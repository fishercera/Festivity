/* global React, FestivityHelpers, CurvePanel, WheelPanel */
const { useState, useEffect, useCallback, useMemo } = React;
const { F: FF, isoToDate, dateToIso, holidayShort, fillForFestivity, BrandMark } = window.FestivityHelpers;

const TODAY = new Date(2026, 4, 10, 12, 0, 0);

function App() {
  const initialIso = (() => {
    const m = window.location.hash.match(/date=(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : dateToIso(TODAY);
  })();
  const [iso, setIso] = useState(initialIso);
  const date = useMemo(() => isoToDate(iso), [iso]);
  const isToday = dateToIso(date) === dateToIso(TODAY);

  const reading = useMemo(() => {
    const f = FF.festivityForDate(date);
    const yr = date.getFullYear();
    const holidays = FF.buildHolidays(yr);
    const upcoming = FF.findUpcomingHoliday(date, holidays);
    const previous = FF.findPreviousHoliday(date, holidays);
    const days = upcoming ? FF.daysBetween(date, upcoming.date) : null;
    return { date, festivity: f, tier: FF.tier(f), upcoming, previous, daysToNext: days, year: yr };
  }, [date]);

  // Persist date to hash (permalink)
  useEffect(() => {
    const newHash = `#date=${iso}`;
    if (window.location.hash !== newHash) {
      history.replaceState(null, "", newHash);
    }
  }, [iso]);

  const onToday   = useCallback(() => setIso(dateToIso(TODAY)), []);
  const onRandom  = useCallback(() => {
    const yr = TODAY.getFullYear();
    const start = new Date(yr, 0, 1).getTime();
    const end   = new Date(yr, 11, 31).getTime();
    const r = new Date(start + Math.random() * (end - start));
    setIso(dateToIso(r));
  }, []);
  const onShare = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#date=${iso}`;
    try {
      await navigator.clipboard.writeText(url);
      const btn = document.querySelector("[data-share-btn]");
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = "✓ COPIED";
        setTimeout(() => { btn.textContent = orig; }, 1400);
      }
    } catch (e) {}
  }, [iso]);

  const holidays16 = useMemo(() => FF.buildHolidays(reading.year).slice(0, 16), [reading.year]);

  return (
    <div className="page">
      <TopBar />
      <Hero reading={reading} isToday={isToday} />
      <Picker iso={iso} setIso={setIso} onToday={onToday} onRandom={onRandom} onShare={onShare} />

      <div className="curve-row">
        <CurvePanel date={date} year={reading.year} />
        <MathCard />
      </div>

      <div className="divider" />

      <div className="section-head">
        <div>
          <div className="lbl">Up Next</div>
          <div className="lead serif">The upcoming holiday</div>
        </div>
        <div className="num">02 / 04</div>
      </div>
      <UpcomingCard reading={reading} />

      <div className="divider" />

      <div className="section-head">
        <div>
          <div className="lbl">Reference</div>
          <div className="lead serif">The wheel of the year</div>
        </div>
        <div className="num">03 / 04</div>
      </div>
      <WheelSection date={date} reading={reading} holidays={holidays16} />

      <div className="divider" />

      <div className="section-head">
        <div>
          <div className="lbl">Origin</div>
          <div className="lead serif">Providence, Rhode Island · 2011</div>
        </div>
        <div className="num">04 / 04</div>
      </div>
      <OriginSection />

      <Footer />
    </div>
  );
}

function TopBar() {
  return (
    <div className="topbar">
      <div className="brand">
        <BrandMark />
        <span>The Festivity Index</span>
      </div>
      <div className="nav">
        <a href="#today">Today</a>
        <a href="#curve">Curve</a>
        <a href="#wheel">Wheel</a>
        <a href="#origin">Origin</a>
      </div>
    </div>
  );
}

function Hero({ reading, isToday }) {
  const pct = Math.round(reading.festivity * 100);
  return (
    <div className="hero" id="today">
      <div>
        <div className="lbl">Festivity Index · {isToday ? "Today" : FF.fmtDateLong(reading.date)}</div>
        {isToday && (
          <div className="lbl" style={{ marginTop: 6, color: "var(--ink-2)" }}>
            {FF.fmtDateLong(reading.date)}
          </div>
        )}
        <div className="hero-num" style={{ marginTop: 14 }}>
          <span>{pct}</span>
          <span className="pct">%</span>
        </div>
        <div className="hero-tier">{reading.tier.toLowerCase()}</div>
      </div>
      <div>
        <div className="lbl">Reading</div>
        <p className="body-lg" style={{ marginTop: 8 }}>
          You are sitting between <strong>{holidayShort(reading.previous.name)}</strong> and{" "}
          <strong>{holidayShort(reading.upcoming.name)}</strong> — about{" "}
          <span className="mono-num" style={{ color: "var(--ink)" }}>{reading.daysToNext}</span>{" "}
          days from the next holiday.
        </p>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <div className="lbl">Last holiday</div>
            <div className="v">
              {holidayShort(reading.previous.name)}<br />
              <span style={{ color: "var(--ink-3)" }}>{FF.fmtDate(reading.previous.date)}</span>
            </div>
          </div>
          <div className="hero-meta-item">
            <div className="lbl">Next holiday</div>
            <div className="v">
              {holidayShort(reading.upcoming.name)}<br />
              <span style={{ color: "var(--ink-3)" }}>{FF.fmtDate(reading.upcoming.date)}</span>
            </div>
          </div>
          <div className="hero-meta-item">
            <div className="lbl">Hemisphere</div>
            <div className="v">Northern</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Picker({ iso, setIso, onToday, onRandom, onShare }) {
  return (
    <div className="picker">
      <span className="lbl">Look up a date</span>
      <input
        type="date"
        value={iso}
        onChange={e => setIso(e.target.value)}
      />
      <button className="btn" onClick={onToday}>Today</button>
      <button className="btn" onClick={onRandom}>Random</button>
      <button className="btn btn-dark" data-share-btn onClick={onShare}>Share ↗</button>
    </div>
  );
}

function MathCard() {
  return (
    <div className="math-card" id="curve">
      <div className="lbl">The math</div>
      <div className="formula">
        f(x) = [<br />
        &nbsp;&nbsp;⅛(2−√2)<br />
        &nbsp;&nbsp;<span className="op">+</span> ¼(2+√2) cos 2x<br />
        &nbsp;&nbsp;<span className="op">+</span> ⅛(2−√2) cos 4x<br />
        ]<sup>2</sup>
      </div>
      <div style={{ height: 1, background: "#ffffff22", margin: "18px 0" }} />
      <div className="body-sm">
        <strong style={{ color: "var(--paper)" }}>x</strong> maps a quarter
        (solstice → equinox) linearly to <strong style={{ color: "var(--paper)" }}>0..π</strong>.
        Peaks at <strong style={{ color: "var(--paper)" }}>1.0</strong> at solstices &amp; equinoxes,
        sits at <strong style={{ color: "var(--paper)" }}>0.5</strong> at the cross-quarters,
        bottoms out at <strong style={{ color: "var(--paper)" }}>0.0</strong> at the eighths.
      </div>
      <div style={{ flex: 1 }} />
      <div className="lbl" style={{ marginTop: 18, fontSize: 10, color: "var(--ink-4)" }}>
        derived by a math-prof friend, 2011
      </div>
    </div>
  );
}

function UpcomingCard({ reading }) {
  const h = reading.upcoming;
  const pct = Math.round(h.festivity * 100);
  return (
    <div className="upcoming">
      <div className="countdown">
        <div className="num mono-num">{reading.daysToNext}</div>
        <div className="lbl">days to go</div>
      </div>
      <div>
        <div className="lbl">Upcoming holiday · {pct}% peak festivity</div>
        <div className="h2 serif" style={{ marginTop: 4 }}>{h.name}</div>
        <div className="lbl" style={{ marginTop: 4, color: "var(--ink-4)" }}>
          {FF.fmtDateLong(h.date)}
        </div>
        <p className="body-lg" style={{ marginTop: 16 }}>
          We celebrate by{" "}
          <span className="celebration">{FF.CELEBRATIONS[h.name]}</span>
        </p>
      </div>
      <div className="stamp">
        {pct === 100 ? "Peak\nFestivity" : pct === 50 ? "Cross\nQuarter" : "Festivity\nNadir"}
      </div>
    </div>
  );
}

function WheelSection({ date, reading, holidays }) {
  return (
    <div className="wheel-stack" id="wheel">
      <p className="body-lg wheel-intro">
        Sixteen holidays. Four <strong>solstices &amp; equinoxes</strong> at peak festivity,
        four <strong>cross-quarter</strong> days at half power exactly between them,
        and eight <strong>nadirs</strong> — the eighths of the year — where festivity
        drops to zero. Every holiday gets its own tradition.
      </p>
      <WheelPanel date={date} year={reading.year} />
      <div className="legend-grid">
        {holidays.map((h, i) => {
          const isCurrent =
            h.date.getTime() === reading.previous.date.getTime() ||
            h.date.getTime() === reading.upcoming.date.getTime();
          return (
            <div className={`legend-item ${isCurrent ? "is-current" : ""}`} key={i}>
              <span className="swatch" style={{ background: fillForFestivity(h.festivity) }} />
              <span className="date">{h.date.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase()}</span>
              <span className="name">{holidayShort(h.name)}</span>
              <span className="pct">{Math.round(h.festivity * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OriginSection() {
  return (
    <div className="origin" id="origin">
      <div>
        <p className="body-lg">
          My spouse and I invented this holiday scheme in 2011, the year they
          started grad school in Providence, Rhode Island. We're both atheists,
          but we love celebrations and we think traditions are important.
        </p>
        <p className="body-lg" style={{ marginTop: 14 }}>
          A friend who's a math professor derived a single function whose peaks
          land exactly on the solstices and equinoxes, whose half-power points
          land on the cross-quarter days, and whose troughs sit at the eighths.
          We've been "almost finished" with this website every December for
          fifteen years. This is it. Mostly.
        </p>
      </div>
      <div>
        <div className="lbl">By the numbers</div>
        <div className="stat-row">
          <div className="stat">
            <div className="v mono-num">16</div>
            <div className="k lbl">holidays / year</div>
          </div>
          <div className="stat">
            <div className="v mono-num">~23d</div>
            <div className="k lbl">avg between</div>
          </div>
          <div className="stat">
            <div className="v mono-num">15</div>
            <div className="k lbl">years late</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      <div className="lbl">Northern Hemisphere · solstice dates approximated to fixed calendar days</div>
      <div className="lbl">© 2011–2026 · made with festivity</div>
    </div>
  );
}

window.App = App;
