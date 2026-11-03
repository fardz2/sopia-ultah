import { CatmullRomCurve3, Vector3 } from 'three';
import type { PerspectiveCamera } from 'three';
import type { WorldSnapshot, WorldLayout } from './types';
const path=new CatmullRomCurve3([
  new Vector3(0,.12,4),new Vector3(.35,.08,.5),new Vector3(-.3,.15,-4.5),
  new Vector3(.35,.02,-9.5),new Vector3(-.3,.12,-14.5),new Vector3(.3,.02,-19.5),new Vector3(.2,.05,-20),
],false,'catmullrom',.32);
const aims=new CatmullRomCurve3([
  new Vector3(.6,0,-7),new Vector3(2.1,0,-7),new Vector3(-1.5,.35,-12),new Vector3(1.8,-.1,-17),
  new Vector3(-1.6,.2,-22),new Vector3(1.4,-.1,-27),new Vector3(1.4,-.1,-27),
],false,'catmullrom',.32);
export function resolveStoryPose(camera:PerspectiveCamera,snapshot:WorldSnapshot,layout:WorldLayout) {
  const {chapter,progress:p}=snapshot.story;
  const target=new Vector3();
  if(snapshot.ritual.open&&snapshot.unlocked){camera.position.set(0,0,10);camera.lookAt(0,0,0);return;}
  if(chapter==='gallery'){
    path.getPoint(p,camera.position);aims.getPoint(p,target);
    if(layout.portrait){camera.position.x*=.38;camera.position.z+=1.8;target.x*=.38;}
  }else if(chapter==='opening'||chapter==='teaser'){
    camera.position.set(4-p,5-p,16-p*3);target.set(0,.5,4);
  }else if(chapter==='frame'){
    camera.position.set(3*(1-p),3*(1-p)+1,12-p*5);target.set(0,.8,0);
  }else if(chapter==='iris'){
    camera.position.set(-p,1.4-p,7-p*3);target.set(0,0,-6);
  }else if(chapter==='book'){
    camera.position.set(.2*(1-p),.05+p*1.75,-20-p*6);target.set(0,1.8,-34);
  }else if(chapter==='wishes'){
    camera.position.set(.3*Math.sin(p*Math.PI),1.5,-28-p*2);target.set(0,1.5,-36);
  }else{camera.position.set(4,5,-34);target.set(0,.5,-44);}
  camera.lookAt(target);
}
