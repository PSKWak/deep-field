"""Train a classifier to tell real exoplanets from false positives.

This is the learned half of the method the Deep Field app teaches. The app's
Box Least Squares search *finds* periodic dips; it cannot say whether a dip is
a planet or an eclipsing binary star. That judgement is what Kepler's human
vetters made, and what a model can learn from their verdicts.

    python fetch_data.py     # once, to download the labelled data
    python train.py

Writes a fitted model and a set of plots into artifacts/.
"""

from __future__ import annotations

import os

# Must be set before sklearn is imported. Its OpenMP helper otherwise probes
# the *physical* core count, which shells out to a command that isn't
# available on some Windows setups; the fallback works fine but prints a
# warning with a full traceback that reads like a real failure. Setting the
# thread count explicitly skips the probe, and makes runs more reproducible.
os.environ.setdefault("OMP_NUM_THREADS", str(os.cpu_count() or 4))

from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")  # no display in CI or a plain terminal
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    RocCurveDisplay,
    accuracy_score,
    classification_report,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

HERE = Path(__file__).parent
DATA = HERE / "data" / "koi.csv"
ARTIFACTS = HERE / "artifacts"

RANDOM_STATE = 42

# Measured quantities: what the telescope and the transit fit actually give you.
FEATURES = [
    "koi_period",
    "koi_duration",
    "koi_depth",
    "koi_prad",
    "koi_teq",
    "koi_insol",
    "koi_model_snr",
    "koi_impact",
    "koi_steff",
    "koi_slogg",
    "koi_srad",
    "koi_kepmag",
]

# These four are the vetting pipeline's *conclusions*, not observations. A
# model given them is reading the answer sheet. Used only in the leakage demo.
LEAKY = ["koi_fpflag_nt", "koi_fpflag_ss", "koi_fpflag_co", "koi_fpflag_ec"]

# 1 = a real planet. The rarer, more interesting class.
POSITIVE = "CONFIRMED"


def load() -> tuple[pd.DataFrame, pd.Series]:
    if not DATA.exists():
        raise SystemExit(f"{DATA} not found — run `python fetch_data.py` first.")
    frame = pd.read_csv(DATA)
    labels = (frame["koi_disposition"] == POSITIVE).astype(int)
    return frame, labels


def make_model(kind: str) -> Pipeline:
    """Median imputation because some KOIs are missing stellar parameters;
    dropping those rows would silently bias the sample."""
    if kind == "logistic":
        return Pipeline(
            [
                ("impute", SimpleImputer(strategy="median")),
                ("scale", StandardScaler()),
                ("clf", LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)),
            ]
        )
    # Gradient boosting handles NaN natively and needs no scaling.
    return Pipeline(
        [("clf", HistGradientBoostingClassifier(random_state=RANDOM_STATE))]
    )


def evaluate(name: str, model: Pipeline, X, y, X_test, y_test) -> dict:
    model.fit(X, y)
    predicted = model.predict(X_test)
    probability = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, predicted)
    auc = roc_auc_score(y_test, probability)
    print(f"\n{'=' * 62}\n{name}\n{'=' * 62}")
    print(f"accuracy {accuracy:.3f}   roc-auc {auc:.3f}")
    print(
        classification_report(
            y_test, predicted, target_names=["false positive", "planet"], digits=3
        )
    )
    return {"name": name, "model": model, "accuracy": accuracy, "auc": auc,
            "predicted": predicted, "probability": probability}


def main() -> None:
    ARTIFACTS.mkdir(exist_ok=True)
    frame, y = load()
    print(f"{len(frame):,} labelled KOIs — {y.sum():,} planets, "
          f"{(1 - y).sum():,} false positives")

    X = frame[FEATURES]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=RANDOM_STATE
    )
    print(f"train {len(X_train):,}   test {len(X_test):,}")

    # A model that always guesses the majority class. Any real model has to
    # beat this to have earned anything.
    baseline = DummyClassifier(strategy="most_frequent")
    baseline.fit(X_train, y_train)
    print(f"\nalways-guess-false-positive baseline: "
          f"accuracy {baseline.score(X_test, y_test):.3f}")

    results = [
        evaluate("Logistic regression (honest features)",
                 make_model("logistic"), X_train, y_train, X_test, y_test),
        evaluate("Gradient boosting (honest features)",
                 make_model("boosting"), X_train, y_train, X_test, y_test),
    ]
    best = max(results, key=lambda r: r["auc"])

    # The leakage demonstration: same model, plus the vetting flags.
    X_leaky = frame[FEATURES + LEAKY]
    Xl_train, Xl_test, yl_train, yl_test = train_test_split(
        X_leaky, y, test_size=0.25, stratify=y, random_state=RANDOM_STATE
    )
    leaked = evaluate("Gradient boosting WITH vetting flags (leakage)",
                      make_model("boosting"), Xl_train, yl_train, Xl_test, yl_test)

    print(f"\n{'=' * 62}")
    print("Leakage check")
    print(f"{'=' * 62}")
    print(f"  honest features : accuracy {best['accuracy']:.3f}  auc {best['auc']:.3f}")
    print(f"  + vetting flags : accuracy {leaked['accuracy']:.3f}  auc {leaked['auc']:.3f}")
    print("  The flags ARE the verdict, so the second number measures nothing.")

    # Cross-validation on the honest model: one split can flatter a model.
    folds = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    scores = cross_val_score(make_model("boosting"), X, y, cv=folds, scoring="roc_auc")
    print(f"\n5-fold cross-validated roc-auc: {scores.mean():.3f} "
          f"± {scores.std():.3f}  {np.round(scores, 3)}")

    # Which measurements actually carry the signal?
    # n_jobs=1: this dataset is small, and spawning joblib workers emits a
    # spurious "could not find the number of physical cores" warning on
    # Windows that looks like a real failure.
    importance = permutation_importance(
        best["model"], X_test, y_test, n_repeats=10,
        random_state=RANDOM_STATE, scoring="roc_auc", n_jobs=1,
    )
    order = np.argsort(importance.importances_mean)[::-1]
    print(f"\nPermutation importance ({best['name']}):")
    for i in order:
        print(f"  {FEATURES[i]:<16} {importance.importances_mean[i]:+.4f}"
              f" ± {importance.importances_std[i]:.4f}")

    _plots(best, y_test, X_test, importance, order)
    joblib.dump(best["model"], ARTIFACTS / "planet_classifier.joblib")
    print(f"\nSaved model and plots to {ARTIFACTS.relative_to(Path.cwd())}/")


def _plots(best, y_test, X_test, importance, order) -> None:
    ConfusionMatrixDisplay.from_predictions(
        y_test, best["predicted"],
        display_labels=["false positive", "planet"], colorbar=False,
    )
    plt.title(best["name"])
    plt.tight_layout()
    plt.savefig(ARTIFACTS / "confusion_matrix.png", dpi=140)
    plt.close()

    RocCurveDisplay.from_predictions(y_test, best["probability"])
    plt.plot([0, 1], [0, 1], "k--", linewidth=0.8, label="chance")
    plt.title("Planet vs false positive")
    plt.legend()
    plt.tight_layout()
    plt.savefig(ARTIFACTS / "roc_curve.png", dpi=140)
    plt.close()

    plt.figure(figsize=(7, 4.5))
    names = [FEATURES[i] for i in order][::-1]
    values = importance.importances_mean[order][::-1]
    plt.barh(names, values, color="#6366f1")
    plt.xlabel("drop in roc-auc when this column is shuffled")
    plt.title("Which measurements carry the signal")
    plt.tight_layout()
    plt.savefig(ARTIFACTS / "feature_importance.png", dpi=140)
    plt.close()


if __name__ == "__main__":
    main()
