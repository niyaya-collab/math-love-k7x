export function heartPoint(t) {
  const s = Math.sin(t);
  return {
    x: 16 * s * s * s,
    y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
  };
}

export function drawHeart(ctx, size, progress, { filled = false, sparks = [], dot = true } = {}) {
  const pad = size * 0.14;
  const span = size - pad * 2;
  const mapX = (x) => pad + ((x + 16) / 32) * span;
  const mapY = (y) => pad + ((12 - y) / 30) * span;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2.5, size / 90);
  ctx.strokeStyle = "#e84a7f";
  ctx.fillStyle = "rgba(255, 133, 173, 0.88)";
  ctx.beginPath();
  const steps = Math.max(2, Math.floor(420 * progress));
  for (let i = 0; i <= steps; i += 1) {
    const p = heartPoint((i / 420) * Math.PI * 2);
    const x = mapX(p.x);
    const y = mapY(p.y);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  if (filled || progress >= 1) ctx.fill();
  ctx.stroke();
  if (dot && progress > 0 && progress < 1) {
    const p = heartPoint(progress * Math.PI * 2);
    ctx.beginPath();
    ctx.fillStyle = "#fff8ef";
    ctx.arc(mapX(p.x), mapY(p.y), Math.max(4, size / 48), 0, Math.PI * 2);
    ctx.fill();
  }
  for (const spark of sparks) {
    ctx.globalAlpha = spark.life;
    ctx.fillStyle = spark.gold ? "#ffd27a" : "#fff5f8";
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function playHeart(canvas, { reduced = false } = {}) {
  const ctx = canvas.getContext("2d");
  const css = canvas.clientWidth || 280;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(css * dpr);
  canvas.height = Math.round(css * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const strokeMs = reduced ? 0 : 2500;
  const fillMs = reduced ? 180 : 700;
  const start = performance.now();
  const sparks = Array.from({ length: reduced ? 0 : 16 }, (_, i) => ({
    x: css / 2,
    y: css * 0.46,
    vx: Math.cos((i / 16) * Math.PI * 2) * (0.35 + (i % 3) * 0.12),
    vy: Math.sin((i / 16) * Math.PI * 2) * (0.35 + (i % 4) * 0.1) - 0.15,
    r: 1.6 + (i % 3),
    life: 0,
    gold: i % 2 === 0,
  }));

  return new Promise((resolve) => {
    const frame = (now) => {
      const elapsed = now - start;
      let progress = 1;
      let filled = reduced;
      if (!reduced) {
        if (elapsed < strokeMs) progress = elapsed / strokeMs;
        else {
          progress = 1;
          filled = true;
          const fillT = Math.min(1, (elapsed - strokeMs) / fillMs);
          for (const spark of sparks) {
            spark.life = 1 - fillT;
            spark.x += spark.vx * 2.2;
            spark.y += spark.vy * 2.2;
          }
        }
      } else {
        filled = true;
      }
      drawHeart(ctx, css, progress, {
        filled,
        sparks: filled ? sparks : [],
        dot: !reduced && progress < 1,
      });
      const done = reduced ? elapsed > fillMs : elapsed > strokeMs + fillMs;
      if (done) resolve();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
