// build-client.mjs — превращает прототип в два артефакта рядом с бандлом:
//
//   public/helpmap/data.json   запечённая география
//   public/helpmap/runtime.mjs разметка + стили + логика карты из template.html
//
// Оба лежат в public/ и попадают в dist РЯДОМ с index.html, а не внутрь него.
// Так и надо: vite-plugin-singlefile инлайнит всё, что импортируется статически
// или динамически, поэтому «отдельный чанк» в этой сборке недостижим — а вот
// сосед по каталогу работает: island.ts ровно так же тянет в проде
// ./island-preview-sort-v2.html.
//
// template.html остаётся ЕДИНСТВЕННЫМ источником правды: вкусовые итерации
// продолжают жить в прототипе, а клиент пересобирается этой командой. Поэтому
// перенос сделан не копипастой, а явным списком подстановок — и каждая из них
// проверяется на количество совпадений, чтобы молча не разъехаться.
//
// Карта в клиенте живёт в Shadow DOM: стили приложения не протекают внутрь,
// а стили карты — наружу. Отсюда и вся правка селекторов ниже.
//
// Запуск (из help-map-prototype/):
//   node build-client.mjs                       -> ../feed-prototype/public/helpmap/
//   node build-client.mjs --out=<путь>/public/helpmap

import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { HERE, mapData, buildReport, gridParts } from './geo-data.mjs';

const arg = process.argv.slice(2).find((a) => a.startsWith('--out='));
const outDir = resolve(arg ? arg.slice('--out='.length) : join(HERE, '..', 'feed-prototype', 'public', 'helpmap'));
mkdirSync(outDir, { recursive: true });

// --------------------------------------------------------------- фокус 50m
// По умолчанию клиент получает ТОТ ЖЕ мир, что и прототип: полную 50m-детализацию.
// Это возможно только потому, что данные лежат соседом, а не в бандле, — иначе
// 258 КБ gzip уехали бы в index.html (vite-plugin-singlefile инлайнит всё).
//
// На случай, если разовая загрузка окажется слишком тяжёлой для мобильной сети,
// есть --focus=lon0,lat0,lon1,lat1: тогда 50m остаётся только в этом окне, а
// вне его рантайм не включает детальный слой и продолжает рисовать обзорный
// 110m (он и так в данных). Покрытие остаётся полным, земля не исчезает.
// ВАЖНО: окно должно накрывать весь стартовый кадр на СВОЁМ устройстве —
// вытянутый экран телефона дотягивается и до полярного ряда ячеек.
const focusArg = process.argv.slice(2).find((a) => a.startsWith('--focus='));
const FOCUS = focusArg ? focusArg.slice('--focus='.length).split(',').map(Number) : null;
const FULL_DETAIL = !FOCUS;

const { GX, GY, bounds } = gridParts;

/** Ячейки, попадающие в окно фокуса (в единицах карты). */
function focusCells() {
  const [lon0, lat0, lon1, lat1] = FOCUS;
  const P = (lon, lat) => {
    const l = lon * Math.PI / 180, p = lat * Math.PI / 180, p2 = p * p, p4 = p2 * p2;
    const x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
    const y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
    return [mapData.proj.scale * x + mapData.proj.tx, mapData.proj.ty - mapData.proj.scale * y];
  };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
    const [x, y] = P(lon0 + (lon1 - lon0) * i / 8, lat0 + (lat1 - lat0) * j / 8);
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const cw = bounds.w / GX, ch = bounds.h / GY;
  const set = new Set();
  for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) {
    const cx0 = bounds.x0 + i * cw, cy0 = bounds.y0 + j * ch;
    if (cx0 + cw >= x0 && cx0 <= x1 && cy0 + ch >= y0 && cy0 <= y1) set.add(j * GX + i);
  }
  return set;
}

/**
 * Разреженная детальная сетка: 50m только в окне фокуса. Остальные ячейки
 * пустые, а список детальных уезжает в `fine` — рантайм не включает детальный
 * слой, пока в кадре есть недетальная ячейка, и там просто продолжает
 * работать обзорный 110m-слой (он и так лежит в данных). Дублировать весь мир
 * во второй сетке ради этого не нужно.
 */
function sparseGrid() {
  if (FULL_DETAIL) return { grid: mapData.lod.detail, cells: null };
  const keep = focusCells();
  const src = mapData.lod.detail;
  const pick = (k) => src[k].map((d, i) => (keep.has(i) ? d : ''));
  return {
    grid: { grid: true, fill: pick('fill'), coast: pick('coast'), bord: pick('bord'), fine: [...keep].sort((a, b) => a - b) },
    cells: keep,
  };
}

const sparse = sparseGrid();
const clientData = { ...mapData, lod: { ...mapData.lod, detail: sparse.grid } };

const GEN = '// ВНИМАНИЕ: сгенерировано help-map-prototype/build-client.mjs — не править руками.\n' +
            '// Пересборка:  cd help-map-prototype && node build-client.mjs --out=<репо>/public/helpmap\n';

// ------------------------------------------------------------------- данные

// Чистый JSON: грузится fetch-ем по требованию, в бандл не попадает ни байта.
writeFileSync(join(outDir, 'data.json'), JSON.stringify(clientData));

// ------------------------------------------------------------------ рантайм

const tpl = readFileSync(join(HERE, 'template.html'), 'utf8');

function grab(re, what) {
  const m = tpl.match(re);
  if (!m) throw new Error(`build-client: не нашёл ${what} в template.html`);
  return m[1];
}
let css = grab(/<style>\n([\s\S]*?)\n<\/style>/, '<style>');
const theme = grab(/<body data-theme="([a-z]+)">/, 'тему по умолчанию на <body>');
const markup = grab(/<body data-theme="[a-z]+">\n([\s\S]*?)\n<script>/, 'разметку <body>').trim();
let js = grab(/<script>\n([\s\S]*?)\n<\/script>/, '<script>');

/** Явная подстановка с проверкой количества совпадений. */
function sub(src, from, to, expect, what) {
  const parts = src.split(from);
  const n = parts.length - 1;
  if (n !== expect) throw new Error(`build-client: «${what}» — ожидал ${expect} совпадений, нашёл ${n}`);
  return parts.join(to);
}
/** to — ВСЕГДА функция: строка с $1 не сработала бы, replace не раскрывает
 *  ссылки на группы, когда заменитель обёрнут в функцию-счётчик. */
function subRe(src, re, to, expect, what) {
  let n = 0;
  const out = src.replace(re, (...a) => { n++; return to(...a); });
  if (n !== expect) throw new Error(`build-client: «${what}» — ожидал ${expect} совпадений, нашёл ${n}`);
  return out;
}

// --- CSS: перевод на Shadow DOM ---------------------------------------------
// Кастомные свойства наследуются через границу тени, поэтому темы вешаем на
// :host — внутренние элементы их видят.
css = sub(css, ':root{', ':host{', 1, ':root -> :host');
css = subRe(css, /^\[data-theme="([a-z]+)"\]\{/gm, (_m, t) => `:host([data-theme="${t}"]){`, 3, 'блоки тем');
css = subRe(css, /^\[data-theme="([a-z]+)"\] /gm, (_m, t) => `:host([data-theme="${t}"]) `, 6, 'селекторы по теме');
// html/body внутри тени не существуют: их роль играет сам host
css = sub(css, 'html,body{height:100%; margin:0; overflow:hidden}\nbody{\n', ':host{\n  display:block; position:absolute; inset:0; overflow:hidden;\n', 1, 'html/body -> :host');
// В прототипе сцена — fixed, потому что там body и есть окно. В клиенте оверлей
// занимает свой бокс внутри #viewport, и fixed вырвал бы карту за его пределы:
// подложка растеклась бы на всё окно, а бейдж и кнопки остались бы в боксе.
css = sub(css, '#stage{position:fixed;', '#stage{position:absolute;', 1, 'сцена -> absolute');
// В Telegram fullscreen env(safe-area-inset-*) НЕ заполняется — приложение
// считает отступы само (устройство + собственная шапка Telegram) и кладёт их в
// --safe-*. Внутри тени кастомные свойства наследуются, так что просто
// переключаемся на них; в самом прототипе env() остаётся правильным.
css = sub(css, 'env(safe-area-inset-top)', 'var(--safe-top, 0px)', 3, 'safe-area сверху');
css = sub(css, 'env(safe-area-inset-bottom)', 'var(--safe-bottom, 0px)', 4, 'safe-area снизу');

// --- JS: тот же код, но привязанный к своему корню, и с уборкой за собой ----
js = sub(js, '"use strict";\n', '', 1, 'use strict');
js = sub(js, 'const MAP = /*__MAP_DATA__*/null;', '/* MAP приходит параметром */', 1, 'плейсхолдер данных');
js = sub(js, 'document.getElementById(', 'ROOT.getElementById(', 30, 'getElementById -> корень тени');
js = sub(js, 'document.body.dataset.theme', 'HOST.dataset.theme', 2, 'тема на host');
// глобальные подписки и таймер — единственное, что переживает размонтирование
js = sub(js, 'document.addEventListener("keydown"', 'ON(document, "keydown"', 1, 'keydown');
js = sub(js, '\naddEventListener("resize"', '\nON(window, "resize"', 1, 'resize');
js = sub(js, '\nsetInterval(', '\nEVERY(', 1, 'setInterval');

const runtimeMod = `${GEN}//
// Разметка, стили и логика карты, перенесённые из template.html подстановками
// (см. build-client.mjs). Карта монтируется в Shadow DOM.

export const HELPMAP_THEME = ${JSON.stringify(theme)};

const CSS = ${JSON.stringify(css)};
const HTML = ${JSON.stringify(markup)};

/**
 * Монтирует карту в теневой корень. Возвращает функцию размонтирования:
 * она снимает глобальные подписки и таймер, всё остальное уходит вместе с host.
 *
 * @param {HTMLElement} HOST   элемент-хозяин (несёт data-theme)
 * @param {ShadowRoot}  ROOT   его теневой корень
 * @param {object}      MAP    данные из helpmap-data.mjs
 * @returns {() => void}
 */
export function mountHelpMap(HOST, ROOT, MAP) {
  const style = document.createElement("style");
  style.textContent = CSS;
  ROOT.appendChild(style);
  const holder = document.createElement("div");
  holder.innerHTML = HTML;
  while (holder.firstChild) ROOT.appendChild(holder.firstChild);

  const CLEAN = [];
  const ON = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    CLEAN.push(() => target.removeEventListener(type, fn, opts));
  };
  const EVERY = (fn, ms) => {
    const id = setInterval(fn, ms);
    CLEAN.push(() => clearInterval(id));
    return id;
  };

${js.split('\n').map((l) => (l ? '  ' + l : l)).join('\n')}

  return () => { for (const off of CLEAN) off(); };
}
`;
writeFileSync(join(outDir, 'runtime.mjs'), runtimeMod);

// -------------------------------------------------------------------- отчёт

const size = (p) => {
  const raw = statSync(join(outDir, p)).size;
  const gz = gzipSync(readFileSync(join(outDir, p))).length;
  return `  ${p.padEnd(22)} ${(raw / 1024).toFixed(0).padStart(4)} КБ  (gzip ${(gz / 1024).toFixed(0)} КБ)`;
};
console.log(buildReport.join('\n'));
console.log(sparse.cells
  ? `\nдетальный 50m только в окне ${FOCUS.join(',')} — ${sparse.cells.size} из ${GX * GY} ячеек; вне окна работает обзорный 110m-слой`
  : '\nдетальный 50m на весь мир (--full-detail)');
console.log(`\n${outDir}`);
console.log(size('data.json'));
console.log(size('runtime.mjs'));
