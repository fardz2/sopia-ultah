<script lang="ts">
  import {onMount,tick} from 'svelte';
  import type {WorldDriver,WorldLayout,WorldSnapshot,WorldStatus,ScreenRect} from './world/types';
  let {snapshot,enabled=true,onstatus,onprojection,onturnend}:{snapshot:WorldSnapshot;enabled?:boolean;onstatus:(status:WorldStatus)=>void;onprojection?:(rects:{spread:ScreenRect|null;video:ScreenRect|null})=>void;onturnend?:(id:number)=>void}=$props();
  let canvas:HTMLCanvasElement;
  let status=$state<WorldStatus>('idle');
  let driver:WorldDriver|undefined, lifetime:AbortController|undefined;
  let mounted=false,dead=false,starting=false,run=0,measureFrame=0;
  function measure(){
    measureFrame=0;if(!driver)return;
    const width=innerWidth,height=innerHeight;
    const targets:WorldLayout['targets']={};
    for(const name of ['portrait','book','letter','candle','finale'] as const){
      const el=document.querySelector<HTMLElement>(`[data-world-target="${name}"]`);
      if(el){const r=el.getBoundingClientRect();if(r.width&&r.height)targets[name]={x:r.x,y:r.y,width:r.width,height:r.height};}
    }
    driver.resize({width,height,dpr:devicePixelRatio||1,mobile:width<=640||matchMedia('(pointer:coarse)').matches,portrait:width/height<.8,targets});
  }
  function requestMeasure(){if(!measureFrame&&!dead)measureFrame=requestAnimationFrame(measure);}
  function stop(){run++;starting=false;lifetime?.abort();lifetime=undefined;driver?.destroy();driver=undefined;}
  async function initialize(){
    if(!mounted||dead||starting||driver||!enabled||status==='failed')return;
    starting=true;const generation=++run;const controller=new AbortController();lifetime=controller;
    try{
      const {createBirthdayWorld}=await import('./world/engine');
      if(dead||generation!==run)return;
      const result=await createBirthdayWorld(canvas,{
        onStatus(value){if(!dead&&generation===run){status=value;onstatus(value);}},
        onBookTurnEnd(id){if(!dead&&generation===run)onturnend?.(id);},
        onBookProjection(rects){if(!dead&&generation===run)onprojection?.(rects);},
      },controller.signal);
      if(dead||generation!==run){result.destroy();return;}
      driver=result;await tick();if(dead||generation!==run)return;measure();driver.update(snapshot);
    }catch{if(!dead&&generation===run){status='failed';onstatus('failed');}}
    finally{if(generation===run)starting=false;}
  }
  onMount(()=>{
    mounted=true;initialize();
    const observer=new ResizeObserver(requestMeasure);observer.observe(document.body);
    return()=>{dead=true;mounted=false;stop();observer.disconnect();cancelAnimationFrame(measureFrame);};
  });
  $effect(()=>{
    const current=snapshot,active=enabled;
    if(!active){stop();if(status!=='failed'){status='idle';onstatus('idle');}return;}
    if(driver)driver.update(current);else initialize();
  });
  $effect(()=>{const chapter=snapshot.story.chapter,phase=snapshot.ritual.phase;void chapter;void phase;tick().then(requestMeasure);});
</script>
<svelte:window onresize={requestMeasure}/>
<div class="birthday-world" class:is-ready={status==='ready'} data-world-status={status} aria-hidden="true">
  <canvas bind:this={canvas} id="birthdayWorldCanvas"></canvas>
</div>
<style>
  .birthday-world{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0;transition:opacity 300ms ease-out;}
  .birthday-world.is-ready{opacity:1;}
  canvas{display:block;width:100%;height:100%;}
  @media(prefers-reduced-motion:reduce){.birthday-world{transition:none;}}
</style>
