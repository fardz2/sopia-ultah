import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three';
import type { PerspectiveCamera, Scene } from 'three';
import type { Resources } from './resources';
import { range, smooth } from './types';

/** Existing watercolor cutouts become near planes along the camera's route. */
export async function buildGardenForeground(scene: Scene, resources: Resources, camera: PerspectiveCamera) {
  const textures = await Promise.all(
    ['leaf-monstera.webp', 'leaf-fern.webp'].map((file) =>
      resources.load('/landing-pages/birthday-media/' + file),
    ),
  );
  const placements = [
    { side: -1, z: 3.2, size: 4.8, angle: 0.65 },
    { side: 1, z: -3.5, size: 4.1, angle: -0.85 },
    { side: -1, z: -10.5, size: 4.8, angle: 0.45 },
    { side: 1, z: -17.5, size: 4.5, angle: -0.7 },
  ];
  const leaves = placements.map((_, i) => {
    const leaf = new Mesh(
      resources.geometry(new PlaneGeometry(1, 1, 5, 8)),
      resources.material(new MeshBasicMaterial({
        map: textures[i % textures.length], transparent: true,
        alphaTest: 0.03, depthWrite: false, side: DoubleSide,
      })),
    );
    scene.add(leaf);
    return leaf;
  });
  const local = new Vector3();
  return {
    update(progress: number, compact: boolean) {
      leaves.forEach((leaf, i) => {
        const { side, z, size, angle } = placements[i];
        const distance = camera.position.z - z;
        leaf.visible = distance > 2.8 && distance < 22;
        if (!leaf.visible) return;
        const scale = size * (compact ? 0.48 : 1);
        const halfHeight = Math.tan(camera.fov * Math.PI / 360) * distance;
        // Anchor stems outside the current frame. Depth still makes the
        // leaves grow as we pass, without floating across the reading area.
        local.set(side * (halfHeight * camera.aspect + scale * 0.3), -halfHeight - scale * 0.2, -distance);
        leaf.position.copy(local.applyQuaternion(camera.quaternion).add(camera.position));
        leaf.scale.setScalar(scale);
        leaf.quaternion.copy(camera.quaternion);
        leaf.rotateX(0.12);
        leaf.rotateZ(angle + Math.sin(progress * Math.PI + i) * 0.09);
        leaf.material.opacity = smooth(range(distance, 2.8, 6));
      });
    },
  };
}
