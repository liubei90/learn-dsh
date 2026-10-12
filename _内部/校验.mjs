import fs from 'node:fs';
import path from 'node:path';

const REPO = '/home/liubei/deepseek-harness';
const OUT = '/home/liubei/code/leanrn-dsh';

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== '_内部' && e.name !== 'node_modules') walk(p, acc); }
    else if (e.name.endsWith('.md')) acc.push(p);
  }
  return acc;
}

const files = walk(OUT).sort();
let problems = 0;
const report = [];

for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const lines = text.split('\n');
  const rel = path.relative(OUT, f);
  const issues = [];

  // 1. balanced code fences
  const fences = (text.match(/^```/gm) || []).length;
  if (fences % 2 !== 0) issues.push(`code fence 未闭合（${fences} 个）`);

  // 2. escaped backticks leaked
  if (text.includes('\\`')) issues.push('存在转义残留 \\`');

  // 3. repo path references in inline code
  const pathRe = /`((?:packages|docs|apps|scripts|snapshots|\.agents|benchmarks|vendor|native|python)\/[^\s`|)]+)`/g;
  let m;
  const seen = new Set();
  while ((m = pathRe.exec(text))) {
    let ref = m[1].split('#')[0].replace(/[^A-Za-z0-9._/\-]+$/, '');
    if (ref.includes('*') || ref.includes('<') || ref.includes('>')) continue;
    const cand = ref.replace(/:\d+(-\d+)?$/, '');
    if (cand === '' || seen.has(cand)) continue;
    seen.add(cand);
    // brace expansion a{b,c}d
    const bm = cand.match(/^(.*)\{([^}]+)\}(.*)$/);
    const variants = bm ? bm[2].split(',').map((x) => bm[1] + x + bm[3]) : [cand];
    for (const v of variants) {
      if (!fs.existsSync(path.join(REPO, v)) && !fs.existsSync(path.join(REPO, v + '.ts')) && !fs.existsSync(path.join(REPO, v + '.md'))) {
        issues.push(`路径不存在: ${v}`); problems++;
      }
    }
  }

  // 4. relative markdown links
  const linkRe = /\]\((?![a-z]+:\/\/)([^)#]+\.md)/g;
  while ((m = linkRe.exec(text))) {
    const target = decodeURIComponent(m[1].split('#')[0]);
    if (!fs.existsSync(path.resolve(path.dirname(f), target))) { issues.push(`相对链接失效: ${m[1]}`); problems++; }
  }

  report.push({ rel, lines: lines.length, bytes: text.length, issues });
}

const totalLines = report.reduce((a, r) => a + r.lines, 0);
console.log('文件数:', report.length, ' 总行数:', totalLines, ' 问题数:', problems);
for (const r of report) {
  const flag = r.issues.length ? ' ⚠️' : ' ✅';
  console.log(`${flag} ${r.rel}  (${r.lines} 行, ${(r.bytes / 1024).toFixed(1)} KB)`);
  for (const i of r.issues) console.log('     - ' + i);
}
