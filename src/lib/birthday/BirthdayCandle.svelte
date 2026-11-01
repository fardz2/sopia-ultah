<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { CinemaDriver } from './cinema/types';
  let {
    reduced = false,
    hidden = false,
    onback,
    onfinale,
  }: { reduced?: boolean; hidden?: boolean; onback: () => void; onfinale: () => void } = $props();
  let panel: HTMLElement, stage: HTMLDivElement, canvas: HTMLCanvasElement;
  let nextButton = $state<HTMLButtonElement>();
  let ready = $state(false),
    failed = $state(false),
    blowing = $state(false),
    blown = $state(false);
  let driver: CinemaDriver | undefined;
  let mounted = false,
    destroyed = false,
    visible = false,
    loading = false,
    frame = 0,
    started = 0,
    progress = 0;
  const lifetime = new AbortController();
  function sync() {
    driver?.update(progress);
    driver?.setPaused(hidden || reduced || !visible);
  }
  function fail() {
    driver?.destroy();
    driver = undefined;
    if (!destroyed) {
      failed = true;
      ready = false;
    }
  }
  async function initialize() {
    if (loading || driver || reduced || failed || !mounted || destroyed || hidden) return;
    loading = true;
    try {
      const { createCinema } = await import('./cinema/engine');
      if (destroyed) return;
      const result = await createCinema(canvas, 'candle', [], fail, lifetime.signal);
      if (destroyed) {
        result.destroy();
        return;
      }
      driver = result;
      ready = true;
      await tick();
      if (destroyed) return;
      driver.resize();
      sync();
    } catch {
      if (!destroyed) fail();
    } finally {
      loading = false;
    }
  }
  function paint(value: number) {
    progress = value;
    stage?.style.setProperty('--blow-progress', String(value));
    driver?.update(value);
  }
  function finish() {
    cancelAnimationFrame(frame);
    frame = 0;
    paint(1);
    blowing = false;
    blown = true;
    tick().then(() => {
      if (!destroyed && !hidden) nextButton?.focus({ preventScroll: true });
    });
  }
  function animate(now: number) {
    frame = 0;
    if (destroyed) return;
    const value = Math.min(1, (now - started) / 850);
    paint(value);
    if (value >= 1) finish();
    else frame = requestAnimationFrame(animate);
  }
  function blow() {
    if (blowing || blown) return;
    if (reduced) {
      finish();
      return;
    }
    blowing = true;
    started = performance.now();
    frame = requestAnimationFrame(animate);
  }
  function resize() {
    driver?.resize();
    sync();
  }
  onMount(() => {
    mounted = true;
    panel.focus({ preventScroll: true });
    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      sync();
    });
    observer.observe(stage);
    initialize();
    return () => {
      destroyed = true;
      mounted = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
      lifetime.abort();
      driver?.destroy();
    };
  });
  $effect(() => {
    const stop = hidden || reduced;
    if (stop) {
      driver?.setPaused(true);
      if (blowing) finish();
    } else if (mounted) {
      initialize();
      sync();
    }
  });
</script>

<svelte:window onresize={resize} />
<section class="wish-ritual" bind:this={panel} tabindex="-1" aria-labelledby="birthdayCandleTitle">
  <h2 id="birthdayCandleTitle">satu doa untukmu,<br /><em>sayang.</em></h2>
  <p class="wish-invitation">pejamkan mata sebentar.<br />simpan satu doa, lalu padamkan lilinnya.</p>
  <div
    class="wish-candle-stage"
    bind:this={stage}
    class:is-blown={blown}
    data-candle-state={blown ? 'blown' : blowing ? 'blowing' : 'lit'}
    data-renderer={ready && !reduced ? 'three' : 'static'}
    aria-hidden="true"
  >
    <canvas bind:this={canvas} id="birthdayCandleCanvas" hidden={!ready || reduced}></canvas>
    {#if !ready || reduced}
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
