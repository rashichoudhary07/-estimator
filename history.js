'use strict';

const fs = require('fs');
const path = require('path');

// Default location: estimator/history.json (one level above src/)
let HISTORY_FILE = path.resolve(__dirname, '..', 'history.json');

function setHistoryFile(filePath) {
  HISTORY_FILE = path.resolve(filePath);
}

function readHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function writeHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2) + '\n');
}

/** Append a successful calculation to history.json */
function saveHistory(entry) {
  const history = readHistory();
  history.push(entry);
  writeHistory(history);
}

/** List all saved estimates */
function listHistory() {
  return readHistory();
}

/**
 * Export history to a CSV string.
 * @param {Array} history
 * @returns {string}
 */
function exportCSV(history) {
  const header = ['timestamp', 'command', 'parameters', 'result'];
  const rows = history.map((entry) => {
    const params = Object.entries(entry.parameters || {})
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    const result = JSON.stringify(entry.result || {});
    return [entry.timestamp, entry.command, params, result];
  });
  return [
    header.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        const s = String(cell);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',')
    ),
  ].join('\n');
}

module.exports = { readHistory, writeHistory, saveHistory, listHistory, exportCSV, setHistoryFile };
