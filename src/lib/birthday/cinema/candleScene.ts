import {
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import type { PerspectiveCamera, Scene } from 'three';
import { Resources } from './resources';
import { range, type Composition } from './types';

export function buildCandle(scene: Scene, camera: PerspectiveCamera, resources: Resources): Composition {
  const wax = resources.material(new MeshStandardMaterial({ color: '#eee0c8', roughness: 0.8 }));
  const brass = resources.material(
    new MeshStandardMaterial({ color: '#9b7850', roughness: 0.65, metalness: 0.15 }),
  );
  const wickMaterial = resources.material(new MeshBasicMaterial({ color: '#423328' }));
  const candle = new Group();
  scene.add(candle);
  const plate = new Mesh(resources.geometry(new CylinderGeometry(0.88, 0.8, 0.065, 48)), brass);
  plate.position.y = -1.05;
  candle.add(plate);
  const body = new Mesh(resources.geometry(new CylinderGeometry(0.31, 0.34, 1.75, 48)), wax);
  body.position.y = -0.14;
  candle.add(body);
  const rim = new Mesh(resources.geometry(new CylinderGeometry(0.31, 0.3, 0.04, 48)), wax);
  rim.position.y = 0.75;
  candle.add(rim);
  const wick = new Mesh(resources.geometry(new CylinderGeometry(0.013, 0.018, 0.16, 8)), wickMaterial);
  wick.position.y = 0.85;
  candle.add(wick);
  const flame = new Group();
  flame.position.y = 0.94;
  candle.add(flame);
  const outerMaterial = resources.material(
    new MeshBasicMaterial({ color: '#c68b3d', transparent: true, opacity: 0.9, depthWrite: false }),
  );
  const innerMaterial = resources.material(
    new MeshBasicMaterial({ color: '#ffe9ad', transparent: true, depthWrite: false }),
  );
  const outer = new Mesh(resources.geometry(new SphereGeometry(1, 20, 16)), outerMaterial);
  outer.position.y = 0.24;
  outer.scale.set(0.115, 0.32, 0.1);
  flame.add(outer);
  const inner = new Mesh(resources.geometry(new SphereGeometry(1, 16, 12)), innerMaterial);
  inner.position.set(0, 0.16, 0.04);
  inner.scale.set(0.06, 0.18, 0.06);
  flame.add(inner);
  const smoke = new Group();
  smoke.position.y = 0.86;
  candle.add(smoke);
  const smokeMaterial = resources.material(
    new MeshBasicMaterial({ color: '#827666', transparent: true, opacity: 0, depthWrite: false }),
  );
  for (let i = 0; i < 3; i++) {
    const curve = new CatmullRomCurve3([
      new Vector3(0, 0, 0),
      new Vector3(0.08, 0.26, 0),
      new Vector3(-0.07, 0.53, 0.01),
      new Vector3(0.14, 0.9, 0),
    ]);
    const strand = new Mesh(resources.geometry(new TubeGeometry(curve, 28, 0.009, 5, false)), smokeMaterial);
    strand.rotation.y = i * 1.4;
    strand.position.x = (i - 1) * 0.02;
    smoke.add(strand);
  }
  return {
    update(progress, aspect) {
      const extinguish = range(progress, 0, 0.4);
      flame.scale.set(1 - extinguish * 0.65, Math.max(0.01, 1 - extinguish), 1 - extinguish * 0.65);
      flame.rotation.z = -extinguish * 0.75;
      outerMaterial.opacity = (1 - extinguish) * 0.9;
      innerMaterial.opacity = 1 - extinguish;
      smokeMaterial.opacity = range(progress, 0.15, 0.4) * (1 - range(progress, 0.7, 1)) * 0.4;
      smoke.position.y = 0.86 + range(progress, 0.25, 1) * 0.7;
      smoke.scale.setScalar(0.5 + progress * 0.8);
      candle.rotation.y = -0.15;
      camera.position.set(0, 0.55, aspect < 0.8 ? 6.6 : 5.8);
      camera.lookAt(0, 0.15, 0);
    },
  };
}
