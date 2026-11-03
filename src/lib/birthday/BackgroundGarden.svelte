<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { GiftBackdrop } from './cinema/giftTableBackground';
  let {
    reduced = false,
    paused = false,
    scrolling = false,
    onready,
  }: { reduced?: boolean; paused?: boolean; scrolling?:boolean; onready?: (ready: boolean) => void } = $props();
  let canvas = $state<HTMLCanvasElement>();
  let canvasVersion = $state(0);
  let driver:GiftBackdrop|undefined,lifetime:AbortController|undefined;
  let active=$state(false),failed=$state(false);
  let mounted=false,destroyed=false,starting=false,run=0;
  function stop(){
    run++;starting=false;lifetime?.abort();lifetime=undefined;driver?.destroy();driver=undefined;
    if(!destroyed)canvasVersion++;
    active=false;onready?.(false);
  }
  function fail(){if(destroyed)return;failed=true;stop();}
  async function initialize(){
    if(!mounted||destroyed||starting||driver||reduced||failed)return;
    starting=true;const generation=++run,controller=new AbortController();lifetime=controller;
    try{
      const {createGiftBackdrop}=await import('./cinema/giftTableBackground');
      await tick();
      if(destroyed||generation!==run)return;
      if(!canvas)throw new Error('Background surface unavailable');
      const result=await createGiftBackdrop(canvas,controller.signal,()=>{if(generation===run)fail();});
      if(destroyed||generation!==run){result.destroy();return;}
      driver=result;driver.setOptions({paused,scrolling});active=true;onready?.(true);
    }catch{if(!destroyed&&generation===run)fail();}
    finally{if(generation===run)starting=false;}
  }
  const motes = [
    [8, 3, 25, -7, 32],
    [26, 4, 32, -21, -24],
    [49, 3, 28, -12, 38],
    [73, 4, 30, -24, -36],
    [93, 3, 24, -4, -28],
    [17, 5, 34, -16, 26],
    [38, 3, 27, -3, -32],
    [62, 4, 31, -18, 24],
    [85, 3, 29, -10, -42],
  ];
  onMount(() => {
    mounted=true;initialize();
    return () => {destroyed=true;mounted=false;stop();};
  });
  $effect(() => {
    const stopMotion=reduced,options={paused,scrolling};
    if(stopMotion){if(driver||starting)stop();}
    else if(driver)driver.setOptions(options);
    else initialize();
  });
</script>

<svelte:window onresize={() => driver?.resize()} onscroll={() => driver?.scroll()} />
<div class="wash" aria-hidden="true"></div>
<div class="gift-table-background" class:is-ready={active} data-backdrop-state={active?'ready':failed?'fallback':reduced?'reduced':'loading'} aria-hidden="true">
  {#key canvasVersion}<canvas bind:this={canvas} id="giftTableBackground"></canvas>{/key}
</div>

<style>
  .gift-table-background{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0;transition:opacity 350ms cubic-bezier(.23,1,.32,1)}
  .gift-table-background.is-ready{opacity:1}
  canvas{display:block;width:100%;height:100%}
  @media(prefers-reduced-motion:reduce){.gift-table-background{transition:none}}
</style>
<div class="ambient-garden" aria-hidden="true">
  {#each motes as mote, i (i)}<i
      class="ambient-speck"
      style:--x="{mote[0]}%"
      style:--size="{mote[1]}px"
      style:--duration="{mote[2]}s"
      style:--delay="{mote[3]}s"
      style:--drift="{mote[4]}px"
    ></i>{/each}
</div>
