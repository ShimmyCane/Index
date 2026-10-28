/* Felix Maze characters and props: simple, bold line drawings that print well in black and white.
   Each is drawn in a 100 × 100 box centered on (0,0). FMZ.art.draw(name, x, y, size) places one.
   Characters are tracked in characters.md. All drawings are original. */
(function (root) {
  "use strict";
  const K = 'stroke="#222" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  const F = (fill = "#fff") => `fill="${fill}" ${K}`;

  const ART = {
    // Felix the cat: our own striped kitten (not the old cartoon cat).
    cat: () => `
      <path d="M-26 44 C-34 20 -30 6 -22 0 L22 0 C30 6 34 20 26 44 Z" ${F()}/>
      <path d="M26 38 C46 38 48 18 38 12" fill="none" ${K}/>
      <path d="M-36 -10 L-30 -46 L-12 -30 Z M36 -10 L30 -46 L12 -30 Z" ${F()}/>
      <ellipse cx="0" cy="-14" rx="36" ry="28" ${F()}/>
      <path d="M-27 -38 L-22 -32 M27 -38 L22 -32" fill="none" ${K}/>
      <path d="M-6 -40 L-6 -32 M0 -42 L0 -33 M6 -40 L6 -32" fill="none" ${K}/>
      <ellipse cx="-13" cy="-16" rx="4.5" ry="6.5" fill="#222"/>
      <ellipse cx="13" cy="-16" rx="4.5" ry="6.5" fill="#222"/>
      <path d="M-4 -6 L4 -6 L0 -2 Z" fill="#222" ${K}/>
      <path d="M0 -2 Q-6 4 -10 0 M0 -2 Q6 4 10 0" fill="none" ${K}/>
      <path d="M-18 -6 L-40 -10 M-18 -2 L-40 2 M18 -6 L40 -10 M18 -2 L40 2" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-14 16 L-10 24 M0 14 L0 24 M14 16 L10 24" fill="none" ${K}/>`,
    mouse: () => `
      <circle cx="-20" cy="-26" r="15" ${F()}/><circle cx="-20" cy="-26" r="7" fill="none" ${K}/>
      <circle cx="12" cy="-28" r="15" ${F()}/><circle cx="12" cy="-28" r="7" fill="none" ${K}/>
      <path d="M-40 24 C-44 -8 -20 -20 4 -14 C24 -10 40 2 46 10 C36 20 10 30 -40 24 Z" ${F()}/>
      <circle cx="46" cy="10" r="4" fill="#222"/>
      <circle cx="18" cy="-2" r="4" fill="#222"/>
      <path d="M-40 22 C-56 22 -54 40 -40 40" fill="none" ${K}/>
      <path d="M36 4 L48 -6 M38 12 L52 14" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>`,
    cheese: () => `
      <path d="M-40 30 L-40 -4 L40 -30 L40 30 Z" ${F()}/>
      <path d="M-40 -4 L40 -30" fill="none" ${K}/>
      <circle cx="-16" cy="12" r="7" fill="none" ${K}/><circle cx="16" cy="-4" r="5" fill="none" ${K}/>
      <circle cx="22" cy="18" r="6" fill="none" ${K}/><circle cx="-30" cy="22" r="3" fill="none" ${K}/>`,
    bee: () => `
      <ellipse cx="-12" cy="-26" rx="16" ry="11" transform="rotate(-25 -12 -26)" ${F()}/>
      <ellipse cx="12" cy="-28" rx="16" ry="11" transform="rotate(20 12 -28)" ${F()}/>
      <ellipse cx="0" cy="6" rx="34" ry="24" ${F()}/>
      <path d="M-12 -16 Q-6 6 -12 28 M6 -17 Q12 6 6 29" fill="none" stroke="#222" stroke-width="7"/>
      <circle cx="-30" cy="0" r="16" ${F()}/>
      <circle cx="-34" cy="-3" r="3" fill="#222"/><path d="M-36 6 Q-31 10 -26 6" fill="none" ${K}/>
      <path d="M-34 -14 Q-40 -30 -48 -30 M-26 -15 Q-26 -32 -20 -36" fill="none" ${K}/>
      <path d="M34 6 L44 6" fill="none" ${K}/>`,
    flower: () => `
      <path d="M0 10 Q4 30 0 48" fill="none" ${K}/>
      <path d="M2 34 Q18 22 26 30 Q16 42 2 36 Z" ${F()}/>
      ${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="0" cy="-22" rx="11" ry="17" transform="rotate(${a} 0 -2)" ${F()}/>`).join("")}
      <circle cx="0" cy="-2" r="12" fill="#222"/>`,
    ant: () => `
      <path d="M-14 6 L-26 26 M-4 8 L-6 30 M6 6 L16 26 M-12 -2 L-28 -14 M-2 -4 L-4 -22 M8 -2 L22 -14" fill="none" ${K}/>
      <ellipse cx="26" cy="0" rx="18" ry="14" ${F()}/>
      <ellipse cx="0" cy="2" rx="11" ry="9" ${F()}/>
      <circle cx="-24" cy="-4" r="13" ${F()}/>
      <circle cx="-28" cy="-7" r="3" fill="#222"/>
      <path d="M-28 4 Q-24 8 -20 4" fill="none" ${K}/>
      <path d="M-30 -16 Q-36 -32 -44 -30 M-22 -16 Q-20 -32 -12 -34" fill="none" ${K}/>`,
    cookie: () => `
      <path d="M-36 -8 C-36 -34 30 -40 36 -10 C42 20 14 38 -6 36 C-30 34 -36 14 -36 -8 Z" ${F()}/>
      <circle cx="-14" cy="-10" r="5" fill="#222"/><circle cx="12" cy="-16" r="4" fill="#222"/>
      <circle cx="16" cy="10" r="5" fill="#222"/><circle cx="-10" cy="16" r="4" fill="#222"/>`,
    spider: () => `
      ${[-1, 1].map(s => `<path d="M${s * 12} -6 Q${s * 34} -30 ${s * 46} -18 M${s * 14} 0 Q${s * 38} -10 ${s * 50} 4 M${s * 14} 6 Q${s * 36} 14 ${s * 46} 28 M${s * 10} 12 Q${s * 26} 30 ${s * 32} 44" fill="none" ${K}/>`).join("")}
      <path d="M0 -50 L0 -24" fill="none" stroke="#222" stroke-width="2"/>
      <ellipse cx="0" cy="4" rx="20" ry="22" ${F()}/>
      <circle cx="-7" cy="-2" r="5" ${F()}/><circle cx="7" cy="-2" r="5" ${F()}/>
      <circle cx="-7" cy="-1" r="2.2" fill="#222"/><circle cx="7" cy="-1" r="2.2" fill="#222"/>
      <path d="M-8 10 Q0 17 8 10" fill="none" ${K}/>`,
    star: () => `<path d="${starPath(0, 0, 40, 17, 5)}" ${F()}/>`,
    heart: () => `<path d="M0 36 C-46 6 -40 -34 -14 -34 C-4 -34 0 -24 0 -18 C0 -24 4 -34 14 -34 C40 -34 46 6 0 36 Z" ${F()}/>`,
    train: () => `
      <rect x="-42" y="-12" width="56" height="34" rx="6" ${F()}/>
      <rect x="14" y="-30" width="28" height="52" rx="5" ${F()}/>
      <rect x="20" y="-24" width="16" height="14" rx="3" fill="none" ${K}/>
      <rect x="-30" y="-28" width="12" height="16" ${F()}/>
      <circle cx="-26" cy="30" r="10" ${F()}/><circle cx="0" cy="30" r="10" ${F()}/><circle cx="28" cy="30" r="10" ${F()}/>
      <path d="M-24 -36 Q-14 -46 -4 -40" fill="none" ${K}/>`,
    house: () => `
      <path d="M-34 -2 L-34 40 L34 40 L34 -2" ${F()}/>
      <path d="M-44 0 L0 -40 L44 0 Z" ${F()}/>
      <rect x="-10" y="14" width="20" height="26" ${F()}/>
      <rect x="14" y="6" width="12" height="12" fill="none" ${K}/>`,
    yarn: () => `
      <path d="M26 24 C40 34 50 26 46 40" fill="none" ${K}/>
      <circle cx="0" cy="0" r="34" ${F()}/>
      <path d="M-30 -14 Q0 -2 28 -20 M-34 4 Q0 18 32 0 M-24 24 Q4 30 22 22 M-10 -32 Q-22 0 -6 33 M10 -33 Q24 0 8 34" fill="none" stroke="#222" stroke-width="3"/>`,
    moon: () => `<path d="M10 -40 A40 40 0 1 0 38 20 A32 32 0 1 1 10 -40 Z" ${F()}/>`,
    rosette: () => `
      ${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="0" cy="-20" r="17" transform="rotate(${a})" ${F()}/>`).join("")}
      <circle cx="0" cy="0" r="14" ${F()}/>`,
    tree: () => `
      <path d="M-8 44 L-6 8 L6 8 L8 44 Z" ${F()}/>
      <path d="M-34 6 C-50 -10 -30 -40 -12 -34 C-6 -50 22 -48 26 -30 C46 -28 46 4 28 8 C16 18 -20 18 -34 6 Z" ${F()}/>`,
    figure: () => `
      <circle cx="0" cy="-36" r="12" ${F()}/>
      <path d="M0 -24 L0 12 M0 -16 L-22 -34 M0 -16 L24 -30 M0 12 L-18 40 M0 12 L18 40" fill="none" stroke="#222" stroke-width="9" stroke-linecap="round"/>`
  };

  function starPath(cx, cy, R, r, n) {
    let d = "";
    for (let i = 0; i < 2 * n; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / n, rad = i % 2 ? r : R;
      d += (i ? "L" : "M") + (cx + rad * Math.cos(a)).toFixed(1) + " " + (cy + rad * Math.sin(a)).toFixed(1);
    }
    return d + "Z";
  }

  function draw(name, x, y, size, rot = 0) {
    const f = ART[name];
    if (!f) return "";
    const k = size / 100;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${k.toFixed(3)})">${f()}</g>`;
  }

  root.FMZ = root.FMZ || {};
  root.FMZ.art = { draw, starPath, names: Object.keys(ART) };
})(typeof window !== "undefined" ? window : globalThis);
