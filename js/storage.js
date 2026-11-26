import { config } from "./config.js";

function read() {
  try {
    const raw = localStorage.getItem(config.storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function write(data) {
  try {
    localStorage.setItem(config.storageKey, JSON.stringify(data));
  } catch {
    /* private mode or a full disk should never break the lab */
  }
}

export function loadState() {
  const data = read();
  return {
    lang: data.lang === "en" || data.lang === "fa" ? data.lang : "",
    latinDigits: Boolean(data.latinDigits),
    sound: data.sound !== false,
    welcomeSeen: Boolean(data.welcomeSeen),
    found: Array.isArray(data.found) ? data.found.filter((id) => typeof id === "string") : [],
    lastMessageId: typeof data.lastMessageId === "string" ? data.lastMessageId : "",
  };
}

export function saveState(partial) {
  write({ ...read(), ...partial });
}

export function defaultLang() {
  const saved = loadState().lang;
  if (saved) return saved;
  const nav = (navigator.language || "fa").toLowerCase();
  return nav.startsWith("en") ? "en" : "fa";
}
