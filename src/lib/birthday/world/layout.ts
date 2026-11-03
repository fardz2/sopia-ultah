import { Vector3 } from 'three';
import type { Object3D, PerspectiveCamera } from 'three';
import type { ScreenRect, WorldLayout } from './types';
export function videoRect(rect: ScreenRect): ScreenRect {
  return { x: rect.x+rect.width*.584, y: rect.y+rect.height*.103, width:rect.width*.3375,height:rect.height*.794 };
}
export function projectRect(corners: readonly Vector3[], camera: PerspectiveCamera, layout: WorldLayout): ScreenRect {
  camera.updateMatrixWorld();
  const points=corners.map(v=>v.clone().project(camera));
  const xs=points.map(v=>(v.x+1)*layout.width/2), ys=points.map(v=>(1-v.y)*layout.height/2);
  return { x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys) };
}
export function placeInRect(object: Object3D, width: number, height: number, rect: ScreenRect, camera: PerspectiveCamera, layout: WorldLayout, distance=8) {
  const h=2*Math.tan(camera.fov*Math.PI/360)*distance, w=h*camera.aspect;
  object.position.set(((rect.x+rect.width/2)/layout.width-.5)*w,(.5-(rect.y+rect.height/2)/layout.height)*h,-distance);
  object.position.applyQuaternion(camera.quaternion).add(camera.position);
  object.quaternion.copy(camera.quaternion);
  object.scale.setScalar(Math.min(rect.width/layout.width*w/width,rect.height/layout.height*h/height));
}
export function defaultTarget(kind: 'portrait'|'book'|'letter'|'candle'|'finale', layout: WorldLayout): ScreenRect {
  const {width:w,height:h,mobile}=layout;
  if(kind==='portrait')return mobile?{x:w*.32,y:h*.31,width:w*.62,height:h*.37}:{x:w*.64,y:h*.21,width:w*.3,height:h*.52};
  if(kind==='book'){const bw=Math.min(900,w-32,(h-220)*1.419);return{x:(w-bw)/2,y:Math.max(110,(h-bw/1.419)/2-15),width:bw,height:bw/1.419};}
  return {x:w*.16,y:h*.22,width:w*.68,height:h*.52};
}
