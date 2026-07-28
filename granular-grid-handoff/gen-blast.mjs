// Offline generator for the blast layouts. Produces "ore deposit" boards: blobs
// of irregular shape grown from seeded points, coloured so adjacent blobs stay
// distinct, with the leftovers falling out as singletons and pairs.
//
// Nothing here ships. The output is baked into levels.ts as literal rows, so the
// runtime has no generation and no random() at all.
import {
  BLAST_MIN_GROUP,
  COLOUR_COUNT,
  blastAt,
  collectGroup,
  createBoard,
  hasOpenColumn,
  isBlastable,
  settleBoard,
} from '/Users/gleb/My projects/p4g-platform-workspace/playables/granular-grid-blast/src/board.ts';

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate({ cols, rows, seed, sizePlan, rightBias = 0, rightFrom = 5 }) {
  const rnd = mulberry32(seed);
  const tiles = new Array(cols * rows).fill(0);
  const unassigned = new Set();
  for (let i = 0; i < cols * rows; i++) unassigned.add(i);
  const used = new Array(COLOUR_COUNT + 1).fill(0);

  const neighbours = (index) => {
    const row = Math.floor(index / cols);
    const col = index - row * cols;
    const out = [];
    if (col > 0) out.push(index - 1);
    if (col + 1 < cols) out.push(index + 1);
    if (row > 0) out.push(index - cols);
    if (row + 1 < rows) out.push(index + cols);
    return out;
  };

  while (unassigned.size > 0) {
    const pool = [...unassigned];
    const seedCell = pool[Math.floor(rnd() * pool.length)];
    const seedCol = seedCell % cols;
    let target = sizePlan[Math.floor(rnd() * sizePlan.length)];
    if (seedCol >= rightFrom) target += rightBias;
    target = Math.max(1, Math.min(6, target));

    const blob = [seedCell];
    unassigned.delete(seedCell);
    while (blob.length < target) {
      const frontier = [];
      for (const cell of blob) {
        for (const n of neighbours(cell)) if (unassigned.has(n)) frontier.push(n);
      }
      if (frontier.length === 0) break;
      const pick = frontier[Math.floor(rnd() * frontier.length)];
      blob.push(pick);
      unassigned.delete(pick);
    }

    const forbidden = new Set();
    for (const cell of blob) {
      for (const n of neighbours(cell)) {
        if (!blob.includes(n) && tiles[n]) forbidden.add(tiles[n]);
      }
    }
    // Among the colours that would not fuse this blob into a neighbour, take the
    // one used least so far: keeps the five colours near-even instead of leaving
    // one of them as a rarity nobody can plan around.
    const rotation = 1 + Math.floor(rnd() * COLOUR_COUNT);
    let colour = 0;
    let bestCount = Infinity;
    for (let step = 0; step < COLOUR_COUNT; step++) {
      const candidate = 1 + ((rotation - 1 + step) % COLOUR_COUNT);
      if (forbidden.has(candidate)) continue;
      if (used[candidate] < bestCount) { bestCount = used[candidate]; colour = candidate; }
    }
    if (!colour) colour = rotation;
    used[colour] += blob.length;
    for (const cell of blob) tiles[cell] = colour;
  }
  return tiles;
}

function analyse(tiles, cols, rows) {
  const state = createBoard({ cols, rows, tiles });
  const sizes = [];
  const seen = new Set();
  for (let i = 0; i < tiles.length; i++) {
    if (seen.has(i)) continue;
    const g = collectGroup(state, i);
    for (const c of g) seen.add(c);
    sizes.push(g.length);
  }
  const blastable = sizes.filter((s) => s >= BLAST_MIN_GROUP);
  const uniformRow = [];
  for (let row = 0; row < rows; row++) {
    const slice = tiles.slice(row * cols, (row + 1) * cols);
    if (slice.every((c) => c === slice[0])) uniformRow.push(row);
  }
  const uniformCol = [];
  for (let col = 0; col < cols; col++) {
    const slice = [];
    for (let row = 0; row < rows; row++) slice.push(tiles[row * cols + col]);
    if (slice.every((c) => c === slice[0])) uniformCol.push(col);
  }
  let longestRun = 0;
  for (let col = 0; col < cols; col++) {
    let run = 1;
    for (let row = 1; row < rows; row++) {
      const a = tiles[(row - 1) * cols + col];
      const b = tiles[row * cols + col];
      run = a === b ? run + 1 : 1;
      longestRun = Math.max(longestRun, run);
    }
  }
  let rightBlastable = 0;
  let leftBlastable = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (!isBlastable(state, i)) continue;
    if (i % cols >= cols / 2) rightBlastable++;
    else leftBlastable++;
  }
  return {
    groups: sizes.length,
    blastableGroups: blastable.length,
    maxGroup: Math.max(...sizes),
    singles: sizes.filter((s) => s === 1).length,
    pairs: sizes.filter((s) => s === 2).length,
    big: sizes.filter((s) => s >= 4).length,
    tilesInBlastable: blastable.reduce((a, b) => a + b, 0),
    uniformRow,
    uniformCol,
    longestRun,
    leftBlastable,
    rightBlastable,
    colourCounts: (() => {
      const counts = new Array(COLOUR_COUNT + 1).fill(0);
      for (const c of tiles) counts[c]++;
      return counts.slice(1);
    })(),
  };
}

function playToOpenColumn(tiles, cols, rows, cell = 46, budget = 80) {
  const state = createBoard({ cols, rows, tiles });
  let clicks = 0;
  const removed = [];
  while (!hasOpenColumn(state) && clicks < budget) {
    let pick = -1;
    for (let col = cols - 1; col >= 0 && pick < 0; col--) {
      for (let row = rows - 1; row >= 0 && pick < 0; row--) {
        const i = row * cols + col;
        if (state.tiles[i] && isBlastable(state, i)) pick = i;
      }
    }
    if (pick < 0) return { clicks, opened: false, deadlock: true, removed };
    removed.push(blastAt(state, pick).cleared.length);
    settleBoard(state, cell);
    clicks++;
  }
  const openedAt = clicks;
  let extra = 0;
  while (extra < budget) {
    let pick = -1;
    for (let i = state.tiles.length - 1; i >= 0 && pick < 0; i--) {
      if (state.tiles[i] && isBlastable(state, i)) pick = i;
    }
    if (pick < 0) break;
    blastAt(state, pick);
    settleBoard(state, cell);
    extra++;
  }
  return {
    clicks: openedAt,
    opened: hasOpenColumn(state),
    deadlock: false,
    removed,
    extra,
    tilesLeft: state.tiles.filter(Boolean).length,
    openColumns: (() => {
      let n = 0;
      for (let col = 0; col < cols; col++) {
        let empty = true;
        for (let row = 0; row < rows; row++) if (state.tiles[row * cols + col]) empty = false;
        if (empty) n++;
      }
      return n;
    })(),
  };
}

function firstClickOpens(tiles, cols, rows, cell = 46) {
  for (let i = 0; i < tiles.length; i++) {
    const state = createBoard({ cols, rows, tiles });
    if (!isBlastable(state, i)) continue;
    blastAt(state, i);
    settleBoard(state, cell);
    if (hasOpenColumn(state)) return i;
  }
  return -1;
}

const PLANS = {
  1: { sizePlan: [6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 2, 1], rightBias: 1 },
  2: { sizePlan: [5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1], rightBias: 1 },
  3: { sizePlan: [4, 4, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1], rightBias: 1 },
};

const STAGES = [
  { id: 1, cols: 8, rows: 8, budget: [2, 4] },
  { id: 2, cols: 8, rows: 9, budget: [3, 7] },
  { id: 3, cols: 8, rows: 10, budget: [4, 10] },
];

const chosen = {};
for (const stage of STAGES) {
  const plan = PLANS[stage.id];
  let best = null;
  for (let seed = 1; seed <= 6000; seed++) {
    const tiles = generate({ cols: stage.cols, rows: stage.rows, seed, ...plan });
    const stats = analyse(tiles, stage.cols, stage.rows);
    if (stats.blastableGroups < 3) continue;
    if (stats.maxGroup > 6) continue;
    if (stats.longestRun > 4) continue;
    if (stats.uniformRow.length || stats.uniformCol.length) continue;
    if (stats.singles + stats.pairs < 2) continue;
    if (stats.tilesInBlastable > tiles.length * 0.8) continue;
    if (stats.leftBlastable < 6) continue;
    if (stats.rightBlastable < stats.leftBlastable * 0.6) continue;
    const even = tiles.length / COLOUR_COUNT;
    if (stats.colourCounts.some((c) => c < even * 0.62 || c > even * 1.45)) continue;
    if (firstClickOpens(tiles, stage.cols, stage.rows) >= 0) continue;
    const play = playToOpenColumn(tiles, stage.cols, stage.rows);
    if (!play.opened || play.deadlock) continue;
    if (play.clicks < stage.budget[0] || play.clicks > stage.budget[1]) continue;
    const score = stats.groups + stats.singles * 0.6 + stats.big * 0.4;
    if (!best || score > best.score) best = { seed, tiles, stats, play, score };
  }
  if (!best) {
    console.log(`stage ${stage.id}: NO CANDIDATE`);
    continue;
  }
  chosen[stage.id] = best;
  console.log(
    `stage ${stage.id}: seed ${best.seed} groups ${best.stats.groups} blastable ${best.stats.blastableGroups} ` +
      `max ${best.stats.maxGroup} singles ${best.stats.singles} pairs ${best.stats.pairs} big>=4 ${best.stats.big} ` +
      `run ${best.stats.longestRun} inBlastable ${best.stats.tilesInBlastable}/${best.tiles.length} ` +
      `L/R blastable ${best.stats.leftBlastable}/${best.stats.rightBlastable} ` +
      `colours ${best.stats.colourCounts.join('/')} ` +
      `-> column open in ${best.play.clicks} clicks (${best.play.removed.join('+')}), ` +
      `${best.play.extra} further clicks exhaust it to ${best.play.tilesLeft} tiles / ${best.play.openColumns} open columns`,
  );
  for (let row = 0; row < stage.rows; row++) {
    console.log('   ' + best.tiles.slice(row * stage.cols, (row + 1) * stage.cols).join(' '));
  }
}

console.log('\n--- levels.ts literals ---');
for (const stage of STAGES) {
  const best = chosen[stage.id];
  if (!best) continue;
  const rows = [];
  for (let row = 0; row < stage.rows; row++) {
    rows.push('  [' + best.tiles.slice(row * stage.cols, (row + 1) * stage.cols).join(', ') + '],');
  }
  console.log(`const STAGE_${stage.id}_DEPOSIT: TileCell[] = grid([\n${rows.join('\n')}\n]); // seed ${best.seed}`);
}
