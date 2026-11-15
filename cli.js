#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { calculateConcrete } = require('./concrete');
const { calculateBricks } = require('./bricks');
const {
  saveHistory,
  listHistory,
  exportCSV,
  setHistoryFile,
} = require('./history');

const HISTORY_FILE = path.resolve(__dirname, '..', 'history.json');
setHistoryFile(HISTORY_FILE);

function parseArgs(argv) {
  const result = {};
  const tokens = Array.isArray(argv) ? argv : [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (typeof token !== 'string' || !token.startsWith('--')) continue;
    const key = token.slice(2);
    if (i + 1 < tokens.length && typeof tokens[i + 1] === 'string' && !tokens[i + 1].startsWith('--')) {
      result[key] = tokens[i + 1];
      i++;
    } else {
      result[key] = true;
    }
  }
  return result;
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function toPositiveNumber(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    fail(`Invalid value for --${name}. Must be a positive number.`);
  }
  return n;
}

function toNonNegativeNumber(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    fail(`Invalid value for --${name}. Must be a non-negative number.`);
  }
  return n;
}

/** Concrete command */
function cmdConcrete(args) {
  const { length, width, depth, grade } = parseArgs(args);

  if (length === undefined || width === undefined || depth === undefined || grade === undefined) {
    fail('Missing required argument for concrete. Usage: concrete --length <num> --width <num> --depth <num> --grade <M15|M20|M25>');
  }

  const l = toPositiveNumber(length, 'length');
  const w = toPositiveNumber(width, 'width');
  const d = toPositiveNumber(depth, 'depth');

  if (!['M15', 'M20', 'M25'].includes(grade)) {
    fail(`Unknown grade: ${grade}. Supported grades: M15, M20, M25`);
  }

  const result = calculateConcrete(l, w, d, grade);
  const entry = {
    timestamp: new Date().toISOString(),
    command: 'concrete',
    parameters: { length: l, width: w, depth: d, grade },
    result,
  };
  saveHistory(entry);

  console.log(`Wet volume: ${result.wetVolume.toFixed(2)} m3`);
  console.log(`Dry volume: ${result.dryVolume.toFixed(2)} m3`);
  console.log(`Cement volume: ${result.cementVolume.toFixed(2)} m3 = ${result.cementBags} bags`);
  console.log(`Sand: ${result.sandVolume.toFixed(2)} m3`);
  console.log(`Aggregate: ${result.aggregateVolume.toFixed(2)} m3`);
}

/** Bricks command */
function cmdBricks(args) {
  const { length, height, thickness, openings } = parseArgs(args);

  if (length === undefined || height === undefined || thickness === undefined) {
    fail('Missing required argument for bricks. Usage: bricks --length <num> --height <num> --thickness <num> [--openings <num>]');
  }

  const l = toPositiveNumber(length, 'length');
  const h = toPositiveNumber(height, 'height');
  const t = toPositiveNumber(thickness, 'thickness');
  const o = toNonNegativeNumber(openings === undefined ? '0' : openings, 'openings');

  const result = calculateBricks(l, h, t, o);
  const entry = {
    timestamp: new Date().toISOString(),
    command: 'bricks',
    parameters: { length: l, height: h, thickness: t, openings: o },
    result,
  };
  saveHistory(entry);

  console.log(`Net wall volume: ${result.netWallVolume.toFixed(2)} m3`);
  console.log(`Bricks needed: ${result.bricks}`);
}

/** History command */
function cmdHistory(args) {
  const { export: exportMode } = parseArgs(args);

  let history = listHistory();

  if (exportMode === 'csv') {
    const csv = exportCSV(history);
    fs.writeFileSync(path.resolve(__dirname, '..', 'history.csv'), csv + '\n');
    console.log(`Exported ${history.length} estimate(s) to history.csv`);
    return;
  }

  if (history.length === 0) {
    console.log('No estimates saved yet.');
    return;
  }

  const entryWord = history.length > 1 ? 'entries' : 'entry';
  console.log(`Estimate history (${history.length} ${entryWord}):`);
  history.forEach((entry, i) => {
    const params = Object.entries(entry.parameters || {})
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    const lines = formatResult(entry);
    console.log(`[${i + 1}] ${entry.timestamp} — ${entry.command} — ${params}`);
    console.log(`    ${lines}`);
  });
}

function formatResult(entry) {
  if (entry.command === 'concrete') {
    const r = entry.result;
    return `wet=${r.wetVolume.toFixed(2)} m3, dry=${r.dryVolume.toFixed(2)} m3, cement=${r.cementVolume.toFixed(2)} m3 (${r.cementBags} bags), sand=${r.sandVolume.toFixed(2)} m3, aggregate=${r.aggregateVolume.toFixed(2)} m3`;
  }
  if (entry.command === 'bricks') {
    const r = entry.result;
    return `net=${r.netWallVolume.toFixed(2)} m3, bricks=${r.bricks}`;
  }
  return JSON.stringify(entry.result);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'concrete':
      cmdConcrete(args.slice(1));
      break;
    case 'bricks':
      cmdBricks(args.slice(1));
      break;
    case 'history':
      cmdHistory(args.slice(1));
      break;
    default:
      fail(`Unknown command: ${command}. Use: concrete, bricks, or history.`);
  }
}

main();
