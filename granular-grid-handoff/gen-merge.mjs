/**
 * Offline search for the merge build's stage layouts.
 *
 * Same shape as the blast build's `gen-blast.mjs`: a seeded generator plus a
 * rejection filter made of the real playability constraints, run over a range of
 * seeds until a candidate passes everything, then **baked into `levels.ts` as
 * literal rows**. Nothing here ships and nothing is generated at runtime.
 *
 * Playability is judged against the real board module, not a copy of its rules.
 */
import {
  MAX_TIER,
  FREE,
  LOCKED,
  HIDDEN,
  canMerge,
  createBoard,
  hasAnyMove,
  hasOpenColumn,
  hasPartner,
  isInteractive,
  mergePair,
  settleBoard,
} from '/Users/gleb/My projects/p4g-platform-workspace/playables/granular-grid-prototype/src/board.ts';

const COLS = 8;

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

/** Irregular same-tier deposits over a fully tiled board. */
function growDeposits(rnd, cols, rows) {
  const total = cols * rows;
  const owner = new Array(total).fill(-1);
  const blobs = [];
  const free = [];
  for (let i = 0; i < total; i++) free.push(i);
  while (free.length > 0) {
    const seedAt = free[(rnd() * free.length) | 0];
    if (owner[seedAt] >= 0) {
      free.splice(free.indexOf(seedAt), 1);
      continue;
    }
    const target = 2 + ((rnd() * 5) | 0); // 2..6
    const cells = [seedAt];
    owner[seedAt] = blobs.length;
    const frontier = [seedAt];
    while (cells.length < target && frontier.length > 0) {
      const pick = (rnd() * frontier.length) | 0;
      const current = frontier[pick];
      const row = (current / cols) | 0;
      const col = current - row * cols;
      const around = [];
      if (col > 0) around.push(current - 1);
      if (col + 1 < cols) around.push(current + 1);
      if (row > 0) around.push(current - cols);
      if (row + 1 < rows) around.push(current + cols);
      const open = around.filter((c) => owner[c] < 0);
      if (open.length === 0) {
        frontier.splice(pick, 1);
        continue;
      }
      const next = open[(rnd() * open.length) | 0];
      owner[next] = blobs.length;
      cells.push(next);
      frontier.push(next);
    }
    blobs.push(cells);
    for (const cell of cells) {
      const at = free.indexOf(cell);
      if (at >= 0) free.splice(at, 1);
    }
  }
  return { owner, blobs };
}

/**
 * Depth reads as age: the tier band rises toward the floor, but with per-deposit
 * jitter so no horizontal band is legible. Neighbouring deposits are nudged apart
 * so two touching blobs rarely share a tier (that would read as one big patch).
 */
function colourDeposits(rnd, owner, blobs, cols, rows) {
  const tiles = new Array(cols * rows).fill(0);
  const tierOf = new Array(blobs.length).fill(0);
  for (let b = 0; b < blobs.length; b++) {
    const cells = blobs[b];
    let rowSum = 0;
    for (const cell of cells) rowSum += (cell / cols) | 0;
    const depth = rowSum / cells.length / Math.max(1, rows - 1);
    // Every already-coloured deposit this one touches. Sharing a tier with one of
    // them would fuse the two into a single visual patch, which is how the last
    // layout ended up reading as bands: the deposit is then no longer the unit the
    // player sees.
    const forbidden = new Set();
    for (const cell of cells) {
      const row = (cell / cols) | 0;
      const col = cell - row * cols;
      const around = [];
      if (col > 0) around.push(cell - 1);
      if (col + 1 < cols) around.push(cell + 1);
      if (row > 0) around.push(cell - cols);
      if (row + 1 < rows) around.push(cell + cols);
      for (const other of around) {
        if (owner[other] !== b && tierOf[owner[other]]) forbidden.add(tierOf[owner[other]]);
      }
    }
    const target = 1 + depth * (MAX_TIER - 1) + (rnd() - 0.5) * 1.6;
    const options = [];
    for (let tier = 1; tier <= MAX_TIER; tier++) {
      if (forbidden.has(tier)) continue;
      options.push(tier);
    }
    if (options.length === 0) return null;
    options.sort((a, b2) => Math.abs(a - target) - Math.abs(b2 - target));
    // Pick from the two nearest to the depth target: keeps the age gradient
    // legible without making it a formula the eye can read off.
    const tier = options[options.length > 1 && rnd() < 0.35 ? 1 : 0];
    tierOf[b] = tier;
    for (const cell of cells) tiles[cell] = tier;
  }
  return tiles;
}

/** Connected same-tier regions, 4-neighbour. */
function regionSizes(tiles, cols, rows) {
  const seen = new Array(tiles.length).fill(false);
  const sizes = [];
  for (let start = 0; start < tiles.length; start++) {
    if (seen[start]) continue;
    const tier = tiles[start];
    const queue = [start];
    seen[start] = true;
    let size = 0;
    while (queue.length > 0) {
      const current = queue.pop();
      size++;
      const row = (current / cols) | 0;
      const col = current - row * cols;
      const around = [];
      if (col > 0) around.push(current - 1);
      if (col + 1 < cols) around.push(current + 1);
      if (row > 0) around.push(current - cols);
      if (row + 1 < rows) around.push(current + cols);
      for (const other of around) {
        if (seen[other] || tiles[other] !== tier) continue;
        seen[other] = true;
        queue.push(other);
      }
    }
    sizes.push(size);
  }
  return sizes;
}

/** Anti-stripe guards, the merge twin of the blast build's. */
function looksRegular(tiles, cols, rows) {
  for (let row = 0; row < rows; row++) {
    const slice = tiles.slice(row * cols, (row + 1) * cols);
    if (slice.every((c) => c === slice[0])) return 'uniform row';
  }
  for (let col = 0; col < cols; col++) {
    let run = 1;
    let longest = 1;
    let uniform = true;
    for (let row = 1; row < rows; row++) {
      const above = tiles[(row - 1) * cols + col];
      const here = tiles[row * cols + col];
      if (here !== above) uniform = false;
      run = here === above ? run + 1 : 1;
      longest = Math.max(longest, run);
    }
    if (uniform) return `uniform column ${col}`;
    if (longest > 4) return `vertical run ${longest}`;
  }
  // The layout this replaces was a strict checkerboard of two adjacent tiers per
  // depth band, so the strongest guard is on the *row alphabet*: a row that holds
  // only two tiers reads as a band no matter how the two are arranged.
  for (let row = 0; row < rows; row++) {
    const slice = tiles.slice(row * cols, (row + 1) * cols);
    if (new Set(slice).size < 3) return `row ${row} uses only ${new Set(slice).size} tiers`;
    let run = 1;
    for (let col = 1; col < cols; col++) {
      run = slice[col] === slice[col - 1] ? run + 1 : 1;
      if (run > 3) return `horizontal run ${run} in row ${row}`;
    }
  }
  const sizes = regionSizes(tiles, cols, rows);
  const largest = Math.max(...sizes);
  if (largest > 6) return `deposit of ${largest} tiles`;
  if (sizes.length < (cols * rows) / 3.2) return `only ${sizes.length} deposits`;
  if (new Set(tiles).size < MAX_TIER) return `only ${new Set(tiles).size} tiers on the board`;

  // Depth still has to read as age, otherwise the gradient the mining fantasy
  // rests on is gone and the board is just noise.
  const band = Math.max(1, Math.floor(rows / 3));
  const mean = (fromRow, toRow) => {
    let sum = 0;
    let count = 0;
    for (let row = fromRow; row < toRow; row++) {
      for (let col = 0; col < cols; col++) {
        sum += tiles[row * cols + col];
        count++;
      }
    }
    return sum / count;
  };
  if (mean(rows - band, rows) - mean(0, band) < 1.6) return 'no depth gradient';
  return null;
}

/** Flag placement: 3..6 cells, weighted deeper as the stage index grows. */
function placeFlags(rnd, tiles, cols, rows, count, depthPower) {
  const flags = new Array(cols * rows).fill(FREE);
  const weights = [];
  let total = 0;
  for (let index = 0; index < tiles.length; index++) {
    const row = (index / cols) | 0;
    // Never the top row: a masked cell up there is scenery the player will have
    // dug past before it matters.
    const weight = row === 0 ? 0 : Math.pow((row + 1) / rows, depthPower);
    weights.push(weight);
    total += weight;
  }
  let placed = 0;
  for (let guard = 0; guard < 4000 && placed < count; guard++) {
    let roll = rnd() * total;
    let pick = -1;
    for (let index = 0; index < weights.length; index++) {
      roll -= weights[index];
      if (roll <= 0) {
        pick = index;
        break;
      }
    }
    if (pick < 0 || flags[pick] !== FREE) continue;
    // Keep flagged cells apart: a solid block of them is a wall the player can
    // only clear from the outside, and it reads as level geometry rather than as
    // a puzzle.
    const row = (pick / cols) | 0;
    const col = pick - row * cols;
    let crowded = false;
    for (let dr = -1; dr <= 1 && !crowded; dr++) {
      for (let dc = -1; dc <= 1 && !crowded; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (flags[nr * cols + nc] !== FREE) crowded = true;
      }
    }
    if (crowded) continue;
    // Deeper cells are likelier to be fully masked.
    const deep = (row + 1) / rows;
    flags[pick] = rnd() < 0.35 + deep * 0.3 ? HIDDEN : LOCKED;
    placed++;
  }
  if (placed !== count) return null;
  // Both kinds have to be on every board: they are two different affordances and
  // a stage that shows only one of them teaches half the mechanic.
  if (!flags.includes(LOCKED) || !flags.includes(HIDDEN)) return null;
  return flags;
}

function columnHeights(state) {
  const out = [];
  for (let col = 0; col < state.cols; col++) {
    let height = 0;
    for (let row = 0; row < state.rows; row++) if (state.tiles[row * state.cols + col]) height++;
    out.push(height);
  }
  return out;
}

/** Every legal unordered pair on the board. */
function availablePairs(state) {
  const pairs = [];
  for (let from = 0; from < state.tiles.length; from++) {
    for (let to = from + 1; to < state.tiles.length; to++) {
      if (canMerge(state, from, to)) pairs.push([from, to]);
    }
  }
  return pairs;
}

function flaggedCount(state) {
  return state.flags.reduce((n, f) => n + (f !== FREE ? 1 : 0), 0);
}

/**
 * The greedy bot. Digs the column it can empty fastest and, among equally good
 * drags, prefers the target that weakens the most locked neighbours — the same
 * bias `merge-locked-v2`'s tutor uses (`score = -1000 * lockedNeighbours + …`).
 */
function greedyPlay(level, limit = 400) {
  const state = createBoard(level);
  let drags = 0;
  let openedAt = -1;
  let flagsClearedAt = -1;
  while (drags < limit) {
    if (openedAt < 0 && hasOpenColumn(state)) openedAt = drags;
    if (flagsClearedAt < 0 && flaggedCount(state) === 0) flagsClearedAt = drags;
    if (openedAt >= 0 && flagsClearedAt >= 0) break;
    if (!hasAnyMove(state)) break;
    const heights = columnHeights(state);
    let choice = null;
    const order = [];
    for (let col = 0; col < state.cols; col++) if (heights[col] > 0) order.push(col);
    order.sort((a, b) => heights[a] - heights[b]);
    for (const col of order) {
      let from = -1;
      for (let row = state.rows - 1; row >= 0 && from < 0; row--) {
        const index = row * state.cols + col;
        if (isInteractive(state, index)) from = index;
      }
      if (from < 0) continue;
      let bestScore = -Infinity;
      let bestTo = -1;
      for (let to = 0; to < state.tiles.length; to++) {
        if (to % state.cols === col) continue;
        if (!canMerge(state, from, to)) continue;
        const score = lockNeighbours(state, to) * 100 - (to % state.cols);
        if (score > bestScore) {
          bestScore = score;
          bestTo = to;
        }
      }
      if (bestTo >= 0) {
        choice = [from, bestTo];
        break;
      }
    }
    if (!choice) {
      // No column-emptying drag; take any legal pair so locks keep opening.
      const pairs = availablePairs(state);
      if (pairs.length === 0) break;
      choice = pairs[0];
    }
    mergePair(state, choice[0], choice[1]);
    settleBoard(state, level.cell ?? 46);
    drags++;
  }
  if (openedAt < 0 && hasOpenColumn(state)) openedAt = drags;
  if (flagsClearedAt < 0 && flaggedCount(state) === 0) flagsClearedAt = drags;
  return { drags, openedAt, flagsClearedAt, deadlocked: !hasAnyMove(state) && !hasOpenColumn(state) };
}

function lockNeighbours(state, index) {
  const row = (index / state.cols) | 0;
  const col = index - row * state.cols;
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= state.rows || nc < 0 || nc >= state.cols) continue;
      if (state.flags[nr * state.cols + nc] !== FREE) count++;
    }
  }
  return count;
}

function evaluate(tiles, flags, cols, rows, budget) {
  const level = { cols, rows, tiles, flags, cell: 46 };
  const state = createBoard(level);

  const regular = looksRegular(tiles, cols, rows);
  if (regular) return `regular: ${regular}`;

  const counts = new Map();
  for (const tier of tiles) counts.set(tier, (counts.get(tier) ?? 0) + 1);
  for (const [tier, count] of counts) if (count < 2) return `tier ${tier} appears once`;
  for (let index = 0; index < tiles.length; index++) {
    if (!hasPartner(state, index)) return `cell ${index} has no partner`;
  }

  const settled = createBoard(level);
  settleBoard(settled, 46);
  if (settled.tiles.join() !== tiles.join()) return 'start layout is not settled';
  if (hasOpenColumn(state)) return 'starts with a free drain';

  const pairs = availablePairs(state);
  if (pairs.length < 3) return `only ${pairs.length} available merges at start`;
  const tiersWithPair = new Set(pairs.map(([from]) => state.tiles[from]));
  if (tiersWithPair.size < 2) return 'only one tier offers a merge at start';

  // The first move must never hand over the drain.
  for (const [from, to] of pairs) {
    const probe = createBoard(level);
    mergePair(probe, from, to);
    settleBoard(probe, 46);
    if (hasOpenColumn(probe)) return `first merge ${from}->${to} opens a column`;
  }

  // Locked cells must be reachable: a flagged cell with no free cell in its
  // 8-ring can only be opened from outside, and a whole ring of flagged cells
  // would be permanent.
  for (let index = 0; index < flags.length; index++) {
    if (flags[index] === FREE) continue;
    if (lockNeighbours(state, index) >= 8) return `cell ${index} is sealed by flags`;
  }

  const play = greedyPlay(level);
  if (play.deadlocked) return `greedy bot deadlocked after ${play.drags} drags`;
  if (play.openedAt < 0) return 'greedy bot never opened a drain column';
  if (play.openedAt > budget) return `greedy bot needed ${play.openedAt} drags (budget ${budget})`;
  if (play.flagsClearedAt < 0) return 'greedy bot never cleared every locked cell';
  return null;
}

function rowsOf(values, cols) {
  const out = [];
  for (let index = 0; index < values.length; index += cols) out.push(values.slice(index, index + cols));
  return out;
}

function format(values, cols) {
  return rowsOf(values, cols)
    .map((row) => `  [${row.join(', ')}],`)
    .join('\n');
}

const STAGES = [
  { id: 1, rows: 8, flagCount: 3, depthPower: 1.4, budget: 12 },
  { id: 2, rows: 9, flagCount: 5, depthPower: 2.4, budget: 14 },
  { id: 3, rows: 10, flagCount: 6, depthPower: 3.6, budget: 16 },
];

const reasons = new Map();
for (const stage of STAGES) {
  let found = null;
  for (let seed = 1; seed <= 40000 && !found; seed++) {
    const rnd = mulberry32(seed);
    const { owner, blobs } = growDeposits(rnd, COLS, stage.rows);
    const tiles = colourDeposits(rnd, owner, blobs, COLS, stage.rows);
    if (!tiles) {
      reasons.set('deposit colouring failed', (reasons.get('deposit colouring failed') ?? 0) + 1);
      continue;
    }
    const flags = placeFlags(rnd, tiles, COLS, stage.rows, stage.flagCount, stage.depthPower);
    if (!flags) {
      reasons.set('flag placement failed', (reasons.get('flag placement failed') ?? 0) + 1);
      continue;
    }
    const verdict = evaluate(tiles, flags, COLS, stage.rows, stage.budget);
    if (verdict) {
      const key = verdict.replace(/\d+/g, 'N');
      reasons.set(key, (reasons.get(key) ?? 0) + 1);
      continue;
    }
    found = { seed, tiles, flags };
  }
  if (!found) {
    console.log(`stage ${stage.id}: NO CANDIDATE`);
    continue;
  }
  const play = greedyPlay({ cols: COLS, rows: stage.rows, tiles: found.tiles, flags: found.flags, cell: 46 });
  const state = createBoard({ cols: COLS, rows: stage.rows, tiles: found.tiles, flags: found.flags });
  console.log(`// stage ${stage.id}: seed ${found.seed}, ${availablePairs(state).length} opening merges, ` +
    `drain in ${play.openedAt} drags, locks clear by ${play.flagsClearedAt}`);
  console.log(`const STAGE_${stage.id}_TIERS: TileCell[] = grid([\n${format(found.tiles, COLS)}\n]);`);
  console.log(`const STAGE_${stage.id}_FLAGS: number[] = grid([\n${format(found.flags, COLS)}\n]);`);
  console.log('');
}
console.log('// rejection histogram:');
for (const [reason, count] of [...reasons].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
  console.log(`//   ${count}\t${reason}`);
}
