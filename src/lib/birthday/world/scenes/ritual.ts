import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three';
import { createCandleModel } from '../../cinema/candleScene';
import { galleryPhotos, framePhoto } from '../../media';
import { defaultTarget, placeInRect } from '../layout';
import type { WorldContext, WorldPart } from '../types';

export function createRitualScene(ctx:WorldContext):WorldPart {
  const {resources:r,assets,camera,signal}=ctx;
  const root=new Group(),envelope=new Group(),flap=new Group(),finale=new Group();root.add(envelope,finale);
  const wax=r.material(new MeshStandardMaterial({color:'#b79a68',roughness:.48,metalness:.2}));
  const paper=r.material(new MeshStandardMaterial({color:'#e2d7c3',roughness:1}));
  function cad(name:string,material=paper){
    const source=assets.get(name);if(!source)return;
    return new Mesh(r.geometry(source.clone().rotateX(Math.PI/2)),material);
  }
  for(const name of ['envelope-back','envelope-pocket']){const mesh=cad(name);if(mesh)envelope.add(mesh);}
  if(!assets.has('envelope-back'))envelope.add(new Mesh(r.geometry(new BoxGeometry(1.6,1.12,.02)),paper));
  const flapMesh=cad('envelope-flap');
  flap.position.set(0,.56,.017);
  if(flapMesh){flapMesh.position.set(0,-.56,-.017);flap.add(flapMesh);}envelope.add(flap);
  const letter=cad('envelope-letter',r.material(new MeshStandardMaterial({color:'#f6f2e9',roughness:1})));
  if(letter)envelope.add(letter);
  const seal=cad('seal',wax);if(seal){seal.scale.setScalar(1.1);seal.position.set(0,0,.025);envelope.add(seal);}
  const candle=createCandleModel(r);root.add(candle.root);
  const photos=[...galleryPhotos,{src:framePhoto},{src:'/WhatsApp%20Image%202026-10-29%20at%2012.41.13%20(2).jpeg'}];
  const places=[[30,26,-9],[70,26,8],[15,47,-6],[85,47,7],[30,67,-5],[70,67,6],[50,84,-3]];
  const cards:Group[]=[];let loading=false,dead=false,key='',started=0;
  function loadFinale(){
    if(loading)return;loading=true;
    void Promise.all(photos.map(async photo=>{
      const source=await r.loadTexture(photo.src,signal);if(dead)return;
      const texture=r.texture(source.clone());
      const image=texture.image as HTMLImageElement,aspect=image.width/image.height,target=1/1.2;
      texture.repeat.set(Math.min(1,target/aspect),Math.min(1,aspect/target));texture.offset.set((1-texture.repeat.x)/2,(1-texture.repeat.y)/2);texture.needsUpdate=true;
      const card=new Group();
      const board=new Mesh(r.geometry(new BoxGeometry(1.1,1.32,.025)),r.material(new MeshBasicMaterial({color:'#faf5e9'})));
      const front=new Mesh(r.geometry(new PlaneGeometry(1,1.2)),r.material(new MeshBasicMaterial({map:texture})));front.position.z=.018;card.add(board,front);finale.add(card);return card;
    })).then(result=>{if(dead)return;cards.push(...result.filter((x):x is Group=>!!x));started=performance.now();ctx.invalidate();}).catch(()=>{if(!dead&&!signal.aborted)ctx.fail();});
  }
  return {root,apply(s,l,now){
    root.visible=s.unlocked&&s.ritual.open;if(!root.visible){key='';return;}
    const phase=s.ritual.phase,nextKey=phase+':'+s.ritual.replay;
    if(nextKey!==key){key=nextKey;started=now;}
    const elapsed=now-started;
    envelope.visible=['sealed','opening','letter'].includes(phase);candle.root.visible=phase==='candle';finale.visible=phase==='finale';
    if(envelope.visible){
      const sealed=phase!=='letter';
      const target=sealed?(l.targets.letter??defaultTarget('letter',l)):(l.mobile?{x:0,y:l.height*.35,width:l.width,height:l.height*.45}:{x:l.width*.025,y:l.height*.25,width:l.width*.34,height:l.height*.5});
      placeInRect(envelope,1.6,1.35,target,camera,l,8);
      const t=phase==='sealed'?0:phase==='letter'?1:Math.min(1,elapsed/420),ease=1-(1-t)**3;
      flap.rotation.x=Math.PI*ease;seal&&(seal.visible=t<.15);
      if(letter){letter.position.y=ease*.65;letter.position.z=ease*.04;}
      envelope.rotation.z=-.035;
      return phase==='opening'&&t<1;
    }
    if(candle.root.visible){placeInRect(candle.root,1.76,2.6,l.targets.candle??defaultTarget('candle',l),camera,l,8);candle.update(s.ritual.blow);}
    if(finale.visible){
      loadFinale();placeInRect(finale,4.8,4.8,l.targets.finale??defaultTarget('finale',l),camera,l,8);
      cards.forEach((card,i)=>{
        const t=Math.min(1,Math.max(0,(elapsed-i*70)/1400)),ease=1-(1-t)**3,[x,y,rot]=places[i];
        card.position.set(((x-50)/100*4.6)*ease+(i-3)*.08*(1-ease),((50-y)/100*4.6)*ease-3*(1-ease),Math.sin(Math.PI*t)*1.2+i*.002);
        card.rotation.set((1-ease)*.8,(1-ease)*(i%2?.6:-.6),rot*Math.PI/180*ease+(1-ease)*(i-3)*.24);
      });return cards.length>0&&elapsed<1820;
    }
  },dispose(){dead=true;}};
}
