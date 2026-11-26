import { config } from "./config.js";
import { recipes } from "./recipes.js";
import { pretty } from "./latex.js";
import { createDoc, applySteps } from "./tree.js";
import { t, localDigits } from "./i18n.js";

export function mountNotebook(root, { onShow, onClose, onExport, onImport }) {
  return {
    render(lang, found, latin) {
      root.replaceChildren();
      const head = document.createElement("header");
      head.className = "sheet-head";
      const title = document.createElement("h2");
      title.textContent = t(lang, "notebookTitle");
      const count = document.createElement("p");
      count.id = "notebook-count";
      count.textContent = `${localDigits(found.length, lang, latin)} ${t(lang, "of")} ${localDigits(recipes.length, lang, latin)}`;
      const close = button(t(lang, "close"), "ghost", onClose);
      head.append(title, count, close);

      const list = document.createElement("div");
      list.className = "notes";
      for (const recipe of recipes) {
        const known = found.includes(recipe.id);
        const card = document.createElement("article");
        card.className = known ? "note known" : "note";
        const hint = document.createElement("p");
        hint.className = "hint";
        hint.textContent = recipe.hint[lang];
        card.append(hint);
        if (known) {
          const doc = createDoc();
          applySteps(doc, recipe.steps);
          const formula = document.createElement("p");
          formula.className = "formula";
          formula.dir = "ltr";
          formula.textContent = pretty(doc.root);
          const message = document.createElement("p");
          message.className = "note-text";
          message.textContent = recipe.message[lang];
          card.append(formula, message);
        }
        const show = button(t(lang, "show"), "again", () => onShow(recipe));
        show.dataset.show = recipe.id;
        card.append(show);
        list.append(card);
      }

      const tools = document.createElement("div");
      tools.className = "backup";
      tools.append(
        button(t(lang, "export"), "ghost", onExport),
        button(t(lang, "import"), "ghost", onImport),
      );
      root.append(head, list, tools);
    },
  };
}

function button(text, className, onClick) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = className;
  el.textContent = text;
  el.addEventListener("click", onClick);
  return el;
}

export function backupName() {
  return `${config.herName.en.toLowerCase()}-equations.json`;
}
