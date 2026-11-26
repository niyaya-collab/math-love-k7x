export const strings = {
  title: { fa: "آزمایشگاه معادله‌ی عشق", en: "Love Equation Lab" },
  eyebrow: { fa: "برای نیایش", en: "for Niyayesh" },
  welcome: {
    fa: "نیایش جانم، اینجا یه آزمایشگاه کوچیکه که فقط برای توئه 💗 هر چی دلت خواست بچین. — یاسین",
    en: "Niyayesh, my love, this is a little laboratory made only for you 💗 Arrange whatever you like. — Yasin",
  },
  start: { fa: "شروع", en: "Begin" },
  solve: { fa: "حل کن ✨", en: "Solve ✨" },
  hint: { fa: "سرنخ 💡", en: "Hint 💡" },
  clear: { fa: "پاک کردن همه", en: "Clear all" },
  confirm: { fa: "تخته پاک شود؟", en: "Clear the board?" },
  yes: { fa: "بله، پاک کن", en: "Yes, clear it" },
  no: { fa: "نه، بماند", en: "No, keep it" },
  theorem: { fa: "قضیه", en: "Theorem" },
  proof: { fa: "اثبات", en: "Proof" },
  continue: { fa: "ادامه", en: "Continue" },
  save: { fa: "ذخیره‌ی کارت 📸", en: "Save card 📸" },
  notebook: { fa: "دفترچه 📓", en: "Notebook 📓" },
  notebookTitle: { fa: "دفترچه‌ی معادله‌ها", en: "Equation notebook" },
  show: { fa: "نشونم بده", en: "Show me" },
  close: { fa: "بستن", en: "Close" },
  export: { fa: "خروجی پشتیبان", en: "Export backup" },
  import: { fa: "ورود پشتیبان", en: "Import backup" },
  found: { fa: "پیدا شده", en: "found" },
  of: { fa: "از", en: "of" },
  soundOn: { fa: "صدا روشن است", en: "Sound is on" },
  soundOff: { fa: "صدا خاموش است", en: "Sound is off" },
  digits: { fa: "اعداد فارسی", en: "Persian digits" },
  digitsLatin: { fa: "اعداد انگلیسی", en: "Western digits" },
  tabAlnum: { fa: "اعداد و حروف", en: "Numbers & letters" },
  tabOps: { fa: "عملگرها", en: "Operators" },
  tabCalc: { fa: "حساب دیفرانسیل و انتگرال", en: "Calculus" },
  tabAlgebra: { fa: "جبر", en: "Algebra" },
  undo: { fa: "واگرد", en: "Undo" },
  redo: { fa: "ازنو", en: "Redo" },
  delete: { fa: "حذف", en: "Delete" },
  left: { fa: "مکان‌نما به چپ", en: "Cursor left" },
  right: { fa: "مکان‌نما به راست", en: "Cursor right" },
  leave: { fa: "بیرون از این بخش", en: "Leave this part" },
  board: { fa: "تخته‌ی معادله", en: "Equation board" },
  saved: { fa: "کارت ذخیره شد", en: "Card saved" },
};

export function t(lang, key) {
  const item = strings[key];
  return item?.[lang] || item?.fa || "";
}

export function localDigits(value, lang, latin) {
  const text = String(value);
  if (lang !== "fa" || latin) return text;
  return text.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);
}
