#!/usr/bin/env node
// Собирает dist/platform-scheme.html из template.html + ../VISION.md.
// VISION вшивается сгенерированным HTML с провенансом (git-коммит + sha256 байт),
// чтобы копия в схеме никогда молча не расходилась с authority-документом.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const visionPath = path.join(here, '..', 'VISION.md');
const visionBytes = readFileSync(visionPath);
const visionText = visionBytes.toString('utf8');

function inline(escaped) {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markdownToHtml(md) {
  const out = [];
  let list = null; // {tag, items:[]}
  let para = [];
  const flushPara = () => {
    if (para.length) { out.push(`<p>${inline(esc(para.join(' ')))}</p>`); para = []; }
  };
  const flushList = () => {
    if (list) {
      out.push(`<${list.tag}>` + list.items.map((i) => `<li>${inline(esc(i))}</li>`).join('') + `</${list.tag}>`);
      list = null;
    }
  };
  for (const raw of md.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if (line.startsWith('# ')) { flushPara(); flushList(); continue; } // h1 = заголовок карточки
    if (line.startsWith('## ')) {
      flushPara(); flushList();
      out.push(`<h4>${inline(esc(line.slice(3)))}</h4>`);
      continue;
    }
    const bullet = line.match(/^- (.*)$/);
    const numbered = line.match(/^\d+\. (.*)$/);
    if (bullet || numbered) {
      flushPara();
      const tag = bullet ? 'ul' : 'ol';
      if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
      list.items.push((bullet || numbered)[1]);
      continue;
    }
    if (list && /^\s{2,}/.test(raw)) { list.items[list.items.length - 1] += ` ${line.trim()}`; continue; }
    flushList();
    para.push(line.trim());
  }
  flushPara(); flushList();
  return `<div class="doc">${out.join('')}</div>`;
}

let commit = 'uncommitted';
try {
  commit = execFileSync('git', ['log', '-1', '--format=%h', '--', 'VISION.md'],
    { cwd: path.join(here, '..'), encoding: 'utf8' }).trim() || 'uncommitted';
} catch { /* вне git — оставляем uncommitted */ }
const sha = createHash('sha256').update(visionBytes).digest('hex');

const meta = `VISION.md @ ${commit} · sha256 ${sha.slice(0, 12)}`;
const buildInfo = `исходник: meta-repo/platform-scheme · VISION вшит из VISION.md @ ${commit} · sha256 ${sha.slice(0, 12)}`;

const template = readFileSync(path.join(here, 'template.html'), 'utf8');
for (const token of ['__VISION_HTML__', '__VISION_META__', '__BUILD_INFO__']) {
  if (!template.includes(token)) throw new Error(`template is missing ${token}`);
}
const html = template
  .replace('__VISION_HTML__', JSON.stringify(markdownToHtml(visionText)))
  .replace('__VISION_META__', JSON.stringify(meta))
  .replace('__BUILD_INFO__', esc(buildInfo));

mkdirSync(path.join(here, 'dist'), { recursive: true });
const outPath = path.join(here, 'dist', 'platform-scheme.html');
writeFileSync(outPath, html);
process.stdout.write(`built ${outPath}\n${meta}\n`);
