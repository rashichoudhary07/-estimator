'use strict';

// Mix ratios: grade -> [cement, sand, aggregate] parts
const MIX_RATIOS = {
  M15: { parts: [1, 2, 4] },
  M20: { parts: [1, 1.5, 3] },
  M25: { parts: [1, 1, 2] },
};

// Volume of one 50 kg cement bag in cubic metres
const CEMENT_BAG_VOLUME = 0.0347;

const SUPPORTED_GRADES = Object.keys(MIX_RATIOS);

function round2(value) {
  return Math.round(value * 100) / 100;
}

function validateGrade(grade) {
  if (!MIX_RATIOS[grade]) {
    throw new Error(`Unknown grade: ${grade}. Supported grades: ${SUPPORTED_GRADES.join(', ')}.`);
  }
}

/**
 * Calculate concrete quantities for a rectangular slab.
 *
 * @param {number} length   - slab length in metres
 * @param {number} width    - slab width in metres
 * @param {number} depth    - slab depth in metres
 * @param {string} grade    - concrete grade (M15, M20 or M25)
 * @returns {{
 *   wetVolume: number,
 *   dryVolume: number,
 *   cementVolume: number,
 *   cementBags: number,
 *   sandVolume: number,
 *   aggregateVolume: number,
 * }}
 */
function calculateConcrete(length, width, depth, grade) {
  if (!Number.isFinite(length) || length <= 0) {
    throw new Error('length must be a positive number.');
  }
  if (!Number.isFinite(width) || width <= 0) {
    throw new Error('width must be a positive number.');
  }
  if (!Number.isFinite(depth) || depth <= 0) {
    throw new Error('depth must be a positive number.');
  }
  validateGrade(grade);

  const wetVolume = round2(length * width * depth);
  const dryVolume = round2(wetVolume * 1.54);
  const { parts } = MIX_RATIOS[grade];
  const sum = parts.reduce((a, b) => a + b, 0);

  const cementVolume = round2(dryVolume * parts[0] / sum);
  const cementBags = Math.ceil(cementVolume / CEMENT_BAG_VOLUME);
  const sandVolume = round2(dryVolume * parts[1] / sum);
  const aggregateVolume = round2(dryVolume * parts[2] / sum);

  return {
    wetVolume,
    dryVolume,
    cementVolume,
    cementBags,
    sandVolume,
    aggregateVolume,
  };
}

module.exports = { calculateConcrete, MIX_RATIOS, CEMENT_BAG_VOLUME, round2, SUPPORTED_GRADES };
