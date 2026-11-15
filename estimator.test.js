'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { calculateConcrete, SUPPORTED_GRADES } = require('../src/concrete');
const { calculateBricks } = require('../src/bricks');
const { saveHistory, listHistory, exportCSV, setHistoryFile } = require('../src/history');

describe('concrete', () => {
  it('calculates M20 mix correctly (acceptance test 1 values)', () => {
    const result = calculateConcrete(5, 4, 0.15, 'M20');
    assert.equal(result.wetVolume, 3.0);
    assert.equal(result.dryVolume, 4.62);
    assert.equal(result.cementVolume, 0.84);
    assert.equal(result.cementBags, 25);
    assert.equal(result.sandVolume, 1.26);
    assert.equal(result.aggregateVolume, 2.52);
  });

  it('calculates M25 mix correctly', () => {
    const result = calculateConcrete(3, 2, 0.2, 'M25');
    assert.equal(result.wetVolume, 1.2);
    assert.equal(result.dryVolume, 1.85);
    assert.equal(result.cementVolume, 0.46);
    assert.equal(result.cementBags, 14);
    assert.equal(result.sandVolume, 0.46);
    assert.equal(result.aggregateVolume, 0.93);
  });

  it('throws for an unknown grade', () => {
    assert.throws(() => calculateConcrete(5, 4, 0.15, 'M99'), /Unknown grade/);
  });

  it('throws for a negative dimension', () => {
    assert.throws(() => calculateConcrete(-5, 4, 0.15, 'M20'), /positive number/);
  });

  it('throws for zero depth', () => {
    assert.throws(() => calculateConcrete(5, 4, 0, 'M20'), /positive number/);
  });

  it('rejects non-numeric length', () => {
    assert.throws(() => calculateConcrete('abc', 4, 0.15, 'M20'), /positive number/);
  });

  it('supports all three grades', () => {
    for (const grade of SUPPORTED_GRADES) {
      assert.doesNotThrow(() => calculateConcrete(2, 2, 0.1, grade));
    }
  });
});

describe('bricks', () => {
  it('calculates bricks for the acceptance test 2 values', () => {
    const result = calculateBricks(5, 3, 0.2, 2);
    assert.equal(result.netWallVolume, 2.6);
    assert.equal(result.bricks, 1300);
  });

  it('uses default openings of 0 when not provided', () => {
    const result = calculateBricks(4, 2.5, 0.15, 0);
    assert.equal(result.netWallVolume, 1.5);
    assert.equal(result.bricks, 750);
  });

  it('throws for a negative dimension', () => {
    assert.throws(() => calculateBricks(-5, 3, 0.2, 2), /positive number/);
  });

  it('throws for negative openings', () => {
    assert.throws(() => calculateBricks(5, 3, 0.2, -1), /non-negative number/);
  });
});

describe('history', () => {
  let tmpDir;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'estimator-test-'));
    setHistoryFile(path.join(tmpDir, 'history.json'));
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('saves and lists entries', () => {
    saveHistory({
      timestamp: '2026-11-14T10:00:00.000Z',
      command: 'concrete',
      parameters: { length: 5, width: 4, depth: 0.15, grade: 'M20' },
      result: { wetVolume: 3, dryVolume: 4.62, cementBags: 25 },
    });
    const list = listHistory();
    assert.equal(list.length, 1);
    assert.equal(list[0].command, 'concrete');
    assert.ok(list[0].timestamp);
  });

  it('returns an empty list when no history exists', () => {
    setHistoryFile(path.join(tmpDir, 'empty.json'));
    assert.deepEqual(listHistory(), []);
  });

  it('exports CSV with a header row', () => {
    const csv = exportCSV([
      {
        timestamp: '2026-11-14T10:00:00.000Z',
        command: 'concrete',
        parameters: { length: 5, width: 4, depth: 0.15, grade: 'M20' },
        result: { wetVolume: 3, dryVolume: 4.62, cementBags: 25 },
      },
    ]);
    const lines = csv.split('\n');
    assert.equal(lines.length, 2);
    assert.equal(lines[0], 'timestamp,command,parameters,result');
    assert.ok(lines[1].startsWith('2026-11-14T10:00:00.000Z,concrete'));
  });

  it('writes history.json to the correct default location', () => {
    const defaultFile = path.resolve(__dirname, '..', 'history.json');
    // Clean up any entries left by previous test runs
    if (fs.existsSync(defaultFile)) fs.rmSync(defaultFile);

    setHistoryFile(defaultFile);

    saveHistory({
      timestamp: '2026-11-14T10:00:00.000Z',
      command: 'bricks',
      parameters: { length: 5, height: 3, thickness: 0.2, openings: 2 },
      result: { netWallVolume: 2.6, bricks: 1300 },
    });

    assert.equal(fs.existsSync(defaultFile), true);
    assert.equal(listHistory().length, 1);
    assert.equal(listHistory()[0].command, 'bricks');

    // Clean up after ourselves so acceptance tests start from a clean slate
    fs.rmSync(defaultFile);
  });
});
