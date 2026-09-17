/**
 * Simplified stick figures for the most recognizable constellations, as chains
 * of Bright Star Catalogue Bayer designations. These are the conventional
 * "join the dots" asterisms, not official IAU constellation boundaries.
 */
export type Constellation = {
  abbr: string;
  name: string;
  /** each entry is one continuous polyline through the named stars */
  lines: string[][];
};

export const CONSTELLATIONS: Constellation[] = [
  {
    abbr: "Ori",
    name: "Orion",
    lines: [
      ["Del Ori", "Eps Ori", "Zet Ori"],
      ["Alp Ori", "Zet Ori", "Kap Ori"],
      ["Gam Ori", "Del Ori", "Bet Ori"],
      ["Alp Ori", "Gam Ori"],
      ["Bet Ori", "Kap Ori"],
    ],
  },
  {
    abbr: "UMa",
    name: "the Big Dipper",
    lines: [
      ["Alp UMa", "Bet UMa", "Gam UMa", "Del UMa", "Alp UMa"],
      ["Del UMa", "Eps UMa", "Zet UMa", "Eta UMa"],
    ],
  },
  {
    abbr: "Cas",
    name: "Cassiopeia",
    lines: [["Bet Cas", "Alp Cas", "Gam Cas", "Del Cas", "Eps Cas"]],
  },
  {
    abbr: "Cyg",
    name: "Cygnus",
    lines: [
      ["Alp Cyg", "Gam Cyg", "Eta Cyg", "Bet1Cyg"],
      ["Del Cyg", "Gam Cyg", "Eps Cyg"],
    ],
  },
  {
    abbr: "Sco",
    name: "Scorpius",
    lines: [
      ["Bet1Sco", "Del Sco", "Pi  Sco"],
      ["Del Sco", "Sig Sco", "Alp Sco", "Tau Sco", "Eps Sco", "Mu 1Sco"],
      ["Mu 1Sco", "Zet2Sco", "Eta Sco", "The Sco", "Iot1Sco", "Kap Sco", "Lam Sco"],
    ],
  },
  {
    abbr: "Cru",
    name: "the Southern Cross",
    lines: [
      ["Alp1Cru", "Gam Cru"],
      ["Bet Cru", "Del Cru"],
    ],
  },
  {
    abbr: "Lyr",
    name: "Lyra",
    lines: [["Alp Lyr", "Bet Lyr", "Gam Lyr", "Alp Lyr"]],
  },
  {
    abbr: "CMa",
    name: "Canis Major",
    lines: [
      ["Alp CMa", "Bet CMa"],
      ["Alp CMa", "Del CMa", "Eta CMa"],
      ["Del CMa", "Eps CMa", "Bet CMa"],
    ],
  },
  {
    abbr: "Tau",
    name: "Taurus",
    lines: [
      ["Lam Tau", "Gam Tau", "Del1Tau", "The2Tau", "Alp Tau", "Zet Tau"],
      ["The2Tau", "Eps Tau", "Bet Tau"],
    ],
  },
  {
    abbr: "Leo",
    name: "Leo",
    lines: [
      ["Alp Leo", "Eta Leo", "Gam1Leo", "Zet Leo", "Mu  Leo"],
      ["Gam1Leo", "Del Leo", "Bet Leo"],
      ["Del Leo", "The Leo", "Alp Leo"],
    ],
  },
  {
    abbr: "Gem",
    name: "Gemini",
    lines: [
      ["Alp Gem", "Bet Gem"],
      ["Bet Gem", "Del Gem", "Gam Gem"],
      ["Alp Gem", "Eps Gem", "Eta Gem"],
    ],
  },
  {
    abbr: "Aql",
    name: "Aquila",
    lines: [
      ["Bet Aql", "Alp Aql", "Gam Aql", "Zet Aql"],
      ["Alp Aql", "Del Aql", "The Aql"],
    ],
  },
  {
    abbr: "Boo",
    name: "Boötes",
    lines: [
      ["Alp Boo", "Eps Boo", "Del Boo", "Bet Boo", "Gam Boo", "Eps Boo"],
      ["Alp Boo", "Eta Boo"],
    ],
  },
  {
    abbr: "Peg",
    name: "Pegasus",
    lines: [
      ["Alp Peg", "Bet Peg", "Alp And", "Gam Peg", "Alp Peg"],
      ["Bet Peg", "Eta Peg"],
      ["Alp Peg", "Eps Peg"],
    ],
  },
  {
    abbr: "Per",
    name: "Perseus",
    lines: [
      ["Gam Per", "Alp Per", "Del Per", "Eps Per"],
      ["Del Per", "Bet Per", "Rho Per"],
    ],
  },
  {
    abbr: "Cen",
    name: "Centaurus",
    lines: [
      ["Alp1Cen", "Bet Cen"],
      ["Bet Cen", "Eps Cen", "Zet Cen"],
      ["Eps Cen", "Eta Cen", "The Cen"],
    ],
  },
  {
    abbr: "Aur",
    name: "Auriga",
    lines: [
      ["Alp Aur", "Bet Aur", "The Aur", "Iot Aur", "Eps Aur", "Alp Aur"],
    ],
  },
  {
    abbr: "Crv",
    name: "Corvus",
    lines: [["Alp Crv", "Eps Crv", "Gam Crv", "Del Crv", "Bet Crv", "Eps Crv"]],
  },
];
