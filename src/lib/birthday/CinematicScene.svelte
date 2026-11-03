<script lang="ts">
  import { onMount, tick, type Snippet } from 'svelte';
  import { galleryPhotos } from './media';
  import { range, type CinemaDriver, type CinemaMode } from './cinema/types';
  import './styles/cinema.css';
  let {
    mode,
    id,
    locked = false,
    reduced = false,
    paused = false,
    onactive,
    children,
  }: {
    mode: Exclude<CinemaMode, 'candle'>;
    id: string;
    locked?: boolean;
    reduced?: boolean;
    paused?: boolean;
    onactive?: (active: boolean) => void;
    children?: Snippet<[boolean]>;
  } = $props();
  let section: HTMLElement, canvas: HTMLCanvasElement;
  let status = $state<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  let arrived = $state(false);
  const interactive = $derived(!locked && (reduced || status === 'fallback' || arrived));
  let driver: CinemaDriver | undefined;
  const lifetime = new AbortController();
  let focusRequested = false;
  let frame = 0,
    mounted = false,
    destroyed = false,
    near = false,
    active = false;
  let currentProgress = 0;
  function activity(value: boolean) {
    if (value === active) return;
    active = value;
    onactive?.(value);
  }
  function fail() {
    driver?.destroy();
    driver = undefined;
    if (!destroyed) status = 'fallback';
    activity(false);
  }
  async function initialize() {
    if (!mounted || destroyed || reduced || paused || driver || status === 'loading' || status === 'fallback')
      return;
    status = 'loading';
    try {
      const { createCinema } = await import('./cinema/engine');
      if (destroyed) return;
      const result = await createCinema(canvas, mode, galleryPhotos, fail, lifetime.signal);
      if (destroyed) {
        result.destroy();
        return;
      }
      driver = result;
      status = 'ready';
      await tick();
      if (destroyed) return;
      driver.resize();
      schedule();
    } catch {
      if (!destroyed) fail();
    }
  }
  function draw() {
    frame = 0;
    if (destroyed || !mounted) return;
    const rect = section.getBoundingClientRect();
    const visible = rect.top < innerHeight && rect.bottom > 0;
    currentProgress = locked
      ? 0
      : Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)));
    arrived = currentProgress >= 0.92;
    section.style.setProperty('--cinema-copy', String(
      1 - (mode === 'gallery'
        ? range(currentProgress, 0.035, 0.17)
        : range(currentProgress, 0.12, 0.4)),
    ));
    section.style.setProperty(
      '--cinema-end',
      String(mode === 'gallery'
        ? range(currentProgress, 0.82, 0.92)
        : range(currentProgress, 0.5, 0.68) * (1 - range(currentProgress, 0.81, 0.94))),
    );
    section.style.setProperty('--book-opacity', String(range(currentProgress, 0.83, 0.94)));
    section.style.setProperty(
      '--canvas-opacity',
      String(mode === 'book' ? 1 - range(currentProgress, 0.83, 0.94) : 1),
    );
    section.dataset.progress = currentProgress.toFixed(3);
    const running =
      visible && !paused && !reduced && status === 'ready' && !(mode === 'book' && currentProgress >= 0.94);
    driver?.update(currentProgress);
    driver?.setPaused(!running);
    activity(running);
    const nativeBounds = focusRequested
      ? section.querySelector<HTMLElement>('#sbBook')?.getBoundingClientRect()
      : undefined;
    if (
      mode === 'book' &&
      interactive &&
      focusRequested &&
      nativeBounds &&
      nativeBounds.top >= 0 &&
      nativeBounds.bottom <= innerHeight
    ) {
      focusRequested = false;
      tick().then(() => {
        if (!destroyed) section.querySelector<HTMLElement>('#sketchbook')?.focus({ preventScroll: true });
      });
    }
  }
  export function seekBook(animate = true) {
    if (!section || locked) return;
    focusRequested = true;
    const top =
      section.getBoundingClientRect().top + scrollY + Math.max(0, section.offsetHeight - innerHeight);
    scrollTo({ top, behavior: reduced || !animate ? 'instant' : 'smooth' });
    schedule();
  }
  function schedule() {
    if (!frame && mounted && (near || reduced || status === 'fallback')) frame = requestAnimationFrame(draw);
  }
  function resize() {
    driver?.resize();
    schedule();
  }
  onMount(() => {
    mounted = true;
    const observer = new IntersectionObserver(
      (entries) => {
        near = entries.some((entry) => entry.isIntersecting);
        if (near) {
          initialize();
          schedule();
        } else {
          driver?.setPaused(true);
          activity(false);
        }
      },
      { rootMargin: '600px' },
    );
    observer.observe(section);
    const layout = new ResizeObserver(resize);
    layout.observe(section);
    schedule();
    return () => {
      destroyed = true;
      mounted = false;
      observer.disconnect();
      layout.disconnect();
      cancelAnimationFrame(frame);
      lifetime.abort();
      driver?.destroy();
      activity(false);
    };
  });
  $effect(() => {
    const stop = paused || reduced;
    if (stop) {
      driver?.setPaused(true);
      activity(false);
    } else if (mounted && near) {
      initialize();
      schedule();
    }
  });
</script>

<svelte:window onscroll={schedule} onresize={resize} />
<section
  {id}
  bind:this={section}
  class="cinema-stage cinema-{mode}"
  class:is-static={reduced || status === 'fallback'}
  class:is-interactive={interactive}
  class:is-locked={locked}
  data-cinema-state={status}
  aria-label={mode === 'book'
    ? 'Buku untuk Sopia, dari Faridz'
    : 'Galeri foto Sopia dan surat kecil dari Faridz'}
>
  <div class="cinema-pin">
    <canvas bind:this={canvas} class="cinema-canvas" hidden={status !== 'ready' || reduced} aria-hidden="true"
    ></canvas>
    {#if mode === 'gallery' && status === 'ready' && !reduced}
      <ul class="cinema-photo-descriptions" aria-label="Foto dalam galeri">
        {#each galleryPhotos as photo (photo.src)}<li>{photo.alt}</li>{/each}
      </ul>
    {/if}
    {#if mode === 'gallery' && (status !== 'ready' || reduced)}
      <div class="cinema-gallery-fallback">
        {#each galleryPhotos as photo (photo.src)}<img
            src={photo.src}
            alt={photo.alt}
            width="567"
            height="1280"
            loading="lazy"
            draggable="false"
          />{/each}
      </div>
    {:else if mode === 'book' && status !== 'ready' && !interactive}
      <div class="cinema-cover-fallback" aria-hidden="true">
        <span>7 november</span><em>sebuah buku kecil</em><span>untuk</span><strong>sopia.</strong>
        <span class="cinema-cover-seal">f / s</span><em
          >dari faridz</em
        >
      </div>
    {/if}
    <div class="cinema-copy">
      {#if mode === 'gallery'}
        <h2>dari semua<br />hal indah,<br /><em>kamu.</em></h2>
        <p>yang ingin aku rayakan.<br />yang ingin aku bahagiakan.</p>
      {:else if locked}
        <h2>belum saatnya.<br /><em>sebentar lagi, ya.</em></h2>
        <p>buku ini menunggumu.<br />terbuka pada 7 november, pukul 00.00 wib.</p>
      {:else}
        <h2>sedikit cerita.<br /><em>banyak rasa.</em></h2>
        <p>aku simpan di antara halaman,<br />supaya bisa kamu buka kapan pun.</p>
      {/if}
    </div>
    {#if !locked}<div class="cinema-end-copy" aria-hidden="true">
      <p>{mode === 'gallery' ? 'aku sayang kamu, sopia.' : 'sepuluh halaman. satu hati untukmu.'}</p>
      <span>dari faridz</span>
    </div>{/if}
    {#if mode === 'book' && children && !locked}
      <button
        class="cinema-skip"
        type="button"
        hidden={interactive}
        aria-controls="sketchbook"
        onclick={(event) => seekBook(event.detail !== 0)}>buka buku sekarang</button
      >
      <div class="book-handoff" inert={!interactive} aria-hidden={!interactive}>
        {@render children(interactive)}
      </div>
    {/if}
    <div class="cinema-edge-note" aria-hidden="true">
      <span>{mode === 'gallery' ? 'potongan waktu, rasa sayangku.' : 'untuk sopia, dari pacarmu.'}</span><span
        >{locked ? 'sampai waktunya tiba.' : 'lanjutkan menggulir ↓'}</span
      >
    </div>
  </div>
</section>
