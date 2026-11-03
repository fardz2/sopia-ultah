<script lang="ts">
  import { onMount, tick } from 'svelte';
  let { reduced=false, hidden=false, world=false, progress=$bindable(0), onback, onfinale }: {
    reduced?:boolean; hidden?:boolean; world?:boolean; progress?:number; onback:()=>void; onfinale:()=>void;
  }=$props();
  let panel:HTMLElement, stage:HTMLDivElement;
  let nextButton=$state<HTMLButtonElement>();
  let blowing=$state(false);
  const blown=$derived(progress>=1);
  let frame=0,started=0,destroyed=false;
  function paint(value:number){progress=value;stage?.style.setProperty('--blow-progress',String(value));}
  function finish(){
    cancelAnimationFrame(frame);frame=0;paint(1);blowing=false;
    tick().then(()=>{if(!destroyed&&!hidden)nextButton?.focus({preventScroll:true});});
  }
  function animate(now:number){
    frame=0;if(destroyed)return;
    const value=Math.min(1,(now-started)/850);paint(value);
    if(value>=1)finish();else frame=requestAnimationFrame(animate);
  }
  function blow(){
    if(blowing||blown)return;if(reduced){finish();return;}
    blowing=true;started=performance.now();frame=requestAnimationFrame(animate);
  }
  onMount(()=>{panel.focus({preventScroll:true});paint(progress);return()=>{destroyed=true;cancelAnimationFrame(frame);};});
  $effect(()=>{if((hidden||reduced)&&blowing)finish();});
</script>


<section class="wish-ritual" bind:this={panel} tabindex="-1" aria-labelledby="birthdayCandleTitle">
  <h2 id="birthdayCandleTitle">satu doa untukmu,<br /><em>sayang.</em></h2>
  <p class="wish-invitation">pejamkan mata sebentar.<br />simpan satu doa, lalu padamkan lilinnya.</p>
  <div
    class="wish-candle-stage"
    bind:this={stage}
    class:is-blown={blown}
    data-candle-state={blown ? 'blown' : blowing ? 'blowing' : 'lit'}
    data-renderer={world ? 'shared-three' : 'static'}
    data-world-target="candle"
    aria-hidden="true"
  >
    {#if !world}
      <div class="wish-candle-static">
        <span class="wish-candle-flame"></span><span class="wish-candle-wick"></span><span
          class="wish-candle-wax"
        ></span><span class="wish-candle-plate"></span>
      </div>
      <svg class="wish-candle-smoke" viewBox="0 0 300 300"
        ><path
          d="M150 135c20-25-15-35 3-60s-8-32 8-48"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        /></svg
      >
    {/if}
  </div>
  <p class="wish-result" role="status" aria-live="polite">
    {blown
      ? 'Semoga doamu menemukan jalannya. Aku ikut mengaminkannya.'
      : 'satu lilin kecil, untuk semua harapan baikmu.'}
  </p>
  <div class="ritual-actions">
    {#if !blown}<button
        id="birthdayBlow"
        class="birthday-control birthday-control-primary"
        type="button"
        disabled={blowing}
        onclick={blow}>{blowing ? 'lilinnya sedang padam…' : 'tiup lilinnya'}</button
      >
    {:else}<button
        id="birthdayCandleNext"
        bind:this={nextButton}
        class="birthday-control birthday-control-primary"
        type="button"
        onclick={onfinale}>lihat kejutan terakhir</button
      >{/if}
    <button class="birthday-control" type="button" onclick={onback}>kembali ke surat</button>
  </div>
</section>
