import { config, tabs, tiles, specialTiles } from "./config.js";
import { glyphOf } from "./latex.js";
import {
  createDoc,
  insert,
  focusSlot,
  exitSlot,
  moveCursor,
  removeBefore,
  removeNode,
  clearDoc,
  undo,
  redo,
  placeAfter,
} from "./tree.js";

export function mountEditor({ expr, tray, onInsert, onLimit }) {
  const doc = createDoc();
  let highlight = null;
  let playing = false;
  let pressTimer = 0;

  expr.addEventListener("click", () => {
    doc.cursor = { nodeId: null, slot: null, index: doc.root.length };
    render();
  });

  document.addEventListener("keydown", (event) => {
    if (playing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target.closest("input, textarea")) return;
    const map = {
      "+": "plus",
      "-": "minus",
      "*": "times",
      "/": "div",
      "=": "eq",
      "(": "lpar",
      ")": "rpar",
      "<": "lt",
      ">": "gt",
      "^": "sup",
      x: "x",
      t: "t",
      k: "k",
      n: "n",
    };
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      place("tile", event.key);
    } else if (map[event.key]) {
      event.preventDefault();
      place("tile", map[event.key]);
    } else if (event.key === "Backspace") {
      event.preventDefault();
      removeBefore(doc);
      render();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveCursor(doc, -1);
      render();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveCursor(doc, 1);
      render();
    } else if (event.key === "Enter") {
      event.preventDefault();
      document.querySelector("#solve")?.click();
    }
  });

  buildTray();
  render();

  return {
    doc,
    render,
    playing: () => playing,
    setHighlight(slot) {
      highlight = slot;
      render();
      const target = expr.querySelector(".slot.need");
      target?.scrollIntoView({ block: "nearest", inline: "nearest" });
    },
    clearHighlight() {
      highlight = null;
      render();
    },
    async play(steps) {
      playing = true;
      clearDoc(doc);
      render();
      for (const step of steps) {
        await wait(config.showDelay);
        if (step.op === "tile") insert(doc, step.id);
        else if (step.op === "slot") focusSlot(doc, step.name);
        else exitSlot(doc);
        render();
      }
      await wait(config.showDelay);
      playing = false;
    },
    tools: {
      undo() {
        undo(doc);
        render();
      },
      redo() {
        redo(doc);
        render();
      },
      backspace() {
        removeBefore(doc);
        render();
      },
      left() {
        moveCursor(doc, -1);
        render();
      },
      right() {
        moveCursor(doc, 1);
        render();
      },
      leave() {
        exitSlot(doc);
        render();
      },
      clear() {
        clearDoc(doc);
        highlight = null;
        render();
      },
    },
  };

  function place(kind, id) {
    if (playing) return;
    if (kind === "tile") {
      const ok = insert(doc, id);
      if (!ok && !["integral", "sigma", "limit", "deriv", "sqrt", "frac", "sup"].includes(id)) {
        onLimit?.();
        return;
      }
      highlight = null;
      onInsert?.();
      render();
    }
  }

  function buildTray() {
    const tabRow = document.createElement("div");
    tabRow.className = "tabs";
    const panels = document.createElement("div");
    panels.className = "panels";
    tabs.forEach((tab, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tab";
      button.dataset.tabBtn = tab;
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      tabRow.append(button);
      const panel = document.createElement("div");
      panel.className = "panel";
      panel.dataset.panel = tab;
      panel.hidden = index !== 0;
      for (const id of tiles[tab]) {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "tile";
        if (specialTiles.has(id)) tile.classList.add("special", `tile-${id}`);
        tile.dataset.tile = id;
        tile.dataset.tab = tab;
        tile.textContent = glyphOf(id);
        tile.addEventListener("click", () => place("tile", id));
        panel.append(tile);
      }
      panels.append(panel);
    });
    tabRow.addEventListener("click", (event) => {
      const button = event.target.closest("[data-tab-btn]");
      if (!button) return;
      for (const item of tabRow.children) item.setAttribute("aria-pressed", String(item === button));
      for (const panel of panels.children) panel.hidden = panel.dataset.panel !== button.dataset.tabBtn;
    });
    tray.replaceChildren(tabRow, panels);
  }

  function render() {
    expr.replaceChildren();
    paintSeq(expr, doc.root, null, null);
  }

  function paintSeq(parent, nodes, ownerId, slot) {
    const active = doc.cursor.nodeId === ownerId && doc.cursor.slot === slot;
    nodes.forEach((node, index) => {
      if (active && doc.cursor.index === index) parent.append(caret());
      parent.append(paintNode(node));
    });
    if (active && doc.cursor.index === nodes.length) parent.append(caret());
  }

  function paintNode(node) {
    if (node.type === "tok") {
      const el = document.createElement("span");
      el.className = "tok";
      el.setAttribute("role", "button");
      el.tabIndex = 0;
      if (node.value === "heart") el.classList.add("heart");
      if (node.value === "Y" || node.value === "N") el.classList.add("letter");
      el.textContent = glyphOf(node.value);
      el.addEventListener("click", (event) => {
        event.stopPropagation();
        placeAfter(doc, node.id);
        render();
      });
      watch(el, node.id);
      return el;
    }
    const el = document.createElement("span");
    el.className = `node node-${node.type}`;
    if (node.type === "integral") {
      el.append(sign("∫"), limits(node, "upper", "lower"), slotEl(node, "body", "body"), dx(node));
    } else if (node.type === "sigma") {
      el.append(sign("Σ"), limits(node, "upper", "lower"), slotEl(node, "body", "body"));
    } else if (node.type === "limit") {
      const word = document.createElement("span");
      word.className = "limword";
      word.append("lim", slotEl(node, "sub", "sub"));
      el.append(word, slotEl(node, "body", "body"));
    } else if (node.type === "deriv") {
      el.append(derivFrac(node), slotEl(node, "body", "body"));
    } else if (node.type === "sqrt") {
      el.append(sign("√"), slotEl(node, "body", "rad"));
    } else if (node.type === "frac") {
      const bar = document.createElement("i");
      bar.className = "bar";
      const stack = document.createElement("span");
      stack.className = "frac";
      stack.append(slotEl(node, "num", "num"), bar, slotEl(node, "den", "den"));
      el.append(stack);
    } else if (node.type === "sup") {
      el.append(slotEl(node, "base", "base"), slotEl(node, "exp", "exp"));
    }
    watch(el, node.id);
    return el;
  }

  function limits(node, upper, lower) {
    const box = document.createElement("span");
    box.className = "lims";
    box.append(slotEl(node, upper, "lim"), slotEl(node, lower, "lim"));
    return box;
  }

  function dx(node) {
    const box = document.createElement("span");
    box.className = "dx";
    box.append("d", slotEl(node, "dvar", "dvar"));
    return box;
  }

  function derivFrac(node) {
    const box = document.createElement("span");
    box.className = "dfrac";
    const bar = document.createElement("i");
    bar.className = "bar";
    const bottom = document.createElement("span");
    bottom.append("d", slotEl(node, "dvar", "dvar"));
    box.append(sign("d"), bar, bottom);
    return box;
  }

  function sign(text) {
    const el = document.createElement("span");
    el.className = "sign";
    el.textContent = text;
    return el;
  }

  function slotEl(node, name, kind) {
    const el = document.createElement("span");
    el.className = `slot slot-${kind}`;
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.dataset.node = node.id;
    el.dataset.slot = name;
    if (!node.slots[name].length) el.classList.add("empty");
    if (doc.cursor.nodeId === node.id && doc.cursor.slot === name) el.classList.add("active");
    if (highlight?.nodeId === node.id && highlight.slot === name) el.classList.add("need");
    paintSeq(el, node.slots[name], node.id, name);
    el.addEventListener("pointerdown", (event) => event.stopPropagation());
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      doc.cursor = { nodeId: node.id, slot: name, index: node.slots[name].length };
      highlight = null;
      render();
    });
    return el;
  }

  function caret() {
    const el = document.createElement("i");
    el.className = "caret";
    return el;
  }

  function watch(el, id) {
    el.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      if (event.button !== 0) return;
      const startX = event.clientX;
      const startY = event.clientY;
      pressTimer = window.setTimeout(() => {
        pressTimer = 0;
        removeNode(doc, id);
        render();
      }, 560);
      const cancel = (move) => {
        if (move && Math.hypot(move.clientX - startX, move.clientY - startY) < 12) return;
        window.clearTimeout(pressTimer);
        pressTimer = 0;
        el.removeEventListener("pointermove", onMove);
      };
      const onMove = (move) => cancel(move);
      el.addEventListener("pointerup", () => cancel(), { once: true });
      el.addEventListener("pointercancel", () => cancel(), { once: true });
      el.addEventListener("pointermove", onMove);
    });
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
