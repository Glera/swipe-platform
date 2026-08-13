// build.mjs — bakes the geometry from geo-data.mjs into the standalone
// prototype.html. Taste iterations live here; zero runtime dependencies.
//
// Run:  node build.mjs

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { HERE, mapData, buildReport } from './geo-data.mjs';

const template = readFileSync(join(HERE, 'template.html'), 'utf8');
const token = '/*__MAP_DATA__*/null';
if (!template.includes(token)) throw new Error('template.html is missing the ' + token + ' placeholder');
const html = template.replace(token, JSON.stringify(mapData));
const out = join(HERE, 'prototype.html');
writeFileSync(out, html);

console.log(buildReport.join('\n'));
console.log(`prototype.html  ${(statSync(out).size / 1024 / 1024).toFixed(2)} MB`);
