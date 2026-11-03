import { Group, Mesh, MeshStandardMaterial, PlaneGeometry, BoxGeometry } from 'three';
import type { WorldResources } from '../resources';
export function createTableScene(resources:WorldResources) {
  const root=new Group();
  const material=resources.material(new MeshStandardMaterial({color:'#ece7dc',roughness:1}));
  const ground=new Mesh(resources.geometry(new PlaneGeometry(110,110)),material);
  ground.rotation.x=-Math.PI/2;ground.position.set(0,-2.4,-18);root.add(ground);
  const edge=new Mesh(resources.geometry(new BoxGeometry(17,.25,13)),resources.material(new MeshStandardMaterial({color:'#d8c9ad',roughness:1})));
  edge.position.set(0,-2.5,4);root.add(edge);
  return {root,dispose(){}};
}
