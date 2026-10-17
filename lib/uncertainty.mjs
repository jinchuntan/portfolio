/** Deliberately synthetic temperature signal. Not a fitted model or dissertation result. */
export function makeSignal(drift = false) {
  return Array.from({length: 80}, (_, i) => {
    const forecast = 25 + .55 * Math.sin(i / 9);
    const residual = .28 * Math.sin(i * 1.7) + .19 * Math.cos(i * .65);
    const spike = [17, 38, 56, 68].includes(i) ? 1.25 : 0;
    const shift = drift && i >= 45 ? (i - 45) / 28 : 0;
    return { i, forecast, observed: forecast + residual + spike + shift };
  });
}
export function evaluateSignal(width, drift = false) {
  const halfWidth = Math.min(1.6, Math.max(.2, Number.isFinite(Number(width)) ? Number(width) : .7));
  const points = makeSignal(drift).map(p => ({...p, lower:p.forecast-halfWidth, upper:p.forecast+halfWidth, outside: Math.abs(p.observed-p.forecast)>halfWidth}));
  return {halfWidth, points, outside:points.filter(p=>p.outside).length};
}
export function signalSVG(width = .7, drift = false) {
  const {points, outside, halfWidth} = evaluateSignal(width, drift);
  const x = i => (48+i*6.35).toFixed(2);
  const y = v => (198-(v-22)*28).toFixed(2);
  const line = key => points.map(p=>`${x(p.i)},${y(p[key])}`).join(' ');
  const band = [...points.map(p=>`${x(p.i)},${y(p.upper)}`), ...[...points].reverse().map(p=>`${x(p.i)},${y(p.lower)}`)].join(' ');
  return `<svg viewBox="0 0 580 235" role="img" aria-labelledby="signal-title signal-desc"><title id="signal-title">Synthetic temperature forecast and interval</title><desc id="signal-desc">Illustrative 80-point signal. Interval half-width ${halfWidth.toFixed(1)} degrees Celsius; ${outside} observations outside the interval. ${drift?'An increasing sensor drift is included.':'Four isolated spikes are included.'} This is not measured research data.</desc><g stroke="currentColor" opacity=".12"><path d="M48 30H550M48 86H550M48 142H550M48 198H550"/></g><g fill="currentColor" font-family="monospace" font-size="9"><text x="10" y="33">28°C</text><text x="10" y="89">26°C</text><text x="10" y="145">24°C</text><text x="10" y="201">22°C</text><text x="48" y="224">0</text><text x="510" y="224">80 steps</text></g><polygon points="${band}" fill="#9abf71" opacity=".27"/><polyline points="${line('forecast')}" fill="none" stroke="#587b40" stroke-width="1.5" stroke-dasharray="4 4"/><polyline points="${line('observed')}" fill="none" stroke="#26352b" stroke-width="1.7"/>${points.filter(p=>p.outside).map(p=>`<circle cx="${x(p.i)}" cy="${y(p.observed)}" r="3.5" fill="#ae603f" stroke="var(--paper)" stroke-width="1.2"/>`).join('')}</svg>`;
}
