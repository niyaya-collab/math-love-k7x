export const config = {
  herName: { fa: "نیایش", en: "Niyayesh" },
  hisName: { fa: "یاسین", en: "Yasin" },
  nickname: { fa: "ناناسی", en: "Nanasi" },
  signature: {
    fa: "— یاسین، که خیلی خیلی دوستت داره 💗",
    en: "— Yasin, who loves you very, very much 💗",
  },
  storageKey: "love-eq-k7x",
  maxTokens: 40,
  maxHistory: 50,
  showDelay: 450,
  music: false,
};

export const tabs = ["alnum", "ops", "calc", "algebra"];

export const tiles = {
  alnum: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "x", "t", "k", "n", "Y", "N", "heart"],
  ops: ["plus", "minus", "times", "div", "eq", "lt", "gt", "le", "ge", "lpar", "rpar", "to"],
  calc: ["integral", "sigma", "limit", "deriv"],
  algebra: ["sqrt", "frac", "sup", "pi", "e", "i", "inf"],
};

export const specialTiles = new Set(["Y", "N", "heart", "pi", "inf"]);

export const templates = new Set(["integral", "sigma", "limit", "deriv", "sqrt", "frac", "sup"]);
