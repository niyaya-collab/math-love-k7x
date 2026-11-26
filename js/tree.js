import { config, templates } from "./config.js";

export const slotOrder = {
  integral: ["lower", "upper", "body", "dvar"],
  sigma: ["lower", "upper", "body"],
  limit: ["sub", "body"],
  deriv: ["dvar", "body"],
  sqrt: ["body"],
  frac: ["num", "den"],
  sup: ["base", "exp"],
};

export function createDoc() {
  return {
    root: [],
    cursor: { nodeId: null, slot: null, index: 0 },
    past: [],
    future: [],
    nextId: 1,
  };
}

export function countTokens(nodes) {
  let total = 0;
  for (const node of nodes) {
    if (node.type === "tok") total += 1;
    else {
      for (const name of slotOrder[node.type]) total += countTokens(node.slots[name]);
    }
  }
  return total;
}

export function findById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type !== "tok") {
      for (const name of slotOrder[node.type]) {
        const found = findById(node.slots[name], id);
        if (found) return found;
      }
    }
  }
  return null;
}

export function findFirstEmpty(nodes) {
  for (const node of nodes) {
    if (node.type === "tok") continue;
    for (const name of slotOrder[node.type]) {
      if (node.slots[name].length === 0) return { nodeId: node.id, slot: name };
      const nested = findFirstEmpty(node.slots[name]);
      if (nested) return nested;
    }
  }
  return null;
}

export function insert(doc, tile) {
  if (templates.has(tile)) return insertTemplate(doc, tile);
  if (countTokens(doc.root) >= config.maxTokens) return false;
  commit(doc);
  const seq = currentSeq(doc);
  seq.splice(doc.cursor.index, 0, token(doc, tile));
  doc.cursor.index += 1;
  return true;
}

export function focusSlot(doc, name) {
  const id = doc.cursor.nodeId;
  if (!id) return false;
  const node = findById(doc.root, id);
  if (!node?.slots?.[name]) return false;
  doc.cursor = { nodeId: id, slot: name, index: node.slots[name].length };
  return true;
}

export function exitSlot(doc) {
  if (!doc.cursor.nodeId) return false;
  const place = locate(doc.root, doc.cursor.nodeId);
  if (!place) return false;
  doc.cursor = { nodeId: place.ownerId, slot: place.slot, index: place.index + 1 };
  return true;
}

export function moveCursor(doc, dir) {
  const list = positions(doc.root, null, null);
  const at = list.findIndex((item) => sameCursor(item, doc.cursor));
  const next = list[at + dir];
  if (!next) return false;
  doc.cursor = { nodeId: next.nodeId, slot: next.slot, index: next.index };
  return true;
}

export function removeBefore(doc) {
  const seq = currentSeq(doc);
  if (doc.cursor.index <= 0) {
    exitSlot(doc);
    return false;
  }
  commit(doc);
  seq.splice(doc.cursor.index - 1, 1);
  doc.cursor.index -= 1;
  return true;
}

export function placeAfter(doc, id) {
  const place = locate(doc.root, id);
  if (!place) return false;
  doc.cursor = { nodeId: place.ownerId, slot: place.slot, index: place.index + 1 };
  return true;
}

export function removeNode(doc, id) {
  const place = locate(doc.root, id);
  if (!place) return false;
  commit(doc);
  const seq = sequence(doc.root, place.ownerId, place.slot);
  seq.splice(place.index, 1);
  doc.cursor = { nodeId: place.ownerId, slot: place.slot, index: place.index };
  return true;
}

export function clearDoc(doc) {
  if (doc.root.length === 0) {
    doc.cursor = { nodeId: null, slot: null, index: 0 };
    return false;
  }
  commit(doc);
  doc.root = [];
  doc.cursor = { nodeId: null, slot: null, index: 0 };
  return true;
}

export function undo(doc) {
  if (!doc.past.length) return false;
  doc.future.push(snapshot(doc));
  if (doc.future.length > config.maxHistory) doc.future.shift();
  restore(doc, doc.past.pop());
  return true;
}

export function redo(doc) {
  if (!doc.future.length) return false;
  doc.past.push(snapshot(doc));
  if (doc.past.length > config.maxHistory) doc.past.shift();
  restore(doc, doc.future.pop());
  return true;
}

export function applySteps(doc, steps) {
  for (const step of steps) {
    if (step.op === "tile") insert(doc, step.id);
    else if (step.op === "slot") focusSlot(doc, step.name);
    else if (step.op === "out") exitSlot(doc);
  }
  return doc;
}

function insertTemplate(doc, tile) {
  commit(doc);
  const seq = currentSeq(doc);
  if (tile === "sup" && doc.cursor.index > 0) {
    const node = makeTemplate(doc, "sup");
    const base = seq[doc.cursor.index - 1];
    node.slots.base = [base];
    seq.splice(doc.cursor.index - 1, 1, node);
    doc.cursor = { nodeId: node.id, slot: "exp", index: 0 };
    return true;
  }
  const node = makeTemplate(doc, tile);
  const ownerId = doc.cursor.nodeId;
  const ownerSlot = doc.cursor.slot;
  const at = doc.cursor.index;
  seq.splice(at, 0, node);
  const empty = firstEmpty(node);
  if (empty) doc.cursor = { nodeId: node.id, slot: empty, index: 0 };
  else doc.cursor = { nodeId: ownerId, slot: ownerSlot, index: at + 1 };
  return true;
}

function makeTemplate(doc, tile) {
  const slots = {};
  for (const name of slotOrder[tile]) slots[name] = [];
  const node = { type: tile, id: takeId(doc), slots };
  if (tile === "integral") node.slots.dvar = [token(doc, "x")];
  return node;
}

function firstEmpty(node) {
  for (const name of slotOrder[node.type]) {
    if (node.slots[name].length === 0) return name;
  }
  return null;
}

function token(doc, value) {
  return { type: "tok", id: takeId(doc), value };
}

function takeId(doc) {
  const id = `n${doc.nextId}`;
  doc.nextId += 1;
  return id;
}

function currentSeq(doc) {
  return sequence(doc.root, doc.cursor.nodeId, doc.cursor.slot);
}

function sequence(root, ownerId, slot) {
  if (!ownerId) return root;
  return findById(root, ownerId).slots[slot];
}

function locate(nodes, id, ownerId = null, slot = null) {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.id === id) return { ownerId, slot, index, node };
    if (node.type !== "tok") {
      for (const name of slotOrder[node.type]) {
        const found = locate(node.slots[name], id, node.id, name);
        if (found) return found;
      }
    }
  }
  return null;
}

function positions(nodes, ownerId, slot) {
  const list = [];
  for (let index = 0; index <= nodes.length; index += 1) {
    list.push({ nodeId: ownerId, slot, index });
    if (index < nodes.length && nodes[index].type !== "tok") {
      for (const name of slotOrder[nodes[index].type]) {
        list.push(...positions(nodes[index].slots[name], nodes[index].id, name));
      }
    }
  }
  return list;
}

function sameCursor(a, b) {
  return a.nodeId === b.nodeId && a.slot === b.slot && a.index === b.index;
}

function commit(doc) {
  doc.past.push(snapshot(doc));
  if (doc.past.length > config.maxHistory) doc.past.shift();
  doc.future = [];
}

function snapshot(doc) {
  return JSON.parse(JSON.stringify({ root: doc.root, cursor: doc.cursor, nextId: doc.nextId }));
}

function restore(doc, shot) {
  doc.root = shot.root;
  doc.cursor = shot.cursor;
  doc.nextId = shot.nextId;
}
