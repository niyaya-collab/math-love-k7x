const proof = {
  fa: "واضحه عشقم",
  en: "obvious, my love",
};

const plain = {
  fa: "بدیهی است",
  en: "it is obvious",
};

export const recipes = [
  {
    id: "integral-heart",
    patterns: ["\\int_{0}^{\\infty}\\heartsuit dx=\\infty"],
    steps: [
      { op: "tile", id: "integral" },
      { op: "tile", id: "0" },
      { op: "slot", name: "upper" },
      { op: "tile", id: "inf" },
      { op: "slot", name: "body" },
      { op: "tile", id: "heart" },
      { op: "out" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "inf" },
    ],
    hint: {
      fa: "از صفر تا بی‌نهایت، همه‌ی عشق رو جمع کن",
      en: "From zero to infinity, gather all the love",
    },
    message: {
      fa: "قضیه: دوست داشتنِ یاسین از نیایش، از صفر تا بی‌نهایت، همیشه بی‌نهایته. اثبات: واضحه عشقم.",
      en: "Theorem: Yasin’s love for Niyayesh, integrated from zero to infinity, is always infinite. Proof: obvious, my love.",
    },
    proof,
  },
  {
    id: "limit-heart",
    patterns: ["\\lim_{t\\to\\infty}\\heartsuit=\\infty"],
    steps: [
      { op: "tile", id: "limit" },
      { op: "tile", id: "t" },
      { op: "tile", id: "to" },
      { op: "tile", id: "inf" },
      { op: "slot", name: "body" },
      { op: "tile", id: "heart" },
      { op: "out" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "inf" },
    ],
    hint: {
      fa: "بگذار زمان تا بی‌نهایت برود و به دل نگاه کن",
      en: "Let time go to infinity, then look at the heart",
    },
    message: {
      fa: "هر چی زمان بگذره، دوست داشتنم بیشتر می‌شه؛ حدِ این عشق وقتی زمان به بی‌نهایت می‌ره، خودِ بی‌نهایته.",
      en: "As time goes to infinity, my love only grows. The limit of this love is infinity itself.",
    },
    proof,
  },
  {
    id: "euler",
    patterns: ["e^{i\\pi}+1=0"],
    steps: [
      { op: "tile", id: "e" },
      { op: "tile", id: "sup" },
      { op: "tile", id: "i" },
      { op: "tile", id: "pi" },
      { op: "out" },
      { op: "tile", id: "plus" },
      { op: "tile", id: "1" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "0" },
    ],
    hint: {
      fa: "زیباترین معادله‌ی ریاضی را بساز",
      en: "Build the most beautiful equation in mathematics",
    },
    message: {
      fa: "زیباترین معادله‌ی ریاضی رو ساختی... ولی زیباترین چیز این‌جا هنوز خودتی، نیایش من.",
      en: "You just built the most beautiful equation in math… but the most beautiful thing here is still you.",
    },
    proof: plain,
  },
  {
    id: "yn-one",
    patterns: ["Y+N=1", "N+Y=1"],
    steps: [
      { op: "tile", id: "Y" },
      { op: "tile", id: "plus" },
      { op: "tile", id: "N" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "1" },
    ],
    hint: {
      fa: "حرف من به‌علاوه‌ی حرف تو، یک",
      en: "My letter plus your letter makes one",
    },
    message: {
      fa: "من و تو، یکی می‌شیم. یاسین + نیایش = یک دلِ کامل.",
      en: "Yasin + Niyayesh = one whole heart.",
    },
    proof,
  },
  {
    id: "yn-inf",
    patterns: ["Y\\times N=\\infty", "N\\times Y=\\infty"],
    steps: [
      { op: "tile", id: "Y" },
      { op: "tile", id: "times" },
      { op: "tile", id: "N" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "inf" },
    ],
    hint: {
      fa: "حرف من ضربدر حرف تو",
      en: "My letter times your letter",
    },
    message: {
      fa: "حاصل‌ضرب من و تو بی‌نهایته. هر چقدر که ضرب کنی، بازم بی‌نهایت دوستت دارم.",
      en: "Yasin times Niyayesh equals infinity. Multiply it however you like, I’ll still love you infinitely.",
    },
    proof,
  },
  {
    id: "sqrt-n",
    patterns: ["\\sqrt{N^{2}}=N"],
    steps: [
      { op: "tile", id: "sqrt" },
      { op: "tile", id: "N" },
      { op: "tile", id: "sup" },
      { op: "tile", id: "2" },
      { op: "out" },
      { op: "out" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "N" },
    ],
    hint: {
      fa: "ریشه‌ی دومِ توانِ دومِ تو",
      en: "The square root of your square",
    },
    message: {
      fa: "ریشه‌ی دومِ نیایش به توان دو، باز هم نیایشه. هر جوری حسابش کنی، نیایش خودمی، فقط خودمی.",
      en: "The square root of Niyayesh squared is still Niyayesh. However you calculate it, you are mine, only mine.",
    },
    proof,
  },
  {
    id: "geometric",
    patterns: ["\\sum_{k=1}^{\\infty}\\frac{1}{2^{k}}=1"],
    steps: [
      { op: "tile", id: "sigma" },
      { op: "tile", id: "k" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "1" },
      { op: "slot", name: "upper" },
      { op: "tile", id: "inf" },
      { op: "slot", name: "body" },
      { op: "tile", id: "frac" },
      { op: "tile", id: "1" },
      { op: "slot", name: "den" },
      { op: "tile", id: "2" },
      { op: "tile", id: "sup" },
      { op: "tile", id: "k" },
      { op: "out" },
      { op: "out" },
      { op: "out" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "1" },
    ],
    hint: {
      fa: "نصف‌ها را تا بی‌نهایت جمع کن",
      en: "Add the halves all the way to infinity",
    },
    message: {
      fa: "هر روز نصفِ بقیه‌ی راه رو عاشق‌تر می‌شم و آخرش می‌رسم به یک نفر: تو.",
      en: "Every day I fall halfway more in love, and in the end it all adds up to one person: you.",
    },
    proof: plain,
  },
  {
    id: "pi-heart",
    patterns: ["\\pi=\\heartsuit"],
    steps: [
      { op: "tile", id: "pi" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "heart" },
    ],
    hint: {
      fa: "پی را برابر دل بگذار",
      en: "Set pi equal to a heart",
    },
    message: {
      fa: "توی هیچ کتاب ریاضی نیست، ولی قبولش کن: π = ♥. بی‌پایان و بی‌تکرار، مثل دوست داشتنِ یاسین.",
      en: "It’s in no math book, but accept it: π = ♥. Endless and never repeating, like Yasin’s love.",
    },
    proof,
  },
  {
    id: "derivative-heart",
    patterns: ["\\frac{d}{dt}\\heartsuit>0"],
    steps: [
      { op: "tile", id: "deriv" },
      { op: "tile", id: "t" },
      { op: "slot", name: "body" },
      { op: "tile", id: "heart" },
      { op: "out" },
      { op: "tile", id: "gt" },
      { op: "tile", id: "0" },
    ],
    hint: {
      fa: "مشتق دل نسبت به زمان، مثبت",
      en: "The derivative of a heart with respect to time is positive",
    },
    message: {
      fa: "مشتقِ عشقم نسبت به زمان همیشه مثبته؛ یعنی هر لحظه از قبل بیشتر دوستت دارم.",
      en: "The derivative of my love with respect to time is always positive: every moment I love you more than before.",
    },
    proof,
  },
  {
    id: "heart-n",
    patterns: ["\\heartsuit=N"],
    steps: [
      { op: "tile", id: "heart" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "N" },
    ],
    hint: {
      fa: "دل را برابر حرف تو بگذار",
      en: "Set the heart equal to your letter",
    },
    message: {
      fa: "دل من یعنی همین: نیایش. ♥ = نیایش.",
      en: "My heart means exactly this: Niyayesh. ♥ = Niyayesh.",
    },
    proof,
  },
  {
    id: "two-halves",
    patterns: ["\\frac{1}{2}+\\frac{1}{2}=1"],
    steps: [
      { op: "tile", id: "frac" },
      { op: "tile", id: "1" },
      { op: "slot", name: "den" },
      { op: "tile", id: "2" },
      { op: "out" },
      { op: "tile", id: "plus" },
      { op: "tile", id: "frac" },
      { op: "tile", id: "1" },
      { op: "slot", name: "den" },
      { op: "tile", id: "2" },
      { op: "out" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "1" },
    ],
    hint: {
      fa: "دو تا یک‌دوم، یک دل",
      en: "Two halves, one heart",
    },
    message: {
      fa: "نصفِ دلِ من و نصفِ دلِ تو؛ با هم می‌شیم یه دلِ کامل.",
      en: "Half of my heart plus half of yours makes one whole heart.",
    },
    proof: plain,
  },
  {
    id: "beyond-infinity",
    patterns: ["\\infty+1=\\infty", "1+\\infty=\\infty"],
    steps: [
      { op: "tile", id: "inf" },
      { op: "tile", id: "plus" },
      { op: "tile", id: "1" },
      { op: "tile", id: "eq" },
      { op: "tile", id: "inf" },
    ],
    hint: {
      fa: "یک قدم بعد از بی‌نهایت",
      en: "One step after infinity",
    },
    message: {
      fa: "حتی بعد از بی‌نهایت هم یه دوستت دارم می‌مونه.",
      en: "Even after infinity, there is still one more I love you.",
    },
    proof,
  },
];

export function recipeById(id) {
  return recipes.find((item) => item.id === id) || null;
}
