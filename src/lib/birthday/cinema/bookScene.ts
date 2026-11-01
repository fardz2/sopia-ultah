import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';
import type { PerspectiveCamera, Scene } from 'three';
import { Resources } from './resources';
import { range, smooth, type Composition } from './types';

export async function buildBook(
  scene: Scene,
  camera: PerspectiveCamera,
  resources: Resources,
  canvas: HTMLCanvasElement,
): Promise<Composition> {
  const width = 2.2,
    height = 3.1;
  const spread = await resources.load('/landing-pages/birthday-media/kenangan-01.svg');
  await document.fonts.ready;
  const cover = document.createElement('canvas');
  cover.width = 1024;
  cover.height = 1440;
  const ink = cover.getContext('2d');
  if (!ink) throw new Error('Cover unavailable');
  ink.fillStyle = '#e2d7c3';
  ink.fillRect(0, 0, cover.width, cover.height);
  ink.strokeStyle = '#b29b78';
  ink.lineWidth = 2;
  ink.strokeRect(62, 62, 900, 1316);
  ink.strokeRect(74, 74, 876, 1292);
  ink.textAlign = 'center';
  ink.fillStyle = '#78532f';
  ink.font = '400 38px Archivo';
  ink.fillText('7 NOVEMBER', 512, 220);
  ink.font = 'italic 400 84px "Instrument Serif"';
  ink.fillText('sebuah buku kecil', 512, 480);
  ink.font = '400 52px "Newsreader"';
  ink.fillText('untuk', 512, 620);
  ink.font = 'italic 400 190px "Instrument Serif"';
  ink.fillText('sopia.', 512, 830);
  ink.beginPath();
  ink.moveTo(432, 950);
  ink.lineTo(592, 950);
  ink.stroke();
  ink.font = 'italic 400 68px "Instrument Serif"';
  ink.fillText('dari faridz', 512, 1110);
  ink.font = '400 29px Archivo';
  ink.fillText('DENGAN SELURUH SAYANGKU', 512, 1220);
  const coverTexture = resources.canvas(cover);
  coverTexture.colorSpace = SRGBColorSpace;
  coverTexture.anisotropy = 4;
  const left = resources.texture(spread.clone()),
    right = resources.texture(spread.clone());
  left.repeat.set(0.5, 1);
  left.offset.set(0, 0);
  left.needsUpdate = true;
  right.repeat.set(0.5, 1);
  right.offset.set(0.5, 0);
  right.needsUpdate = true;
  const cloth = resources.material(new MeshStandardMaterial({ color: '#c9b593', roughness: 0.94 }));
  const paper = resources.material(new MeshStandardMaterial({ color: '#f3eddf', roughness: 1 }));
  const outer = resources.material(new MeshBasicMaterial({ map: coverTexture }));
  const leftFace = resources.material(
    new MeshBasicMaterial({ map: left, transparent: true, alphaTest: 0.01 }),
  );
  const rightFace = resources.material(
    new MeshBasicMaterial({ map: right, transparent: true, alphaTest: 0.01 }),
  );
  const book = new Group();
  scene.add(book);
  const bottom = new Mesh(resources.geometry(new BoxGeometry(width + 0.06, height + 0.06, 0.065)), cloth);
  bottom.position.set(width / 2, 0, -0.08);
  book.add(bottom);
  const pages = new Mesh(resources.geometry(new BoxGeometry(width - 0.035, height - 0.045, 0.18)), paper);
  pages.position.set(width / 2, 0, 0.04);
  book.add(pages);
  // Visible leaf edges give thickness without expensive shadow maps.
  for (let i = 0; i < 7; i++) {
    const edge = new Mesh(resources.geometry(new BoxGeometry(width - 0.045, 0.006, 0.002)), cloth);
    edge.position.set(width / 2, -height / 2 + 0.022, -0.025 + i * 0.023);
    book.add(edge);
  }
  const photograph = new Mesh(resources.geometry(new PlaneGeometry(width, height)), rightFace);
  photograph.position.set(width / 2, 0, 0.137);
  book.add(photograph);
  const hinge = new Group();
  hinge.position.z = 0.155;
  book.add(hinge);
  const lid = new Mesh(resources.geometry(new BoxGeometry(width + 0.06, height + 0.06, 0.045)), [
    cloth,
    cloth,
    cloth,
    cloth,
    outer,
    leftFace,
  ]);
  lid.position.x = width / 2;
  hinge.add(lid);
  const spine = new Mesh(resources.geometry(new BoxGeometry(0.06, height + 0.06, 0.24)), cloth);
  spine.position.set(-0.02, 0, 0.025);
  book.add(spine);
  let target = { width: 0.87, height: 0.66, x: 0.5, y: 0.5 };
  return {
    resize() {
      const native = canvas.parentElement?.querySelector<HTMLElement>('#sbBook');
      const bounds = native?.getBoundingClientRect(),
        viewport = canvas.getBoundingClientRect();
      if (!bounds || !viewport.width || !viewport.height || !bounds.width) return;
      target = {
        width: bounds.width / viewport.width,
        height: bounds.height / viewport.height,
        x: (bounds.left - viewport.left + bounds.width / 2) / viewport.width,
        y: (bounds.top - viewport.top + bounds.height / 2) / viewport.height,
      };
    },
    update(progress, aspect) {
      const settle = smooth(range(progress, 0, 0.78));
      const open = smooth(range(progress, 0.2, 0.8));
      hinge.rotation.y = -Math.PI * open;
      book.rotation.set(0.16 * (1 - settle), -0.48 * (1 - settle), -0.11 * (1 - settle));
      const tangent = Math.tan((Math.PI * 35) / 360);
      const heightRatio = (aspect < 0.8 ? 0.5 : 0.62) * (1 - settle) + target.height * settle;
      const widthRatio = 0.78 * (1 - settle) + target.width * settle;
      const fitHeight = height / (2 * tangent * heightRatio);
      const fitWidth = (width * (1 + open)) / (2 * tangent * aspect * widthRatio);
      const distance = Math.max(fitHeight, fitWidth) + Math.sin(Math.PI * open) * width * 0.9;
      const fieldHeight = distance * 2 * tangent;
      const startX = aspect > 1 ? 0.65 : 0.15;
      book.position.set(
        (-width / 2) * (1 - open) + startX * (1 - settle) + (target.x - 0.5) * fieldHeight * aspect * settle,
        -0.06 * fieldHeight * (1 - settle) + (0.5 - target.y) * fieldHeight * settle,
        0,
      );
      camera.position.set(0, 0, distance);
      camera.lookAt(0, 0, 0);
    },
  };
}
