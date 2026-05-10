/* global React, Festivity */
const { useState, useMemo, useEffect, useCallback } = React;
const F = window.Festivity;

// ── Helpers ─────────────────────────────────────────────────────────────────

function isoToDate(iso) {
  // Parse YYYY-MM-DD as local noon (avoid TZ drift).
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
function dateToIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function holidayShort(name) {
  return name
    .replace("First Winter Nadir",   "1st Winter Nadir")
    .replace("Second Winter Nadir",  "2nd Winter Nadir")
    .replace("First Spring Nadir",   "1st Spring Nadir")
    .replace("Second Spring Nadir",  "2nd Spring Nadir")
    .replace("First Summer Nadir",   "1st Summer Nadir")
    .replace("Second Summer Nadir",  "2nd Summer Nadir")
    .replace("First Autumn Nadir",   "1st Autumn Nadir")
    .replace("Second Autumn Nadir",  "2nd Autumn Nadir");
}
function holidayMonogram(name) {
  // Short cap label for curve labels, e.g. "WINTER SOL"
  return name
    .replace("Vernal Equinox",       "Vernal Eq.")
    .replace("Autumnal Equinox",     "Autumnal Eq.")
    .replace("Winter Solstice",      "Winter Sol.")
    .replace("Summer Solstice",      "Summer Sol.")
    .replace("Cross Quarter",        "X-Qtr");
}
function colorForFestivity(f) {
  if (f === 1)   return "var(--solstice)";
  if (f === 0.5) return "var(--crossq)";
  return "var(--paper)";
}
function fillForFestivity(f) {
  if (f === 1)   return "#b94121";
  if (f === 0.5) return "#c08828";
  return "#f4ede0";
}

// ── Brand mark ──────────────────────────────────────────────────────────────
function BrandMark() {
  return (
    <svg viewBox="0 0 26 26" className="brand-mark">
      <circle cx="13" cy="13" r="11" fill="none" stroke="#1a1714" strokeWidth="1.25" />
      <line x1="13" y1="2" x2="13" y2="6" stroke="#1a1714" strokeWidth="1.5" />
      <line x1="13" y1="20" x2="13" y2="24" stroke="#1a1714" strokeWidth="1.5" />
      <line x1="2" y1="13" x2="6" y2="13" stroke="#1a1714" strokeWidth="1.5" />
      <line x1="20" y1="13" x2="24" y2="13" stroke="#1a1714" strokeWidth="1.5" />
      <circle cx="13" cy="13" r="3.5" fill="#b94121" />
    </svg>
  );
}

window.FestivityHelpers = {
  isoToDate, dateToIso, holidayShort, holidayMonogram,
  colorForFestivity, fillForFestivity, BrandMark, F,
};
