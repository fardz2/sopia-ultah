import { BufferAttribute,BufferGeometry,Group,Points,PointsMaterial } from 'three';
import type {WorldContext,WorldPart} from '../types';
export function createWishScene(ctx:WorldContext):WorldPart {
  const root=new Group(),geometry=ctx.resources.geometry(new BufferGeometry());
  const positions=new Float32Array(220*3);
  for(let i=0;i<220;i++){
    const angle=i*2.39996323,r=Math.sqrt(i/220)*2.3;
    positions[i*3]=Math.cos(angle)*r;positions[i*3+1]=Math.sin(angle)*r;positions[i*3+2]=Math.sin(i*.31)*.65;
  }
  geometry.setAttribute('position',new BufferAttribute(positions,3));
  const material=ctx.resources.material(new PointsMaterial({color:'#9b7850',size:.035,sizeAttenuation:true}));
  material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('void main() {','void main() { if(length(gl_PointCoord-vec2(0.5))>0.5)discard;');};
  const stars=new Points(geometry,material);root.add(stars);root.position.set(2,1.5,-36);
  return{root,apply(snapshot,layout){root.visible=snapshot.unlocked&&!snapshot.ritual.open&&snapshot.story.chapter==='wishes';if(root.visible){root.position.x=layout.mobile?1.6:2;stars.rotation.set(.1,snapshot.story.progress*.5,snapshot.story.progress*.08);}},dispose(){}};
}
