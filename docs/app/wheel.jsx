/* global React, FestivityHelpers */
const { F: WF, fillForFestivity, holidayMonogram } = window.FestivityHelpers;

function WheelPanel({ date, year }) {
  const holidays = React.useMemo(
    () => WF.buildHolidays(year).slice(0, 16),
    [year]
  );
  const next = React.useMemo(
    () => WF.buildHolidays(year + 1)[0],
    [year]
  );
  const yrStart = holidays[0].date.getTime();
  const yrEnd = next.date.getTime();
  const span = yrEnd - yrStart;

  const SIZE = 460;
  const cx = SIZE / 2, cy = SIZE / 2;
  const rOuter = 200;
  const rInner = 150;
  const rText  = 222;

  function angleFor(d) {
    const tt = (d.getTime() - yrStart) / span;
    return -Math.PI / 2 + tt * 2 * Math.PI;
  }

  const todayA = angleFor(date);
  const todayX = cx + Math.cos(todayA) * rOuter;
  const todayY = cy + Math.sin(todayA) * rOuter;

  const todayF = WF.festivityForDate(date);

  // Horizontal padding inside the viewBox so rim labels don't clip on left/right.
  const padX = 110;

  return (
    <div className="wheel-wrap">
      <svg viewBox={`${-padX} 0 ${SIZE + 2 * padX} ${SIZE}`} width="100%" preserveAspectRatio="xMidYMid meet">
        {/* concentric rings */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#1a1714" strokeWidth="1.25" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="#1a1714" strokeWidth="0.75" strokeDasharray="2 4" />
        <circle cx={cx} cy={cy} r="100" fill="none" stroke="#1a1714" strokeWidth="0.5" strokeDasharray="1 3" />

        {/* spokes + dots */}
        {holidays.map((h, i) => {
          const a = angleFor(h.date);
          const x1 = cx + Math.cos(a) * rInner;
          const y1 = cy + Math.sin(a) * rInner;
          const x2 = cx + Math.cos(a) * rOuter;
          const y2 = cy + Math.sin(a) * rOuter;
          const major = h.festivity === 1;
          const isCross = h.festivity === 0.5;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#1a1714"
                    strokeWidth={major ? 1.5 : 0.75}
                    strokeDasharray={major ? "" : isCross ? "" : "2 3"} />
              <circle cx={x2} cy={y2}
                      r={major ? 6 : isCross ? 4.5 : 3}
                      fill={fillForFestivity(h.festivity)}
                      stroke="#1a1714" strokeWidth="1.25" />
            </g>
          );
        })}

        {/* names around the rim */}
        {holidays.map((h, i) => {
          const a = angleFor(h.date);
          const tx = cx + Math.cos(a) * rText;
          const ty = cy + Math.sin(a) * rText;
          const cosA = Math.cos(a);
          const anchor = cosA > 0.2 ? "start" : cosA < -0.2 ? "end" : "middle";
          const major = h.festivity === 1;
          return (
            <g key={"t" + i}>
              <text x={tx} y={ty} textAnchor={anchor}
                    className="wheel-label"
                    style={{ fontWeight: major ? 600 : 400, fontSize: major ? 10 : 9 }}>
                {holidayMonogram(h.name).toUpperCase()}
              </text>
              <text x={tx} y={ty + 11} textAnchor={anchor} className="wheel-date">
                {h.date.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* TODAY pointer — also positioned radially by festivity */}
        <line x1={cx} y1={cy} x2={todayX} y2={todayY} stroke="#b94121" strokeWidth="2" />
        <circle cx={todayX} cy={todayY} r="8" fill="#f4ede0" stroke="#b94121" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r="5" fill="#1a1714" />

        {/* center reading */}
        <text x={cx} y={cy - 8} textAnchor="middle"
              fontFamily="'IBM Plex Mono', monospace" fontSize="56" fontWeight="300"
              fill="#b94121" letterSpacing="-0.04em">{Math.round(todayF * 100)}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="wheel-label"
              fontSize="10" fill="#7a7166">PERCENT FESTIVE</text>
      </svg>
    </div>
  );
}

window.WheelPanel = WheelPanel;
