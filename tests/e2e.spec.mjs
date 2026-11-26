import { test, expect } from "@playwright/test";
import { recipes } from "../js/recipes.js";

const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "desk", width: 1280, height: 800 },
];

async function place(page, id) {
  const tile = page.locator(`[data-tile="${id}"]`);
  const tab = await tile.getAttribute("data-tab");
  await page.locator(`[data-tab-btn="${tab}"]`).click();
  await tile.click();
}

async function focusSlot(page, name) {
  const node = page.locator(".node", { has: page.locator(".slot.active") }).last();
  await node.locator(`[data-slot="${name}"]`).click();
}

async function build(page, steps) {
  for (const step of steps) {
    if (step.op === "tile") await place(page, step.id);
    else if (step.op === "slot") await focusSlot(page, step.name);
    else await page.locator("#leave").click();
  }
}

async function openLab(page, lang) {
  await page.goto("/");
  await page.locator("#start").click();
  await page.locator(lang === "fa" ? "#lang-fa" : "#lang-en").click();
}

for (const viewport of viewports) {
  for (const lang of ["fa", "en"]) {
    test(`${viewport.name} ${lang} recognizes every formula`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        errors.push(msg.text());
      });
      page.on("response", (response) => {
        if (response.status() === 404) errors.push(`404 ${response.url()}`);
      });
      await page.setViewportSize(viewport);
      await openLab(page, lang);
      await expect(page.locator("html")).toHaveAttribute("dir", lang === "fa" ? "rtl" : "ltr");
      await expect(page.locator("#expr")).toHaveAttribute("dir", "ltr");
      const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily.toLowerCase());
      const titleFont = await page.evaluate(() => getComputedStyle(document.querySelector("h1")).fontFamily.toLowerCase());
      expect(bodyFont).toContain("vazirmatn");
      expect(titleFont).toContain("cormorant");

      for (const recipe of recipes) {
        await build(page, recipe.steps);
        await page.locator("#solve").click();
        await expect(page.locator("#result-card")).toBeVisible();
        await expect(page.locator("#theorem-text")).toHaveText(recipe.message[lang]);
        await expect(page.locator("#result-card")).toHaveAttribute("data-recipe", recipe.id);
        const box = await page.evaluate(() => ({
          sw: document.documentElement.scrollWidth,
          cw: document.documentElement.clientWidth,
        }));
        expect(box.sw).toBeLessThanOrEqual(box.cw + 1);
        await page.locator("#continue").click();
        await page.locator("#clear").click();
        await page.locator("#confirm-yes").click();
      }

      await place(page, "integral");
      await page.locator("#solve").click();
      await expect(page.locator("#toast")).toHaveText(lang === "fa" ? "هنوز یه شکاف خالی داره 🌸" : "There's still an empty slot 🌸");
      await expect(page.locator(".slot.need")).toHaveCount(1);
      await page.locator("#clear").click();
      await page.locator("#confirm-yes").click();

      await place(page, "7");
      await place(page, "plus");
      await place(page, "7");
      await page.locator("#undo").click();
      await expect(page.locator("#expr")).toHaveText("7+");
      await page.locator("#redo").click();
      await expect(page.locator("#expr")).toHaveText("7+7");
      await page.locator("#solve").click();
      await expect(page.locator("#result-card")).toHaveAttribute("data-kind", "pool");
      await expect(page.locator("#result-card")).toHaveAttribute("data-pool", "number");
      await page.locator("#continue").click();
      await page.locator("#clear").click();
      await page.locator("#confirm-yes").click();

      await page.locator("#hint").click();
      await page.locator('[data-show="pi-heart"]').click();
      await expect(page.locator("#theorem-text")).toHaveText(recipes.find((item) => item.id === "pi-heart").message[lang], { timeout: 20000 });
      const download = page.waitForEvent("download");
      await page.locator("#save-card").click();
      expect((await download).suggestedFilename()).toContain("love-equation");
      expect(errors).toEqual([]);
    });
  }
}
