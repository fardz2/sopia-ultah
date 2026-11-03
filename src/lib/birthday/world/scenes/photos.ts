import { DoubleSide,Group,Mesh,MeshBasicMaterial,MeshStandardMaterial } from 'three';
import type {WorldContext,WorldPart} from '../types';
import {galleryPhotos,framePhoto,irisPhoto} from '../../media';
import {createPaper} from '../../cinema/paperGeometry';
import {buildGardenForeground} from '../../cinema/gardenForeground';
import {placeInRect} from '../layout';
const positions=[[2.1,0,-7,-.055],[-1.5,.35,-12,.065],[1.8,-.1,-17,-.045],[-1.6,.2,-22,.055],[1.4,-.1,-27,-.045]];
export function createPhotoScene(ctx:WorldContext):WorldPart {
  const root=new Group(),gallery=new Group(),frame=new Group(),iris=new Group(),gardenRoot=new Group();
  root.add(gallery,frame,iris,gardenRoot);
  let loaded=false,loading=false,dead=false;
  const prints:{root:Group;board:ReturnType<typeof createPaper>;photo:ReturnType<typeof createPaper>;materials:import('three').Material[]}[]=[];
  let garden:Awaited<ReturnType<typeof buildGardenForeground>>|undefined;
  buildGardenForeground(gardenRoot,ctx.resources,ctx.camera).then(value=>{if(!dead){garden=value;ctx.invalidate();}}).catch(()=>{});
  async function load(){
    if(loading||loaded)return;loading=true;
    try{
      const textures=await Promise.all([...galleryPhotos.map(p=>p.src),framePhoto,irisPhoto].map(url=>ctx.resources.loadTexture(url,ctx.signal)));
      if(dead)return;
      textures.forEach((texture,i)=>{
        const picture=new Group(),image=texture.image as HTMLImageElement,h=i===0?3.2:2.8,w=h*image.naturalWidth/image.naturalHeight;
        const board=createPaper(ctx.resources,w+.16,h+.2),photo=createPaper(ctx.resources,w,h,true);
        const backing=ctx.resources.material(new MeshStandardMaterial({color:'#f1e7d2',roughness:1,side:DoubleSide,transparent:true}));
        const front=ctx.resources.material(new MeshBasicMaterial({map:texture,vertexColors:true,side:DoubleSide,transparent:true}));
        picture.add(new Mesh(board.geometry,backing));const face=new Mesh(photo.geometry,front);face.position.z=.018;picture.add(face);
        (i<5?gallery:i===5?frame:iris).add(picture);prints.push({root:picture,board,photo,materials:[backing,front]});
      });loaded=true;ctx.invalidate();
    }catch{if(!dead&&!ctx.signal.aborted)ctx.fail();}
  }
  return{root,apply(snapshot,layout){
    const {chapter,progress:p}=snapshot.story;
    root.visible=!snapshot.ritual.open;
    gardenRoot.visible=root.visible;garden?.update(p,layout.mobile);
    gallery.visible=root.visible&&snapshot.unlocked&&chapter==='gallery';
    frame.visible=root.visible&&snapshot.unlocked&&chapter==='frame';iris.visible=root.visible&&snapshot.unlocked&&chapter==='iris';
    if(gallery.visible||frame.visible||iris.visible)load();
    if(!loaded)return;
    prints.slice(0,5).forEach(({root:picture,board,photo,materials},i)=>{
      const [x,y,z,angle]=positions[i],d=ctx.camera.position.z-z,near=layout.portrait?4.5:.85;
      picture.visible=d>near;if(!gallery.visible||!picture.visible)return;
      picture.position.set(x*(layout.portrait?.38:1),y,z);
      picture.rotation.set(.025*(i-2),(i%2?-1:1)*.06,angle);
      const focus=1-Math.min(1,Math.abs(d-7.5)/9),curl=(layout.mobile?.1:.17)+focus*.1;
      board.bend(curl,Math.sin(p*Math.PI*2+i));photo.bend(curl,Math.sin(p*Math.PI*2+i));
      const opacity=Math.max(0,Math.min(1,(d-near)/(layout.portrait?2.1:2.15)));
      for(const material of materials)material.opacity=opacity;
    });
    for(const [group,index] of [[frame,5],[iris,6]] as const){
      if(!group.visible)continue;
      const image=prints[index],ratio=(index===5?4/3:567/1280),h=2.8,w=h*ratio;
      image.board.bend(.05*(1-p),1);image.photo.bend(.05*(1-p),1);
      const inset=(1-p)*(chapter==='frame'?.25:.18);
      placeInRect(group,w+.16,h+.2,{x:layout.width*inset,y:layout.height*inset,width:layout.width*(1-inset*2),height:layout.height*(1-inset*2)},ctx.camera,layout,7);
    }
  },dispose(){dead=true;}};
}
