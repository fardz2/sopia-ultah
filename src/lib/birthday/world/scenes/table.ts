import { Group, Mesh, MeshStandardMaterial, MeshBasicMaterial, PlaneGeometry, BoxGeometry, RepeatWrapping } from 'three';
import type { WorldResources } from '../resources';
export function createTableScene(resources:WorldResources,signal:AbortSignal,invalidate:()=>void) {
  const root=new Group();
  const material=resources.material(new MeshBasicMaterial({color:'#ece7dc'}));
  const ground=new Mesh(resources.geometry(new PlaneGeometry(110,110)),material);
  ground.rotation.x=-Math.PI/2;ground.position.set(0,-2.4,-18);root.add(ground);
  resources.loadTexture('/landing-pages/birthday-media/paper-clean.webp',signal).then(texture=>{
    texture.wrapS=texture.wrapT=RepeatWrapping;texture.repeat.set(5,5);material.color.set('#ffffff');material.map=texture;material.needsUpdate=true;invalidate();
  }).catch(()=>{});
  const edge=new Mesh(resources.geometry(new BoxGeometry(17,.25,13)),resources.material(new MeshStandardMaterial({color:'#d8c9ad',roughness:1})));
  edge.position.set(0,-2.5,4);root.add(edge);
  return {root,dispose(){}};
}
