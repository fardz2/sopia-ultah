<script lang="ts">
  import { onMount, tick, untrack } from 'svelte';
  import type { BirthdayExperience } from './world/experience.svelte';
  import type { ScreenRect } from './world/types';
  import { mediaPages } from './media';
  import type { BookCommand } from './world/bookState';
  import './styles/world-book.css';
  let { experience: e, spread, video, active = true, hidden = false, onbusy }: {
    experience: BirthdayExperience; spread: ScreenRect | null; video: ScreenRect | null;
    active?: boolean; hidden?: boolean; onbusy?: (busy: boolean) => void;
  } = $props();
  let player = $state<HTMLVideoElement>();
  let requested = $state(false), error = $state(false), showLoupe = $state(false);
  let playbackRun = 0, dead = false, ignoreClick = 0;
  let drag: { x: number; y: number; previous: number; time: number; velocity: number; direction: 'next'|'prev'; started: boolean; distance: number } | null = null;
  const page = $derived(mediaPages[e.book.index]);
  const visible = $derived(active && !hidden && !!spread);
  const bounds = (r: ScreenRect | null) => r ? `left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px` : '';
  function stopVideo() { playbackRun++; player?.pause(); requested = false; e.videoPlaying = false; error = false; }
  function command(value: BookCommand) { stopVideo(); showLoupe = false; e.dispatch(value); }
  function step(direction: 'next'|'prev') { command({type:'step',direction,at:performance.now()}); }
  async function playVideo() {
    const run = ++playbackRun, index = e.book.index;
    requested = true; error = false; showLoupe = false; e.loupe.on = false;
    onbusy?.(true); await tick(); const media = player;
    if (dead || run !== playbackRun || !media) return;
    try { await media.play(); }
    catch (reason) {
      if (dead || run !== playbackRun || player !== media || index !== e.book.index) return;
      requested = false; e.videoPlaying = false;
      error = !(reason instanceof DOMException && reason.name === 'AbortError');
    }
    if (run !== playbackRun) media.pause();
  }
  function down(event: PointerEvent) {
    if (!spread || event.button !== 0) return;
    const direction = event.clientX < spread.x + spread.width/2 ? 'prev' : 'next';
    drag = {x:event.clientX,y:event.clientY,previous:event.clientX,time:performance.now(),velocity:0,direction,started:false,distance:0};
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (!spread) return;
    e.loupe.u = Math.max(0,Math.min(1,(event.clientX-spread.x)/spread.width));
    e.loupe.v = Math.max(0,Math.min(1,(event.clientY-spread.y)/spread.height));
    showLoupe = e.loupe.on && event.pointerType !== 'touch' && !e.book.turn;
    if (!drag) return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if (!drag.started && Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>9) { drag=null; return; }
    if (!drag.started && Math.abs(dx)>9 && Math.abs(dx)>Math.abs(dy)) {
      stopVideo(); e.dispatch({type:'drag-start',direction:drag.direction}); drag.started=true;
    }
    if (!drag.started) return;
    const now=performance.now(); drag.velocity=(event.clientX-drag.previous)/Math.max(1,now-drag.time);
    drag.previous=event.clientX;drag.time=now;
    drag.distance=Math.max(0,(drag.direction==='next'?-dx:dx)/(spread.width/2));
    e.dispatch({type:'drag',progress:Math.min(1,drag.distance)});event.preventDefault();
  }
  function up(cancel=false) {
    if(drag?.started){
      const commit=!cancel&&(drag.distance>.42||(drag.direction==='next'?-drag.velocity:drag.velocity)>1.1);
      e.dispatch({type:'release',commit,at:performance.now()});ignoreClick=performance.now()+350;
    }
    drag=null;
  }
  function click(event: MouseEvent) {
    if(performance.now()<ignoreClick||!spread)return;
    step(event.clientX<spread.x+spread.width/2?'prev':'next');
  }
  function key(event: KeyboardEvent) {
    if(!visible||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
    const target=event.target as HTMLElement;
    if(target.closest('input,textarea,select,video,details,[contenteditable="true"],dialog'))return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?'prev':'next');}
  }
  $effect(()=>{
    const index=e.book.index, turn=e.book.turn?.id;
    untrack(()=>{if(index>=0||turn) { stopVideo(); if(mediaPages[index].mediaType==='video')e.zoom=1; }});
  });
  $effect(()=>{if(!visible||hidden)untrack(stopVideo);});
  onMount(()=>()=>{dead=true;stopVideo();});
</script>
<svelte:window onkeydown={key}/>
<div class="world-book-slot" data-world-target="book" aria-hidden="true"></div>
{#if visible && spread}
  <button class="world-book-surface" style={bounds(spread)} aria-label="Balik halaman buku, sisi kiri sebelumnya dan kanan berikutnya" onpointerdown={down} onpointermove={move} onpointerup={()=>up()} onpointercancel={()=>up(true)} onpointerleave={()=>showLoupe=false} onclick={click}></button>
  {#if showLoupe && e.loupe.on && !e.book.turn && page.mediaType==='photo'}
    <div class="world-book-loupe" aria-hidden="true" style={`left:${spread.x+spread.width*e.loupe.u-85}px;top:${spread.y+spread.height*e.loupe.v-85}px`}>
      <img src={page.url} alt="" draggable="false" style={`width:${spread.width*2.3}px;height:${spread.height*2.3}px;transform:translate(${85-spread.width*2.3*e.loupe.u}px,${85-spread.height*2.3*e.loupe.v}px)`}/>
    </div>
  {/if}
  {#if video && !e.book.turn}
    <div class="world-book-video" style={bounds(video)}>
      {#if requested}
        <!-- Personal memory clips have no supplied transcript; their descriptions are in the native note below. -->
        <!-- svelte-ignore a11y_media_has_caption -->
        <video bind:this={player} src={page.videoUrl} preload="none" playsinline controls onplay={()=>{e.videoPlaying=true;onbusy?.(true);}} onpause={()=>e.videoPlaying=false} onended={()=>e.videoPlaying=false} onerror={()=>{error=true;requested=false;e.videoPlaying=false;}} aria-label={`Video ${page.title}`}></video>
      {:else}
        <button id="worldVideoPlay" class="world-video-play" onclick={playVideo}>putar video <span aria-hidden="true">↗</span></button>
      {/if}
    </div>
  {/if}
  <div class="world-book-controls" style={`top:${Math.min(innerHeight-115,spread.y+spread.height+18)}px`}>
    <div class="world-book-navigation">
      <button id="sbLeft" onclick={()=>step('prev')} aria-label="Halaman sebelumnya">←</button>
      <span aria-live="polite" id="worldBookPage">{page.title} <small>{e.book.index+1} / 10</small></span>
      <button id="sbRight" onclick={()=>step('next')} aria-label="Halaman berikutnya">→</button>
      <button id="zOut" onclick={()=>e.zoom=Math.max(.9,e.zoom-.1)} aria-label="Perkecil buku">−</button>
      <button id="zIn" onclick={()=>e.zoom=Math.min(1.5,e.zoom+.1)} aria-label="Perbesar buku">+</button>
      <button id="loupeBtn" aria-pressed={e.loupe.on} onclick={()=>{e.loupe.on=!e.loupe.on;showLoupe=e.loupe.on;}}>lup</button>
    </div>
    <details class="world-book-note"><summary>baca catatan halaman ini</summary><p>{page.description}</p></details>
    {#if error}<p role="status">video belum bisa diputar. coba lagi, ya.</p>{/if}
  </div>
{/if}
