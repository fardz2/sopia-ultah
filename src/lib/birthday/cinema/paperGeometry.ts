import { BufferAttribute, PlaneGeometry } from 'three';
import type { Resources } from './resources';

/** Keep the centre of a print flat; only its exposed paper edges catch the bend. */
export function createPaper(resources: Resources, width: number, height: number, shaded = false) {
  const geometry = resources.geometry(new PlaneGeometry(width, height, 18, 26));
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  const rest = new Float32Array(position.array);
  const shades = shaded ? new Float32Array(position.count * 3).fill(1) : undefined;
  if (shades) geometry.setAttribute('color', new BufferAttribute(shades, 3));
  // Keep a conservative bound while the camera passes the bent corners.
  geometry.computeBoundingSphere();
  if (geometry.boundingSphere) geometry.boundingSphere.radius += 0.4;
  return {
    geometry,
    bend(amount: number, direction: number) {
      for (let i = 0; i < position.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        const side = Math.pow(Math.abs(u - 0.5) * 2, 6);
        const end = Math.pow(Math.abs(v - 0.5) * 2, 8);
        const edge = side * (0.35 + v * 0.65) + end * 0.23;
        position.setXYZ(
          i,
          rest[i * 3] * (1 - amount * side * 0.025),
          rest[i * 3 + 1] * (1 - amount * end * 0.012),
          amount * edge + direction * amount * side * (u - 0.5) * 0.3,
        );
        if (shades) shades.fill(1 - edge * amount * 0.16, i * 3, i * 3 + 3);
      }
      position.needsUpdate = true;
      if (shades) geometry.getAttribute('color').needsUpdate = true;
      else geometry.computeVertexNormals();
    },
  };
}
