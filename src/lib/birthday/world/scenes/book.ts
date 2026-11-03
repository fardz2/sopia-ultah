import { BoxGeometry, Color, Float32BufferAttribute, FrontSide, BackSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, SRGBColorSpace, Vector3 } from 'three';
import type { Texture, Material } from 'three';
import { mediaPages } from '../../media';
import { sampleBookTurn } from '../bookState';
import { curlPoint } from '../pageCurl';
import { defaultTarget, placeInRect, projectRect, videoRect } from '../layout';
import type { ScreenRect, WorldContext, WorldPart } from '../types';

export function createWorldBook(ctx: WorldContext): WorldPart {
  const { resources: r, camera, signal } = ctx;
  const root = new Group(), book = new Group(), hinge = new Group(); root.add(book); book.add(hinge);
  const cloth = r.material(new MeshStandardMaterial({color:'#c9b593',roughness:.94}));
  const paper = r.material(new MeshBasicMaterial({color:'#f3eddf'}));
  const box = (w:number,h:number,d:number,x:number,z:number,material:Material=cloth) => {
    const mesh=new Mesh(r.geometry(new BoxGeometry(w,h,d)),material);mesh.position.set(x,0,z);book.add(mesh);return mesh;
  };
  box(2.26,3.16,.065,1.1,-.09);box(2.17,3.05,.18,1.1,.025,paper);
  box(.06,3.16,.24,-.02,.025);
  const leftStack=box(2.2,3.1,.06,-1.1,-.04,paper);
  const coverCanvas=document.createElement('canvas');coverCanvas.width=1024;coverCanvas.height=1440;
  const coverTexture=r.canvas(coverCanvas);coverTexture.colorSpace=SRGBColorSpace;
  function drawCover(){
    if(dead)return;const ink=coverCanvas.getContext('2d');if(!ink)return;
    ink.fillStyle='#e2d7c3';ink.fillRect(0,0,1024,1440);ink.strokeStyle='#b29b78';ink.lineWidth=2;
    ink.strokeRect(62,62,900,1316);ink.strokeRect(74,74,876,1292);ink.textAlign='center';ink.fillStyle='#78532f';
    const text=(s:string,y:number,font:string)=>{ink.font=font;ink.fillText(s,512,y);};
    text('7 NOVEMBER',220,'400 38px Archivo');text('sebuah buku kecil',480,'italic 400 84px "Instrument Serif"');
    text('untuk',620,'400 52px Newsreader');text('sopia.',830,'italic 400 190px "Instrument Serif"');
    text('f / s',963,'400 28px Archivo');text('dari faridz',1110,'italic 400 68px "Instrument Serif"');
    text('DENGAN SELURUH SAYANGKU',1220,'400 29px Archivo');coverTexture.needsUpdate=true;ctx.invalidate();
  }
  let dead=false;drawCover();void document.fonts.ready.then(drawCover);
  const coverFace=r.material(new MeshBasicMaterial({map:coverTexture}));
  const cover=new Mesh(r.geometry(new BoxGeometry(2.26,3.16,.045)),[cloth,cloth,cloth,cloth,coverFace,paper]);
  cover.position.x=1.1;hinge.position.z=.155;hinge.add(cover);
  const sealGeometry=ctx.assets.get('seal');
  if(sealGeometry){
    const geometry=r.geometry(sealGeometry.clone()),positions=geometry.getAttribute('position'),colors=new Float32Array(positions.count*3),color=new Color();
    for(let i=0;i<positions.count;i++){
      color.set(positions.getY(i)>.011&&Math.hypot(positions.getX(i),positions.getZ(i))<.1?'#3d2c1d':'#b79a68');
      colors.set([color.r,color.g,color.b],i*3);
    }
    geometry.setAttribute('color',new Float32BufferAttribute(colors,3));
    const seal=new Mesh(geometry,r.material(new MeshStandardMaterial({vertexColors:true,metalness:.2,roughness:.48})));
    seal.rotation.x=Math.PI/2;seal.scale.setScalar(1.3);seal.position.set(1.1,-.5,.04);hinge.add(seal);
  }
  const leftMat=r.material(new MeshBasicMaterial({color:'#f3eddf'})),rightMat=r.material(new MeshBasicMaterial({color:'#f3eddf'}));
  const pageGeo=r.geometry(new PlaneGeometry(2.2,3.1));
  const left=new Mesh(pageGeo,leftMat),right=new Mesh(pageGeo,rightMat);left.position.set(-1.1,0,.14);right.position.set(1.1,0,.14);book.add(left,right);
  const turningGeo=r.geometry(new PlaneGeometry(2.2,3.1,30,2));
  const turnFront=r.material(new MeshBasicMaterial({side:FrontSide})),turnBack=r.material(new MeshBasicMaterial({side:BackSide}));
  const front=new Mesh(turningGeo,turnFront),back=new Mesh(turningGeo,turnBack);front.position.z=back.position.z=.15;book.add(front,back);
  const cached=new Map<number,{source:Texture;left:Texture;right:Texture;reverse:Texture}>(),pending=new Set<number>();let wanted=new Set<number>();
  function load(index:number){
    if(cached.has(index)||pending.has(index))return;pending.add(index);
    void r.loadTexture(mediaPages[index].url,signal).then(source=>{
      pending.delete(index);
      if(dead)return;
      if(!wanted.has(index)){r.forgetTexture(mediaPages[index].url,source);return;}
      const half=(offset:number,repeat:number)=>{const t=r.texture(source.clone());t.offset.set(offset,0);t.repeat.set(repeat,1);t.needsUpdate=true;return t;};
      cached.set(index,{source,left:half(0,.5),right:half(.5,.5),reverse:half(.5,-.5)});ctx.invalidate();
    }).catch(()=>{pending.delete(index);if(!dead&&!signal.aborted)ctx.fail();});
  }
  function map(material:MeshBasicMaterial,texture?:Texture){if(material.map!==texture){material.map=texture??null;material.needsUpdate=true;}}
  let completed=0,lastProjection='';
  function projection(spread:ScreenRect|null,video:ScreenRect|null){const key=JSON.stringify([spread,video]);if(key!==lastProjection){lastProjection=key;ctx.callbacks.onBookProjection({spread,video});}}
  return {root,apply(s,l,now){
    const chapter=s.story.chapter,p=s.story.progress;
    root.visible=!s.ritual.open&&['teaser','book','closing'].includes(chapter);
    if(!root.visible){projection(null,null);return;}
    const reading=chapter==='book'&&s.unlocked,pOpen=reading?Math.min(1,Math.max(0,(p-.14)/.66)):0;
    const smooth=pOpen*pOpen*(3-2*pOpen);
    let target=l.targets.book??defaultTarget('book',l);
    if(!reading)target=l.mobile?{x:l.width*.08,y:l.height*.3,width:l.width*.84,height:l.height*.56}:{x:l.width*.42,y:l.height*.16,width:l.width*.55,height:l.height*.68};
    placeInRect(root,2.2*(1+smooth),3.1,target,camera,l,8);
    if(reading)root.scale.multiplyScalar(s.book.zoom);
    book.position.x=-1.1*(1-smooth);hinge.rotation.y=-Math.PI*smooth;
    cover.visible=smooth<.999;leftStack.visible=smooth>.1;left.visible=smooth>.999&&s.unlocked;right.visible=left.visible;
    front.visible=back.visible=false;
    if(!reading||smooth<1){projection(null,null);return;}
    const turn=s.book.turn,index=s.book.index;
    wanted=new Set([index,(index+1)%10,(index+9)%10,...(turn?[turn.from,turn.to]:[])]);
    for(const [i,textures]of cached)if(!wanted.has(i)){
      r.releaseTexture(textures.left);r.releaseTexture(textures.right);r.releaseTexture(textures.reverse);r.forgetTexture(mediaPages[i].url,textures.source);cached.delete(i);
    }
    wanted.forEach(load);
    const a=cached.get(turn?.from??index),b=turn?cached.get(turn.to):undefined;
    map(leftMat,turn?.direction==='prev'?b?.left:a?.left);map(rightMat,turn?.direction==='next'?b?.right:a?.right);
    let moving=false;
    if(turn&&a&&b){
      const sample=sampleBookTurn(turn,now);moving=!!turn.animation&&!sample.done;
      const positions=turningGeo.getAttribute('position'),uv=turningGeo.getAttribute('uv');
      for(let i=0;i<positions.count;i++){const point=curlPoint(uv.getX(i),sample.progress,2.2,turn.direction);positions.setXYZ(i,point.x,uv.getY(i)*3.1-1.55,point.z);}
      positions.needsUpdate=true;turningGeo.computeVertexNormals();
      front.visible=back.visible=true;
      map(turnFront,turn.direction==='next'?a.right:b.right);map(turnBack,turn.direction==='next'?b.reverse:a.reverse);
      if(sample.done&&completed!==turn.id){completed=turn.id;ctx.callbacks.onBookTurnEnd(turn.id);}
    }
    root.updateWorldMatrix(true,true);
    if(p>=.92){
      const corners=[[-2.2,-1.55],[2.2,-1.55],[2.2,1.55],[-2.2,1.55]].map(([x,y])=>book.localToWorld(new Vector3(x,y,.14)));
      const rect=projectRect(corners,camera,l);projection(rect,!turn&&mediaPages[index].mediaType==='video'?videoRect(rect):null);
    }else projection(null,null);
    return moving;
  },dispose(){dead=true;cached.clear();pending.clear();}};
}
