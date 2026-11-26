import { findFirstEmpty } from "./tree.js";
import { canonical, walkCounts } from "./latex.js";
import { recipes } from "./recipes.js";
import { pools, poolOrder, soft } from "./messages.js";

const ranked = [...recipes].sort((a, b) => longest(b) - longest(a));

export function recognize(root, lastId = "") {
  if (!root.length) {
    return { kind: "empty", message: soft.empty, proof: soft.proof };
  }
  const hole = findFirstEmpty(root);
  if (hole) {
    return { kind: "incomplete", message: soft.incomplete, proof: soft.proof, emptySlot: hole };
  }
  const loose = canonical(root).replace(/[()]/g, "");
  for (const recipe of ranked) {
    if (recipe.patterns.some((pattern) => includesFormula(loose, pattern.replace(/[()]/g, "")))) {
      return {
        kind: "recipe",
        recipeId: recipe.id,
        message: recipe.message,
        proof: recipe.proof,
      };
    }
  }
  const pool = dominant(walkCounts(root));
  const message = pick(pools[pool], lastId);
  return {
    kind: "pool",
    pool,
    messageId: message.id,
    message,
    proof: soft.proof,
  };
}

function dominant(counts) {
  for (const key of poolOrder) {
    if (counts[key] > 0) return key;
  }
  return "other";
}

function pick(list, lastId) {
  const fresh = list.filter((item) => item.id !== lastId);
  const bag = fresh.length ? fresh : list;
  return bag[Math.floor(Math.random() * bag.length)];
}

function includesFormula(hay, needle) {
  let from = 0;
  while (from < hay.length) {
    const at = hay.indexOf(needle, from);
    if (at < 0) return false;
    const before = hay[at - 1] || "";
    const after = hay[at + needle.length] || "";
    const starts = /^[0-9A-Za-z\\]/.test(needle);
    const ends = /[0-9A-Za-z]$/.test(needle);
    const beforeOk = !starts || !/[0-9A-Za-z]/.test(before);
    const afterOk = !ends || !/[0-9A-Za-z]/.test(after);
    if (beforeOk && afterOk) return true;
    from = at + 1;
  }
  return false;
}

function longest(recipe) {
  return Math.max(...recipe.patterns.map((pattern) => pattern.length));
}
