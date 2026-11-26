import { slotOrder } from "./tree.js";

const CANON = {
  plus: "+",
  minus: "-",
  times: "\\times",
  div: "\\div",
  eq: "=",
  lt: "<",
  gt: ">",
  le: "\\le",
  ge: "\\ge",
  lpar: "(",
  rpar: ")",
  to: "\\to",
  pi: "\\pi",
  e: "e",
  i: "i",
  inf: "\\infty",
  heart: "\\heartsuit",
  x: "x",
  t: "t",
  k: "k",
  n: "n",
  Y: "Y",
  N: "N",
};

const GLYPH = {
  plus: "+",
  minus: "−",
  times: "×",
  div: "÷",
  eq: "=",
  lt: "<",
  gt: ">",
  le: "≤",
  ge: "≥",
  lpar: "(",
  rpar: ")",
  to: "→",
  pi: "π",
  e: "e",
  i: "i",
  inf: "∞",
  heart: "♥",
  x: "x",
  t: "t",
  k: "k",
  n: "n",
  Y: "Y",
  N: "N",
  integral: "∫",
  sigma: "Σ",
  limit: "lim",
  deriv: "d/dt",
  sqrt: "√",
  frac: "a/b",
  sup: "xⁿ",
};

export function glyphOf(value) {
  return GLYPH[value] ?? value;
}

export function canonical(nodes) {
  return joinCanon(nodes.map(canonNode));
}

export function toLatex(nodes) {
  return canonical(nodes);
}

export function pretty(nodes) {
  return nodes.map(prettyNode).join("");
}

function joinCanon(parts) {
  let out = "";
  for (const part of parts) {
    if (!part) continue;
    if (out && /\\[a-zA-Z]+$/.test(out) && /^[a-zA-Z]/.test(part)) out += " ";
    out += part;
  }
  return out;
}

function canonNode(node) {
  if (node.type === "tok") return CANON[node.value] ?? node.value;
  const s = node.slots;
  const part = (name) => joinCanon(s[name].map(canonNode));
  switch (node.type) {
    case "integral":
      return `\\int_{${part("lower")}}^{${part("upper")}}${part("body")} d${part("dvar")}`;
    case "sigma":
      return `\\sum_{${part("lower")}}^{${part("upper")}}${part("body")}`;
    case "limit":
      return `\\lim_{${part("sub")}}${part("body")}`;
    case "deriv":
      return `\\frac{d}{d${part("dvar")}}${part("body")}`;
    case "sqrt":
      return `\\sqrt{${part("body")}}`;
    case "frac":
      return `\\frac{${part("num")}}{${part("den")}}`;
    case "sup":
      return `${part("base")}^{${part("exp")}}`;
    default:
      return "";
  }
}

function prettyNode(node) {
  if (node.type === "tok") return glyphOf(node.value);
  const s = node.slots;
  const part = (name) => s[name].map(prettyNode).join("");
  switch (node.type) {
    case "integral":
      return `∫_${part("lower") || "□"}^{${part("upper") || "□"}} ${part("body") || "□"} d${part("dvar")}`;
    case "sigma":
      return `Σ_${part("lower") || "□"}^{${part("upper") || "□"}} ${part("body") || "□"}`;
    case "limit":
      return `lim_${part("sub") || "□"} ${part("body") || "□"}`;
    case "deriv":
      return `d/d${part("dvar") || "□"} ${part("body") || "□"}`;
    case "sqrt":
      return `√(${part("body") || "□"})`;
    case "frac":
      return `(${part("num") || "□"})/(${part("den") || "□"})`;
    case "sup":
      return `${part("base") || "□"}^(${part("exp") || "□"})`;
    default:
      return "";
  }
}

export function walkCounts(nodes) {
  const counts = {
    integral: 0,
    sigma: 0,
    sqrt: 0,
    pi: 0,
    limit: 0,
    frac: 0,
    deriv: 0,
    number: 0,
    other: 0,
  };
  const visit = (list) => {
    for (const node of list) {
      if (node.type === "tok") {
        if (/^[0-9]$/.test(node.value)) counts.number += 1;
        else if (node.value === "pi") counts.pi += 1;
        else counts.other += 1;
      } else if (counts[node.type] != null) {
        counts[node.type] += 1;
        for (const name of slotOrder[node.type]) visit(node.slots[name]);
      }
    }
  };
  visit(nodes);
  return counts;
}
