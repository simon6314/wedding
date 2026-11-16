'use strict';
// ===== 婚宴咖啡廳：Q 版賓客在平面圖裡自己走動 =====
// 座標以平面圖（橫式 1120 × 770）為準；直式手機版把整張圖逆時針轉 90 度，人物維持正立。

const CFG = window.WEDDING || {};
const PW = 1120, PH = 770;

// ---- 場地（照 Honeywood 的平面圖） ----
const AREAS = [
  { id: 'sign', kind: 'sign', x: 143, y: 44, w: 297, h: 110, label: 'Honeywood', sub: '美式饗宴', solid: true },
  { id: 'room', kind: 'room', x: 145, y: 160, w: 292, h: 116, label: '包廂區', sub: '（不安排入座）', solid: true },
  { id: 'sound', kind: 'zone', x: 443, y: 71, w: 89, h: 139, label: '音控區', sub: '工作人員', solid: true },
  { id: 'drink', kind: 'drink', x: 441, y: 226, w: 84, h: 54, label: '飲料區', solid: true },
  { id: 'send', kind: 'dash', x: 154, y: 286, w: 200, h: 36, label: '送客區' },
  { id: 'ent2', kind: 'dash', x: 40, y: 50, w: 100, h: 46, label: '入口處 2' },
  { id: 'kitchen', kind: 'kitchen', x: 39, y: 453, w: 61, h: 75, label: '出菜口', solid: true },
  { id: 'counter', kind: 'counter', x: 38, y: 534, w: 392, h: 138, label: '備餐區 / 櫃台', solid: true },
  { id: 'gift', kind: 'gift', x: 437, y: 552, w: 52, h: 82, label: '收禮桌', solid: true },
  { id: 'ent1', kind: 'dash', x: 484, y: 641, w: 102, h: 30, label: '入口處 1', keep: 1 },
  { id: 'door', kind: 'door', x: 438, y: 683, w: 196, h: 85, label: '透明玻璃門', keep: 1 },
  { id: 'album', kind: 'album', x: 484, y: 738, w: 72, h: 30, label: '相本桌', solid: true, keep: 1 },
  { id: 'stage', kind: 'stage', x: 951, y: 392, w: 112, h: 165, label: '活動區' },
  { id: 'screen', kind: 'screen', x: 1067, y: 392, w: 31, h: 155, solid: true },
  { id: 'long1', kind: 'long', x: 581, y: 374, w: 363, h: 30, solid: true, keep: 1.15 },
  { id: 'long2', kind: 'long', x: 581, y: 409, w: 363, h: 29, solid: true, keep: 1.15 },
  { id: 'sofa1', kind: 'sofa', x: 987, y: 40, w: 73, h: 30, solid: true, keep: 1 },
  { id: 'sofa2', kind: 'sofa', x: 1063, y: 40, w: 37, h: 128, solid: true, keep: 1 },
];
// 桌子：seats = 座位數（第 8、10 桌是 6 人桌）
const TABLES = [
  { n: 1, round: true, cx: 1020, cy: 118, r: 25, seats: 6 },
  { n: 2, x: 868, y: 38, w: 84, h: 110, seats: 6 },
  { n: 3, x: 733, y: 38, w: 84, h: 110, seats: 6 },
  { n: 4, x: 598, y: 38, w: 84, h: 110, seats: 6 },
  { n: 5, x: 843, y: 194, w: 123, h: 64, seats: 6 },
  { n: 6, x: 635, y: 192, w: 146, h: 68, seats: 6 },
  { n: 7, x: 791, y: 305, w: 145, h: 62, seats: 8 },   // 8 人桌，大小和第 11、12 桌一樣
  { n: 8, x: 638, y: 307, w: 109, h: 57, seats: 6 },
  { n: 9, x: 813, y: 447, w: 109, h: 58, seats: 6 },
  { n: 10, x: 616, y: 447, w: 109, h: 58, seats: 6 },   // 6 人桌，大小和第 8、9 桌一樣
  { n: 11, x: 862, y: 568, w: 145, h: 69, seats: 8 },
  { n: 12, x: 660, y: 571, w: 144, h: 69, seats: 8 },
  { n: 0, main: true, x: 998, y: 244, w: 69, h: 142, seats: 6 },   // 主桌（活動區旁）
];
// 可以走的範圍：大廳、入口 1 的門口、門外（相本桌、賓客入口）
const WALKABLE = [
  { x: 30, y: 22, w: 1078, h: 652, raw: true },
  { x: 492, y: 668, w: 88, h: 18, keep: 1 },
  { x: 220, y: 682, w: 480, h: 86, raw: true },
];
const PTS = {
  guestIn: [800, 742], ent1: [536, 692], gift: [508, 596], ent2: [92, 112],
  kitchen: [116, 492], album: [520, 726], stageC: [1004, 476],
  greet: [[566, 612], [590, 612], [546, 570], [569, 570], [592, 570], [615, 570]],
  drink: [[452, 298], [483, 302], [514, 298], [541, 272], [545, 246], [540, 222]],
  staffIdle: [[180, 520], [260, 522], [340, 520]],
  lounge: { x: 110, y: 340, w: 440, h: 170 },
};

// ---- 小工具 ----
let seed = 20261116;
const srand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);

// ---- 假賓客 ----
const SURNAME = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '郭', '洪', '曾', '邱', '廖', '賴', '周', '徐', '蘇'];
const GIVEN_M = ['家豪', '冠宇', '承翰', '志明', '建宏', '宗翰', '俊傑', '彥廷', '柏宇', '冠廷', '文華', '宥辰', '品睿', '子軒'];
const GIVEN_F = ['怡君', '雅婷', '佳穎', '欣怡', '淑芬', '詩涵', '雅筑', '郁婷', '品妤', '思妤', '美玲', '子晴', '語彤', '筱涵'];
function fakeGuests() {
  // 每桌人數（含一家 4 口）；7、8、11、12 桌各有一組一家 4 口（爸爸填表、2 個小朋友）
  const counts = { 1: 5, 2: 6, 3: 6, 4: 5, 5: 6, 6: 5, 7: 6, 8: 7, 9: 5, 10: 4, 11: 5, 12: 4 };
  const families = { 7: 1, 8: 1, 11: 1, 12: 1 };
  const out = [];
  for (const t of Object.keys(counts)) {
    let left = counts[t];
    for (let f = 0; f < (families[t] || 0); f++) {
      const sn = SURNAME[Math.floor(srand() * SURNAME.length)];
      out.push({ name: sn + GIVEN_M[Math.floor(srand() * 14)], table: +t, g: 'm', count: 4, kids: 2 });
      left -= 4;
    }
    for (let i = 0; i < left; i++) {
      const g = srand() < 0.5 ? 'm' : 'f';
      const sn = SURNAME[Math.floor(srand() * SURNAME.length)];
      out.push({ name: sn + (g === 'm' ? GIVEN_M : GIVEN_F)[Math.floor(srand() * 14)], table: +t, g });
    }
  }
  return out;
}

// ---- Q 版角色 ----
const SKIN = ['#ffe4d0', '#fcdcc4', '#f6d2b8', '#f0c6a6'];
const HAIR = ['#2e2a30', '#3b2f2f', '#5b3a29', '#7a523c', '#4a3b52', '#8c5a3c', '#1f1d24', '#a8743f'];
const SUIT = ['#3b4a6b', '#5c6370', '#7a5c48', '#2f3a4a', '#4f6f5f', '#8a7a6a', '#6a4f7a', '#a9b7c9'];
const DRESS = ['#f7a8c0', '#c9a0e6', '#9fd8cb', '#ffd66b', '#9fd0f0', '#ef9f8a', '#f2c6a0', '#b8e0a0', '#e6b8d8', '#f5b48f'];
const TIE = ['#e8574f', '#3f7fd0', '#f2a03d', '#7c5cc0', '#2f9e7a', '#d94f8a'];

function lookFor(p) {
  // 外型用名字決定：名單增減時，其他人的樣子不會跟著變
  let hs = 2166136261;
  for (const ch of `${p.name}#${p.famIdx || 0}`) hs = Math.imul(hs ^ ch.codePointAt(0), 16777619) >>> 0;
  const r = () => { hs = Math.imul(hs ^ (hs >>> 15), 2246822507) >>> 0; hs = Math.imul(hs ^ (hs >>> 13), 3266489909) >>> 0; hs ^= hs >>> 16; return (hs >>> 0) / 4294967296; };
  const lk = { g: p.g, kid: !!p.kid, skin: SKIN[Math.floor(r() * 4)], hair: p.elder ? (r() < 0.5 ? '#9a9aa2' : '#c4c4cc') : HAIR[Math.floor(r() * HAIR.length)] };
  if (p.g === 'f') {
    lk.hs = ['long', 'bob', 'pony', 'bun', 'long'][Math.floor(r() * 5)];
    lk.cloth = DRESS[Math.floor(r() * DRESS.length)];
  } else {
    lk.hs = r() < 0.5 ? 'short' : 'side';
    lk.cloth = SUIT[Math.floor(r() * SUIT.length)];
    lk.tie = TIE[Math.floor(r() * TIE.length)];
  }
  lk.glasses = p.kid ? (r(), false) : p.elder ? r() < 0.6 : r() < 0.12;   // 小朋友不戴眼鏡
  if (p.kid) { const k = Math.floor(r() * 3); lk.cloth = p.g === 'f' ? ['#ffb3c8', '#ffd66b', '#b8e0a0'][k] : ['#7fb6f0', '#f2a03d', '#8fd3b0'][k]; }
  if (p.look) Object.assign(lk, p.look);   // 名單裡指定的外型（髮色、膚色、眼睛顏色、鬍子…）
  return lk;
}
// 顏色加深（amt < 0）或變淺（amt > 0）
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
}
const OUT = 'stroke="rgba(92,60,40,.28)" stroke-width=".9"';
// 臉：眉毛、有兩個亮點的眼睛、小鼻子、嘴巴、腮紅；女生有睫毛
function faceSvg(lk) {
  const brow = lk.hairLine ? '#a39a9e' : shade(lk.hair, -0.15);   // 白髮的眉毛深一點，才看得到
  const lash = lk.pretty
    ? '<path d="M27.6 36 l-2.6 -1.4 M28 34.6 l-2 -2.2 M29.6 33.8 l-.9 -2.4 M52.4 36 l2.6 -1.4 M52 34.6 l2 -2.2 M50.4 33.8 l.9 -2.4" stroke="#2f2622" stroke-width="1" stroke-linecap="round"/>'
    : lk.g === 'f' ? '<path d="M27.7 36.2 l-2 -1.4 M52.3 36.2 l2 -1.4" stroke="#2f2622" stroke-width="1.1" stroke-linecap="round"/>' : '';
  const lip = lk.g === 'f' ? '#d9667f' : '#b9728a';
  const eye = lk.eye || '#2f2622';
  const pupil = (cx) => (lk.eye ? `<circle cx="${cx}" cy="38.4" r="1.6" fill="#1f1a18"/>` : '');
  const beard = lk.beard ? `<path d="M24.5 44 Q26 54 40 56.2 Q54 54 55.5 44 Q52 51 46 50.6 Q43 48.6 40 49.4 Q37 48.6 34 50.6 Q28 51 24.5 44Z" fill="${shade(lk.hair, -0.05)}" opacity=".55"/>` : '';
  return `${beard}
  <path d="M26.8 30.4 Q31 28.4 35 30.2 M45 30.2 Q49 28.4 53.2 30.4" fill="none" stroke="${brow}" stroke-width="1.5" stroke-linecap="round" opacity=".85"/>
  <g class="eye"><ellipse cx="31" cy="38" rx="3.1" ry="3.7" fill="${eye}"/>${pupil(31)}<circle cx="32.2" cy="36.5" r="1.3" fill="#fff"/><circle cx="30.1" cy="39.7" r=".6" fill="#fff" opacity=".8"/>
    <ellipse cx="49" cy="38" rx="3.1" ry="3.7" fill="${eye}"/>${pupil(49)}<circle cx="50.2" cy="36.5" r="1.3" fill="#fff"/><circle cx="48.1" cy="39.7" r=".6" fill="#fff" opacity=".8"/>${lash}</g>
  <g class="eye-h"><path d="M27.5 39 Q31 35 34.5 39 M45.5 39 Q49 35 52.5 39" fill="none" stroke="#2f2622" stroke-width="1.8" stroke-linecap="round"/></g>
  <path d="M39.2 42.6 q.8 .7 1.6 0" fill="none" stroke="${shade(lk.skin, -0.25)}" stroke-width="1" stroke-linecap="round"/>
  ${lk.pretty ? '<path class="mouth" d="M37 46 Q40 49.6 43 46 Q40 47.2 37 46Z" fill="#e8708c" stroke="#e8708c" stroke-width=".8" stroke-linejoin="round"/>' : `<path class="mouth" d="M36.4 46.2 Q40 49.4 43.6 46.2" fill="none" stroke="${lip}" stroke-width="1.5" stroke-linecap="round"/>`}
  <ellipse cx="24.5" cy="44" rx="3.8" ry="2.2" fill="#ff8fa6" opacity=".45"/>
  <ellipse cx="55.5" cy="44" rx="3.8" ry="2.2" fill="#ff8fa6" opacity=".45"/>`;
}
const GLASSES = '<circle cx="31" cy="38" r="5.8" fill="rgba(255,255,255,0.28)" stroke="#5a5360" stroke-width="1.4"/><circle cx="49" cy="38" r="5.8" fill="rgba(255,255,255,0.28)" stroke="#5a5360" stroke-width="1.4"/><path d="M36.8 38 h6.4" stroke="#5a5360" stroke-width="1.4"/><path d="M27.5 35.5 l2 -1.2" stroke="#fff" stroke-width="1" opacity=".7"/>';
// 主婚人胸花（紅玫瑰＋緞帶）
const CORSAGE = `<g><path d="M48.5 67 l-2.6 9 2 -1 1 2 M53.5 67 l2.6 9 -2 -1 -1 2" fill="#e8455f" stroke="#c8344d" stroke-width="1.4" stroke-linejoin="round"/>
  <circle cx="51" cy="64.5" r="4.4" fill="#e8455f"/><path d="M48.6 64 q2.4 -2.6 4.8 0 q-2.4 2.4 -4.8 0" fill="none" stroke="#b72a44" stroke-width=".9"/><circle cx="51" cy="64.5" r="1.3" fill="#b72a44"/>
  <path d="M46.5 62 q-2 -1 -2.8 1.2 q2 .8 2.8 -1.2 M55.5 62 q2 -1 2.8 1.2 q-2 .8 -2.8 -1.2" fill="#7bb36d"/></g>`;

function hairBack(lk) {
  const h = lk.hair;
  const st = lk.hairLine ? ' stroke="#c8c1d6" stroke-width="1"' : '';   // 淺色頭髮加細邊，才不會跟背景混在一起
  if (lk.hs === 'long') return `<path d="M18 34 Q15 11 40 11 Q65 11 62 34 L64 66 Q50 64 50 52 L30 52 Q30 64 16 66 Z" fill="${shade(h, -0.08)}"${st}/>`;
  if (lk.hs === 'bob') return `<path d="M17 36 Q14 11 40 11 Q66 11 63 36 L63 53 Q53 52 51 45 L29 45 Q27 52 17 53 Z" fill="${shade(h, -0.08)}"${st}/>`;
  if (lk.hs === 'pony') return `<path d="M57 20 Q77 24 71 54 Q66 42 57 36 Z" fill="${shade(h, -0.08)}"${st}/><circle cx="59" cy="22" r="3" fill="#ef7d9a"/>`;
  if (lk.hs === 'bun') return `<circle cx="40" cy="10" r="8.5" fill="${shade(h, -0.05)}"${st}/><path d="M34 9 Q40 5 46 9" stroke="#fff" stroke-opacity=".25" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return '';
}
function hairFront(lk) {
  const h = lk.hair;
  const st = lk.hairLine ? ' stroke="#c8c1d6" stroke-width="1"' : '';
  if (lk.hs === 'none') return '';
  const hi = '<path d="M27 19 Q35 14 45 15" stroke="#fff" stroke-opacity=".28" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  if (lk.hs === 'short') return `<path d="M18.5 36 Q16 11 40 11 Q64 11 61.5 36 Q57 22 40 22 Q23 22 18.5 36 Z" fill="${h}"${st}/>${hi}`;
  if (lk.hs === 'side') return `<path d="M18.5 36 Q15 10 42 11 Q65 12 61.5 34 Q55 23 34 21 Q24 25 18.5 36 Z" fill="${h}"${st}/>${hi}`;
  return `<path d="M19 34 Q17 11 40 11 Q63 11 61 34 Q55 20 45 21 Q42 27 36 21 Q25 21 19 34 Z" fill="${h}"${st}/>${hi}`;
}
// 手臂：可以舉杯、拍手（CSS 轉動）
function armsSvg(sleeve, skin) {
  return `<g class="arm arm-l"><path d="M25.5 61 Q19 68 21.4 77" stroke="${sleeve}" stroke-width="6.6" stroke-linecap="round" fill="none"/><circle cx="21.5" cy="78.2" r="3.3" fill="${skin}" ${OUT}/></g>
    <g class="arm arm-r"><path d="M54.5 61 Q61 68 58.6 77" stroke="${sleeve}" stroke-width="6.6" stroke-linecap="round" fill="none"/><circle cx="58.5" cy="78.2" r="3.3" fill="${skin}" ${OUT}/></g>`;
}
function bodySvg(lk) {
  const c = lk.cloth, d = shade(c, -0.22);
  if (lk.g === 'f') {
    return `<ellipse cx="34" cy="89" rx="4.2" ry="2.2" fill="${shade(c, -0.4)}"/><ellipse cx="46" cy="89" rx="4.2" ry="2.2" fill="${shade(c, -0.4)}"/>
      <path d="M28 57 Q40 53 52 57 L54 66 L61 87 Q40 92 19 87 L26 66 Z" fill="${c}" ${OUT}/>
      <path d="M46 67 L52 67 L58 86 Q53 88 48 88.6 Z" fill="#000" opacity=".07"/>
      <path d="M26.6 66 Q40 69.4 53.4 66" stroke="${d}" stroke-width="2.4" fill="none"/>
      <path d="M33.5 72 L30.5 86 M40 71.5 V88.5 M46.5 72 L49.5 86" stroke="${d}" stroke-width=".9" opacity=".55"/>
      <path d="M32 58.6 Q40 63.6 48 58.6" stroke="#fff" stroke-width="1.4" fill="none" opacity=".7"/>
      <circle cx="36.4" cy="61.4" r="1" fill="#fff"/><circle cx="40" cy="62.4" r="1.1" fill="#fff"/><circle cx="43.6" cy="61.4" r="1" fill="#fff"/>
      ${armsSvg(c, lk.skin)}`;
  }
  return `<ellipse cx="33.5" cy="88.6" rx="5" ry="2.6" fill="#3a2f2b"/><ellipse cx="46.5" cy="88.6" rx="5" ry="2.6" fill="#3a2f2b"/>
    <ellipse cx="40" cy="73" rx="16.5" ry="14.5" fill="${c}" ${OUT}/>
    <path d="M47 60 Q57 66 56 78 Q53 85 44 87 Q52 76 47 60Z" fill="#000" opacity=".08"/>
    <path d="M34 59 L40 69 L46 59 Z" fill="#fff"/>
    <path d="M40 62 L38.2 71 L40 74 L41.8 71 Z" fill="${lk.tie || '#e8574f'}"/><path d="M38.6 61 h2.8 l-.6 1.8 h-1.6 Z" fill="${shade(lk.tie || '#e8574f', -0.2)}"/>
    <path d="M33.6 58.6 L38.6 71 L32.6 66.4 Z M46.4 58.6 L41.4 71 L47.4 66.4 Z" fill="${d}"/>
    <circle cx="40" cy="77.5" r="1" fill="${shade(c, -0.45)}"/><circle cx="40" cy="81.5" r="1" fill="${shade(c, -0.45)}"/>
    <path d="M45.4 67.4 l5.2 -.8 -.6 2.2 Z" fill="#fff" opacity=".9"/>
    ${armsSvg(d, lk.skin)}`;
}
function headSvg(lk) {
  const ear = `<ellipse cx="19.6" cy="38.5" rx="3.2" ry="4" fill="${lk.skin}" ${OUT}/><ellipse cx="60.4" cy="38.5" rx="3.2" ry="4" fill="${lk.skin}" ${OUT}/>`;
  return `<g class="hd">${ear}<ellipse cx="40" cy="36" rx="${lk.faceRx || 21}" ry="20" fill="${lk.skin}" ${OUT}/>
    ${faceSvg(lk)}${hairFront(lk)}${lk.glasses ? GLASSES : ''}</g>`;
}
// 兒童座椅：高椅背、細長椅腳、前面一塊餐盤
const HIGHCHAIR_BACK = '<path d="M27 92 L24 102 M53 92 L56 102" stroke="#a87b56" stroke-width="3" stroke-linecap="round"/><rect x="23" y="44" width="34" height="48" rx="7" fill="#e3bf93" stroke="#b98a5c" stroke-width="1.5"/>';
const HIGHCHAIR_FRONT = '<rect x="18" y="70" width="44" height="7" rx="3" fill="#f4e3cc" stroke="#c9a27c" stroke-width="1.4"/>';
function personSvg(lk, extraBack = '', extraFront = '') {
  const body = lk.bodyOverride || bodySvg(lk);
  // 壯一點：身體和手臂往橫向放大
  const bodyG = lk.big ? `<g transform="translate(40 89) scale(1.32 1.08) translate(-40 -89)">${body}</g>` : body;
  const inner = `${extraBack}${hairBack(lk)}${bodyG}${headSvg(lk)}${extraFront}`;
  const g = lk.kid ? `<g transform="translate(40 92) scale(${lk.baby ? 0.6 : 0.78}) translate(-40 -92)">${inner}</g>` : inner;
  return `<svg viewBox="0 0 80 92" aria-hidden="true"><ellipse cx="40" cy="89" rx="18" ry="3.6" fill="rgba(70,40,20,0.22)"/>${g}</svg>`;
}
function vipSvg(role, side) {
  if (role === 'bride') {
    // 新娘：側邊辮子（垂在右肩前）、纖細的身形、長睫毛
    const lk = { g: 'f', skin: '#ffe6d6', hair: '#3e2a24', hs: 'sidepony', faceRx: 19.8, pretty: true };
    const h = lk.hair;
    const veil = `<path d="M23 22 Q40 4 57 22 Q68 52 65 86 Q40 92 15 86 Q12 52 23 22 Z" fill="#fff" opacity=".55" stroke="#efe2ea" stroke-width="1"/>
      <path d="M18 50 Q16 70 17 84 M62 50 Q64 70 63 84" stroke="#fff" stroke-width="1.1" opacity=".8" fill="none"/>`;
    const backHair = `<path d="M19 36 Q16 11 40 11 Q64 11 61 36 L60 48 Q56 54 50 53 L30 50 L21 46 Z" fill="${shade(h, -0.08)}"/>`;
    const gown = `<path d="M33.5 56 Q40 53 46.5 56 L48 65 Q61 76 66 89 Q40 94.6 14 89 Q19 76 32 65 Z" fill="#fffafc" ${OUT}/>
      <path d="M44 66.6 Q57 77 61.6 89.6 Q53 91.8 47 92 Q48.6 78 44 66.6Z" fill="#c8a8c0" opacity=".14"/>
      <path d="M32 65 Q40 67.8 48 65" stroke="#f7a8c0" stroke-width="2.2" fill="none"/><path d="M38.4 66.6 l1.6 -1.8 1.6 1.8 -1.6 1.8 Z" fill="#f08fb0"/>
      <path d="M33.6 57.6 Q40 61.4 46.4 57.6" stroke="#efd9e6" stroke-width="1" fill="none"/>
      <path d="M23 81 Q27.5 78.4 32 81 Q36.5 83.6 41 81 Q45.5 78.4 50 81 Q54.5 83.6 59 81" stroke="#efd9e6" stroke-width="1.1" fill="none"/>
      <path d="M18 87.6 Q23.5 85 29 87.6 Q34.5 90.2 40 87.6 Q45.5 85 51 87.6 Q56.5 90.2 62 87.6" stroke="#efd9e6" stroke-width="1.1" fill="none"/>
      <circle cx="30" cy="75" r=".9" fill="#f0dce6"/><circle cx="50" cy="75" r=".9" fill="#f0dce6"/><circle cx="40" cy="77" r=".9" fill="#f0dce6"/>
      <g class="arm arm-l"><path d="M33 59 Q27 67 28.4 76" stroke="#ffe6d6" stroke-width="4.4" stroke-linecap="round" fill="none"/><circle cx="28.5" cy="77" r="2.7" fill="${lk.skin}" ${OUT}/></g>
      <g class="arm arm-r"><path d="M47 59 Q53 67 51.6 76" stroke="#ffe6d6" stroke-width="4.4" stroke-linecap="round" fill="none"/><circle cx="51.5" cy="77" r="2.7" fill="${lk.skin}" ${OUT}/></g>`;
    // 低編髮：從脖子後面往右肩前編下來，不長，髮尾綁小花
    const braidPts = [[53.6, 51.6], [56, 56.4], [57.4, 61.4], [58, 66.4]];   // 低編髮：從脖子後面開始，短短的
    const braid = braidPts.map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="4.6" ry="3.5" transform="rotate(${k % 2 ? 28 : -28} ${x} ${y})" fill="${h}" ${OUT}/>
      <path d="M${x - 2.6} ${y - 0.6} Q${x} ${y + (k % 2 ? 1.6 : -1.6)} ${x + 2.6} ${y + 0.6}" stroke="#fff" stroke-opacity=".22" stroke-width="1" fill="none" stroke-linecap="round"/>`).join('');
    const pony = `${braid}
      <path d="M56.4 69.4 Q57.6 73.6 55.8 76 M58 69.6 Q59 73.4 58.6 76.6 M59.6 69.2 Q61.4 72.6 61 75.4" stroke="${h}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <g transform="translate(58 69.2) scale(.65)"><circle r="3.4" fill="#fff" stroke="#f0d4e0" stroke-width=".6"/><circle cx="-2.4" cy="-1.8" r="2" fill="#ffd1dc"/><circle cx="2.4" cy="-1.8" r="2" fill="#ffd1dc"/><circle cy="2.6" r="2" fill="#ffd1dc"/><circle r="1.3" fill="#ffd66b"/></g>
      <g transform="translate(60.5 31.5) scale(.7)"><circle r="3.4" fill="#fff" stroke="#f0d4e0" stroke-width=".6"/><circle cx="-2.4" cy="-1.8" r="2" fill="#ffd1dc"/><circle cx="2.4" cy="-1.8" r="2" fill="#ffd1dc"/><circle cy="2.6" r="2" fill="#ffd1dc"/><circle r="1.3" fill="#ffd66b"/></g>`;
    const bangs = `<path d="M19 34 Q16 10 42 11 Q64 12 61 33 Q56 20 46 19.4 Q36 20 30 27 Q24 30.4 19 34 Z" fill="${h}"/>
      <path d="M27 18 Q35 13.6 45 14.6" stroke="#fff" stroke-opacity=".28" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    const tiara = '<path d="M32 15.6 l2.6 -4.4 2.6 3.4 2.8 -5 2.8 5 2.6 -3.4 2.6 4.4 Z" fill="#ffe08a" stroke="#d9a930" stroke-width=".7"/><circle cx="40" cy="10.4" r="1.4" fill="#ff8fb0"/>';
    const earring = '<path d="M19.6 43 v2.6" stroke="#e8d6c0" stroke-width=".6"/><circle cx="19.6" cy="46.4" r="1.3" fill="#fff" stroke="#e0c7d4" stroke-width=".5"/>';
    const hsvg = headSvg({ ...lk, hs: 'none' });
    const head = hsvg.slice(0, hsvg.lastIndexOf('</g>'));   // 頭的群組先不關，把瀏海、皇冠放進去一起動
    return `<svg viewBox="0 0 80 92" aria-hidden="true"><ellipse cx="40" cy="90" rx="24" ry="3.4" fill="rgba(70,40,20,0.22)"/>${veil}${backHair}${gown}${head}${bangs}${tiara}${earring}</g>${pony}</svg>`;
  }
  if (role === 'groom') {
    const lk = { g: 'm', skin: '#fcdcc4', hair: '#1f1d24', hs: 'side' };
    const c = '#2b2b33';
    const body = `<ellipse cx="33.5" cy="88.6" rx="5" ry="2.6" fill="#141418"/><ellipse cx="46.5" cy="88.6" rx="5" ry="2.6" fill="#141418"/><path d="M30 88 h7 M43 88 h7" stroke="#fff" stroke-width=".8" opacity=".35"/>
      <ellipse cx="40" cy="73" rx="16.5" ry="14.5" fill="${c}" ${OUT}/>
      <path d="M33 59 L40 73 L47 59 Z" fill="#fff"/>
      <path d="M33.4 58.6 L39 73 L31.8 67 Z M46.6 58.6 L41 73 L48.2 67 Z" fill="#18181e"/>
      <path d="M34.5 61 L40 63.5 L34.5 66 Z M45.5 61 L40 63.5 L45.5 66 Z" fill="#141418"/><circle cx="40" cy="63.5" r="1.6" fill="#141418"/>
      <circle cx="40" cy="67.6" r=".7" fill="#ccc"/><circle cx="40" cy="70.6" r=".7" fill="#ccc"/>
      <g transform="translate(50.5 66.5)"><circle r="3.6" fill="#fff"/><circle cx="-1.6" cy="-1" r="1.8" fill="#fff" stroke="#eee" stroke-width=".5"/><circle cx="1.6" cy="-1" r="1.8" fill="#fff" stroke="#eee" stroke-width=".5"/><circle r="1.3" fill="#ffd66b"/><path d="M0 3.4 l-1.2 4" stroke="#6fae6a" stroke-width="1.6"/></g>
      <path d="M47 60 Q57 66 56 78 Q53 85 44 87 Q52 76 47 60Z" fill="#fff" opacity=".05"/>
      ${armsSvg('#22222a', lk.skin)}`;
    return `<svg viewBox="0 0 80 92" aria-hidden="true"><ellipse cx="40" cy="89" rx="18" ry="3.6" fill="rgba(70,40,20,0.22)"/>${body}${headSvg(lk)}</svg>`;
  }
  if (role === 'dad') {
    const lk = { g: 'm', skin: side === 'g' ? '#f6d2b8' : '#fcdcc4', hair: side === 'g' ? '#2b2628' : '#3b3438', hs: side === 'g' ? 'short' : 'side', cloth: side === 'g' ? '#34405a' : '#4a4a52', tie: '#c23b4a', glasses: false };
    if (side === 'g') { lk.big = true; lk.faceRx = 22.4; }   // 民星：壯一點（身體寬、臉圓一點）
    return personSvg(lk, '', CORSAGE);
  }
  // 主婚人媽媽
  //   男方（月娥）：長髮、不戴眼鏡，白色上衣＋牛仔外套＋長裙
  //   女方（玉華）：短髮、戴眼鏡，藍色襯衫＋黃色長裙
  const shoes = '<ellipse cx="34.5" cy="89.4" rx="4.4" ry="2.1" fill="#4a3a33"/><ellipse cx="45.5" cy="89.4" rx="4.4" ry="2.1" fill="#4a3a33"/>';
  const longSkirt = (c) => `<path d="M27 71 Q40 74 53 71 L59 88.5 Q40 92.4 21 88.5 Z" fill="${c}" ${OUT}/>
    <path d="M47 73 L52.5 72 L58.6 88.4 Q54 89.8 50 90.2 Z" fill="#000" opacity=".07"/>
    <path d="M34 75 L31.5 89 M40 75.4 V90.4 M46 75 L48.5 89" stroke="${shade(c, -0.2)}" stroke-width=".8" opacity=".6"/>`;
  let lk;
  if (side === 'g') {
    lk = { g: 'f', skin: '#ffe4d0', hair: '#3b2f2f', hs: 'long', glasses: false };
    const denim = '#5b84b1', dd = shade(denim, -0.25);
    lk.bodyOverride = `${shoes}${longSkirt('#8a6f63')}
      <path d="M28 57 Q40 53 52 57 L53.5 73 Q40 76 26.5 73 Z" fill="#fbf7f0" ${OUT}/>
      <path d="M28 57 Q31.5 55.6 34.6 57.4 L37 75.6 Q31 76 25.6 73.4 Z" fill="${denim}" ${OUT}/>
      <path d="M52 57 Q48.5 55.6 45.4 57.4 L43 75.6 Q49 76 54.4 73.4 Z" fill="${denim}" ${OUT}/>
      <path d="M34.6 57.4 L31.6 63 L35.6 62 Z M45.4 57.4 L48.4 63 L44.4 62 Z" fill="${dd}"/>
      <path d="M29 66 h5 M46 66 h5" stroke="#e8c26a" stroke-width=".8" stroke-dasharray="1.2 1"/>
      <rect x="29.2" y="64" width="4.6" height="3.6" rx=".6" fill="none" stroke="${dd}" stroke-width=".7"/><rect x="46.2" y="64" width="4.6" height="3.6" rx=".6" fill="none" stroke="${dd}" stroke-width=".7"/>
      <circle cx="35.6" cy="68" r=".8" fill="#e8c26a"/><circle cx="35.9" cy="72" r=".8" fill="#e8c26a"/>
      ${armsSvg(denim, lk.skin)}`;
  } else {
    lk = { g: 'f', skin: '#fcdcc4', hair: '#4a3530', hs: 'bob', glasses: true };
    const shirt = '#7fa9d8', sd = shade(shirt, -0.22);
    lk.bodyOverride = `${shoes}${longSkirt('#f2c94c')}
      <path d="M28 57 Q40 53 52 57 L53.5 73.4 Q40 76 26.5 73.4 Z" fill="${shirt}" ${OUT}/>
      <path d="M35 56.4 L40 61 L45 56.4 L42.6 55.6 L40 58.4 L37.4 55.6 Z" fill="${shade(shirt, 0.35)}"/>
      <path d="M40 61 V73.6" stroke="${sd}" stroke-width=".8"/>
      <circle cx="40" cy="64" r=".75" fill="#fff"/><circle cx="40" cy="67.6" r=".75" fill="#fff"/><circle cx="40" cy="71.2" r=".75" fill="#fff"/>
      <path d="M27 72.6 Q40 75.4 53 72.6" stroke="${shade('#f2c94c', -0.25)}" stroke-width="1.6" fill="none"/>
      ${armsSvg(shirt, lk.skin)}`;
  }
  const pearl = '<circle cx="19.6" cy="44" r="1.4" fill="#fffaf0" stroke="#d9cbb8" stroke-width=".5"/><circle cx="60.4" cy="44" r="1.4" fill="#fffaf0" stroke="#d9cbb8" stroke-width=".5"/>';
  return personSvg(lk, '', CORSAGE + pearl);
}
function staffSvg() {
  const lk = { g: 'm', skin: '#fcdcc4', hair: pick(['#2e2a30', '#5b3a29']), hs: 'short', cloth: '#f4f1ec', tie: '#2b2b33' };
  lk.bodyOverride = `<ellipse cx="33.5" cy="88.6" rx="5" ry="2.6" fill="#2b2b33"/><ellipse cx="46.5" cy="88.6" rx="5" ry="2.6" fill="#2b2b33"/>
    <ellipse cx="40" cy="73" rx="16.5" ry="14.5" fill="#f7f4ef" ${OUT}/>
    <path d="M34.5 61 L40 63.5 L34.5 66 Z M45.5 61 L40 63.5 L45.5 66 Z" fill="#2b2b33"/>
    <path d="M28 70 h24 l2.4 16 Q40 89 25.6 86 Z" fill="#3a3330"/><path d="M28 70 Q40 72 52 70" stroke="#c9a27c" stroke-width="1.6" fill="none"/>
    <rect x="44" y="74" width="5" height="4" rx="1" fill="#c9a27c" opacity=".7"/>
    ${armsSvg('#ece7e0', lk.skin)}`;
  return personSvg(lk);
}

// ---- 台詞 ----
const CHAT = [
  ['新娘今天好美！', '真的！婚紗超好看'],
  ['新郎今天好帥', '平常都沒這麼帥 😂'],
  ['你怎麼認識新人的？', '大學同學啊～'],
  ['這個好好吃！', '我要再來一塊'],
  ['下一個換你了吧？', '先吃飯先吃飯 😅'],
  ['等等去拍照嗎？', '走！去活動區'],
  ['剛剛好感動 🥹', '我也差點哭'],
  ['你喝什麼？', '水果氣泡飲～'],
  ['好久不見！', '上次見是畢業耶'],
  ['他們好登對', '天生一對！'],
  ['這裡好溫馨', '咖啡廳婚禮好可愛'],
  ['甜點什麼時候上？', '聽說有蛋糕！'],
  ['今天天氣真好', '新人運氣好～'],
  ['你們家寶寶好可愛', '謝謝～一直跑來跑去'],
];
const SOLO = ['好好吃 😋', '好飽～', '要幸福喔！', '新婚快樂 🎉', '這杯好喝', '百年好合！', '永浴愛河 ❤', '吃不完了啦', '拍照拍照 📸', '甜甜蜜蜜～', '佳偶天成 💕', '今天好幸福的感覺', '他們笑得好甜 🥰', '我也被閃到了 😎'];
const KID_LINES = ['我要喝果汁！', '好好玩～', '新娘好像公主！', '我要吃蛋糕！', '抓不到我～', '嘿嘿'];
const BLESS = ['乾杯！', '新婚快樂！', '百年好合！', '永浴愛河！', '白頭偕老！', '要幸福喔！', 'Cheers 🥂',
  '天作之合！', '幸福美滿！', '心心相印 💕', '恩恩愛愛一輩子！', '執子之手，與子偕老', '愛情長長久久 💕', '每天都像今天一樣幸福！', '要一直這麼甜喔！', '吵架都要讓新娘贏 😆', '記得常常請我們吃飯 😆', '一起去好多地方旅行 ✈️', '永遠是彼此最好的朋友'];
const COUPLE_THANKS = ['謝謝大家來！', '吃飽喝足喔～', '今天好開心 ❤', '謝謝你們！', '多吃一點喔'];
const PARENT_LINES = ['謝謝你們來！', '多吃一點喔', '招待不周請見諒', '今天好開心', '菜還合胃口嗎？'];
const GUEST_REPLY = ['恭喜恭喜！', '好好吃！', '新娘好漂亮', '謝謝招待～', '恭喜您！'];
// 只會英文的賓客（名單裡 lang: 'en'）：常用台詞對照，沒有對照的就從英文台詞裡挑一句
const EN = {
  '新娘今天好美！': 'The bride looks stunning! ✨', '真的！婚紗超好看': 'Right? Love the dress!',
  '新郎今天好帥': 'The groom looks so sharp!', '平常都沒這麼帥 😂': 'Never seen him this dressed up 😂',
  '你怎麼認識新人的？': 'How do you know the couple?', '大學同學啊～': 'We go way back!',
  '這個好好吃！': 'This is so good!', '我要再來一塊': 'I need another piece',
  '下一個換你了吧？': "You're next, right? 😉", '先吃飯先吃飯 😅': "Let's just eat 😅",
  '等等去拍照嗎？': 'Photo later?', '走！去活動區': "Let's go to the stage!",
  '剛剛好感動 🥹': 'That was so touching 🥹', '我也差點哭': 'I almost cried too',
  '你喝什麼？': 'What are you drinking?', '水果氣泡飲～': 'Fruit soda~',
  '好久不見！': 'Long time no see!', '上次見是畢業耶': 'Since graduation!',
  '他們好登對': 'They look perfect together', '天生一對！': 'A perfect match!',
  '這裡好溫馨': 'Such a cozy place', '咖啡廳婚禮好可愛': 'Café weddings are so cute',
  '甜點什麼時候上？': 'When is dessert?', '聽說有蛋糕！': 'I heard there is ice cream!',
  '今天天氣真好': 'Lovely weather today', '新人運氣好～': 'Lucky couple~',
  '好好吃 😋': 'Yummy 😋', '好飽～': "I'm so full~", '要幸福喔！': 'Be happy forever!', '新婚快樂 🎉': 'Happy wedding day 🎉',
  '這杯好喝': 'Great drink!', '百年好合！': 'Best wishes!', '永浴愛河 ❤': 'Love always ❤',
  '吃不完了啦': "I can't finish this", '拍照拍照 📸': 'Photo time 📸',
  '乾杯！': 'Cheers! 🥂', '新婚快樂！': 'Congratulations!', '永浴愛河！': 'Love always!',
  '白頭偕老！': 'Forever together!', '恭喜恭喜！': 'Congrats! 🎉', '好好吃！': 'Delicious!', '新娘好漂亮': 'Beautiful bride!',
  '謝謝招待～': 'Thanks for having us~', '恭喜您！': 'Congratulations!',
  '甜甜蜜蜜～': 'So sweet~', '佳偶天成 💕': 'Made for each other 💕', '今天好幸福的感覺': 'Such a happy day', '他們笑得好甜 🥰': 'Their smiles are so sweet 🥰', '我也被閃到了 😎': 'Too much love in the air 😎',
  '天作之合！': 'A match made in heaven!', '幸福美滿！': 'Wishing you a happy life!', '心心相印 💕': 'Two hearts as one 💕', '恩恩愛愛一輩子！': 'Love each other forever!',
  '執子之手，與子偕老': 'Hand in hand, all life long', '愛情長長久久 💕': 'May your love last forever 💕', '每天都像今天一樣幸福！': 'May every day be as happy as today!',
  '要一直這麼甜喔！': 'Stay this sweet!', '吵架都要讓新娘贏 😆': 'Groom, always let her win 😆', '記得常常請我們吃飯 😆': 'Invite us to dinner often 😆',
  '一起去好多地方旅行 ✈️': 'Travel the world together ✈️', '永遠是彼此最好的朋友': 'Best friends forever',
  '親一個！': 'Kiss! Kiss! 💋', '👏👏👏': '👏👏👏', '呀～～': 'Awww~', '好甜！': 'So sweet!', '閃瞎了 😎': 'So romantic 😎',
};
const EN_ANY = ['This is delicious! 😋', 'So happy for you two!', 'What a lovely party! 🎉', 'Cheers! 🥂', 'Congrats! 💕', 'Great food!', 'Love this place ☕'];
const toEn = (text) => EN[text] || (/[\u3400-\u9fff]/.test(text) ? pick(EN_ANY) : text);
// 我們的菜單（Honey Wood Café 西式婚禮專案，沒有選加價菜色）：[圖示, 簡稱（對話用）, 完整菜名]
const COURSES = [
  ['🍣', '煙燻鮭魚冷盤', '煙燻鮭魚切達乾酪＆刺山柑酸豆法式槍魷水晶凍'],
  ['🍲', '海鮮巧達濃湯', '海鮮巧達濃湯'],
  ['🌭', '德國香料腸', '德國帶骨香料腸'],
  ['🥗', '凱薩沙拉', '有機水耕蔬菜沙拉佐凱薩醬'],
  ['🥘', '青醬舒肥雞', '歐式手作青醬舒肥雞'],
  ['🐟', '英式炸魚', '英式炸魚＆蒔蘿塔塔醬'],
  ['🍗', '韓式雞翅', '洋釀韓式雞翅'],
  ['🍝', '肉醬筆管麵', '牧羊人肉醬筆管麵'],
  ['🐠', '紙包鱸魚', '火烤紙包時蔬黑松露卡邦尼醬鱸菲力'],
  ['🍨', '義式冰淇淋', '塔拉朵義式冰淇淋'],
];
const DRINKS = ['🥤', '🍹', '☕', '🧋', '🍷'];

// ---- 版面（橫式／直式） ----
let ORI = 'land', PHONE = false, SW = PW, SH = PH;
// 版面調整：左邊（招牌、包廂、備餐區、入口）縮窄，右邊用餐區拉寬，桌子之間比較不擠
// 平面圖座標 x 0–560 壓到 0–340，560–1120 拉到 340–1120
const SPLIT = 560, NEW_SPLIT = 340;
const remapX = (x) => (x <= SPLIT ? x * NEW_SPLIT / SPLIT : NEW_SPLIT + (x - SPLIT) * (PW - NEW_SPLIT) / (PW - SPLIT));
const mp = ([x, y]) => [remapX(x), y];
// keep：位置跟著移、寬度保持（乘上 keep 倍數）；沒有 keep 就整塊等比例縮放
const mr = (r, keep) => {
  if (r.raw) return { ...r };
  if (keep) { const c = remapX(r.x + r.w / 2), w = r.w * keep; return { ...r, x: c - w / 2, w }; }
  return { ...r, x: remapX(r.x), w: remapX(r.x + r.w) - remapX(r.x) };
};
let L = null;   // 換算後的版面

function buildLayout() {
  // 手機直式也用橫式平面圖，畫面比較寬、可以左右滑動，桌子不會擠在一起
  PHONE = innerWidth < innerHeight * 0.95;
  ORI = 'land';
  SW = ORI === 'land' ? PW : PH; SH = ORI === 'land' ? PH : PW;
  const areas = AREAS.map((a) => ({ ...a, ...mr(a, a.keep) }));
  const tables = TABLES.map((t) => {
    let r;
    if (t.round) r = mr({ x: t.cx - t.r, y: t.cy - t.r, w: t.r * 2, h: t.r * 2 }, 1);
    else r = mr(t, 1.12);   // 桌子跟著移到新位置，稍微加寬，椅子間距比較鬆
    const T = { ...t, ...r, cx: r.x + r.w / 2, cy: r.y + r.h / 2 };
    T.seatList = seatsFor(T);
    T.serve = T.round ? [T.cx, T.y + T.h + 34] : (T.w >= T.h ? [T.x - 16, T.cy + 12] : [T.cx, T.y + T.h + 22]);
    T.toast = T.round ? [T.cx - 10, T.y + T.h + 36] : (T.w >= T.h ? [T.x + T.w + 14, T.cy + 12] : [T.cx - 6, T.y + T.h + 24]);
    return T;
  });
  const obst = [];
  for (const a of areas) if (a.solid) obst.push(inflate(a, 7));
  for (const t of tables) obst.push(inflate(t, 6));
  const walk = WALKABLE.map((w) => mr(w, w.keep));
  const P = {};
  for (const k of Object.keys(PTS)) {
    const v = PTS[k];
    if (k === 'lounge') P[k] = mr(v);
    else if (Array.isArray(v[0])) P[k] = v.map(mp);
    else P[k] = mp(v);
  }
  L = { areas, tables, obst, walk, P };
  buildGrid();
}
function inflate(r, d) { return { x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d }; }
function seatsFor(T) {
  const n = T.seats, out = [];
  if (T.round) {
    const R = T.w / 2;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / n;
      const dx = Math.cos(a), dy = Math.sin(a);
      const top = dy < -0.3;
      out.push({ sit: [T.cx + dx * (R + 14), top ? T.y + 8 : T.cy + dy * (R + 10) + 18], side: top ? 'top' : 'side' });
    }
    return out;
  }
  if (T.w >= T.h) {
    const k1 = Math.ceil(n / 2), k2 = n - k1;
    for (let i = 0; i < k1; i++) out.push({ sit: [T.x + (i + 0.5) * T.w / k1, T.y + 7], side: 'top' });
    for (let i = 0; i < k2; i++) out.push({ sit: [T.x + (i + 0.5) * T.w / k2, T.y + T.h + 29], side: 'bottom' });
  } else {
    const k1 = Math.ceil(n / 2), k2 = n - k1;
    for (let i = 0; i < k1; i++) out.push({ sit: [T.x - 15, T.y + (i + 0.5) * T.h / k1 + 16], side: 'left' });
    for (let i = 0; i < k2; i++) out.push({ sit: [T.x + T.w + 15, T.y + (i + 0.5) * T.h / k2 + 16], side: 'right' });
  }
  return out;
}

// ---- 走路：格子 A* ----
const CELL = 8;
let GC = 0, GR = 0, FREE = null;
const inR = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
function buildGrid() {
  GC = Math.ceil(SW / CELL); GR = Math.ceil(SH / CELL);
  FREE = new Uint8Array(GC * GR);
  for (let j = 0; j < GR; j++) for (let i = 0; i < GC; i++) {
    const x = (i + 0.5) * CELL, y = (j + 0.5) * CELL;
    FREE[j * GC + i] = L.walk.some((r) => inR(r, x, y)) && !L.obst.some((r) => inR(r, x, y)) ? 1 : 0;
  }
}
const cellOf = ([x, y]) => [Math.max(0, Math.min(GC - 1, Math.floor(x / CELL))), Math.max(0, Math.min(GR - 1, Math.floor(y / CELL)))];
function nearestFree(c) {
  if (FREE[c[1] * GC + c[0]]) return c;
  for (let d = 1; d < 40; d++) {
    let best = null, bd = 1e9;
    for (let dj = -d; dj <= d; dj++) for (let di = -d; di <= d; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== d) continue;
      const i = c[0] + di, j = c[1] + dj;
      if (i < 0 || j < 0 || i >= GC || j >= GR || !FREE[j * GC + i]) continue;
      const dd = di * di + dj * dj;
      if (dd < bd) { bd = dd; best = [i, j]; }
    }
    if (best) return best;
  }
  return c;
}
const isFreeAt = (x, y) => { const i = Math.floor(x / CELL), j = Math.floor(y / CELL); return i >= 0 && j >= 0 && i < GC && j < GR && FREE[j * GC + i] === 1; };
function los(a, b) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / 3);
  for (let k = 1; k < n; k++) { const t = k / n; if (!isFreeAt(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return false; }
  return true;
}
function findPath(from, to) {
  const s = nearestFree(cellOf(from)), g = nearestFree(cellOf(to));
  const N = GC * GR;
  if (!findPath.buf || findPath.buf.n !== N) findPath.buf = { n: N, gs: new Float32Array(N), par: new Int32Array(N), closed: new Uint8Array(N) };
  const { gs, par, closed } = findPath.buf;
  gs.fill(1e9); par.fill(-1); closed.fill(0);
  const si = s[1] * GC + s[0], gi = g[1] * GC + g[0];
  const heap = [[0, si]]; gs[si] = 0;
  const h = (i) => Math.hypot((i % GC) - g[0], Math.floor(i / GC) - g[1]);
  const push = (it) => { heap.push(it); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  let found = false;
  while (heap.length) {
    const [, cur] = pop();
    if (closed[cur]) continue;
    closed[cur] = 1;
    if (cur === gi) { found = true; break; }
    const ci = cur % GC, cj = Math.floor(cur / GC);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const ni = ci + di, nj = cj + dj;
      if (ni < 0 || nj < 0 || ni >= GC || nj >= GR) continue;
      const nk = nj * GC + ni;
      if (!FREE[nk] || closed[nk]) continue;
      if (di && dj && (!FREE[cj * GC + ni] || !FREE[nj * GC + ci])) continue;
      const ng = gs[cur] + (di && dj ? 1.414 : 1);
      if (ng < gs[nk]) { gs[nk] = ng; par[nk] = cur; push([ng + h(nk), nk]); }
    }
  }
  const pts = [];
  if (found) { for (let k = gi; k !== -1 && k !== si; k = par[k]) pts.push([(k % GC + 0.5) * CELL, (Math.floor(k / GC) + 0.5) * CELL]); pts.reverse(); }
  pts.push(to.slice());
  // 拉直：看得到就直接走過去
  const out = [];
  let cur = from;
  let i = 0;
  while (i < pts.length) {
    let j = pts.length - 1;
    while (j > i && !los(cur, pts[j])) j--;
    out.push(pts[j]); cur = pts[j]; i = j + 1;
  }
  return out;
}

// ---- 模擬時間 ----
let simT = 0;
const timers = [];
const wait = (ms) => new Promise((r) => timers.push({ at: simT + ms, r }));

// ---- 角色 ----
const actors = [];
let stage, actorLayer, tableLayer, fxLayer;
function makeActor(o) {
  const a = { pos: [0, 0], path: null, speed: 70, face: 1, pose: '', prop: '', temp: '', busy: false, next: rand(2000, 12000), hidden: false, ...o };
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'actor ' + (a.cls || '');
  el.innerHTML = `<span class="fig">${a.svg}<span class="prop"></span></span><span class="tag">${a.name}</span><span class="bub"></span>`;
  el.addEventListener('click', (e) => { e.stopPropagation(); tapActor(a); });
  a.el = el; a.figEl = el.querySelector('.fig'); a.propEl = el.querySelector('.prop'); a.bubEl = el.querySelector('.bub');
  actorLayer.appendChild(el);
  actors.push(a);
  return a;
}
function place(a) {
  // 用 transform 移動（交給 GPU，不用重新排版），比改 left/top 順很多
  a.el.style.transform = `translate3d(${(a.pos[0] * UPX).toFixed(1)}px,${(a.pos[1] * UPX).toFixed(1)}px,0) translate(-50%,-100%)`;
  // 坐在桌子左右兩側的人要畫在椅子和桌子前面
  let z = a.pos[1];
  if (a.seat && a.table && a.seat.side !== 'top' && a.seat.side !== 'bottom' && atSeat(a)) z = Math.max(z, a.table.cy + 1);
  const zi = Math.round(z) + (a.bubbleOn ? 3000 : 0) + (a.hl ? 4000 : 0);
  if (zi !== a._z) { a._z = zi; a.el.style.zIndex = String(zi); }
}
function setPose(a, p) { if (a.pose === p) return; a.el.classList.remove('p-' + a.pose); a.pose = p; if (p) a.el.classList.add('p-' + p); }
function showProp(a) { const p = a.temp || a.prop; if (a.propEl.textContent !== p) a.propEl.textContent = p; }
function setFace(a, f) { if (a.face === f) return; a.face = f; a.figEl.classList.toggle('flip', f < 0); }
let bubbleCount = 0;
function say(a, text, ms = 2600, cls = '') {
  if (a.hidden) return;
  if (a.info && a.info.lang === 'en') text = toEn(text);   // Glenn 只會英文
  if (a.bubT) clearTimeout(a.bubT); else bubbleCount++;
  a.bubEl.textContent = text;
  a.bubEl.className = 'bub show ' + cls;
  a.bubbleOn = true; place(a);
  // 碰到上緣就改放在下面
  a.bubEl.classList.toggle('below', a.pos[1] < 70);
  a.bubT = setTimeout(() => { a.bubEl.className = 'bub'; a.bubbleOn = false; a.bubT = null; bubbleCount--; place(a); }, ms);
}
function walkTo(a, pt) {
  return new Promise((res) => {
    a.path = findPath(a.pos, pt);
    a.onArrive = res;
    setPose(a, 'walk');
  });
}
const atSeat = (a) => a.seat && Math.hypot(a.pos[0] - a.seat.sit[0], a.pos[1] - a.seat.sit[1]) < 2;
async function goHome(a) { if (a.seat) { await walkTo(a, a.seat.sit); settle(a); } }
function settle(a) { setPose(a, 'sit'); a.temp = ''; showProp(a); setFace(a, a.seat && a.seat.side === 'right' ? -1 : 1); }
async function routine(a, fn) {
  a.busy = true;
  try { await fn(); } finally { a.busy = false; a.next = simT + rand(4000, 14000); }
}

// ---- 舞台 DOM ----
// 盆栽
function plantSvg(x, y, s = 1, kind = 0) {
  const leaves = kind
    ? `<path d="M0 -14 Q-12 -30 -4 -42 Q2 -28 0 -14 Z M0 -14 Q10 -32 18 -36 Q12 -20 0 -14 Z M0 -14 Q-18 -22 -22 -32 Q-8 -28 0 -14 Z" fill="#6aa86b"/><path d="M0 -14 Q4 -26 6 -40 Q10 -26 0 -14 Z" fill="#82be7c"/>`
    : `<ellipse cx="-7" cy="-24" rx="9" ry="13" fill="#5f9e62" transform="rotate(-25 -7 -24)"/><ellipse cx="8" cy="-26" rx="9" ry="14" fill="#6fb06f" transform="rotate(22 8 -26)"/><ellipse cx="0" cy="-34" rx="8" ry="12" fill="#82be7c"/><path d="M-7 -24 l4 6 M8 -26 l-4 7 M0 -34 v12" stroke="#4d8a52" stroke-width="1.2"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="13" ry="4" fill="rgba(70,40,20,.18)"/>${leaves}<path d="M-10 -14 h20 l-3 16 h-14 Z" fill="#d98f5c"/><rect x="-11" y="-16" width="22" height="4" rx="2" fill="#c47a48"/></g>`;
}
function areaSvg(a) {
  const { x, y, w, h } = a;
  const cx = x + w / 2, cy = y + h / 2;
  const vert = w < h * 0.55;
  const text = (t, dy = 0, size = 13, cls = 'lb') => vert
    ? `<text class="${cls}" x="${cx + dy}" y="${cy}" font-size="${size}" text-anchor="middle" dominant-baseline="middle" style="writing-mode:vertical-rl">${t}</text>`
    : `<text class="${cls}" x="${cx}" y="${cy + dy}" font-size="${size}" text-anchor="middle" dominant-baseline="middle">${t}</text>`;
  const shadow = (rx = 8) => `<rect x="${x + 2}" y="${y + 4}" width="${w}" height="${h}" rx="${rx}" fill="rgba(70,40,20,.14)"/>`;
  switch (a.kind) {
    case 'sign': {
      // 木頭招牌牆＋小蜂蜜罐
      const hx = vert ? cx : x + 26, hy = vert ? y + 24 : cy;
      return `${shadow(16)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#plank)" stroke="#8a6248" stroke-width="3"/>
        <rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${h - 14}" rx="11" fill="none" stroke="#f3dcc0" stroke-width="1.4" opacity=".7"/>
        <g transform="translate(${hx} ${hy})"><path d="M-9 -4 Q-9 -12 0 -12 Q9 -12 9 -4 L8 9 Q0 13 -8 9 Z" fill="#f2b33d" stroke="#c9862a" stroke-width="1.2"/><rect x="-7" y="-15" width="14" height="5" rx="2" fill="#c9862a"/><path d="M-4 -4 q4 3 8 0" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/></g>
        ${text(a.label, -10, 22, 'lb brand')}${text(a.sub, 15, 14, 'lb brand2')}`;
    }
    case 'room': {
      let lines = '', doors = '';
      for (let k = 1; k < 4; k++) lines += ORI === 'land' ? `<path d="M${x + w * k / 4} ${y + 4} v${h - 8}" class="a-roomline"/>` : `<path d="M${x + 4} ${y + h * k / 4} h${w - 8}" class="a-roomline"/>`;
      for (let k = 0; k < 4; k++) {
        doors += ORI === 'land'
          ? `<path d="M${x + w * k / 4 + 12} ${y + h - 3} h${w / 4 - 24}" stroke="#f4eee8" stroke-width="5"/><path d="M${x + w * k / 4 + 12} ${y + h - 3} a${w / 4 - 24} ${w / 4 - 24} 0 0 0 ${w / 4 - 24} ${-(w / 4 - 24)}" fill="none" stroke="#b9a898" stroke-width="1" stroke-dasharray="3 3"/>`
          : '';
      }
      return `${shadow(6)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#roomfloor)" stroke="#3d3532" stroke-width="4"/>${lines}${doors}${text(a.label, -6, 15)}${text(a.sub, 12, 9, 'lb sm')}`;
    }
    case 'zone': {
      // 音控台：混音器＋喇叭
      const bx = vert ? cx : cx, by = y + 24;
      return `${shadow(8)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#f6f0ea" stroke="#b9a898" stroke-width="1.5"/>
        <g transform="translate(${bx} ${by})"><rect x="-22" y="-10" width="44" height="18" rx="3" fill="#4a4a52"/>${[-15, -7, 1, 9].map((dx, i) => `<rect x="${dx}" y="-6" width="3" height="10" rx="1" fill="#2b2b33"/><rect x="${dx - 1}" y="${-4 + (i % 3) * 3}" width="5" height="2.4" rx="1" fill="${['#ef7d9a', '#ffd66b', '#9fd0f0', '#8fd3b0'][i]}"/>`).join('')}<circle cx="17" cy="-5" r="2" fill="#8fd3b0" class="led"/></g>
        <g transform="translate(${x + 14} ${y + h - 18})"><rect x="-7" y="-10" width="14" height="20" rx="3" fill="#3d3532"/><circle cy="-3" r="3.6" fill="#6b6260"/><circle cy="5" r="2" fill="#6b6260"/></g>
        <g transform="translate(${x + w - 14} ${y + h - 18})"><rect x="-7" y="-10" width="14" height="20" rx="3" fill="#3d3532"/><circle cy="-3" r="3.6" fill="#6b6260"/><circle cy="5" r="2" fill="#6b6260"/></g>
        ${vert ? text(a.label, 0, 12) : text(a.label, 6, 12) + text(a.sub, 22, 9, 'lb sm')}`;
    }
    case 'drink': {
      // 飲料吧台：三桶飲料、一疊杯子
      const disp = (dx, c) => `<g transform="translate(${cx + dx} ${cy - 6})"><rect x="-6" y="-12" width="12" height="18" rx="3" fill="rgba(255,255,255,.75)" stroke="#c9b6a6" stroke-width="1"/><rect x="-5" y="-4" width="10" height="9" rx="2" fill="${c}" opacity=".85"/><rect x="-4" y="-15" width="8" height="3" rx="1" fill="#b98a62"/><rect x="-1.2" y="6" width="2.4" height="3" fill="#8a6a52"/></g>`;
      return `<ellipse cx="${cx + 2}" cy="${cy + 4}" rx="${w / 2}" ry="${h / 2}" fill="rgba(70,40,20,.14)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="#fff8ef" stroke="#c98f5c" stroke-width="3"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${w / 2 - 6}" ry="${h / 2 - 6}" fill="none" stroke="#ecd6bd" stroke-width="1.2"/>
        ${disp(-20, '#f6a05a')}${disp(0, '#ef7d9a')}${disp(20, '#8fd3b0')}
        <g transform="translate(${cx + 30} ${cy + 4})"><path d="M-3 -6 h6 l-1 8 h-4 Z" fill="#fff" stroke="#d9c4b0" stroke-width=".8"/><path d="M-3 -9 h6 l-1 3 h-4 Z" fill="#fff" stroke="#d9c4b0" stroke-width=".8"/></g>
        ${text(a.label, 15, 10, 'lb sm')}`;
    }
    case 'kitchen': return `${shadow(6)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#f3ece5" stroke="#b9a898" stroke-width="1.5"/>
        <rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="4" fill="none" stroke="#e0d2c4" stroke-width="1" stroke-dasharray="4 3"/>
        <ellipse cx="${cx}" cy="${y + 14}" rx="${Math.min(w, h) / 3}" ry="4" fill="#ffd66b" opacity=".35" class="candle"/>
        <g transform="translate(${cx} ${cy + 14})"><path d="M-6 0 Q-6 -7 0 -7 Q6 -7 6 0 Z" fill="#e0b04a"/><rect x="-8" y="0" width="16" height="2.4" rx="1" fill="#c9962e"/><circle cy="-8.4" r="1.4" fill="#c9962e"/></g>
        ${text(a.label, -4, 11)}`;
    case 'counter': {
      let deco = '';
      const n = 5;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const px = w >= h ? x + w * t : x + 22, py = w >= h ? y + 20 : y + h * t;
        deco += i % 2
          ? `<g transform="translate(${px} ${py})"><ellipse rx="10" ry="5" fill="#fff" stroke="#e0d2c4"/><circle cx="-3" cy="-2" r="2.4" fill="#e8a65e"/><circle cx="3" cy="-1" r="2.4" fill="#d9864a"/></g>`
          : `<g transform="translate(${px} ${py})"><rect x="-8" y="-5" width="16" height="10" rx="2" fill="#efe5da"/><rect x="-6" y="-3" width="12" height="6" rx="1" fill="#e2d4c6"/></g>`;
      }
      return `${shadow(22)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#fffdf9" stroke="#a98c7a" stroke-width="3"/>
        <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="16" fill="url(#marble)" stroke="#eadfd4" stroke-width="1"/>${deco}${text(a.label, w >= h ? 10 : 0, 18)}`;
    }
    case 'gift': return `<ellipse cx="${cx + 2}" cy="${cy + 4}" rx="${w / 2}" ry="${h / 2}" fill="rgba(70,40,20,.14)"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${w / 2}" ry="${h / 2}" fill="#fff4f2" stroke="#d98b8b" stroke-width="2.4"/>
        <g transform="translate(${cx} ${cy - (vert ? 18 : h * 0.3)})"><rect x="-9" y="-7" width="18" height="14" rx="2" fill="#d94a4a"/><path d="M-9 -2 h18" stroke="#ffd66b" stroke-width="1.6"/><circle r="2.6" fill="#ffd66b"/></g>
        <g transform="translate(${cx} ${cy + (vert ? 22 : h * 0.28)})"><rect x="-8" y="-4" width="16" height="8" rx="1" fill="#fff" stroke="#d9c4b0" stroke-width=".8"/><path d="M0 -4 v8" stroke="#d9c4b0" stroke-width=".8"/><path d="M5 -6 l3 6" stroke="#5a4636" stroke-width="1.2"/></g>
        ${text(a.label, vert ? 3 : 0, 10, 'lb sm')}`;
    case 'door': {
      const panes = ORI === 'land' ? [0, 1, 2, 3].map((k) => `<rect x="${x + 6 + k * (w - 12) / 4}" y="${y + 4}" width="${(w - 12) / 4 - 4}" height="${h - 8}" rx="2" fill="rgba(200,230,245,.5)" stroke="#9ab7c6" stroke-width="1"/><path d="M${x + 12 + k * (w - 12) / 4} ${y + 12} l10 -6" stroke="#fff" stroke-width="1.6" opacity=".7"/>`).join('') : '';
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(220,240,250,.35)" stroke="#9ab7c6" stroke-width="1.5" stroke-dasharray="6 4"/>${panes}${text(a.label, -14, 11, 'lb sm')}`;
    }
    case 'album': return `<rect x="${x + 2}" y="${y + 3}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" fill="rgba(70,40,20,.14)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2}" fill="#fff8ef" stroke="#c98f5c" stroke-width="2"/>
        <g transform="translate(${cx - 18} ${cy})"><path d="M-9 -6 Q-4 -8 0 -6 Q4 -8 9 -6 V6 Q4 4 0 6 Q-4 4 -9 6 Z" fill="#fff" stroke="#c9a27c" stroke-width="1"/><path d="M0 -6 V6" stroke="#c9a27c"/><rect x="-7" y="-4" width="5" height="4" fill="#9fd0f0"/><rect x="2" y="-4" width="5" height="4" fill="#f7a8c0"/></g>
        <text class="lb sm" x="${cx + 8}" y="${cy + 1}" font-size="10" text-anchor="middle" dominant-baseline="middle">相本桌</text>`;
    case 'stage': {
      let tiles = '';
      const s = 18;
      for (let i = 0; i < Math.floor(w / s); i++) for (let j = 0; j < Math.floor(h / s); j++) if ((i + j) % 2) tiles += `<rect x="${x + 2 + i * s}" y="${y + 2 + j * s}" width="${s}" height="${s}" class="a-tile"/>`;
      // 靠布幕那一側的花拱門
      let arch = '';
      const n = 11;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const [px, py] = ORI === 'land' ? [x + w - 6 - Math.sin(t * Math.PI) * 14, y + 8 + t * (h - 16)] : [x + 8 + t * (w - 16), y + 6 + Math.sin(t * Math.PI) * 14];
        arch += `<circle cx="${px}" cy="${py}" r="5.4" fill="${['#f7a8c0', '#fff', '#ffd1dc', '#c9a0e6'][i % 4]}" stroke="rgba(200,120,150,.35)" stroke-width=".8"/>`;
        if (i % 2) arch += `<ellipse cx="${px + 4}" cy="${py + 3}" rx="3.4" ry="1.8" fill="#7bb36d"/>`;
      }
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="rgba(255,240,246,.8)" stroke="#d9a7c2" stroke-width="2" stroke-dasharray="7 5"/>${tiles}
        <ellipse cx="${cx}" cy="${cy}" rx="${w / 2 - 10}" ry="${h / 2 - 10}" fill="url(#spot)"/>${arch}${text(a.label, 0, 15, 'lb stage-lb')}`;
    }
    case 'screen': return `<rect x="${x + 3}" y="${y + 4}" width="${w}" height="${h}" rx="3" fill="rgba(70,40,20,.2)"/>`;
    case 'long': return `<rect x="${x + 2}" y="${y + 4}" width="${w}" height="${h}" rx="5" fill="rgba(70,40,20,.14)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#fffdf9" stroke="#c9b3a0" stroke-width="2"/>
        <rect x="${a.w >= a.h ? x : cx - 5}" y="${a.w >= a.h ? cy - 5 : y}" width="${a.w >= a.h ? w : 10}" height="${a.w >= a.h ? 10 : h}" fill="#f6d5dc" opacity=".8"/>${longDecor(a)}`;
    case 'sofa': {
      const horiz = w >= h, k = Math.max(1, Math.round((horiz ? w : h) / 34));
      let cush = '';
      for (let i = 0; i < k; i++) cush += horiz ? `<rect x="${x + 5 + i * (w - 10) / k}" y="${y + 9}" width="${(w - 10) / k - 3}" height="${h - 13}" rx="5" fill="#bfa392"/>` : `<rect x="${x + 9}" y="${y + 5 + i * (h - 10) / k}" width="${w - 13}" height="${(h - 10) / k - 3}" rx="5" fill="#bfa392"/>`;
      return `${shadow(8)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#9c7d6a" stroke="#7d604f" stroke-width="2"/>${cush}`;
    }
    case 'dash': return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="rgba(255,255,255,.4)" stroke="#a8968a" stroke-width="1.5" stroke-dasharray="5 4"/>${text(a.label, 0, 11, 'lb sm')}`;
  }
  return '';
}
function longDecor(a) {
  // 長桌：花、蠟燭、小燭台
  let s = '';
  const horiz = a.w >= a.h, n = 9;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = horiz ? a.x + a.w * t : a.x + a.w / 2, y = horiz ? a.y + a.h / 2 : a.y + a.h * t;
    s += i % 2
      ? `<circle cx="${x}" cy="${y}" r="7" fill="#ffe08a" opacity=".25" class="candle"/><rect x="${x - 2}" y="${y - 3}" width="4" height="6" rx="1" fill="#fff8e6" stroke="#e8d3a0" stroke-width=".6"/><circle cx="${x}" cy="${y - 4}" r="1.6" fill="#ffb84d"/>`
      : `<circle cx="${x - 3.4}" cy="${y + 1}" r="3.6" fill="#f7a8c0"/><circle cx="${x + 3.2}" cy="${y}" r="3.6" fill="#fff" stroke="#f0dce6" stroke-width=".6"/><circle cx="${x}" cy="${y - 3}" r="3.2" fill="#c9a0e6"/><circle cx="${x}" cy="${y + 3.6}" r="2.6" fill="#ffd1dc"/><circle cx="${x - 3.4}" cy="${y + 1}" r="1.1" fill="#e07a98"/><ellipse cx="${x + 6}" cy="${y + 3}" rx="3" ry="1.5" fill="#7bb36d"/>`;
  }
  return s;
}
function drawFloor() {
  const parts = [];
  parts.push(`<defs>
    <pattern id="floor-marble" width="160" height="160" patternUnits="userSpaceOnUse">
      <rect width="160" height="160" fill="#f1ece6"/><rect width="80" height="80" fill="#f6f2ed"/><rect x="80" y="80" width="80" height="80" fill="#f6f2ed"/>
      <path d="M0 26 Q22 18 38 30 T80 22 M80 60 Q100 44 122 52 T160 40 M6 110 Q30 98 46 118 Q60 132 80 120 M88 150 Q110 128 136 140 T160 126" stroke="#d8cdc0" stroke-width="1.1" fill="none" opacity=".75"/>
      <path d="M18 0 Q30 30 22 54 Q16 70 30 80 M120 80 Q132 100 126 122 Q122 140 140 160 M40 80 Q52 90 48 104" stroke="#e2d8cc" stroke-width=".8" fill="none" opacity=".8"/>
      <path d="M100 10 q10 6 22 2 M56 140 q8 -6 18 -2" stroke="#cfc2b4" stroke-width=".6" fill="none" opacity=".6"/>
      <path d="M0 0 H160 M0 80 H160 M0 0 V160 M80 0 V160" stroke="#e0d6ca" stroke-width="1.2"/>
      <path d="M0 1 H160 M0 81 H160 M1 0 V160 M81 0 V160" stroke="#fff" stroke-width=".8" opacity=".7"/></pattern>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="tile" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#d9d4cf"/><rect width="9" height="9" fill="#e7e2dc"/><rect x="9" y="9" width="9" height="9" fill="#e7e2dc"/></pattern>
    <pattern id="plank" width="40" height="12" patternUnits="userSpaceOnUse"><rect width="40" height="12" fill="#c99b72"/><rect width="40" height="6" fill="#c2936a"/><path d="M0 6 H40 M0 12 H40 M22 0 V6 M8 6 V12" stroke="#a87b56" stroke-width=".8"/></pattern>
    <pattern id="roomfloor" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#f4eee8"/><path d="M0 14 L14 0" stroke="#e8ded4" stroke-width="1"/></pattern>
    <pattern id="marble" width="60" height="40" patternUnits="userSpaceOnUse"><rect width="60" height="40" fill="#fbf8f4"/><path d="M0 30 Q15 22 30 28 T60 20 M10 0 Q20 12 40 8" stroke="#ece4da" stroke-width="1.2" fill="none"/></pattern>
    <radialGradient id="glow"><stop offset="0" stop-color="#fff3c4" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>
    <radialGradient id="spot"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="vign" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#5a3a24" stop-opacity="0"/><stop offset="1" stop-color="#5a3a24" stop-opacity=".22"/></radialGradient>
  </defs>`);
  const hall = { x: 22, y: 18, w: 1092, h: 660 };
  const outside = { x: 0, y: 680, w: PW, h: 90 };
  parts.push(`<rect x="0" y="0" width="${SW}" height="${SH}" fill="#bfae9e"/>`);
  parts.push(`<rect x="${outside.x}" y="${outside.y}" width="${outside.w}" height="${outside.h}" fill="url(#tile)"/>`);
  // 門外的人行道花圃
  for (const [px, py, k] of [[700, 724, 0], [860, 724, 1], [960, 724, 0], [380, 724, 1]]) { const [qx, qy] = mp([px, py]); parts.push(plantSvg(qx, qy + 14, 0.8, k)); }
  // 牆：外框深色、內側一條淺色飾條
  parts.push(`<rect x="${hall.x - 4}" y="${hall.y - 4}" width="${hall.w + 8}" height="${hall.h + 8}" rx="14" fill="#7a5a44"/>`);
  parts.push(`<rect x="${hall.x}" y="${hall.y}" width="${hall.w}" height="${hall.h}" rx="10" fill="url(#floor-marble)"/><rect x="${hall.x}" y="${hall.y}" width="${hall.w}" height="${hall.h}" rx="10" fill="url(#sheen)"/>`);
  parts.push(`<rect x="${hall.x + 3}" y="${hall.y + 3}" width="${hall.w - 6}" height="${hall.h - 6}" rx="8" fill="none" stroke="#f6e7d4" stroke-width="2" opacity=".8"/>`);
  // 入口 1 的門口
  const gap = mr({ x: 490, y: 668, w: 92, h: 16 }, 1);
  parts.push(`<rect x="${gap.x}" y="${gap.y}" width="${gap.w}" height="${gap.h}" fill="#efe9e2"/>`);
  const mat = mr({ x: 500, y: 650, w: 72, h: 20 }, 1);
  parts.push(`<rect x="${mat.x}" y="${mat.y}" width="${mat.w}" height="${mat.h}" rx="4" fill="#b85a5a" opacity=".85"/><rect x="${mat.x + 3}" y="${mat.y + 3}" width="${mat.w - 6}" height="${mat.h - 6}" rx="3" fill="none" stroke="#f3c6a0" stroke-width="1" stroke-dasharray="3 2"/>`);
  // 每張桌子上方的吊燈光暈
  for (const T of L.tables) parts.push(`<ellipse cx="${T.cx}" cy="${T.cy}" rx="${T.w / 2 + 40}" ry="${T.h / 2 + 40}" fill="url(#glow)"/>`);
  // 牆上的串燈（掛線＋燈泡）
  const bl = [];
  for (let i = 0; i < 27; i++) bl.push(mp([560 + i * 20.5, 28 + Math.sin(i * 0.9) * 4]));
  parts.push(`<path d="M${bl.map((p) => p.join(' ')).join(' L')}" fill="none" stroke="#6b5444" stroke-width="1" opacity=".5"/>`);
  parts.push(bl.map(([bx, by], i) => `<circle cx="${bx}" cy="${by}" r="7" fill="url(#glow)"/><circle cx="${bx}" cy="${by + 1.5}" r="2.8" class="bulb b${i % 3}"/>`).join(''));
  // 盆栽（左牆、入口旁、右下角）
  for (const [px, py, k] of [[62, 190, 0], [62, 330, 1], [62, 430, 0], [612, 664, 1], [1090, 640, 0], [1050, 660, 1], [460, 520, 0]]) { const [qx, qy] = mp([px, py]); parts.push(plantSvg(qx, qy, 1, k)); }
  for (const a of L.areas) parts.push(areaSvg(a));
  const [ax, ay] = mp([760, 752]);
  parts.push(`<text x="${ax}" y="${ay}" class="lb sm" font-size="10" text-anchor="middle">${ORI === 'land' ? '← 賓客入口處' : '賓客入口 ↑'}</text>`);
  // 氣球束（活動區兩角）
  const st = L.areas.find((a) => a.id === 'stage');
  const balloon = (bx, by) => `<g class="balloons" transform="translate(${bx} ${by})"><path d="M0 18 Q-3 8 -7 -2 M0 18 Q1 6 4 -6 M0 18 Q4 10 10 0" stroke="#b9a898" stroke-width=".7" fill="none"/>
    <ellipse cx="-7" cy="-6" rx="6.4" ry="7.6" fill="#f7a8c0"/><ellipse cx="4" cy="-11" rx="6.4" ry="7.6" fill="#fff" stroke="#f0dce6" stroke-width=".6"/><ellipse cx="10" cy="-3" rx="6" ry="7.2" fill="#ffd66b"/>
    <path d="M-9 -9 q1 -2 3 -2 M2 -14 q1 -2 3 -2 M8 -6 q1 -2 3 -2" stroke="#fff" stroke-width="1.2" opacity=".8" fill="none"/></g>`;
  parts.push(balloon(st.x + 10, st.y + 14), balloon(ORI === 'land' ? st.x + 10 : st.x + st.w - 14, ORI === 'land' ? st.y + st.h - 4 : st.y + 14));
  // 四周暗角，讓畫面聚焦在中間
  parts.push(`<rect x="0" y="0" width="${SW}" height="${SH}" fill="url(#vign)" pointer-events="none"/>`);
  $('#floor').setAttribute('viewBox', `0 0 ${SW} ${SH}`);
  $('#floor').innerHTML = parts.join('');
}
// 桌面：桌布、桌旗、每個座位的餐盤刀叉和酒杯、花和蠟燭
function tableTopSvg(T) {
  const w = T.w, h = T.h, horiz = w >= h;
  const main = !!T.main;
  const cloth = main ? '#fff6f8' : '#fffdf9', rim = main ? '#f2b9c8' : '#e3d2c2';
  let s = '';
  if (T.round) {
    s += `<circle cx="${w / 2 + 1}" cy="${h / 2 + 3}" r="${w / 2 - 1}" fill="rgba(90,60,40,.16)"/><circle cx="${w / 2}" cy="${h / 2}" r="${w / 2 - 1}" fill="${cloth}" stroke="${rim}" stroke-width="2"/><circle cx="${w / 2}" cy="${h / 2}" r="${w / 2 - 6}" fill="none" stroke="${rim}" stroke-width=".8" stroke-dasharray="2 2"/>`;
  } else {
    s += `<rect x="2" y="4" width="${w - 2}" height="${h - 2}" rx="7" fill="rgba(90,60,40,.16)"/><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="7" fill="${cloth}" stroke="${rim}" stroke-width="2"/>`;
    s += `<rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="5" fill="none" stroke="${rim}" stroke-width=".8" stroke-dasharray="2 2"/>`;
    // 桌旗
    const rc = main ? '#f7b7c8' : '#f3d9c6';
    s += horiz ? `<rect x="0" y="${h / 2 - h * 0.14}" width="${w}" height="${h * 0.28}" fill="${rc}" opacity=".75"/><path d="M0 ${h / 2 - h * 0.14} H${w} M0 ${h / 2 + h * 0.14} H${w}" stroke="#e0b46a" stroke-width=".9" opacity=".8"/>`
      : `<rect x="${w / 2 - w * 0.14}" y="0" width="${w * 0.28}" height="${h}" fill="${rc}" opacity=".75"/><path d="M${w / 2 - w * 0.14} 0 V${h} M${w / 2 + w * 0.14} 0 V${h}" stroke="#e0b46a" stroke-width=".9" opacity=".8"/>`;
  }
  // 餐盤：在桌面靠近每個座位的地方
  for (const st of T.seatList) {
    let px = st.sit[0] - T.x, py;
    if (T.round) { const dx = st.sit[0] - T.cx, dy = (st.side === 'top' ? T.y - 6 : st.sit[1] - 18) - T.cy; const d = Math.hypot(dx, dy) || 1; px = w / 2 + dx / d * (w / 2 - 9); py = h / 2 + dy / d * (h / 2 - 9); }
    else if (st.side === 'top') py = 10;
    else if (st.side === 'bottom') py = h - 10;
    else if (st.side === 'left') { px = 10; py = st.sit[1] - 16 - T.y; }
    else { px = w - 10; py = st.sit[1] - 16 - T.y; }
    s += `<circle cx="${px}" cy="${py}" r="6.4" fill="#fff" stroke="#dacbbd" stroke-width=".9"/><circle cx="${px}" cy="${py}" r="4" fill="none" stroke="#ece2d8" stroke-width=".8"/>`;
    if (!T.round) {
      s += horiz ? `<path d="M${px - 9} ${py - 4} v8 M${px + 9} ${py - 4} v8" stroke="#bfb3a8" stroke-width="1.1" stroke-linecap="round"/><circle cx="${px + 13}" cy="${py + (st.side === 'top' ? 3 : -3)}" r="2.2" fill="rgba(220,235,245,.9)" stroke="#bcd0dc" stroke-width=".6"/>`
        : `<path d="M${px - 4} ${py - 9} h8 M${px - 4} ${py + 9} h8" stroke="#bfb3a8" stroke-width="1.1" stroke-linecap="round"/>`;
    }
  }
  // 花＋蠟燭（擺在桌子一端，中間留給菜）
  const [fx, fy] = T.round ? [w / 2, h / 2 + 8] : horiz ? [w - 16, h / 2] : [w / 2, h - 18];
  s += `<g transform="translate(${fx} ${fy})"><circle r="8" fill="#ffe08a" opacity=".22" class="candle"/>
    <circle cx="-3" cy="1" r="3.2" fill="${main ? '#ef7d9a' : '#f7a8c0'}"/><circle cx="3" cy="0" r="3.2" fill="#fff" stroke="#f0dce6" stroke-width=".5"/><circle cx="0" cy="-3" r="2.8" fill="#c9a0e6"/><circle cx="0" cy="3.4" r="2.4" fill="#ffd1dc"/>
    <ellipse cx="-5.6" cy="-2" rx="2.6" ry="1.3" fill="#7bb36d"/><ellipse cx="5.6" cy="3" rx="2.6" ry="1.3" fill="#7bb36d"/></g>`;
  if (main) s += `<path transform="translate(${w / 2} ${h * 0.18})" d="M0 4 C-7 -2 -4 -8 0 -4 C4 -8 7 -2 0 4 Z" fill="#ef7d9a"/>`;
  return `<svg class="top" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
}
function drawTables() {
  tableLayer.innerHTML = '';
  for (const T of L.tables) {
    const d = document.createElement('div');
    d.className = 'table' + (T.round ? ' round' : '') + (T.main ? ' main' : '');
    d.style.left = (T.x / SW * 100) + '%'; d.style.top = (T.y / SH * 100) + '%';
    d.style.width = (T.w / SW * 100) + '%'; d.style.height = (T.h / SH * 100) + '%';
    d.style.zIndex = String(Math.round(T.cy));
    // 椅子放在獨立一層、畫在所有人後面：人坐在椅子上，椅子不會擋到身體
    for (const st of T.seatList) {
      const off = st.side === 'top' ? [0, -15] : st.side === 'bottom' ? [0, -11] : [0, -12];
      const c = document.createElement('i');
      c.className = 'chair ' + st.side;
      c.style.left = ((st.sit[0] + off[0]) / SW * 100) + '%';
      c.style.top = ((st.sit[1] + off[1]) / SH * 100) + '%';
      tableLayer.appendChild(c);
    }
    d.innerHTML = `<div class="cloth">${tableTopSvg(T)}</div><span class="tno">${T.main ? '主桌' : T.n}</span><span class="dishes"></span>`;
    T.el = d; T.dishEl = d.querySelector('.dishes');
    d.addEventListener('click', (e) => { e.stopPropagation(); tapTable(T); });
    tableLayer.appendChild(d);
    renderDishes(T);
  }
  const sc = L.areas.find((a) => a.id === 'screen');
  const s = $('#screen');
  s.style.left = (sc.x / SW * 100) + '%'; s.style.top = (sc.y / SH * 100) + '%';
  s.style.width = (sc.w / SW * 100) + '%'; s.style.height = (sc.h / SH * 100) + '%';
  s.classList.toggle('vert', sc.w < sc.h);
}
function renderDishes(T) {
  if (!T.dishes) T.dishes = [];
  T.dishEl.innerHTML = T.dishes.map((d) => `<i style="opacity:${0.4 + 0.6 * d.left};--s:${(0.72 + 0.28 * d.left).toFixed(2)}">${d.left > 0.05 ? d.e : '🍽️'}</i>`).join('');
}

function sizeStage() {
  const wrap = $('#stageWrap');
  const aw = wrap.clientWidth, ah = wrap.clientHeight;
  let w;
  if (PHONE) {
    // 高度大約佔螢幕七成，寬度跟著平面圖比例變寬，左右滑動看
    const h = Math.max(360, Math.min(innerHeight * 0.68, 640));
    w = Math.max(aw, h * SW / SH * ZOOM);
  } else {
    w = Math.min(aw, ah * SW / SH);
  }
  const prevW = parseFloat(stage.style.width) || 0;
  stage.style.width = w + 'px';
  stage.style.height = (w * SH / SW) + 'px';
  stage.style.setProperty('--u', (w / SW) + 'px');
  UPX = w / SW;
  for (const a of actors) place(a);
  if (PHONE) {
    // 第一次先置中在用餐區；縮放時維持看的中心
    if (!prevW || !sizeStage.done) { wrap.scrollLeft = (w - aw) * 0.62; wrap.scrollTop = 0; sizeStage.done = true; }
    else if (prevW !== w) { const c = (wrap.scrollLeft + aw / 2) / prevW; wrap.scrollLeft = c * w - aw / 2; }
  }
}
let ZOOM = 1, UPX = 1;

// ---- 狀態與面板 ----
const state = { phase: 'party', course: -1, toasts: 0, cheers: 0, event: '', toastOrder: [], names: false };
function banner(text, ms = 3500) {
  const b = $('#banner');
  b.textContent = text; b.classList.add('show');
  clearTimeout(banner.t);
  banner.t = setTimeout(() => b.classList.remove('show'), ms);
}
function setStatus(text) { state.event = text; const e = $('#nowEvent'); if (e) e.textContent = text; }
function logLine(text) {
  const ul = $('#log');
  if (!ul) return;
  const li = document.createElement('li');
  li.textContent = text;
  ul.prepend(li);
  while (ul.children.length > 8) ul.lastChild.remove();
}
// 投影布幕輪播
const SLIDES = () => [
  `${CFG.groom || '新郎'} ❤ ${CFG.bride || '新娘'}`, 'Welcome', '♥', CFG.date || 'Just Married', '謝謝大家', '💍',
];
let slideI = 0, screenOverride = null;
function screenTick() {
  const s = $('#screen .sc-in');
  const list = SLIDES();
  const t = screenOverride || list[slideI++ % list.length];
  s.textContent = t;
  s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop');
}
function screenShow(t, ms = 5000) { screenOverride = t; screenTick(); setTimeout(() => { screenOverride = null; }, ms); }

// 飛的東西（愛心、捧花）
function fx(text, pt, cls = 'heart', ms = 1800) {
  const s = document.createElement('span');
  s.className = 'fx ' + cls;
  s.textContent = text;
  s.style.left = (pt[0] / SW * 100) + '%'; s.style.top = (pt[1] / SH * 100) + '%';
  s.style.setProperty('--dx', rand(-14, 14).toFixed(1));
  fxLayer.appendChild(s);
  setTimeout(() => s.remove(), ms);
}
function hearts(pt, n = 8, emoji = ['❤', '💕', '💖', '✨']) {
  for (let i = 0; i < n; i++) setTimeout(() => fx(pick(emoji), [pt[0] + rand(-24, 24), pt[1] - rand(20, 40)]), i * 120);
}
function flyBouquet(from, to) {
  return new Promise((res) => {
    const s = document.createElement('span');
    s.className = 'fx fly';
    s.textContent = '💐';
    fxLayer.appendChild(s);
    const x0 = from[0] / SW * 100, y0 = (from[1] - 30) / SH * 100, x1 = to[0] / SW * 100, y1 = (to[1] - 30) / SH * 100;
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 18;
    s.animate([
      { left: x0 + '%', top: y0 + '%', transform: 'translate(-50%,-50%) rotate(0deg)' },
      { left: mx + '%', top: my + '%', transform: 'translate(-50%,-50%) rotate(300deg) scale(1.4)' },
      { left: x1 + '%', top: y1 + '%', transform: 'translate(-50%,-50%) rotate(720deg)' },
    ], { duration: 1500, easing: 'ease-in-out' }).onfinish = () => { s.remove(); res(); };
  });
}
function flash() { const f = $('#flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }

// ---- 建立人物 ----
const guests = [], vip = {}, staff = [];
// 一筆報名代表一家人：{ name: '王小明', table: 3, count: 4, kids: 2 }
// 會展開成 count 個人：第一位是填表的人，其他人叫「王小明的家人」，最後 kids 位是小朋友
function expandFamilies(list) {
  const out = [];
  for (const p of list) {
    const n = Math.max(1, Math.round(+p.count || 1));
    const kids = Math.min(n - 1, Math.max(0, Math.round(+p.kids || 0)));
    const lap = Math.min(kids, Math.max(0, Math.round(+p.lap || 0)));   // 不佔座位、坐在大人腿上的小朋友
    out.push({ ...p, lap: false, baby: false, family: n > 1 ? p.name : '', famSize: n, famIdx: 0 });   // 填表的人本身一定佔座位
    for (let i = 1; i < n; i++) {
      const kid = i >= n - kids;
      const onLap = i >= n - lap;
      const g = i === 1 && !kid ? (p.g === 'f' ? 'm' : 'f') : ((p.name.length + i) % 2 ? 'm' : 'f');
      const m = (p.members || [])[i - 1] || {};   // 家人的指定（性別、外型）
      out.push({ name: `${p.name}的家人`, table: p.table, g: m.g || g, kid, lap: onLap, baby: onLap && !!p.baby, highchair: onLap && !!p.highchair, look: m.look, family: p.name, famSize: n, famIdx: i });
    }
  }
  return out;
}
function createPeople() {
  actorLayer.innerHTML = ''; actors.length = 0; guests.length = 0; staff.length = 0;
  seed = 20261116;
  const list = expandFamilies(CFG.GUESTS || fakeGuests());
  const byTable = {};
  for (const p of list) (byTable[p.table] = byTable[p.table] || []).push(p);
  for (const T of L.tables) {
    if (T.main) continue;
    const ps = byTable[T.n] || [];
    // 先坐不會被桌子擋住的位子
    const order = T.seatList.map((s, i) => i);
    let k = 0, lastSeat = null, lastSi = 0;
    ps.forEach((p) => {
      const lk = lookFor(p);
      if (p.baby) lk.baby = true;
      let seat, si;
      if (p.lap && lastSeat) {
        // 坐在家人旁邊（腿上），不佔座位
        si = lastSi;
        const off = p.highchair ? 15 : 9;   // 兒童座椅放在大人旁邊，離遠一點
        // 兒童座椅：坐在桌子兩側時放在大人外側，上下排就放旁邊
        const dx = p.highchair ? (lastSeat.side === 'right' ? off : lastSeat.side === 'left' ? -off : off) : (lastSeat.side === 'right' ? -off : off);
        seat = { ...lastSeat, sit: [lastSeat.sit[0] + dx, lastSeat.sit[1] + (p.highchair ? 6 : 2)], lap: true };
      } else {
        if (k >= order.length) console.warn(`第 ${T.n} 桌人數超過座位數`);
        si = order[k % order.length]; k++;
        seat = T.seatList[si];
        lastSeat = seat; lastSi = si;
      }
      const a = makeActor({ kind: 'guest', name: p.name, info: p, lk, table: T, seatIdx: si, svg: p.highchair ? personSvg(lk, HIGHCHAIR_BACK, HIGHCHAIR_FRONT) : personSvg(lk), speed: p.kid ? 95 : rand(62, 78), cls: p.kid ? 'kid' : '' });
      a.seat = seat;
      guests.push(a);
    });
  }
  const main = L.tables.find((t) => t.main);
  const vipSeat = { groom: 0, bride: 1, gdad: 2, gmom: 3, bdad: 4, bmom: 5 };
  for (const v of (CFG.vip || [])) {
    const name = v.name;
    const a = makeActor({ kind: v.role, name, svg: vipSvg(v.role, v.side), speed: 72, table: main, cls: 'vip ' + v.role, busy: true });
    a.seat = main.seatList[vipSeat[v.id]];
    vip[v.id] = a;
  }
  if (vip.bride) vip.bride.prop = '💐';
  for (let i = 0; i < 3; i++) {
    const a = makeActor({ kind: 'staff', name: '服務生', svg: staffSvg(), speed: 88, cls: 'staff', busy: true });
    a.pos = L.P.staffIdle[i].slice();
    staff.push(a);
  }
  for (const a of actors) { showProp(a); place(a); }
}

// ---- 每一幀 ----
let last = 0;
function tick(now) {
  const dt = Math.min(0.1, last ? (now - last) / 1000 : 0);
  last = now;
  simT += dt * 1000;
  for (let i = timers.length - 1; i >= 0; i--) if (timers[i].at <= simT) { const t = timers[i]; timers.splice(i, 1); t.r(); }
  let walkers = 0;
  for (const a of actors) {
    if (a.path && a.path.length) {
      walkers++;
      const tgt = a.path[0];
      const dx = tgt[0] - a.pos[0], dy = tgt[1] - a.pos[1], d = Math.hypot(dx, dy);
      const step = a.speed * dt;
      if (Math.abs(dx) > 0.5) setFace(a, dx < 0 ? -1 : 1);
      if (d <= step) { a.pos = tgt.slice(); a.path.shift(); } else { a.pos[0] += dx / d * step; a.pos[1] += dy / d * step; }
      if (!a.path.length) { a.path = null; setPose(a, ''); const f = a.onArrive; a.onArrive = null; if (f) f(); }
      place(a);
    }
  }
  if (state.phase === 'party') {
    for (const a of guests) {
      if (a.busy || a.path || simT < a.next || a.hidden) continue;
      a.next = simT + rand(6000, 18000);
      if (!atSeat(a)) { routine(a, () => goHome(a)); continue; }
      guestAct(a, walkers);
    }
  }
  requestAnimationFrame(tick);
}

// ---- 賓客自己做的事 ----
function seatedNeighbors(a) {
  return guests.filter((b) => b !== a && b.table === a.table && !b.busy && atSeat(b) && !b.bubbleOn);
}
function guestAct(a, walkers) {
  const r = Math.random();
  const T = a.table;
  if (a.info.kid && r < 0.45 && walkers < 14) { routine(a, () => kidRun(a)); return; }
  const quiet = bubbleCount >= (PHONE ? 10 : 16);
  if (r < 0.3 && !quiet) {
    const nb = seatedNeighbors(a);
    if (nb.length && !a.bubbleOn) {
      const b = pick(nb), pair = pick(CHAT);
      say(a, pair[0]); setFace(a, b.pos[0] < a.pos[0] ? -1 : 1);
      setTimeout(() => { if (!b.busy) { say(b, pair[1]); setFace(b, a.pos[0] < b.pos[0] ? -1 : 1); } }, 1500);
      return;
    }
  }
  if (r < 0.58) {
    const dish = (T.dishes || []).filter((d) => d.left > 0.05).pop();
    if (dish) {
      setPose(a, 'eat');
      dish.left = Math.max(0, dish.left - 0.07);
      renderDishes(T);
      if (!quiet && Math.random() < 0.35) say(a, pick(['好好吃 😋', `${dish.name}好讚`, '再來一口', '這道必吃！']));
      setTimeout(() => { if (a.pose === 'eat') setPose(a, 'sit'); }, 2400);
      return;
    }
  }
  if (r < 0.68 && walkers < 16) { routine(a, () => getDrink(a)); return; }
  if (r < 0.82 && walkers < 16) { routine(a, () => visitFriend(a)); return; }
  if (r < 0.88 && walkers < 16) { routine(a, () => stageFun(a)); return; }
  if (r < 0.91 && walkers < 16) { routine(a, () => albumLook(a)); return; }
  if (a.prop && Math.random() < 0.5) { setPose(a, 'sip'); setTimeout(() => { if (a.pose === 'sip') setPose(a, 'sit'); }, 1600); return; }
  if (!quiet && !a.bubbleOn && Math.random() < 0.5) say(a, a.info.kid ? pick(KID_LINES) : pick(SOLO));
}
async function getDrink(a) {
  const spot = pick(L.P.drink);
  await walkTo(a, spot);
  setPose(a, 'pour');
  if (Math.random() < 0.4) say(a, pick(['要喝哪個呢～', '我要冰的！', '續杯！', '拿鐵好香']));
  await wait(2200);
  a.prop = a.info.kid ? '🧃' : pick(DRINKS);
  showProp(a);
  const keep = a.prop;
  setTimeout(() => { if (a.prop === keep) { a.prop = ''; showProp(a); } }, rand(40000, 80000));
  await goHome(a);
}
async function visitFriend(a) {
  const others = guests.filter((b) => b.table !== a.table && !b.busy && atSeat(b) && !b.info.kid);
  if (!others.length) return;
  const b = pick(others);
  b.busy = true;
  try {
    const s = b.seat.sit;
    const off = ORI === 'land' ? [b.seat.side === 'right' ? 18 : -18, b.seat.side === 'top' ? -20 : 4] : [b.seat.side === 'right' ? 18 : -18, b.seat.side === 'top' ? -20 : 4];
    await walkTo(a, [s[0] + off[0], s[1] + off[1]]);
    setFace(a, b.pos[0] < a.pos[0] ? -1 : 1);
    const pair = pick([['好久不見！', '你也來啦！'], ['敬你一杯！', '乾杯～'], ['最近好嗎？', '還不錯啊～'], ['等等一起拍照！', '好啊！'], ['這桌菜比較好吃嗎 😆', '哈哈都一樣啦']]);
    say(a, pair[0]); await wait(1400); say(b, pair[1]);
    if (pair[1].includes('乾杯')) { a.temp = '🥂'; b.temp = '🥂'; showProp(a); showProp(b); setPose(a, 'cheer'); setPose(b, 'cheer'); }
    await wait(2400);
    b.temp = ''; showProp(b); setPose(b, 'sit');
  } finally { b.busy = false; }
  await goHome(a);
}
function randomIn(r) {
  for (let k = 0; k < 30; k++) {
    const p = [r.x + rand(6, r.w - 6), r.y + rand(10, r.h - 4)];
    if (isFreeAt(p[0], p[1])) return p;
  }
  return [r.x + r.w / 2, r.y + r.h / 2];
}
const stageRect = () => L.areas.find((x) => x.id === 'stage');
async function stageFun(a) {
  await walkTo(a, randomIn(inflate(stageRect(), -10)));
  if (Math.random() < 0.5) { a.temp = '📷'; showProp(a); say(a, pick(['來自拍！✌', '跟布幕合照～', '這裡好好拍'])); setPose(a, 'cheer'); }
  else { setPose(a, 'dance'); say(a, pick(['跳舞囉～ 🎶', '嘿咻嘿咻', '♪～'])); }
  await wait(rand(4000, 7000));
  a.temp = ''; showProp(a);
  await goHome(a);
}
async function albumLook(a) {
  await walkTo(a, [L.P.album[0] + rand(-30, 30), L.P.album[1] - rand(0, 8)]);
  setPose(a, 'eat');
  say(a, pick(['好多回憶～', '這張好可愛！', '新人小時候耶 🥹']));
  await wait(3500);
  await goHome(a);
}
async function kidRun(a) {
  const n = Math.floor(rand(2, 4));
  for (let i = 0; i < n; i++) {
    await walkTo(a, randomIn(L.P.lounge));
    if (Math.random() < 0.5) say(a, pick(KID_LINES));
  }
  await goHome(a);
}

// ---- 婚宴進行中 ----
async function party() {
  state.phase = 'party';
  setStatus('用餐中');
  logLine('開始上菜');
  for (const a of guests) a.next = simT + rand(300, 8000);
  courseLoop();
  staff.forEach((s, i) => staffLoop(s, i));
  for (const id of ['gdad', 'gmom', 'bdad', 'bmom']) if (vip[id]) parentLoop(vip[id]);
  await wait(rand(15000, 25000));
  for (;;) {
    const ev = weighted([[toastTour, 34], [cheersAll, 18], [kissEvent, 16], [bouquetEvent, 12], [groupPhoto, 20]]);
    try { await ev(); } catch (e) { console.error(e); }
    setStatus(COURSES[Math.max(0, state.course) % COURSES.length][1] + ' 上菜中');
    await wait(rand(16000, 30000));
  }
}
function weighted(list) {
  const tot = list.reduce((s, x) => s + x[1], 0);
  let r = Math.random() * tot;
  for (const [f, w] of list) { if ((r -= w) < 0) return f; }
  return list[0][0];
}
async function courseLoop() {
  for (;;) {
    state.course++;
    const c = COURSES[state.course % COURSES.length];
    $('#nowCourse').textContent = `${c[0]} ${c[2] || c[1]}`;
    logLine(`上菜：${c[0]} ${c[1]}`);
    await wait(rand(38000, 50000));
  }
}
async function staffLoop(s, i) {
  await wait(i * 1500);
  for (;;) {
    const need = L.tables.filter((t) => (t.course ?? -1) < state.course && !t.claimed);
    if (!need.length) {
      if (Math.random() < 0.5) await walkTo(s, L.P.staffIdle[i]);
      await wait(rand(2000, 5000));
      continue;
    }
    need.sort((a, b) => Math.hypot(a.serve[0] - L.P.kitchen[0], a.serve[1] - L.P.kitchen[1]) - Math.hypot(b.serve[0] - L.P.kitchen[0], b.serve[1] - L.P.kitchen[1]));
    const T = need[Math.floor(Math.random() * Math.min(3, need.length))];
    T.claimed = true;
    await walkTo(s, [L.P.kitchen[0] + i * 6, L.P.kitchen[1] + i * 8]);
    await wait(700);
    const ci = state.course, c = COURSES[ci % COURSES.length];
    s.temp = c[0]; showProp(s); setPose(s, 'carry');
    await walkTo(s, T.serve);
    setPose(s, '');
    await wait(400);
    T.dishes = (T.dishes || []).filter((d) => d.left > 0.05).slice(-1);
    T.dishes.push({ e: c[0], name: c[1], left: 1 });
    renderDishes(T);
    T.course = ci; T.claimed = false;
    s.temp = ''; showProp(s);
    if (Math.random() < 0.4) say(s, pick(['上菜囉～', '小心燙喔', '請慢用', `${c[1]}來囉！`]));
    // 同桌的人會開心
    const tg = guests.filter((g) => g.table === T && !g.busy && atSeat(g));
    if (tg.length && Math.random() < 0.5) { const g = pick(tg); setTimeout(() => say(g, pick(['哇～看起來好好吃', '好香！', `是${c[1]}！`, '開動！'])), 800); }
    await wait(300);
  }
}
async function parentLoop(p) {
  await wait(rand(15000, 40000));
  for (;;) {
    if (!state.coupleAway || Math.random() < 0.5) {
      const T = pick(L.tables.filter((t) => !t.main));
      const tg = guests.filter((g) => g.table === T && !g.busy && atSeat(g));
      await walkTo(p, [T.toast[0] + rand(-6, 6), T.toast[1] + rand(-4, 6)]);
      say(p, pick(PARENT_LINES));
      if (tg.length) { const g = pick(tg); await wait(1400); say(g, pick(GUEST_REPLY)); }
      await wait(2600);
      await goHome(p);
    }
    await wait(rand(35000, 70000));
  }
}
const seatedOf = (T) => guests.filter((g) => g.table === T && !g.busy && atSeat(g));
async function couplePair(pt, dx = 9) {
  const g = vip.groom, b = vip.bride;
  await Promise.all([walkTo(g, [pt[0] - dx, pt[1]]), walkTo(b, [pt[0] + dx, pt[1]])]);
  setFace(g, 1); setFace(b, -1);
}
async function coupleHome() { await Promise.all([goHome(vip.groom), goHome(vip.bride)]); }
async function toastTour() {
  if (!state.toastOrder.length) state.toastOrder = shuffle(L.tables.filter((t) => !t.main));
  const list = state.toastOrder.splice(0, 3);
  state.coupleAway = true;
  for (const T of list) {
    setStatus(`新人敬酒 · 第 ${T.n} 桌`);
    banner(`🥂 新人來第 ${T.n} 桌敬酒囉！`, 3500);
    await couplePair(T.toast, 9);
    const g = vip.groom, b = vip.bride;
    g.temp = '🥂'; b.temp = '🥂'; showProp(g); showProp(b);
    const tg = seatedOf(T);
    tg.forEach((x, i) => setTimeout(() => { x.temp = '🥂'; showProp(x); setPose(x, 'cheer'); }, i * 120));
    say(g, pick(COUPLE_THANKS), 2600, 'love');
    for (const x of shuffle(tg).slice(0, 3)) { await wait(700); say(x, pick(BLESS), 2200); }
    await wait(900);
    say(b, '乾杯～ 🥂', 2000, 'love');
    hearts([T.cx, T.cy - 10], 6, ['🥂', '✨', '❤']);
    await wait(2400);
    for (const x of tg) { x.temp = ''; showProp(x); if (x.pose === 'cheer') setPose(x, 'sit'); }
    g.temp = ''; b.temp = ''; showProp(g); showProp(b);
    state.toasts++;
    logLine(`新人到第 ${T.n} 桌敬酒`);
  }
  await coupleHome();
  state.coupleAway = false;
}
async function cheersAll() {
  setStatus('全場乾杯');
  banner('🥂 全場一起乾杯！', 4500);
  screenShow('Cheers! 🥂', 5000);
  logLine('全場乾杯');
  const ppl = [...guests.filter((g) => !g.busy && atSeat(g)), ...Object.values(vip).filter((v) => atSeat(v))];
  ppl.forEach((x, i) => setTimeout(() => { x.temp = '🥂'; showProp(x); setPose(x, 'cheer'); }, rand(0, 900)));
  for (const x of shuffle(ppl).slice(0, 14)) setTimeout(() => say(x, pick(BLESS), 2200), rand(300, 2600));
  await wait(4200);
  for (const x of ppl) { x.temp = ''; showProp(x); if (x.pose === 'cheer') setPose(x, 'sit'); }
  state.cheers++;
}
async function kissEvent() {
  setStatus('親一個！');
  banner('💋 大家起鬨：親一個！', 6000);
  logLine('新人在活動區親親');
  state.coupleAway = true;
  const st = stageRect();
  const ppl = guests.filter((g) => !g.busy && atSeat(g));
  const crowd = setInterval(() => { const x = pick(ppl); if (!x.busy && !x.bubbleOn) say(x, pick(['親一個！', '親一個！', '在一起～', '喔喔喔～']), 1600); }, 300);
  await couplePair([st.x + st.w / 2, st.y + st.h / 2 + 20], 8);
  clearInterval(crowd);
  setPose(vip.groom, 'kiss'); setPose(vip.bride, 'kiss');
  screenShow('❤', 5000);
  hearts([st.x + st.w / 2, st.y + st.h / 2 - 10], 18);
  for (const x of shuffle(ppl).slice(0, 8)) setTimeout(() => { if (!x.busy) { setPose(x, 'clap'); say(x, pick(['呀～～', '好甜！', '👏👏👏', '閃瞎了 😎'])); } }, rand(200, 1500));
  await wait(3800);
  setPose(vip.groom, ''); setPose(vip.bride, '');
  for (const x of ppl) if (x.pose === 'clap') setPose(x, 'sit');
  await coupleHome();
  state.coupleAway = false;
}
async function bouquetEvent() {
  const cands = shuffle(guests.filter((g) => g.info.g === 'f' && !g.info.kid && !g.info.elder && !g.busy && atSeat(g))).slice(0, 6);
  if (cands.length < 2) return cheersAll();
  setStatus('拋捧花');
  banner('💐 拋捧花！單身的快來～', 6000);
  logLine('新娘拋捧花');
  state.coupleAway = true;
  const st = stageRect(), b = vip.bride;
  const horiz = st.w >= st.h;
  // 新娘站在活動區靠布幕那一側，接捧花的人站另一側
  const bp = ORI === 'land' ? [st.x + st.w - 16, st.y + st.h / 2 + 20] : [st.x + st.w / 2, st.y + 30];
  const spots = cands.map((_, i) => ORI === 'land'
    ? [st.x - 14 + (i % 2) * 26, st.y + 30 + Math.floor(i / 2) * 42]
    : [st.x + 20 + (i % 3) * 36, st.y + st.h + 18 + Math.floor(i / 3) * 30]);
  for (const c of cands) c.busy = true;
  try {
    const arrive = Promise.all(cands.map((c, i) => walkTo(c, spots[i]).then(() => { setFace(c, ORI === 'land' ? 1 : 1); say(c, pick(['我我我！', '丟給我！', '等很久了！', '準備好了 🙌']), 2000); })));
    await Promise.race([Promise.all([walkTo(b, bp), arrive]), wait(16000)]);
    setFace(b, -1);
    say(b, '要丟囉～ 1、2、3！', 2400, 'love');
    await wait(2000);
    b.temp = ' '; showProp(b);
    const win = pick(cands);
    await flyBouquet(b.pos, win.pos);
    win.temp = '💐'; showProp(win); setPose(win, 'cheer');
    say(win, '我接到了！💐', 3000, 'love');
    hearts(win.pos, 10, ['🎉', '✨', '💐', '❤']);
    screenShow('💐 Next!', 5000);
    for (const c of cands) if (c !== win) setTimeout(() => say(c, pick(['啊～差一點！', '恭喜妳！', '下次換我！']), 2000), rand(300, 900));
    logLine(`${win.name} 接到捧花！`);
    await wait(3200);
    b.temp = ''; showProp(b);
    win.prop = '💐';
    const goBack = cands.map(async (c) => { c.temp = ''; showProp(c); setPose(c, ''); await goHome(c); });
    await Promise.all([...goBack, goHome(b)]);
  } finally {
    for (const c of cands) c.busy = false;
    state.coupleAway = false;
  }
}
async function groupPhoto() {
  const tbls = shuffle(L.tables.filter((t) => !t.main)).slice(0, 2);
  const ppl = tbls.flatMap((T) => seatedOf(T));
  if (ppl.length < 3) return cheersAll();
  setStatus(`大合照 · 第 ${tbls.map((t) => t.n).join('、')} 桌`);
  banner(`📸 第 ${tbls.map((t) => t.n).join('、')} 桌上台大合照！`, 5000);
  logLine(`第 ${tbls.map((t) => t.n).join('、')} 桌和新人合照`);
  state.coupleAway = true;
  const st = stageRect();
  const c = [st.x + st.w / 2, st.y + st.h / 2];
  for (const p of ppl) p.busy = true;
  try {
    const n = ppl.length;
    const spots = ppl.map((_, i) => {
      if (ORI === 'land') { const col = i % 3, row = Math.floor(i / 3); return [st.x + 14 + col * 30 + (row % 2) * 10, st.y + 28 + row * 26]; }
      const col = i % 5, row = Math.floor(i / 5); return [st.x + 14 + col * 30 + (row % 2) * 10, st.y + 24 + row * 22];
    });
    const arrive = Promise.all(ppl.map((p, i) => walkTo(p, spots[i] && isFreeAt(spots[i][0], spots[i][1]) ? spots[i] : randomIn(st))));
    await Promise.race([Promise.all([couplePair(ORI === 'land' ? [c[0] - 8, st.y + st.h - 18] : [c[0], st.y + st.h - 14], 9), arrive]), wait(18000)]);
    say(vip.groom, '大家靠過來～', 2000, 'love');
    await wait(1200);
    for (const k of ['3', '2', '1']) { screenShow(k, 900); banner(`📸 ${k}…`, 900); await wait(800); }
    for (const p of [...ppl, vip.groom, vip.bride]) { setPose(p, 'cheer'); p.temp = pick(['✌', '✌', '🎉', '❤']); showProp(p); }
    flash();
    screenShow('📸 Say Cheese!', 3000);
    banner('📸 喀嚓！', 2000);
    await wait(2600);
    for (const p of [...ppl, vip.groom, vip.bride]) { p.temp = ''; showProp(p); setPose(p, ''); }
    await Promise.all([...ppl.map((p) => goHome(p)), coupleHome()]);
  } finally {
    for (const p of ppl) p.busy = false;
    state.coupleAway = false;
  }
}

// ---- 點人／點桌／找座位 ----
function clearHl() { for (const a of actors) if (a.hl) { a.hl = false; a.el.classList.remove('hl'); place(a); } for (const T of L.tables) T.el.classList.remove('hl'); }
function tapActor(a) {
  const who = a.kind === 'guest' ? `${a.name}（第 ${a.table.n} 桌）` : a.name;
  const line = a.kind === 'guest' ? (a.info.kid ? pick(KID_LINES) : pick([...SOLO, ...GUEST_REPLY])) : a.kind === 'staff' ? pick(['請慢用～', '需要什麼嗎？']) : a.kind === 'groom' || a.kind === 'bride' ? pick(COUPLE_THANKS) : pick(PARENT_LINES);
  say(a, a.info && a.info.lang === 'en' ? `${a.name}: ${toEn(line)}` : `${who}：${line}`, 3200);
  a.el.classList.add('poke'); setTimeout(() => a.el.classList.remove('poke'), 500);
}
function tableNames(T) {
  if (T.main) return Object.values(vip).map((v) => v.name);
  // 同一家只列填表的人，後面標幾位
  return guests.filter((g) => g.table === T && !g.info.famIdx).map((g) => {
    const tags = [g.info.note, g.info.famSize > 1 ? `一家 ${g.info.famSize} 位` : ''].filter(Boolean);
    return tags.length ? `${g.name}（${tags.join('・')}）` : g.name;
  });
}
const tableTitle = (T) => (T.main ? '主桌' : '第 ' + T.n + ' 桌');
// 點桌子：在桌子旁邊跳出這桌的名單（面板裡也會顯示）
function tapTable(T) {
  const ppl = tableNames(T);
  const box = $('#tableInfo');
  if (box) box.innerHTML = `<b>${tableTitle(T)}${(CFG.tableNotes || {})[T.n] ? '・' + CFG.tableNotes[T.n] : ''}</b>　${ppl.join('、') || '（空桌）'}`;
  const pop = $('#tablePop');
  const note = (CFG.tableNotes || {})[T.n];
  pop.innerHTML = `<b>${tableTitle(T)}${note ? '・' + note : ''}</b><span>${ppl.length ? ppl.map((n) => `<i>${n}</i>`).join('') : '（空桌）'}</span>`;
  const above = T.cy > SH * 0.42;
  pop.style.left = Math.min(Math.max(T.cx / SW * 100, 12), 88) + '%';
  pop.style.top = ((above ? T.y - 6 : T.y + T.h + 34) / SH * 100) + '%';
  pop.classList.toggle('above', above);
  pop.classList.add('show');
  for (const t of L.tables) t.el.classList.toggle('hl', t === T);
  clearTimeout(tapTable.t);
  tapTable.t = setTimeout(closePop, 9000);
}
function closePop() { $('#tablePop').classList.remove('show'); for (const t of L.tables) t.el.classList.remove('hl'); }
// 面板裡的完整座位表
function renderSeatList() {
  const box = $('#seatList');
  if (!box) return;
  const order = [...L.tables].sort((a, b) => (a.main ? -1 : b.main ? 1 : a.n - b.n));
  box.innerHTML = order.map((T) => `<div class="seat-row"><b data-t="${T.main ? 'main' : T.n}">${tableTitle(T)}</b><span>${tableNames(T).map((n) => `<button type="button" data-name="${n.replace(/（.*）$/, '')}">${n}</button>`).join('') || `<em class="muted">${(CFG.tableNotes || {})[T.n] || '空桌'}</em>`}</span></div>`).join('');
  box.onclick = (e) => {
    const nb = e.target.closest('button[data-name]');
    if (nb) { const n = nb.dataset.name; const a = actors.find((x) => x.name === n) || actors.find((x) => x.name.startsWith(n + '（')); if (a) highlight(a); return; }
    const tb = e.target.closest('b[data-t]');
    if (tb) { const T = L.tables.find((t) => (t.main ? 'main' : String(t.n)) === tb.dataset.t); if (T) { tapTable(T); if (PHONE) T.el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); } }
  };
}
function highlight(a) {
  clearHl();
  // 一家人一起標出來
  const fam = a.info && a.info.family ? guests.filter((g) => g.info.family === a.info.family && g.table === a.table) : [a];
  for (const m of fam) { m.hl = true; m.el.classList.add('hl'); place(m); setTimeout(() => { if (m.hl) { m.hl = false; m.el.classList.remove('hl'); place(m); } }, 12000); }
  if (a.table) { a.table.el.classList.add('hl'); tapTable(a.table); }
  if (PHONE) a.el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  setTimeout(() => { if (a.hl) { a.hl = false; a.el.classList.remove('hl'); place(a); a.table && a.table.el.classList.remove('hl'); } }, 12000);
}
function setupSearch() {
  const inp = $('#find'), out = $('#findOut');
  inp.addEventListener('input', () => {
    const q = inp.value.trim();
    out.innerHTML = '';
    if (!q) return;
    const hits = actors.filter((a) => a.kind !== 'staff' && !(a.info && a.info.famIdx) && a.name.includes(q)).slice(0, 8);
    out.innerHTML = hits.length ? hits.map((a, i) => `<button type="button" data-i="${actors.indexOf(a)}">${a.name}${a.info && a.info.famSize > 1 ? `（一家 ${a.info.famSize} 位）` : ''}${a.table ? ' · ' + (a.table.main ? '主桌' : '第 ' + a.table.n + ' 桌') : ''}</button>`).join('') : '<span class="muted">找不到這個名字</span>';
  });
  out.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) highlight(actors[+b.dataset.i]); });
}

// ---- 啟動 ----
function rebuild() {
  const prevOri = ORI;
  const wasSeated = new Set(actors.filter((a) => atSeat(a) && !a.path));
  buildLayout();
  $('#app').dataset.ori = PHONE ? 'port' : 'land';
  drawFloor();
  drawTables();
  sizeStage();
  if (prevOri !== ORI && actors.length) {
    // 轉向：把每個人換到新的座標
    for (const a of actors) {
      const T = a.table, si = a.seatIdx;
      if (T) { const nt = L.tables.find((t) => t.n === T.n && !!t.main === !!T.main); a.table = nt; }
    }
    for (const g of guests) { g.seat = g.table.seatList[g.seatIdx]; }
    const vipSeat = { groom: 0, bride: 1, gdad: 2, gmom: 3, bdad: 4, bmom: 5 };
    for (const id of Object.keys(vip)) vip[id].seat = vip[id].table.seatList[vipSeat[id]];
    for (const a of actors) {
      const p = a.pos;
      // a.pos 是舊方向的座標，先換回平面圖座標再換到新方向
      const plan = prevOri === 'land' ? p : [PW - p[1], p[0]];
      a.pos = mp(plan);
      if (a.path) a.path = a.path.map((q) => mp(prevOri === 'land' ? q : [PW - q[1], q[0]]));
      if (wasSeated.has(a)) { a.pos = a.seat.sit.slice(); settle(a); }
      place(a);
    }
    for (const T of L.tables) {
      const old = TABLE_STATE[T.main ? 'main' : T.n];
      if (old) { T.dishes = old.dishes; T.course = old.course; T.claimed = false; renderDishes(T); }
    }
  }
  $('#app').dataset.ori = PHONE ? 'port' : 'land';
}
// 視窗大小改變（手機網址列收合、轉向、全螢幕）：平面圖不用重畫，只調整大小，
// 桌子物件保持同一份，賓客和桌子的對應才不會跑掉
function relayout() {
  PHONE = innerWidth < innerHeight * 0.95;
  $('#app').dataset.ori = PHONE ? 'port' : 'land';
  sizeStage();
}
const TABLE_STATE = {};
function snapshotTables() { if (!L) return; for (const T of L.tables) TABLE_STATE[T.main ? 'main' : T.n] = { dishes: T.dishes, course: T.course }; }

function init() {
  stage = $('#stage'); actorLayer = $('#actors'); tableLayer = $('#tables'); fxLayer = $('#fx');
  document.title = CFG.title || '婚禮派對';
  $('#ttl').textContent = CFG.title || '我們的婚禮派對';
  $('#sub').textContent = [`${CFG.groom || '新郎'} ❤ ${CFG.bride || '新娘'}`, CFG.date].filter(Boolean).join(' · ');
  $('#venue').textContent = CFG.venue || '';
  rebuild();
  createPeople();
  $('#count').textContent = `${guests.length + Object.keys(vip).length} 位`;
  setupSearch();
  renderSeatList();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(relayout, 150); });
  $('#btnNames').addEventListener('click', (e) => { state.names = !state.names; stage.classList.toggle('names', state.names); e.currentTarget.classList.toggle('on', state.names); });
  $('#btnFull').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); });
  $('#btnPanel').addEventListener('click', () => { $('#app').classList.toggle('nopanel'); sizeStage(); });
  $('#btnShow').addEventListener('click', () => { $('#app').classList.remove('nopanel'); sizeStage(); });
  $('#zoomIn').addEventListener('click', () => { ZOOM = Math.min(2.2, ZOOM * 1.25); sizeStage(); });
  $('#zoomOut').addEventListener('click', () => { ZOOM = Math.max(0.3, ZOOM / 1.25); sizeStage(); });
  stage.addEventListener('click', () => { clearHl(); closePop(); });
  if (PHONE) { const hint = $('#swipeHint'); hint.style.top = (stage.offsetHeight - 46) + 'px'; hint.classList.add('show'); const off = () => hint.classList.remove('show'); setTimeout(off, 4500); setTimeout(() => $('#stageWrap').addEventListener('scroll', off, { once: true }), 800); }
  setInterval(screenTick, 4500); screenTick();
  requestAnimationFrame(tick);
  run();
}
async function run() {
  // 一打開就是大家已經在場內
  for (const a of actors) { if (a.seat) { a.pos = a.seat.sit.slice(); settle(a); place(a); } }
  for (const id of Object.keys(vip)) { vip[id].busy = true; if (atSeat(vip[id])) settle(vip[id]); }
  for (const s of staff) s.busy = true;
  party();
}
document.addEventListener('DOMContentLoaded', init);
