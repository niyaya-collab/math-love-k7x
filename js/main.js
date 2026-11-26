import { config } from "./config.js";
import { t } from "./i18n.js";
import { loadState, saveState, defaultLang } from "./storage.js";
import { canonical } from "./latex.js";
import { recognize } from "./recognize.js";
import { recipes } from "./recipes.js";
import { soft } from "./messages.js";
import { mountEditor } from "./editor.js";
import { mountNotebook, backupName } from "./notebook.js";
import { startSky } from "./background.js";
import { createAudio } from "./audio.js";
import { playHeart } from "./heart.js";
import { shareCard } from "./share.js";
import { pretty } from "./latex.js";

const state = loadState();
let lang = state.lang || defaultLang();
const audio = createAudio();
audio.setEnabled(state.sound);

const $ = (id) => document.querySelector(id);
const editor = mountEditor({
  expr: $("#expr"),
  tray: $("#tray"),
  onInsert: () => audio.tap(),
  onLimit: () => toast(soft.limit[lang]),
});

const notebook = mountNotebook($("#notebook-body"), {
  onShow: async (recipe) => {
    closeOverlay("#notebook");
    await editor.play(recipe.steps);
    await solve();
  },
  onClose: () => closeOverlay("#notebook"),
  onExport: exportBackup,
  onImport: () => $("#backup-file").click(),
});

startSky($("#sky"), $("#floaters"));
applyLanguage();
renderNotebook();
if (!state.welcomeSeen) $("#welcome").hidden = false;

$("#lang-fa").addEventListener("click", () => setLang("fa"));
$("#lang-en").addEventListener("click", () => setLang("en"));
$("#sound").addEventListener("click", () => {
  state.sound = !state.sound;
  audio.setEnabled(state.sound);
  save();
  applyLanguage();
});
$("#digits").addEventListener("click", () => {
  state.latinDigits = !state.latinDigits;
  save();
  applyLanguage();
  renderNotebook();
});
$("#start").addEventListener("click", () => {
  state.welcomeSeen = true;
  save();
  $("#welcome").hidden = true;
  audio.unlock();
});
$("#solve").addEventListener("click", () => solve());
$("#hint").addEventListener("click", () => openNotebook());
$("#undo").addEventListener("click", () => editor.tools.undo());
$("#redo").addEventListener("click", () => editor.tools.redo());
$("#backspace").addEventListener("click", () => editor.tools.backspace());
$("#cursor-left").addEventListener("click", () => editor.tools.left());
$("#cursor-right").addEventListener("click", () => editor.tools.right());
$("#leave").addEventListener("click", () => editor.tools.leave());
$("#clear").addEventListener("click", () => {
  if (!editor.doc.root.length) return;
  $("#confirm").hidden = false;
});
$("#confirm-yes").addEventListener("click", () => {
  editor.tools.clear();
  $("#confirm").hidden = true;
  toast("");
});
$("#confirm-no").addEventListener("click", () => {
  $("#confirm").hidden = true;
});
$("#continue").addEventListener("click", () => {
  closeOverlay("#result");
  $("#board").classList.remove("glow");
});
$("#open-notebook").addEventListener("click", () => {
  closeOverlay("#result");
  openNotebook();
});
$("#save-card").addEventListener("click", () => saveCurrent());
$("#backup-file").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = new Set(recipes.map((item) => item.id));
    if (Array.isArray(data.found)) {
      for (const id of data.found) if (ids.has(id) && !state.found.includes(id)) state.found.push(id);
      save();
      renderNotebook();
    }
  } catch {
    /* a bad file simply does nothing */
  }
});

document.addEventListener("pointerdown", () => audio.unlock(), { once: true });

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function setLang(next) {
  lang = next;
  state.lang = next;
  save();
  applyLanguage();
  renderNotebook();
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  document.title = t(lang, "title");
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(lang, el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-label]")) el.setAttribute("aria-label", t(lang, el.dataset.i18nLabel));
  $("#lang-fa").setAttribute("aria-pressed", String(lang === "fa"));
  $("#lang-en").setAttribute("aria-pressed", String(lang === "en"));
  $("#sound").setAttribute("aria-pressed", String(state.sound));
  $("#sound").setAttribute("aria-label", t(lang, state.sound ? "soundOn" : "soundOff"));
  $("#sound").textContent = state.sound ? "🔊" : "🔇";
  $("#digits").textContent = state.latinDigits ? "12" : "۱۲";
  $("#digits").setAttribute("aria-label", t(lang, state.latinDigits ? "digitsLatin" : "digits"));
  $("#nick").textContent = config.nickname[lang];
  const tabKeys = { alnum: "tabAlnum", ops: "tabOps", calc: "tabCalc", algebra: "tabAlgebra" };
  for (const [tab, key] of Object.entries(tabKeys)) {
    const button = document.querySelector(`[data-tab-btn="${tab}"]`);
    if (button) button.textContent = t(lang, key);
  }
}

function renderNotebook() {
  notebook.render(lang, state.found, state.latinDigits);
}

function openNotebook() {
  renderNotebook();
  $("#notebook").hidden = false;
}

function closeOverlay(id) {
  $(id).hidden = true;
}

function toast(text) {
  const el = $("#toast");
  el.textContent = text || "";
}

async function solve() {
  if (editor.playing()) return;
  const hit = recognize(editor.doc.root, state.lastMessageId);
  if (hit.kind === "empty" || hit.kind === "incomplete") {
    toast(hit.message[lang]);
    if (hit.emptySlot) editor.setHighlight(hit.emptySlot);
    return;
  }
  toast("");
  editor.clearHighlight();
  if (hit.messageId) state.lastMessageId = hit.messageId;
  if (hit.recipeId && !state.found.includes(hit.recipeId)) state.found.push(hit.recipeId);
  save();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $("#board").classList.add("glow");
  $("#result").hidden = false;
  $("#result-card").hidden = true;
  $("#theorem-text").textContent = hit.message[lang];
  $("#proof-text").textContent = hit.proof[lang];
  $("#signature").textContent = config.signature[lang];
  $("#result-card").dataset.kind = hit.kind;
  $("#result-card").dataset.pool = hit.pool || "";
  $("#result-card").dataset.recipe = hit.recipeId || "";
  const latex = canonical(editor.doc.root);
  const katex = window.katex;
  if (katex) katex.render(latex, $("#katex-line"), { throwOnError: false, displayMode: true });
  else $("#katex-line").textContent = pretty(editor.doc.root);
  $("#result").dataset.pretty = pretty(editor.doc.root);
  $("#result").dataset.message = hit.message[lang];
  $("#result").dataset.proof = hit.proof[lang];
  if (!reduced) audio.arpeggio();
  await playHeart($("#heart"), { reduced });
  $("#result-card").hidden = false;
}

async function saveCurrent() {
  try {
    await shareCard({
      lang,
      prettyFormula: $("#result").dataset.pretty,
      message: $("#result").dataset.message,
      proof: $("#result").dataset.proof,
      signature: config.signature[lang],
    });
    toast(t(lang, "saved"));
  } catch {
    toast("");
  }
}

function exportBackup() {
  const blob = new Blob([JSON.stringify({ version: 1, found: state.found }, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = backupName();
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function save() {
  saveState({
    lang,
    latinDigits: state.latinDigits,
    sound: state.sound,
    welcomeSeen: state.welcomeSeen,
    found: state.found,
    lastMessageId: state.lastMessageId,
  });
}
