/** Inextensible cylindrical leaf: hinge remains fixed throughout the turn. */
export function curlPoint(u: number, progress: number, width: number, direction: 'next' | 'prev') {
  const t = Math.max(0, Math.min(1, progress));
  const beta = .6 * Math.sin(Math.PI * t), angle = Math.PI * t + beta;
  const x = Math.abs(beta) < 1e-6
    ? width * u * Math.cos(Math.PI * t)
    : width * (Math.sin(angle) - Math.sin(angle - 2 * beta * u)) / (2 * beta);
  const z = Math.abs(beta) < 1e-6
    ? width * u * Math.sin(Math.PI * t)
    : width * (Math.cos(angle - 2 * beta * u) - Math.cos(angle)) / (2 * beta);
  return { x: direction === 'next' ? x : -x, z };
}
