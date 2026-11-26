const SYMBOLS = ["∫", "Σ", "π", "√", "∞", "θ", "λ", "e", "∂", "φ", "∑", "∞"];

export function startSky(canvas, host) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || navigator.deviceMemory <= 4;
  const count = weak ? 56 : 104;
  const stars = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.3 + 0.3,
    p: Math.random() * Math.PI * 2,
  }));
  const ctx = canvas.getContext("2d");
  let frame = 0;
  let running = true;

  const symbols = SYMBOLS.slice(0, weak ? 8 : 12);
  host.replaceChildren();
  symbols.forEach((glyph, index) => {
    const el = document.createElement("span");
    el.textContent = glyph;
    el.style.left = `${6 + ((index * 17) % 88)}%`;
    el.style.animationDelay = `${-index * 2.4}s`;
    el.style.fontSize = `${18 + (index % 4) * 6}px`;
    host.append(el);
  });

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function constellation(cx, cy, kind, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = "rgba(255, 210, 122, 0.28)";
    ctx.fillStyle = "rgba(255, 245, 248, 0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (kind === "sine") {
      for (let x = -90; x <= 90; x += 3) {
        const y = Math.sin(x / 16) * 28;
        if (x === -90) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (kind === "parabola") {
      for (let x = -70; x <= 70; x += 3) {
        const y = (x * x) / 90 - 24;
        if (x === -70) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      for (let i = 0; i <= 80; i += 1) {
        const t = (i / 80) * Math.PI * 2;
        const s = Math.sin(t);
        const x = 16 * s * s * s * 2.1;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 2.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    for (const dot of [-60, -20, 20, 60]) {
      ctx.beginPath();
      ctx.arc(dot, kind === "parabola" ? (dot * dot) / 90 - 24 : Math.sin(dot / 16) * 28, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function paint(now) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    for (const star of stars) {
      const twinkle = reduced ? 0.55 : 0.35 + Math.sin(now / 900 + star.p) * 0.35;
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = "#fff5f8";
      ctx.beginPath();
      ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    const angle = reduced ? 0.2 : now / 28000;
    constellation(w * 0.78, h * 0.18, "sine", angle);
    constellation(w * 0.16, h * 0.3, "parabola", -angle * 0.7);
    constellation(w * 0.62, h * 0.72, "heart", angle * 0.45);
  }

  function loop(now) {
    if (!running) return;
    paint(now || 0);
    if (!reduced) frame = requestAnimationFrame(loop);
  }

  resize();
  loop(performance.now());
  window.addEventListener("resize", () => {
    resize();
    if (reduced) paint(0);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frame);
    } else if (!reduced) {
      running = true;
      frame = requestAnimationFrame(loop);
    }
  });
}
