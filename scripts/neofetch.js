// Renders the neofetch-style profile card with a spinning ASCII donut (a1k0n's donut.c) as an animated SVG.
// usage: node scripts/neofetch.js <stats.json> <out.svg>   (stats.json = output of the GraphQL query in profile.yml)
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

const exp = (role, when) => role.padEnd(28) + when;
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
  ['Akvelon', exp('Senior Software Engineer', '2025 - now')],
  ['IGC', exp('Software Engineer / Mentor', '2021 - 2025')],
  ['2G', exp('Software Engineer', '2022 - 2024')],
  ['EPAM', exp('Software Engineer', '2022')],
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
  else if (k === 'head') body = `<tspan class="dim">─ </tspan><tspan class="val">${v}</tspan><tspan class="dim"> ${'─'.repeat(COLS - v.length - 3)}</tspan>`;
  else body = kv(k, v) + (k2 ? `<tspan class="dim">│ </tspan>` + kv(k2, v2) : '');
  lines += `<text class="ln" x="${XI}" y="${y}" style="animation-delay:${d}s">${body}</text>`;
});
const cy = PADY + 6 + info.length * LH;
lines += `<text class="ln" x="${XI}" y="${cy}" style="animation-delay:1.8s"><tspan class="key">$</tspan><tspan class="cur"> █</tspan></text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<style>
:root { --bg:#0d1117; --border:#30363d; --key:#ffa657; --val:#c9d1d9; --dim:#484f58; --donut:#7ee787; }
@media (prefers-color-scheme: light) { :root { --bg:#f6f8fa; --border:#d0d7de; --key:#953800; --val:#24292f; --dim:#afb8c1; --donut:#1a7f37; } }
text { font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; font-size:${FS}px; white-space:pre; }
.bg { fill:var(--bg); stroke:var(--border); }
.f text { fill:var(--donut); }
.f { visibility:hidden; animation:show ${DUR}s infinite; }
@keyframes show { 0% { visibility:visible } ${per}% { visibility:hidden } 100% { visibility:hidden } }
.key { fill:var(--key); } .val { fill:var(--val); } .dim { fill:var(--dim); }
.ln { animation:in .5s ease-out backwards; }
@keyframes in { from { opacity:0 } }
.cur { fill:var(--val); animation:blink 1.1s step-end infinite; }
@keyframes blink { 50% { opacity:0 } }
@media (prefers-reduced-motion: reduce) { .f, .ln, .cur { animation:none } .f:first-of-type { visibility:visible } }
</style>
<rect class="bg" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10"/>
${frames}
${lines}
</svg>
`;
fs.writeFileSync(process.argv[3], svg);
console.log('bytes', svg.length);
