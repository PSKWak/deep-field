"""Download the labelled Kepler Objects of Interest table.

Source: NASA Exoplanet Archive, `cumulative` table (the KOI catalogue).
Each row is a transit signal Kepler found; `koi_disposition` is the verdict
humans reached after vetting it. That verdict is our training label.

    python fetch_data.py
"""

from __future__ import annotations

import io
import sys
import urllib.parse
import urllib.request
from pathlib import Path

import pandas as pd

TAP = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
OUT = Path(__file__).parent / "data" / "koi.csv"

# Observable / measured quantities only. See README for why the koi_fpflag_*
# columns are deliberately absent.
COLUMNS = [
    "kepid",
    "kepoi_name",
    "kepler_name",
    "koi_disposition",
    "koi_period",  # orbital period, days
    "koi_duration",  # transit duration, hours
    "koi_depth",  # transit depth, ppm
    "koi_prad",  # planet radius, Earth radii
    "koi_teq",  # equilibrium temperature, K
    "koi_insol",  # insolation flux, Earth = 1
    "koi_model_snr",  # signal-to-noise of the transit fit
    "koi_impact",  # impact parameter (how central the crossing is)
    "koi_steff",  # stellar effective temperature, K
    "koi_slogg",  # stellar surface gravity, log10(cm/s^2)
    "koi_srad",  # stellar radius, solar radii
    "koi_kepmag",  # Kepler-band magnitude of the star
    # Kept only to demonstrate label leakage in train.py --- never used as
    # a feature in the honest model.
    "koi_fpflag_nt",
    "koi_fpflag_ss",
    "koi_fpflag_co",
    "koi_fpflag_ec",
]


def fetch() -> pd.DataFrame:
    query = (
        f"select {','.join(COLUMNS)} from cumulative "
        "where koi_disposition in ('CONFIRMED','FALSE POSITIVE')"
    )
    url = f"{TAP}?{urllib.parse.urlencode({'query': query, 'format': 'csv'})}"
    print(f"Requesting {len(COLUMNS)} columns from the NASA Exoplanet Archive…")

    with urllib.request.urlopen(url, timeout=300) as response:
        body = response.read().decode("utf-8")

    if not body.lstrip().lower().startswith("kepid"):
        sys.exit(f"Unexpected response from the archive:\n{body[:500]}")

    return pd.read_csv(io.StringIO(body))


def main() -> None:
    frame = fetch()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(OUT, index=False)

    counts = frame["koi_disposition"].value_counts()
    print(f"\nSaved {len(frame):,} labelled rows to {OUT.relative_to(Path.cwd())}")
    for label, n in counts.items():
        print(f"  {label:<15} {n:>6,}  ({n / len(frame):.1%})")


if __name__ == "__main__":
    main()
