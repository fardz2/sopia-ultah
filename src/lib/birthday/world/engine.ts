import { AmbientLight, Color, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { WorldResources } from './resources';
import { loadWorldAssets } from './assets';
import { canShowChapter } from './access';
import { resolveStoryPose } from './cameraRig';
import { createTableScene } from './scenes/table';
import { createOpeningScene } from './scenes/opening';
import { createPhotoScene } from './scenes/photos';
import { createWishScene } from './scenes/wishes';
import { createWorldBook } from './scenes/book';
import { createRitualScene } from './scenes/ritual';
import type { WorldCallbacks,WorldDriver,WorldLayout,WorldSnapshot } from './types';

export async function createBirthdayWorld(canvas:HTMLCanvasElement,callbacks:WorldCallbacks,signal:AbortSignal):Promise<WorldDriver>{
  if(signal.aborted)throw new DOMException('Disposed','AbortError');
  const resources=new WorldResources();
  const renderer=new WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:'low-power'});
  const scene=new Scene();scene.background=new Color('#ece7dc');
  const camera=new PerspectiveCamera(35,1,.05,180);
  scene.add(new AmbientLight('#fff7e8',1.4));
  const light=new DirectionalLight('#fff4df',2.2);light.position.set(-3,8,8);scene.add(light);
  let disposed=false,frame=0,lastKey='',rejectInit:((error:unknown)=>void)|undefined;
  let ritualMode=false,fadeStart=-1000;
  let snapshot:WorldSnapshot|undefined;
  let layout:WorldLayout={width:innerWidth,height:innerHeight,dpr:1,mobile:false,portrait:false,targets:{}};
  const table=createTableScene(resources,signal,invalidate);scene.add(table.root);
  const parts:{root:import('three').Object3D;apply(s:WorldSnapshot,l:WorldLayout,n:number):boolean|void;dispose():void}[]=[];
  function invalidate(){if(!disposed&&!snapshot?.hidden&&!frame)frame=requestAnimationFrame(draw);}
  function draw(now:number){
    frame=0;if(disposed||!snapshot||snapshot.hidden)return;
    const allowed=canShowChapter(snapshot.unlocked,snapshot.story.chapter);
    const current=allowed?snapshot:{...snapshot,story:{chapter:'teaser' as const,progress:0},ritual:{...snapshot.ritual,open:false}};
    canvas.dataset.chapter=current.story.chapter;
    canvas.dataset.ritual=current.ritual.open?current.ritual.phase:'closed';
    if(current.ritual.open!==ritualMode){ritualMode=current.ritual.open;fadeStart=now;}
    const fade=Math.min(1,(now-fadeStart)/350);canvas.style.opacity=String(fade);
    resolveStoryPose(camera,current,layout);
    table.root.visible=!current.ritual.open;
    let moving=fade<1;
    for(const part of parts)if(part.apply(current,layout,now)===true)moving=true;
    renderer.render(scene,camera);
    if(moving)invalidate();
  }
  function destroy(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);frame=0;
    signal.removeEventListener('abort',destroy);canvas.removeEventListener('webglcontextlost',lost);
    rejectInit?.(new DOMException('Disposed','AbortError'));rejectInit=undefined;
    parts.forEach(part=>part.dispose());resources.dispose();scene.clear();renderer.dispose();renderer.forceContextLoss();
  }
  function lost(event:Event){event.preventDefault();destroy();callbacks.onStatus('failed');}
  signal.addEventListener('abort',destroy,{once:true});canvas.addEventListener('webglcontextlost',lost);
  try{
    callbacks.onStatus('loading');
    const prepared=await new Promise<{opening:Awaited<ReturnType<typeof createOpeningScene>>;assets:Awaited<ReturnType<typeof loadWorldAssets>>}>((resolve,reject)=>{
      rejectInit=reject;
      loadWorldAssets(resources,signal).then(async assets=>({assets,opening:await createOpeningScene(resources,assets,camera,signal)})).then(resolve,reject);
    });
    rejectInit=undefined;
    if(disposed)throw new DOMException('Disposed','AbortError');
    const ctx={resources,assets:prepared.assets,camera,signal,callbacks,invalidate,fail(){destroy();callbacks.onStatus('failed');}};
    parts.push(prepared.opening,createPhotoScene(ctx),createWorldBook(ctx),createWishScene(ctx),createRitualScene(ctx));parts.forEach(part=>scene.add(part.root));callbacks.onStatus('ready');
  }catch(error){destroy();throw error;}
  return{
    update(value){snapshot=value;const key=JSON.stringify(value);if(key!==lastKey){lastKey=key;if(value.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();}},
    resize(value){if(disposed)return;layout=value;camera.aspect=value.width/value.height;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(value.dpr,value.mobile?1:1.35));renderer.setSize(value.width,value.height,false);invalidate();},
    destroy,
  };
}
