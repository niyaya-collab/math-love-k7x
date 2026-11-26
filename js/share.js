import { config } from "./config.js";
import { drawHeart } from "./heart.js";

export async function shareCard({ lang, prettyFormula, message, proof, signature }) {
  await document.fonts.load("600 64px 'Cormorant Garamond'");
  await document.fonts.load("400 42px Vazirmatn");
  await document.fonts.load("700 42px Vazirmatn");
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  const sky = ctx.createLinearGradient(0, 0, 1080, 1350);
  sky.addColorStop(0, "#2a1038");
  sky.addColorStop(0.48, "#5b2a73");
  sky.addColorStop(1, "#ff85ad");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1080, 1350);

  ctx.fillStyle = "rgba(255, 245, 248, 0.94)";
  roundRect(ctx, 70, 90, 940, 1170, 46);
  ctx.fill();

  ctx.fillStyle = "#5b2a73";
  ctx.font = "600 54px 'Cormorant Garamond', Vazirmatn, serif";
  ctx.textAlign = "center";
  ctx.direction = "ltr";
  ctx.fillText(lang === "fa" ? "آزمایشگاه معادله‌ی عشق" : "Love Equation Lab", 540, 180);

  ctx.fillStyle = "#fff5f8";
  roundRect(ctx, 120, 220, 840, 180, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(232, 74, 127, 0.25)";
  ctx.stroke();
  ctx.fillStyle = "#4a2038";
  ctx.font = "500 46px 'Cormorant Garamond', Vazirmatn, serif";
  ctx.direction = "ltr";
  wrapText(ctx, prettyFormula || "♥", 540, 300, 760, 54, "center");

  const heart = document.createElement("canvas");
  heart.width = 360;
  heart.height = 360;
  drawHeart(heart.getContext("2d"), 360, 1, { filled: true, dot: false });
  ctx.drawImage(heart, 360, 430, 360, 300);

  ctx.fillStyle = "#4a2038";
  ctx.font = "400 36px Vazirmatn, serif";
  ctx.direction = lang === "fa" ? "rtl" : "ltr";
  wrapText(ctx, message, 540, 790, 780, 50, "center");
  ctx.fillStyle = "#e84a7f";
  ctx.font = "500 32px 'Cormorant Garamond', Vazirmatn, serif";
  wrapText(ctx, proof, 540, 1040, 780, 42, "center");
  ctx.fillStyle = "#5b2a73";
  ctx.font = "400 30px Vazirmatn, serif";
  wrapText(ctx, `${signature}  ∎`, 540, 1120, 780, 40, "center");
  ctx.fillStyle = "#c6a15b";
  ctx.font = "600 28px 'Cormorant Garamond', Vazirmatn, serif";
  const names = lang === "fa"
    ? `${config.hisName.fa}  ·  ${config.herName.fa}`
    : `${config.hisName.en}  ·  ${config.herName.en}`;
  ctx.direction = "ltr";
  ctx.fillText(names, 540, 1205);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], "love-equation.png", { type: "image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Love Equation Lab" });
      return "shared";
    }
  } catch (error) {
    if (error?.name === "AbortError") return "cancelled";
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "love-equation.png";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  return "saved";
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, align) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = trial;
  }
  if (line) lines.push(line);
  ctx.textAlign = align;
  lines.forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
}
