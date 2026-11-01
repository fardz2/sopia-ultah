import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three';
import type { PerspectiveCamera, Scene } from 'three';
import { Resources } from './resources';
import { smooth, type CinemaPhoto, type Composition } from './types';

export async function buildGallery(
  scene: Scene,
  camera: PerspectiveCamera,
  resources: Resources,
  photos: readonly CinemaPhoto[],
): Promise<Composition> {
  const textures = await Promise.all(photos.map((photo) => resources.load(photo.src)));
  const paper = resources.material(new MeshStandardMaterial({ color: '#f4efdf', roughness: 1 }));
  const positions = [
    [1.8, -0.05, 0.8, -0.055],
    [-2.8, 3, -1.8, 0.09],
    [3.8, 1.9, -1.2, -0.1],
    [-2.9, -2.2, -0.6, -0.09],
    [3.5, -2.1, -1.5, 0.09],
  ];
  const frames = textures.map((texture, i) => {
    const picture = new Group(),
      h = i === 0 ? 3.2 : 1.9;
    const image = texture.image as HTMLImageElement;
    const w = (h * image.naturalWidth) / image.naturalHeight;
    const mount = new Mesh(resources.geometry(new BoxGeometry(w + 0.16, h + 0.2, 0.028)), paper);
    picture.add(mount);
    const print = new Mesh(
      resources.geometry(new PlaneGeometry(w, h)),
      resources.material(new MeshBasicMaterial({ map: texture })),
    );
    print.position.z = 0.018;
    picture.add(print);
    picture.rotation.set(0.025 * (i - 2), 0.04 * (i - 2), positions[i][3]);
    scene.add(picture);
    return picture;
  });
  return {
    update(progress, aspect) {
      const travel = smooth(progress),
        compact = aspect < 0.8;
      frames.forEach((picture, i) => {
        const [x, y, z, angle] = positions[i];
        picture.position.set(
          x * (compact ? 0.57 : 1) - travel * (i === 0 ? 0.7 : 0.15),
          y * (compact ? 0.88 : 1),
          z + travel * (i === 0 ? 0.8 : -0.4),
        );
        picture.rotation.z = angle * (1 - travel * 0.35);
      });
      camera.position.set(travel * 0.45, 0.12 - travel * 0.2, (compact ? 10.8 : 9.7) - travel * 3.2);
      camera.lookAt(compact ? 0.25 : travel * 0.5, 0, 0);
    },
  };
}
