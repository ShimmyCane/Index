// Athena's world: drawn placeholder pictures of the people you meet on a job card.
// personSVG(job) returns an SVG string: a smiling face with hair, a work outfit and, for some jobs, a hat.
// Each job always gets the same picture (picked from its id). Real drawings can replace these later.
(function () {
  const INK = '#3b3a4a';
  const SKIN = ['#FBDCC4', '#F3C79E', '#E3AE7C', '#C98C5E', '#9C6644', '#FFE0BD'];
  const HAIR = ['#3b2a20', '#6b4226', '#2b2b33', '#c98a3d', '#a0522d', '#e2bb72', '#4a3328'];
  const BG = ['#CDEFE0', '#FBE9A6', '#F9C8A8', '#D9C8F0', '#BFE3F5', '#F7B8CF', '#B9D8A8'];
  const OUTFIT = {
    doctor: '#FFFFFF', veterinarian: '#FFFFFF', scientist: '#FFFFFF', chef: '#FFFFFF', baker: '#FFFFFF', astronaut: '#F2F2F7',
    nurse: '#8FD6CF', builder: '#F7A65A', firefighter: '#EA7468', 'police-officer': '#7E8FC8', pilot: '#6E7FB0',
    'flight-attendant': '#7E8FC8', 'bus-driver': '#8EC5EA', 'train-driver': '#6E7FB0', sailor: '#FFFFFF', farmer: '#8EC5EA',
    gardener: '#B9D8A8', beekeeper: '#FFFDF7', lifeguard: '#EA7468', 'mail-carrier': '#8EC5EA', electrician: '#F4C95D'
  };
  const MEN = ['👨', '👷‍♂️', '👴', '🧔'];
  const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

  function personSVG(job) {
    const id = job.id || 'x', h = hash(id);
    const man = MEN.some(m => (job.person || '').startsWith(m));
    const old = /👴|👵/.test(job.person || '');
    const skin = SKIN[h % SKIN.length];
    const hair = old ? '#DCDCE4' : HAIR[(h >>> 3) % HAIR.length];
    const bg = BG[(h >>> 5) % BG.length];
    const shirt = OUTFIT[id] || BG[(h >>> 7) % BG.length];
    const styles = man ? ['short', 'curly', 'side'] : ['long', 'bun', 'pony', 'bob', 'curly', 'braids'];
    const style = styles[(h >>> 9) % styles.length];
    const glasses = ['scientist', 'librarian', 'author', 'coder', 'engineer', 'tailor'].includes(id);
    const p = [];
    p.push(`<circle cx="60" cy="60" r="58" fill="${bg}"/>`);
    // hair behind the head (long styles)
    if (style === 'long') p.push(`<path d="M30 58 Q30 24 60 24 Q90 24 90 58 L92 96 Q60 104 28 96 Z" fill="${hair}" stroke="${INK}" stroke-width="2.5"/>`);
    if (style === 'braids') p.push(`<path d="M33 60 L30 98" stroke="${hair}" stroke-width="9" stroke-linecap="round"/><path d="M87 60 L90 98" stroke="${hair}" stroke-width="9" stroke-linecap="round"/>`);
    if (style === 'pony') p.push(`<path d="M84 44 Q104 54 96 84 Q90 70 84 62 Z" fill="${hair}" stroke="${INK}" stroke-width="2.5"/>`);
    // shoulders and neck
    p.push(`<path d="M16 120 Q18 92 44 88 L76 88 Q102 92 104 120 Z" fill="${shirt}" stroke="${INK}" stroke-width="2.5"/>`);
    p.push(`<rect x="52" y="76" width="16" height="16" rx="4" fill="${skin}" stroke="${INK}" stroke-width="2.5"/>`);
    p.push(`<path d="M48 88 L60 100 L72 88" fill="none" stroke="${INK}" stroke-width="2.5"/>`);
    if (['doctor', 'nurse', 'veterinarian'].includes(id)) p.push(`<path d="M46 90 Q48 108 60 108 Q72 108 74 90" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="60" cy="109" r="4" fill="#C9CBD6" stroke="${INK}" stroke-width="2"/>`);
    // ears and head
    p.push(`<circle cx="34" cy="58" r="6" fill="${skin}" stroke="${INK}" stroke-width="2.5"/><circle cx="86" cy="58" r="6" fill="${skin}" stroke="${INK}" stroke-width="2.5"/>`);
    p.push(`<ellipse cx="60" cy="56" rx="26" ry="28" fill="${skin}" stroke="${INK}" stroke-width="2.5"/>`);
    // face
    p.push(`<ellipse cx="50" cy="58" rx="3" ry="4" fill="${INK}"/><ellipse cx="70" cy="58" rx="3" ry="4" fill="${INK}"/>`);
    p.push(`<circle cx="44" cy="67" r="4.5" fill="#F7A6B8" opacity="0.7"/><circle cx="76" cy="67" r="4.5" fill="#F7A6B8" opacity="0.7"/>`);
    p.push(`<path d="M51 69 Q60 77 69 69" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`);
    if (glasses) p.push(`<circle cx="50" cy="58" r="7" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="70" cy="58" r="7" fill="none" stroke="${INK}" stroke-width="2"/><path d="M57 58 L63 58" stroke="${INK}" stroke-width="2"/>`);
    if (man && old) p.push(`<path d="M40 70 Q60 92 80 70 Q74 84 60 86 Q46 84 40 70 Z" fill="${hair}" stroke="${INK}" stroke-width="2"/>`);
    // hair on top
    const top = {
      long:  `<path d="M34 50 Q36 26 60 26 Q84 26 86 50 Q72 40 60 34 Q50 42 34 50 Z"`,
      bun:   `<circle cx="60" cy="24" r="10" fill="${hair}" stroke="${INK}" stroke-width="2.5"/><path d="M34 50 Q36 28 60 28 Q84 28 86 50 Q70 38 34 50 Z"`,
      pony:  `<path d="M34 50 Q36 28 60 28 Q84 28 86 50 Q62 36 34 50 Z"`,
      bob:   `<path d="M32 70 Q28 28 60 26 Q92 28 88 70 L82 70 Q82 46 66 38 Q52 46 38 48 L38 70 Z"`,
      curly: `<path d="M32 54 Q26 40 36 34 Q36 22 50 24 Q58 16 68 23 Q82 20 84 34 Q94 40 88 54 Q82 42 72 40 Q60 46 48 40 Q38 44 32 54 Z"`,
      braids:`<path d="M34 52 Q36 28 60 28 Q84 28 86 52 Q60 30 34 52 Z"`,
      short: `<path d="M34 48 Q34 26 60 26 Q86 26 86 48 Q80 36 60 36 Q40 36 34 48 Z"`,
      side:  `<path d="M34 50 Q32 26 58 26 Q88 24 86 46 Q70 34 52 40 Q42 42 34 50 Z"`
    }[style];
    p.push(top.endsWith('"') ? top + ` fill="${hair}" stroke="${INK}" stroke-width="2.5"/>` : top);
    // hats
    const hat = {
      chef: `<path d="M40 36 Q32 14 48 14 Q52 2 62 8 Q74 2 76 16 Q90 16 80 36 Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/><rect x="40" y="32" width="40" height="8" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`,
      baker: `<path d="M38 38 Q40 20 60 20 Q80 20 82 38 Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`,
      builder: `<path d="M32 40 Q34 16 60 16 Q86 16 88 40 Z" fill="#F4C95D" stroke="${INK}" stroke-width="2.5"/><rect x="26" y="38" width="68" height="7" rx="3" fill="#F4C95D" stroke="${INK}" stroke-width="2.5"/>`,
      firefighter: `<path d="M32 40 Q34 14 60 14 Q86 14 88 40 Z" fill="#EA7468" stroke="${INK}" stroke-width="2.5"/><rect x="24" y="38" width="72" height="7" rx="3" fill="#EA7468" stroke="${INK}" stroke-width="2.5"/><circle cx="60" cy="27" r="5" fill="#F4C95D" stroke="${INK}" stroke-width="2"/>`,
      'police-officer': `<path d="M34 36 Q36 18 60 18 Q84 18 86 36 Z" fill="#6E7FB0" stroke="${INK}" stroke-width="2.5"/><path d="M34 36 L86 36 L92 42 L40 42 Z" fill="${INK}"/><circle cx="60" cy="28" r="4" fill="#F4C95D"/>`,
      pilot: `<path d="M34 36 Q36 18 60 18 Q84 18 86 36 Z" fill="#6E7FB0" stroke="${INK}" stroke-width="2.5"/><path d="M34 36 L86 36 L92 42 L40 42 Z" fill="${INK}"/><path d="M52 27 L60 23 L68 27" stroke="#F4C95D" stroke-width="3" fill="none"/>`,
      'bus-driver': `<path d="M34 36 Q36 18 60 18 Q84 18 86 36 Z" fill="#8EC5EA" stroke="${INK}" stroke-width="2.5"/><path d="M34 36 L86 36 L92 42 L40 42 Z" fill="${INK}"/>`,
      'train-driver': `<path d="M34 36 Q36 18 60 18 Q84 18 86 36 Z" fill="#6E7FB0" stroke="${INK}" stroke-width="2.5"/><path d="M34 36 L86 36 L92 42 L40 42 Z" fill="${INK}"/>`,
      'flight-attendant': `<ellipse cx="72" cy="30" rx="14" ry="6" fill="#7E8FC8" stroke="${INK}" stroke-width="2.5"/>`,
      sailor: `<path d="M38 34 Q40 22 60 22 Q80 22 82 34 Z" fill="#fff" stroke="${INK}" stroke-width="2.5"/><rect x="36" y="32" width="48" height="6" rx="3" fill="#8EC5EA" stroke="${INK}" stroke-width="2"/>`,
      farmer: `<ellipse cx="60" cy="34" rx="40" ry="8" fill="#F2D36B" stroke="${INK}" stroke-width="2.5"/><path d="M40 34 Q42 14 60 14 Q78 14 80 34 Z" fill="#F2D36B" stroke="${INK}" stroke-width="2.5"/><path d="M41 30 L79 30" stroke="#EA7468" stroke-width="4"/>`,
      gardener: `<ellipse cx="60" cy="34" rx="40" ry="8" fill="#F2D36B" stroke="${INK}" stroke-width="2.5"/><path d="M40 34 Q42 14 60 14 Q78 14 80 34 Z" fill="#F2D36B" stroke="${INK}" stroke-width="2.5"/><circle cx="72" cy="26" r="5" fill="#F7B8CF" stroke="${INK}" stroke-width="2"/>`,
      beekeeper: `<ellipse cx="60" cy="34" rx="40" ry="8" fill="#FFFDF7" stroke="${INK}" stroke-width="2.5"/><path d="M40 34 Q42 14 60 14 Q78 14 80 34 Z" fill="#FFFDF7" stroke="${INK}" stroke-width="2.5"/><path d="M24 36 L30 84 M96 36 L90 84" stroke="${INK}" stroke-width="1.5" opacity="0.5"/>`,
      astronaut: `<circle cx="60" cy="56" r="40" fill="#BFE3F5" fill-opacity="0.35" stroke="${INK}" stroke-width="3"/><path d="M36 30 Q46 22 56 22" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,
      lifeguard: `<path d="M38 40 Q40 26 60 26 Q80 26 82 40 L92 44 L38 44 Z" fill="#EA7468" stroke="${INK}" stroke-width="2.5"/>`
    }[id];
    if (hat) p.push(hat);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${(job.who || job.name || '').replace(/"/g, '')}">${p.join('')}</svg>`;
  }
  window.personSVG = personSVG;
})();
