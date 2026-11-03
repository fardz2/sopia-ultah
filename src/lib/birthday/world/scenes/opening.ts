import { BoxGeometry, CanvasTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, SRGBColorSpace } from 'three';
import type { PerspectiveCamera } from 'three';
import type { WorldResources } from '../resources';
import type { WorldAssets } from '../assets';
import type { WorldLayout, WorldSnapshot } from '../types';
import { defaultTarget,placeInRect } from '../layout';
export function createGift(resources:WorldResources,assets:WorldAssets) {
  const root=new Group(),top=new Group();root.add(top);
  const paper=resources.material(new MeshStandardMaterial({color:'#e6d8bd',roughness:.9}));
  const ribbon=resources.material(new MeshStandardMaterial({color:'#939f80',roughness:.75}));
  for(const name of ['gift-base','gift-lid','gift-ribbon-x','gift-ribbon-y','gift-bow-left','gift-bow-right']){
    const geo=assets.get(name); if(!geo)continue;
    const mesh=new Mesh(geo,name==='gift-base'||name==='gift-lid'?paper:ribbon);
    (name==='gift-base'?root:top).add(mesh);
  }
  if(!root.children.some(v=>v!==top))root.add(new Mesh(resources.geometry(new BoxGeometry(1.4,.7,1.1)),paper));
  return{root,top};
}
export async function createOpeningScene(resources:WorldResources,assets:WorldAssets,camera:PerspectiveCamera,signal:AbortSignal){
  const root=new Group();
  const portrait=new Group();root.add(portrait);
  const frame=new Group();frame.rotation.x=Math.PI/2;portrait.add(frame);
  const material=resources.material(new MeshStandardMaterial({color:'#a88a5c',roughness:.7,metalness:.15}));
  for(const name of ['photo-frame','photo-stand']){const geo=assets.get(name);if(geo)frame.add(new Mesh(geo,material));}
  const texture=await resources.loadTexture('/WhatsApp%20Image%202026-10-29%20at%2012.40.23%20(1).jpeg',signal);
  const picture=new Mesh(resources.geometry(new PlaneGeometry(.96,2.16)),resources.material(new MeshBasicMaterial({map:texture,side:DoubleSide})));
  picture.position.z=.035;portrait.add(picture);
  const gift=createGift(resources,assets);gift.root.position.set(-2.8,-1.8,5);gift.root.rotation.y=-.25;gift.root.scale.setScalar(1.35);root.add(gift.root);
  // Stationery is drawn on a real thick plate; decorative text remains native.
  const stationery=new Mesh(resources.geometry(new BoxGeometry(2,.025,1.2)),resources.material(new MeshStandardMaterial({color:'#efe5d2',roughness:1})));
  stationery.position.set(2.3,-2.2,4.3);stationery.rotation.y=.25;root.add(stationery);
  return{root,apply(snapshot:WorldSnapshot,layout:WorldLayout){
    root.visible=!snapshot.ritual.open&&['opening','teaser','closing'].includes(snapshot.story.chapter);
    if(!root.visible)return;
    if(snapshot.story.chapter==='closing'){
      gift.root.position.set(-2.8,-1.8,-44);stationery.position.z=-43;portrait.visible=false;
    }else{
      gift.root.position.set(layout.mobile?-2.1:-2.8,-1.8,5);stationery.position.z=4.3;
      portrait.visible=snapshot.story.chapter==='opening';
      if(portrait.visible)placeInRect(portrait,1.08,2.28,layout.targets.portrait??defaultTarget('portrait',layout),camera,8);
    }
  },dispose(){}};
}
