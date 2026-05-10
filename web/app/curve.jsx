/* global React, FestivityHelpers */
const { F, holidayMonogram, fillForFestivity } = window.FestivityHelpers;

function CurvePanel({ date, year }) {
  const curve = React.useMemo(() => F.buildCurve(year, 240), [year]);
  const holidays = React.useMemo(
    () => F.buildHolidays(year).slice(0, 16),
    [year]
  );
  const yrStart = curve[0].date.getTime();
  const yrEnd = curve[curve.length - 1].date.getTime();
  const span = yrEnd - yrStart;

  const W = 880, H = 360;
  const pL = 44, pR = 28, pT = 38, pB = 50, padX = 14;
  const cxL = pL, cxR = W - pR;
  const cyT = pT, cyB = H - pB;
  const innerW = cxR - cxL - 2 * padX;
  const innerH = cyB - cyT;

  function xFor(d) {
    const tt = (d.getTime() - yrStart) / span;
    return cxL + padX + tt * innerW;
  }
  function yFor(f) { return cyB - f * innerH; }

  // Build path
  let lineD = "";
  curve.forEach((pt, i) => {
    lineD += (i === 0 ? "M" : "L") + xFor(pt.date).toFixed(1) + "," + yFor(pt.festivity).toFixed(1) + " ";
  });
  const fillD = lineD + ` L${cxR - padX},${cyB} L${cxL + padX},${cyB} Z`;

  const todayF = F.festivityForDate(date);
  const tx = xFor(date);
  const ty = yFor(todayF);

  // Month axis ticks
  const months = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1, 12, 0, 0);
    if (d.getTime() < yrStart) continue;
    if (d.getTime() > yrEnd) break;
    months.push(d);
  }

  return (
    <div className="curve-card">
      <div className="section-head" style={{ marginBottom: 8 }}>
        <div>
          <div className="lbl">Festivity Curve</div>
          <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>{year}</div>
        </div>
        <div className="lbl">y = festivity · x = day</div>
      </div>
      <div className="curve-svg-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          {/* grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
            <g key={i}>
              <line x1={cxL} x2={cxR} y1={yFor(g)} y2={yFor(g)} className="grid-line" />
              <text x={cxL - 8} y={yFor(g) + 4} textAnchor="end" className="axis-text">{Math.round(g * 100)}</text>
            </g>
          ))}
          {/* y-axis */}
          <line x1={cxL} y1={cyT} x2={cxL} y2={cyB} className="axis-line" />
          <line x1={cxL} y1={cyB} x2={cxR} y2={cyB} className="axis-line" />
          {/* month ticks */}
          {months.map((m, i) => (
            <g key={"m" + i}>
              <line x1={xFor(m)} y1={cyB} x2={xFor(m)} y2={cyB + 4} className="axis-line" />
              <text x={xFor(m)} y={cyB + 16} textAnchor="middle" className="axis-text">
                {m.toLocaleDateString(undefined, { month: "short" }).toUpperCase()}
              </text>
            </g>
          ))}

          {/* fill + line */}
          <path d={fillD} className="curve-fill" />
          <path d={lineD} className="curve-line" />

          {/* holiday markers */}
          {holidays.map((h, i) => {
            const x = xFor(h.date);
            const y = yFor(h.festivity);
            const major = h.festivity === 1;
            const isCross = h.festivity === 0.5;
            return (
              <g key={i}>
                <circle cx={x} cy={y}
                        r={major ? 5.5 : isCross ? 4 : 3}
                        className="holiday-dot"
                        fill={fillForFestivity(h.festivity)}
                        stroke="#1a1714" />
                {major && (
                  <text x={x} y={y - 12} textAnchor="middle" className="holiday-label">
                    {holidayMonogram(h.name).toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {/* today */}
          <line x1={tx} y1={ty} x2={tx} y2={cyB} className="today-line" />
          <circle cx={tx} cy={ty} r="7" className="today-marker" />
          <text x={tx + 12} y={ty + 4}
                fontFamily="'Cormorant Garamond', serif"
                fontStyle="italic"
                fontSize="22"
                fill="#b94121">today</text>
        </svg>
      </div>
    </div>
  );
}

window.CurvePanel = CurvePanel;
