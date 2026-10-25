// Renders the neofetch-style profile card with a spinning ASCII donut (a1k0n's donut.c) as an animated SVG.
// Also renders activity.svg: an ASCII contribution heatmap in the same style.
// usage: node scripts/neofetch.js <stats.json> <neofetch.svg> <activity.svg>   (stats.json = output of the GraphQL query in profile.yml)
const fs = require('fs');
const W = 52, H = 24, FRAMES = 60, DUR = 6;
const RAMP = '.,-~:;=!*#$@';

function frame(A, B) {
  const out = Array(W * H).fill(' '), z = Array(W * H).fill(0);
  for (let j = 0; j < 6.28; j += 0.07) for (let i = 0; i < 6.28; i += 0.02) {
    const c = Math.sin(i), d = Math.cos(j), e = Math.sin(A), f = Math.sin(j), g = Math.cos(A),
      h = d + 2, D = 1 / (c * h * e + f * g + 5), l = Math.cos(i), m = Math.cos(B), n = Math.sin(B),
      t = c * h * g - f * e;
    const x = Math.floor(W / 2 + 34 * D * (l * h * m - t * n));
    const y = Math.floor(H / 2 + 15 * D * (l * h * n + t * m));
    const N = Math.floor(8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n));
    const o = x + W * y;
    if (y >= 0 && y < H && x >= 0 && x < W && D > z[o]) { z[o] = D; out[o] = RAMP[N > 0 ? N : 0]; }
  }
  const rows = [];
  for (let y = 0; y < H; y++) rows.push(out.slice(y * W, y * W + W).join(''));
  return rows;
}

const u = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).data.user;
const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);
const months = (() => { const n = new Date(); return (n.getUTCFullYear() - 2021) * 12 + n.getUTCMonth() - 1; })(); // since Feb 2021
const uptime = `${Math.floor(months / 12)} years, ${months % 12} months`;
const cc = u.contributionsCollection;

const pair = (k1, v1, k2, v2) => [k1, String(v1).padEnd(10), k2, String(v2)];

const info = [
  ['title'], ['rule'],
  ['Role', 'Senior Software Engineer @ Akvelon'],
  ['Host', 'Tbilisi, Georgia'],
  ['Uptime', uptime],
  [],
  ['Lang', 'C#, T-SQL, JavaScript'],
  ['Stack', 'ASP.NET Core, EF Core, Dapper'],
  ['Data', 'SQL Server, Redis, Kafka, RabbitMQ'],
  ['Cloud', 'Azure, Docker, CI/CD'],
  ['Arch', 'Clean Architecture, CQRS, Microservices'],
  [],
  ['Edu', 'MA DevOps (BTU), BA IT (GTU)'],
  ['Cert', 'Azure Fundamentals AZ-900'],
  [],
  ['head', 'Experience'],
  ['co', 'Akvelon', 'Apr 2025 - Present'], ['role', 'Senior Software Engineer'],
  ['co', 'International Gambling Company', 'Jan 2023 - Mar 2025'], ['role', 'Software Engineer / Mentor'],
  ['co', '2G', 'Dec 2022 - May 2024'], ['role', 'Software Engineer'],
  ['co', 'EPAM Systems', 'Jul 2022 - Nov 2022'], ['role', 'Software Engineer'],
  ['co', 'International Gambling Company', 'Feb 2021 - Jul 2022'], ['role', 'Junior Software Engineer'],
  [],
  ['head', 'GitHub'],
  pair('Repos', u.repositories.totalCount, 'Stars', stars),
  pair('Follow', u.followers.totalCount, 'Contrib', `${cc.contributionCalendar.totalContributions} this year`),
  [],
  ['head', 'Contact'],
  ['Mail', 'imesashviliirakli5@gmail.com'],
  ['GitHub', 'ImesashviliIrakli'],
];

const LH = 19, FS = 14, PADY = 34, X0 = 24, XI = 490, COLS = 50;
const rowsTotal = info.length + 1;
const height = PADY * 2 + LH * (rowsTotal - 1) + 6;
const width = 940;
const donutTop = PADY + 6 + Math.round(((rowsTotal - H) * LH) / 2);
const per = (100 / FRAMES).toFixed(4);

let frames = '';
for (let k = 0; k < FRAMES; k++) {
  const a = (2 * Math.PI * k) / FRAMES;
  const delay = ((k * DUR) / FRAMES - DUR).toFixed(3);
  frames += `<g class="f" style="animation-delay:${delay}s">` +
    frame(a, a).map((r, y) => `<text x="${X0}" y="${donutTop + y * LH}">${r}</text>`).join('') + '</g>';
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const kv = (k, v) => `<tspan class="key">${k}</tspan><tspan class="dim">${' ' + '.'.repeat(8 - k.length) + ' '}</tspan><tspan class="val">${esc(v)}</tspan>`;
let lines = '';
info.forEach(([k, v, k2, v2], i) => {
  const y = PADY + 6 + i * LH, d = (0.2 + i * 0.05).toFixed(2);
  let body;
  if (!k) return;
  if (k === 'title') body = `<tspan class="key">irakli</tspan><tspan class="val">@</tspan><tspan class="key">imesashvili</tspan>`;
  else if (k === 'rule') body = `<tspan class="dim">${'─'.repeat(COLS)}</tspan>`;
  else if (k === 'co') body = `<tspan class="key">${esc(v.padEnd(COLS - k2.length))}</tspan><tspan class="val">${k2}</tspan>`;
  else if (k === 'role') body = `<tspan class="val">  ${esc(v)}</tspan>`;
  else if (k === 'head') body = `<tspan class="dim">─ </tspan><tspan class="val">${v}</tspan><tspan class="dim"> ${'─'.repeat(COLS - v.length - 3)}</tspan>`;
  else body = kv(k, v) + (k2 ? `<tspan class="dim">│ </tspan>` + kv(k2, v2) : '');
  lines += `<text class="ln" x="${XI}" y="${y}" style="animation-delay:${d}s">${body}</text>`;
});
const cy = PADY + 6 + info.length * LH;
lines += `<text class="ln" x="${XI}" y="${cy}" style="animation-delay:1.8s"><tspan class="key">$</tspan><tspan class="cur"> █</tspan></text>`;

const BASE = `
:root { --bg:#0d1117; --border:#30363d; --key:#ffa657; --val:#c9d1d9; --dim:#484f58; --donut:#7ee787; }
@media (prefers-color-scheme: light) { :root { --bg:#f6f8fa; --border:#d0d7de; --key:#953800; --val:#24292f; --dim:#afb8c1; --donut:#1a7f37; } }
text { font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; font-size:${FS}px; white-space:pre; }
.bg { fill:var(--bg); stroke:var(--border); }
.key { fill:var(--key); } .val { fill:var(--val); } .dim { fill:var(--dim); }
.ln { animation:in .5s ease-out backwards; }
@keyframes in { from { opacity:0 } }
.cur { fill:var(--val); animation:blink 1.1s step-end infinite; }
@keyframes blink { 50% { opacity:0 } }`;
const card = (w, h, css, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<style>${BASE}${css}</style>
<rect class="bg" x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="10"/>
${body}
</svg>
`;

fs.writeFileSync(process.argv[3], card(width, height, `
.f text { fill:var(--donut); }
.f { visibility:hidden; animation:show ${DUR}s infinite; }
@keyframes show { 0% { visibility:visible } ${per}% { visibility:hidden } 100% { visibility:hidden } }
@media (prefers-reduced-motion: reduce) { .f, .ln, .cur { animation:none } .f:first-of-type { visibility:visible } }`, frames + lines));

// ---- activity card: ASCII contribution heatmap ----
const days = cc.contributionCalendar.weeks.flatMap(w => w.contributionDays);
const LEVEL = { NONE: ['·', 'l0'], FIRST_QUARTILE: ['-', 'l1'], SECOND_QUARTILE: ['+', 'l2'], THIRD_QUARTILE: ['#', 'l3'], FOURTH_QUARTILE: ['@', 'l4'] };
const fmt = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0;
for (let i = days.length - 1 - (days.at(-1).contributionCount ? 0 : 1); i >= 0 && days[i].contributionCount; i--) current++;
const best = days.reduce((b, d) => (d.contributionCount > b.contributionCount ? d : b));

const CX = 16, CY = 18, GX = 64, GY = 104;
const weeks = cc.contributionCalendar.weeks;
let grid = '', lastMonth = -1;
const labels = [];
weeks.forEach((w, x) => {
  const m = new Date(w.contributionDays[0].date).getUTCMonth();
  if (m !== lastMonth && x < weeks.length - 2) {
    if (labels.length && x - labels.at(-1).x < 3) labels.pop(); // a partial first month yields to the next one
    labels.push({ x, name: new Date(w.contributionDays[0].date).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) });
  }
  lastMonth = m;
  grid += `<g class="c" style="animation-delay:${(0.3 + x * 0.025).toFixed(3)}s">` + w.contributionDays.map(d => {
    const [ch, cls] = LEVEL[d.contributionLevel];
    const today = d === days.at(-1) ? ' cur' : '';
    return `<text class="${cls}${today}" x="${GX + x * CX}" y="${GY + d.weekday * CY}">${ch}</text>`;
  }).join('') + '</g>';
});
labels.forEach(l => { grid += `<text class="dim" x="${GX + l.x * CX}" y="${GY - 24}">${l.name}</text>`; });
['Mon', 'Wed', 'Fri'].forEach((d, i) => { grid += `<text class="dim" x="24" y="${GY + (1 + i * 2) * CY}">${d}</text>`; });

const aw = width, ah = GY + 7 * CY + 84;
const sy = GY + 7 * CY + 22;
const stat = (k, v) => `<tspan class="key">${k}</tspan><tspan class="dim"> </tspan><tspan class="val">${v}</tspan>`;
const sep = '<tspan class="dim">   │   </tspan>';
const head = `<text class="ln" x="24" y="40"><tspan class="key">$</tspan><tspan class="val"> git log --author=irakli --since="1 year ago" | heatmap</tspan></text>
<line x1="24" y1="54" x2="${width - 24}" y2="54" stroke="var(--border)"/>`;
const foot = `<text class="ln" x="24" y="${sy}" style="animation-delay:1.8s">` +
  [stat('total', `${cc.contributionCalendar.totalContributions}`), stat('longest streak', `${longest}d`), stat('current streak', `${current}d`),
   stat('best day', `${fmt(best.date)} (${best.contributionCount})`)].join(sep) + '</text>' +
  `<text class="ln" x="24" y="${sy + 24}" style="animation-delay:2s"><tspan class="dim">less </tspan><tspan class="l0">·</tspan> <tspan class="l1">-</tspan> <tspan class="l2">+</tspan> <tspan class="l3">#</tspan> <tspan class="l4">@</tspan><tspan class="dim"> more</tspan></text>`;

fs.writeFileSync(process.argv[4], card(aw, ah, `
.l0 { fill:var(--dim); } .l1, .l2, .l3, .l4 { fill:var(--donut); font-weight:bold; }
.l1 { opacity:.45 } .l2 { opacity:.65 } .l3 { opacity:.85 }
.c { animation:in .4s ease-out backwards; }
@media (prefers-reduced-motion: reduce) { .c, .ln, .cur { animation:none } }`, head + grid + foot));
console.log('streaks', longest, current, 'best', best.date, best.contributionCount);
