import {
  CatmullRomCurve3, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3,
} from 'three';
import type { PerspectiveCamera, Scene } from 'three';
import { Resources } from './resources';
import { range, smooth, type CinemaPhoto, type Composition } from './types';
import { createPaper } from './paperGeometry';
import { buildGardenForeground } from './gardenForeground';

const positions = [
  [2.1, 0, 0, -0.055],
  [-1.5, 0.35, -5, 0.065],
  [1.8, -0.1, -10, -0.045],
  [-1.6, 0.2, -15, 0.055],
  [1.4, -0.1, -20, -0.045],
];

export async function buildGallery(
  scene: Scene,
  camera: PerspectiveCamera,
  resources: Resources,
  photos: readonly CinemaPhoto[],
): Promise<Composition> {
  const [textures, garden] = await Promise.all([
    Promise.all(photos.map((photo) => resources.load(photo.src))),
    // A failed decorative leaf must not prevent the real photos from loading.
    buildGardenForeground(scene, resources, camera).catch(() => undefined),
  ]);
  const boardMaterial = resources.material(new MeshStandardMaterial({
    color: '#f4efdf', roughness: 1, side: DoubleSide, transparent: true,
  }));
  const frames = textures.map((texture, i) => {
    const picture = new Group();
    const height = i === 0 ? 3.2 : 2.8;
    const image = texture.image as HTMLImageElement;
    const width = height * image.naturalWidth / image.naturalHeight;
    const board = createPaper(resources, width + 0.16, height + 0.2);
    const print = createPaper(resources, width, height, true);
    const backing = resources.material(boardMaterial.clone());
    const photograph = resources.material(new MeshBasicMaterial({
      map: texture, vertexColors: true, side: DoubleSide, transparent: true,
    }));
    picture.add(new Mesh(board.geometry, backing));
    const face = new Mesh(print.geometry, photograph);
    face.position.z = 0.018;
    picture.add(face);
    scene.add(picture);
    return { picture, board, print, backing, photograph };
  });
  const cameraPath = new CatmullRomCurve3([
    new Vector3(0, 0.12, 11),
    new Vector3(0.35, 0.08, 7.5),
    new Vector3(-0.3, 0.15, 2.5),
    new Vector3(0.35, 0.02, -2.5),
    new Vector3(-0.3, 0.12, -7.5),
    new Vector3(0.3, 0.02, -12.5),
    new Vector3(0.2, 0.05, -13),
  ], false, 'catmullrom', 0.32);
  const aimPath = new CatmullRomCurve3([
    new Vector3(0.6, 0, 0),
    ...positions.map(([x, y, z]) => new Vector3(x, y, z)),
    new Vector3(1.4, -0.1, -20),
  ], false, 'catmullrom', 0.32);
  const point = new Vector3(), aim = new Vector3();
  return {
    update(progress, aspect) {
      const compact = aspect < 0.8;
      cameraPath.getPoint(progress, point);
      aimPath.getPoint(progress, aim);
      if (compact) {
        point.x *= 0.38;
        aim.x *= 0.38;
        // Step back on tall frames instead of cropping the portraits.
        point.z += 1.8;
      }
      camera.position.copy(point);
      camera.lookAt(aim);
      const openingDrop = compact ? (1 - smooth(range(progress, 0, 0.18))) * 0.8 : 0;
      const nearStart = compact ? 4.5 : 0.85;
      const nearEnd = compact ? 6.6 : 3;
      frames.forEach(({ picture, board, print, backing, photograph }, i) => {
        const [x, y, z, angle] = positions[i];
        const distance = point.z - z;
        picture.visible = distance > nearStart;
        if (!picture.visible) return;
        picture.position.set(x * (compact ? 0.38 : 1), y - openingDrop, z);
        const focus = 1 - Math.min(1, Math.abs(distance - 7.5) / 9);
        const curl = (compact ? 0.1 : 0.17) + focus * (compact ? 0.08 : 0.14);
        const direction = Math.sin(progress * Math.PI * 2 + i * 0.8);
        board.bend(curl, direction);
        print.bend(curl, direction);
        picture.rotation.set(0.025 * (i - 2), (i % 2 ? -1 : 1) * 0.1 * (1 - focus * 0.6), angle * (1 - focus * 0.5));
        backing.opacity = photograph.opacity = smooth(range(distance, nearStart, nearEnd));
      });
      garden?.update(progress, compact);
    },
  };
}
