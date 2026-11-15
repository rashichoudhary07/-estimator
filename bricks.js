'use strict';

// Brick with mortar dimensions in metres; 500 bricks per cubic metre
const BRICKS_PER_CUBIC_METER = 500;

/**
 * Calculate the number of bricks needed for a wall.
 *
 * @param {number} length     - wall length in metres
 * @param {number} height     - wall height in metres
 * @param {number} thickness  - wall thickness in metres
 * @param {number} openings   - total door/window area in m2 (default 0)
 * @returns {{ netWallVolume: number, bricks: number }}
 */
function calculateBricks(length, height, thickness, openings) {
  if (!Number.isFinite(length) || length <= 0) {
    throw new Error('length must be a positive number.');
  }
  if (!Number.isFinite(height) || height <= 0) {
    throw new Error('height must be a positive number.');
  }
  if (!Number.isFinite(thickness) || thickness <= 0) {
    throw new Error('thickness must be a positive number.');
  }
  if (!Number.isFinite(openings) || openings < 0) {
    throw new Error('openings must be a non-negative number.');
  }

  const netWallVolume = (length * height - openings) * thickness;
  const bricks = Math.ceil(netWallVolume * BRICKS_PER_CUBIC_METER);

  return {
    netWallVolume: round2(netWallVolume),
    bricks,
  };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

module.exports = { calculateBricks, BRICKS_PER_CUBIC_METER, round2 };
