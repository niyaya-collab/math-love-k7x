import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { createDoc, insert, undo, redo, applySteps, clearDoc } from "../js/tree.js";
import { canonical, toLatex } from "../js/latex.js";
import { recognize } from "../js/recognize.js";
import { recipes } from "../js/recipes.js";
import { pools } from "../js/messages.js";

for (const recipe of recipes) {
  test(`recipe ${recipe.id} canonical and message`, () => {
    const doc = createDoc();
    applySteps(doc, recipe.steps);
    const canon = canonical(doc.root);
    assert.equal(canon, recipe.patterns[0]);
    katex.renderToString(toLatex(doc.root), { throwOnError: true, displayMode: true });
    const hit = recognize(doc.root);
    assert.equal(hit.kind, "recipe");
    assert.equal(hit.recipeId, recipe.id);
    assert.equal(hit.message.fa, recipe.message.fa);
    assert.equal(hit.message.en, recipe.message.en);
  });
}

test("addition order still recognizes Y and N", () => {
  const doc = createDoc();
  for (const id of ["N", "plus", "Y", "eq", "1"]) insert(doc, id);
  const hit = recognize(doc.root);
  assert.equal(hit.recipeId, "yn-one");
});

test("a longer number does not steal Y+N=1", () => {
  const doc = createDoc();
  for (const id of ["Y", "plus", "N", "eq", "1", "0"]) insert(doc, id);
  const hit = recognize(doc.root);
  assert.notEqual(hit.recipeId, "yn-one");
});

test("extra symbols still contain the special heart limit", () => {
  const doc = createDoc();
  insert(doc, "1");
  insert(doc, "plus");
  const recipe = recipes.find((item) => item.id === "limit-heart");
  applySteps(doc, recipe.steps);
  const hit = recognize(doc.root);
  assert.equal(hit.recipeId, "limit-heart");
});

test("empty board and empty slot stay kind", () => {
  const doc = createDoc();
  assert.equal(recognize(doc.root).kind, "empty");
  insert(doc, "integral");
  const hit = recognize(doc.root);
  assert.equal(hit.kind, "incomplete");
  assert.equal(hit.emptySlot.slot, "lower");
  assert.equal(hit.message.fa, "هنوز یه شکاف خالی داره 🌸");
});

test("digits fall into the number pool", () => {
  const doc = createDoc();
  insert(doc, "3");
  insert(doc, "plus");
  insert(doc, "4");
  const hit = recognize(doc.root);
  assert.equal(hit.kind, "pool");
  assert.equal(hit.pool, "number");
  assert.ok(pools.number.some((item) => item.fa === hit.message.fa));
});

test("pool messages do not repeat immediately", () => {
  const doc = createDoc();
  insert(doc, "8");
  const first = recognize(doc.root);
  const second = recognize(doc.root, first.messageId);
  assert.notEqual(second.messageId, first.messageId);
});

test("undo and redo restore the expression", () => {
  const doc = createDoc();
  insert(doc, "Y");
  insert(doc, "plus");
  undo(doc);
  assert.equal(canonical(doc.root), "Y");
  redo(doc);
  assert.equal(canonical(doc.root), "Y+");
  clearDoc(doc);
  assert.equal(canonical(doc.root), "");
  undo(doc);
  assert.equal(canonical(doc.root), "Y+");
});
