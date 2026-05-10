// Festivity engine — ported from the Python notebook in the Festivity repo.
// The cosine formula (corrected per the LaTeX in the notebook):
//   f(x) = [ 1/8(2-√2) + 1/4(2+√2)cos(2x) + 1/8(2-√2)cos(4x) ]^2
// where x maps a quarter (solstice→equinox) linearly to 0..π.

(function (global) {
  const SQRT2 = Math.sqrt(2);
  const A = (2 - SQRT2) / 8;
  const B = (2 + SQRT2) / 4;
  const C = (2 - SQRT2) / 8;

  // Approximate fixed dates — Northern Hemisphere.
  const SOLSTICE_DATES = {
    winter:    [11, 21], // Dec 21
    spring:    [2, 20],  // Mar 20
    summer:    [5, 21],  // Jun 21
    fall:      [8, 22],  // Sep 22
  };

  function d(y, m, day) { return new Date(y, m, day, 12, 0, 0); }
  function midpoint(a, b) { return new Date((a.getTime() + b.getTime()) / 2); }

  // 16 ordered holiday names (matches holidays.csv order, but rearranged into
  // calendar-year order starting at first holiday after prev winter solstice).
  // The CSV indices/names from the notebook:
  const HOLIDAY_NAMES = [
    "Winter Solstice",         // 0  (Dec 21 of year-1)
    "First Winter Nadir",      // 1
    "Winter Cross Quarter",    // 2
    "Second Winter Nadir",     // 3
    "Vernal Equinox",          // 4  (Mar 20)
    "First Spring Nadir",      // 5
    "Spring Cross Quarter",    // 6
    "Second Spring Nadir",     // 7
    "Summer Solstice",         // 8  (Jun 21)
    "First Summer Nadir",      // 9
    "Summer Cross Quarter",    // 10
    "Second Summer Nadir",     // 11
    "Autumnal Equinox",        // 12 (Sep 22)
    "First Autumn Nadir",      // 13
    "Autumn Cross Quarter",    // 14
    "Second Autumn Nadir",     // 15
    "Winter Solstice",         // 16 (Dec 21 of year)  — wraps
  ];

  // Festivity values at each of the 16 holiday slots:
  // major = 1.0, cross-quarter = 0.5, nadir = 0.0
  const HOLIDAY_FESTIVITY = [
    1.0, 0.0, 0.5, 0.0,
    1.0, 0.0, 0.5, 0.0,
    1.0, 0.0, 0.5, 0.0,
    1.0, 0.0, 0.5, 0.0, 1.0,
  ];

  // Build the full 17-element ordered date list spanning prev winter solstice
  // (year-1, Dec 21) through this year's winter solstice (year, Dec 21).
  function getHolidayDates(year) {
    const prevWinSol = d(year - 1, ...SOLSTICE_DATES.winter);
    const springEq   = d(year,     ...SOLSTICE_DATES.spring);
    const sumSol     = d(year,     ...SOLSTICE_DATES.summer);
    const fallEq     = d(year,     ...SOLSTICE_DATES.fall);
    const winSol     = d(year,     ...SOLSTICE_DATES.winter);

    // major holidays in calendar order
    const majors = [prevWinSol, springEq, sumSol, fallEq, winSol];
    // cross-quarter = midpoint between adjacent majors
    const crosses = [];
    for (let i = 0; i < majors.length - 1; i++) {
      crosses.push(midpoint(majors[i], majors[i + 1]));
    }
    // interleave majors and crosses → 9 anchor points
    const anchors = [];
    for (let i = 0; i < majors.length; i++) {
      anchors.push(majors[i]);
      if (i < crosses.length) anchors.push(crosses[i]);
    }
    // nadirs = midpoint between each pair of adjacent anchors → 8 nadirs
    const dates = [];
    for (let i = 0; i < anchors.length - 1; i++) {
      dates.push(anchors[i]);
      dates.push(midpoint(anchors[i], anchors[i + 1]));
    }
    dates.push(anchors[anchors.length - 1]);
    return dates; // length 17
  }

  // Map a date to x ∈ [0, π] within its current quarter.
  function dateAsX(date) {
    const year = date.getFullYear();
    const prevWinSol = d(year - 1, ...SOLSTICE_DATES.winter);
    const springEq   = d(year,     ...SOLSTICE_DATES.spring);
    const sumSol     = d(year,     ...SOLSTICE_DATES.summer);
    const fallEq     = d(year,     ...SOLSTICE_DATES.fall);
    const winSol     = d(year,     ...SOLSTICE_DATES.winter);
    let start, end;
    if (date < springEq) { start = prevWinSol; end = springEq; }
    else if (date < sumSol) { start = springEq; end = sumSol; }
    else if (date < fallEq) { start = sumSol; end = fallEq; }
    else if (date < winSol) { start = fallEq; end = winSol; }
    else {
      // Dec 21 → Dec 31: bridge into next-year's first quarter
      const nextSpringEq = d(year + 1, ...SOLSTICE_DATES.spring);
      start = winSol; end = nextSpringEq;
    }
    const total = end - start;
    const elapsed = date - start;
    return (elapsed / total) * Math.PI;
  }

  function festivityRaw(x) {
    const inner = A + B * Math.cos(2 * x) + C * Math.cos(4 * x);
    return inner * inner;
  }

  function festivityForDate(date) {
    return festivityRaw(dateAsX(date));
  }

  // Build a flat list of {date, name, festivity} for the given calendar year.
  // Returns 16 entries (Jan 1 through Dec 31 of `year`), all dates clamped to
  // the calendar year. Includes the prev-winter-solstice trail and next-year's
  // when needed for "upcoming holiday" lookups.
  function buildHolidays(year) {
    const dates = getHolidayDates(year);     // 17 entries, prev-WS … this-WS
    const next  = getHolidayDates(year + 1); // 17 entries, this-WS … next-WS
    const all = [];
    for (let i = 0; i < dates.length; i++) {
      all.push({ date: dates[i], name: HOLIDAY_NAMES[i], festivity: HOLIDAY_FESTIVITY[i] });
    }
    // Append next year's holidays starting at index 1 (skip duplicate winter solstice)
    for (let i = 1; i < next.length; i++) {
      all.push({ date: next[i], name: HOLIDAY_NAMES[i], festivity: HOLIDAY_FESTIVITY[i] });
    }
    return all;
  }

  function findUpcomingHoliday(date, holidays) {
    for (const h of holidays) {
      if (h.date >= date) return h;
    }
    return null;
  }

  function findPreviousHoliday(date, holidays) {
    let prev = null;
    for (const h of holidays) {
      if (h.date <= date) prev = h;
      else break;
    }
    return prev;
  }

  // Celebrations from holidays.csv, keyed by holiday name.
  // (The CSV lists "AutumnCrossQuarter" — we expose both forms.)
  const CELEBRATIONS = {
    "First Winter Nadir":   "getting rid of our Christmas tree, preparing our taxes, and cleaning out our filing cabinets.",
    "Winter Cross Quarter": "getting tight on rum and watching The Rocky Horror Picture Show.",
    "Second Winter Nadir":  "making dental appointments.",
    "Vernal Equinox":       "eating eggs benedict and jousting peeps in the microwave.",
    "First Spring Nadir":   "giving away clothes that don't fit or that we don't wear.",
    "Spring Cross Quarter": "singing Solidarity Forever and going out for a nice dinner.",
    "Second Spring Nadir":  "getting rid of things we wouldn't want to move with.",
    "Summer Solstice":      "putting up paper lanterns and watching a production of A Midsummer Night's Dream.",
    "First Summer Nadir":   "evaluating family finances.",
    "Summer Cross Quarter": "making fancy cheese boards with bread and wine pairings.",
    "Second Summer Nadir":  "making dental appointments.",
    "Autumnal Equinox":     "eating raw oysters, black and white cookies, or drinking egg cremes.",
    "First Autumn Nadir":   "updating resumes and CVs.",
    "Autumn Cross Quarter": "eating quince cobbler.",
    "Second Autumn Nadir":  "setting up our Christmas tree.",
    "Winter Solstice":      "setting something on fire then eating or drinking it.",
  };

  function tier(f) {
    if (f >= 0.85) return "Peak Festivity";
    if (f >= 0.65) return "Highly Festive";
    if (f >= 0.40) return "Moderately Festive";
    if (f >= 0.20) return "Low Festivity";
    return "Festivity Nadir";
  }

  function fmtDate(d, opts) {
    return d.toLocaleDateString(undefined, opts || { month: "long", day: "numeric" });
  }
  function fmtDateLong(d) {
    return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
  function daysBetween(a, b) {
    const ms = b - a;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  // Build the smooth festivity curve as polyline points across a year.
  function buildCurve(year, samples) {
    samples = samples || 365;
    const start = d(year - 1, ...SOLSTICE_DATES.winter);
    const end   = d(year,     ...SOLSTICE_DATES.winter);
    const pts = [];
    for (let i = 0; i <= samples; i++) {
      const t = start.getTime() + (end.getTime() - start.getTime()) * (i / samples);
      const date = new Date(t);
      pts.push({ date, festivity: festivityForDate(date) });
    }
    return pts;
  }

  global.Festivity = {
    festivityForDate,
    festivityRaw,
    dateAsX,
    buildHolidays,
    findUpcomingHoliday,
    findPreviousHoliday,
    buildCurve,
    CELEBRATIONS,
    HOLIDAY_NAMES,
    tier,
    fmtDate,
    fmtDateLong,
    daysBetween,
  };
})(window);
