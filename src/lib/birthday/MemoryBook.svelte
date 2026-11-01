<script lang="ts">
  import { onMount, tick } from 'svelte';
  import AnimatedText from './AnimatedText.svelte';
  import { mediaPages, type MemoryPage } from './media';
  import { reveal } from './reveal';
  type Direction = 'next' | 'prev';
  interface Turn {
    dir: Direction;
    from: number;
    to: number;
    t: number;
  }
  let {
    pages = mediaPages,
    index = $bindable(0),
    reduced = false,
    paused = false,
    onbusy,
  }: {
    pages?: readonly MemoryPage[];
    index?: number;
    reduced?: boolean;
    paused?: boolean;
    onbusy?: (busy: boolean) => void;
  } = $props();
  let section: HTMLElement, stage: HTMLDivElement, book: HTMLDivElement, loupe: HTMLDivElement;
  let player = $state<HTMLVideoElement | undefined>();
  let width = $state(0),
    current = $state(0),
    turn = $state<Turn | null>(null),
    zoom = $state(1),
    rx = $state(0),
    ry = $state(0);
  let loupeOn = $state(true),
    lx = $state(0),
    ly = $state(0),
    held = $state(false),
    hintGone = $state(false),
    playing = $state(false),
    videoError = $state(false),
    inView = $state(false);
  let targetZoom = $state(1),
    targetX = 0,
    targetY = 0,
    frame = 0,
    last = 0,
    lastWidth = 0;
  let motion: { target: number; from: number; started: number; duration: number; done: () => void } | null =
    null;
  let playbackRun = 0,
    disposed = false;
  let drag: {
    dir: Direction;
    x: number;
    width: number;
    moved: number;
    velocity: number;
    previous: number;
  } | null = null;
  let glassDrag: { x: number; y: number; lx: number; ly: number } | null = null,
    glassTarget: { x: number; y: number } | null = null;
  const N = 18,
    SPAN = 0.449,
    BETA = 0.6,
    MAG = 2.3;
  const height = $derived((width * 1240) / 1760);
  const page = $derived(pages[current]);
  const geometry = $derived.by(() => {
    const t = turn?.t ?? 0,
      beta = BETA * Math.sin(Math.PI * t);
    return {
      tt: ((Math.PI * t + beta) * 180) / Math.PI,
      td: (((2 * beta) / N) * 180) / Math.PI,
      shade: Math.sin(Math.PI * t),
    };
  });
  const radius = $derived(Math.round(Math.max(165, Math.min(262, width * 0.235))) / 2);
  const lens = $derived.by(() => {
    if (!width) return { opacity: 0, mask: 'none', transform: '' };
    const cx = width / 2,
      cy = height / 2,
      x0 = cx + (width * 0.051 - cx) * zoom,
      x1 = cx + (width * 0.949 - cx) * zoom,
      y0 = cy + (height * 0.218 - cy) * zoom,
      y1 = cy + (height * 0.782 - cy) * zoom;
    const nx = Math.max(x0, Math.min(lx, x1)),
      ny = Math.max(y0, Math.min(ly, y1));
    const inside =
      lx > x0 && lx < x1 && ly > y0 && ly < y1
        ? Math.min(lx - x0, x1 - lx, ly - y0, y1 - ly)
        : -Math.hypot(lx - nx, ly - ny);
    const opacity = loupeOn ? Math.max(0, Math.min(1, (inside + radius * 0.3) / (radius * 0.55))) : 0;
    const px = cx + (lx - cx) / zoom,
      py = cy + (ly - cy) / zoom,
      scale = MAG * zoom;
    return {
      opacity,
      mask: `radial-gradient(circle ${radius * (1 - 0.116)}px at ${lx}px ${ly}px,#000 calc(100% - 1px),transparent 100%)`,
      transform: `translate(${lx - px * scale}px,${ly - py * scale}px) scale(${scale})`,
    };
  });
  function stopVideo() {
    playbackRun++;
    player?.pause();
    playing = false;
    videoError = false;
  }
  async function playVideo() {
    const request = ++playbackRun;
    const pageAtRequest = current;
    playing = true;
    videoError = false;
    await tick();
    const media = player;
    if (disposed || request !== playbackRun || !media) return;
    try {
      await media.play();
    } catch (error) {
      if (disposed || request !== playbackRun || media !== player || current !== pageAtRequest) return;
      playing = false;
      videoError = !(error instanceof DOMException && error.name === 'AbortError');
    }
  }
  function kick() {
    if (!frame && !paused) {
      last = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }
  function animate(now: number) {
    frame = 0;
    if (paused) return;
    const dt = Math.min(0.08, (now - last) / 1000 || 0.016);
    last = now;
    if (motion && turn) {
      const s = motion;
      const progress = Math.min(1, (now - s.started) / s.duration);
      turn.t = s.from + (s.target - s.from) * (1 - (1 - progress) ** 3);
      if (progress >= 1) {
        turn.t = s.target;
        motion = null;
        s.done();
      }
    }
    let moving = false;
    for (const key of ['x', 'y', 'zoom'] as const) {
      const value = key === 'x' ? rx : key === 'y' ? ry : zoom,
        target = key === 'x' ? targetX : key === 'y' ? targetY : targetZoom;
      const delta = target - value;
      const next = Math.abs(delta) > 0.0006 ? value + delta * (1 - Math.exp(-dt * 16)) : target;
      if (Math.abs(delta) > 0.0006) moving = true;
      if (key === 'x') rx = next;
      else if (key === 'y') ry = next;
      else zoom = next;
    }
    if (glassTarget && !held) {
      const dx = glassTarget.x - lx,
        dy = glassTarget.y - ly;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        lx = glassTarget.x;
        ly = glassTarget.y;
        glassTarget = null;
      } else {
        const ease = 1 - Math.exp(-dt * 18);
        lx += dx * ease;
        ly += dy * ease;
        moving = true;
      }
    }
    if (motion || moving) frame = requestAnimationFrame(animate);
  }
  function setView(x: number, y: number, z: number) {
    targetX = Math.max(-4.5, Math.min(4.5, x));
    targetY = Math.max(-7, Math.min(7, y));
    targetZoom = Math.max(0.9, Math.min(1.5, z));
    if (reduced) {
      rx = targetX;
      ry = targetY;
      zoom = targetZoom;
    } else kick();
  }
  function settle() {
    if (turn) {
      current = turn.to;
      index = current;
      turn = null;
    }
    if (pages[current].mediaType === 'video') resetVideoView();
    motion = null;
    onbusy?.(false);
  }
  function resetVideoView() {
    rx = ry = targetX = targetY = 0;
    zoom = targetZoom = 1;
    glassTarget = null;
  }
  function startTurn(dir: Direction) {
    stopVideo();
    settle();
    const from = current;
    turn = { dir, from, to: (from + (dir === 'next' ? 1 : -1) + pages.length) % pages.length, t: 0 };
    onbusy?.(true);
    if (loupeOn && !held && width) {
      const nx = (width / 2 + (lx - width / 2) / zoom) / width,
        ny = (height / 2 + (ly - height / 2) / zoom) / height;
      if (nx > 0.02 && nx < 0.98 && ny > 0.17 && ny < 0.83) {
        glassTarget = { x: width * (dir === 'next' ? 0.12 : 0.88), y: height * 0.855 };
      }
    }
  }
  function finish() {
    if (!turn) return;
    current = turn.to;
    index = current;
    turn = null;
    motion = null;
    onbusy?.(false);
    if (pages[current].mediaType === 'video') resetVideoView();
  }
  function commit() {
    if (!turn) return;
    if (reduced) {
      finish();
      return;
    }
    motion = {
      target: 1,
      from: turn.t,
      started: performance.now(),
      duration: Math.max(80, 280 * (1 - turn.t)),
      done: finish,
    };
    kick();
  }
  function cancel() {
    if (!turn || turn.t < 0.001) {
      turn = null;
      motion = null;
      onbusy?.(false);
      return;
    }
    motion = {
      target: 0,
      from: turn.t,
      started: performance.now(),
      duration: Math.max(90, 180 * turn.t),
      done: () => {
        turn = null;
        motion = null;
        onbusy?.(false);
      },
    };
    kick();
  }
  function step(dir: Direction) {
    hintGone = true;
    startTurn(dir);
    commit();
  }
  function navigate(next: number) {
    next = (next + pages.length) % pages.length;
    if (next === current && !turn) return;
    settle();
    const forward = (next - current + pages.length) % pages.length,
      back = (current - next + pages.length) % pages.length;
    if (Math.min(forward, back) === 1) {
      step(forward === 1 ? 'next' : 'prev');
      return;
    }
    stopVideo();
    current = next;
    index = next;
    if (pages[current].mediaType === 'video') resetVideoView();
  }
  function pointerDown(event: PointerEvent) {
    if (
      event.button !== 0 ||
      !(event.target instanceof Element) ||
      event.target.closest('.sb-video-play,.sb-media-player,.sb-arrow,.loupe')
    )
      return;
    if (!event.target.closest('#sbBook')) return;
    event.preventDefault();
    hintGone = true;
    stage.setPointerCapture(event.pointerId);
    const rect = book.getBoundingClientRect();
    const dir: Direction = (event.clientX - rect.left) / rect.width > 0.5 ? 'next' : 'prev';
    if (!reduced) startTurn(dir);
    drag = { dir, x: event.clientX, width: rect.width, moved: 0, velocity: 0, previous: performance.now() };
  }
  function pointerMove(event: PointerEvent) {
    if (!drag || reduced) return;
    const dx = event.clientX - drag.x;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    const t = Math.max(0, Math.min(1, (drag.dir === 'next' ? -dx : dx) / (drag.width * 0.62)));
    const now = performance.now();
    drag.velocity = (t - (turn?.t ?? 0)) / Math.max(0.001, (now - drag.previous) / 1000);
    drag.previous = now;
    if (turn) turn.t = t;
  }
  function pointerUp() {
    if (!drag) return;
    const end = drag;
    drag = null;
    if (reduced) {
      step(end.dir);
      return;
    }
    if (!turn) return;
    if (end.moved < 6 || turn.t > 0.42 || end.velocity > 1.1) commit();
    else cancel();
  }
  function pointerCancel() {
    if (!drag) return;
    drag = null;
    cancel();
  }
  function tilt(event: PointerEvent) {
    if (paused || reduced || drag || event.pointerType === 'touch' || page.mediaType === 'video' || !book)
      return;
    const rect = book.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight) return;
    if (event.target instanceof Element && event.target.closest('.sb-media-player,.sb-video-play')) return;
    const nx = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width * 0.62))),
      ny = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height * 0.9)));
    setView(-ny * 4.5, nx * 7, targetZoom);
  }
  function keydown(event: KeyboardEvent) {
    if (
      paused ||
      !book ||
      !['ArrowLeft', 'ArrowRight'].includes(event.key) ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      document.querySelector('dialog[open]')
    )
      return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.matches('input,textarea,video,audio') ||
        target.isContentEditable ||
        target.closest('[controls]'))
    )
      return;
    const rect = book.getBoundingClientRect();
    if (rect.top >= innerHeight || rect.bottom <= 0) return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 'next' : 'prev');
  }
  function grabGlass(event: PointerEvent) {
    if (!loupeOn || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    glassTarget = null;
    held = true;
    glassDrag = { x: event.clientX, y: event.clientY, lx, ly };
    loupe.setPointerCapture(event.pointerId);
    hintGone = true;
  }
  function moveGlass(event: PointerEvent) {
    if (!glassDrag) return;
    lx = Math.max(-radius * 0.7, Math.min(width + radius * 0.7, glassDrag.lx + event.clientX - glassDrag.x));
    ly = Math.max(-radius * 0.7, Math.min(height + radius, glassDrag.ly + event.clientY - glassDrag.y));
  }
  function dropGlass() {
    held = false;
    glassDrag = null;
  }
  function lighting(i: number) {
    const tt = (geometry.tt * Math.PI) / 180,
      td = (geometry.td * Math.PI) / 180,
      l1 = Math.abs(Math.cos(tt - i * td)),
      l2 = Math.abs(Math.cos(tt - (i + 1) * td));
    return `--lit:${l1};--a1:${(1 - l1) * 0.62};--a2:${(1 - l2) * 0.62}`;
  }
  function facePosition(i: number, front: boolean) {
    const a = -(width * 0.5 + (i * width * SPAN) / N),
      b = ((i + 1) * width * SPAN) / N - width * 0.5;
    return (turn?.dir === 'next') === front ? a : b;
  }
  $effect(() => {
    if (width && width !== lastWidth) {
      lastWidth = width;
      lx = width * 0.88;
      ly = height * 0.855;
    }
  });
  $effect(() => {
    const requested = index;
    if (requested !== current && requested !== turn?.to) navigate(requested);
  });
  $effect(() => {
    if (paused) {
      cancelAnimationFrame(frame);
      frame = 0;
      player?.pause();
      drag = null;
      glassDrag = null;
      held = false;
      settle();
    } else if (motion) kick();
  });
  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
    });
    observer.observe(section);
    pages.forEach((page) => {
      const image = new Image();
      image.src = page.url;
      image.decode().catch(() => {});
    });
    return () => {
      disposed = true;
      playbackRun++;
      observer.disconnect();
      cancelAnimationFrame(frame);
      player?.pause();
    };
  });
</script>

<svelte:window onpointermove={tilt} onkeydown={keydown} onblur={() => setView(0, 0, targetZoom)} />
{#snippet strip(i: number)}
  {#if turn && i < N}<div class="strip" class:edge={i === N - 1} style={lighting(i)}>
      <div
        class="face front"
        style:background-image="url('{pages[turn.from].url}')"
        style:background-position-x="{facePosition(i, true)}px"
      >
        <div class="sh"></div>
        <div class="gl"></div>
      </div>
      <div
        class="face back"
        style:background-image="url('{pages[turn.to].url}')"
        style:background-position-x="{facePosition(i, false)}px"
      >
        <div class="sh"></div>
        <div class="gl"></div>
      </div>
      {@render strip(i + 1)}
    </div>{/if}
{/snippet}
{#snippet spread(magnified = false)}
  {#if turn}
    <div class="sb-half left">
      <img
        class="sb-half-img left"
        src={pages[turn.dir === 'next' ? turn.from : turn.to].url}
        alt=""
        draggable="false"
      />
      <div class="gutter-shade left"></div>
    </div>
    <div class="sb-half right">
      <img
        class="sb-half-img right"
        src={pages[turn.dir === 'next' ? turn.to : turn.from].url}
        alt=""
        draggable="false"
      />
      <div class="gutter-shade right"></div>
    </div>
    <div class="curl {turn.dir}" style:--n={N} style:--span={SPAN}>{@render strip(0)}</div>
  {:else}
    <div class="sb-full">
      <img
        src={page.url}
        alt={magnified ? '' : page.title + (page.description ? '. ' + page.description : '')}
        draggable="false"
      />
      {#if !magnified && page.mediaType === 'video'}
        {#if videoError}<p class="sb-media-error" role="alert">Video tidak dapat diputar di perangkat ini.</p>
        {:else if playing}
          <!-- svelte-ignore a11y_media_has_caption (Personal memory clips have no supplied caption track.) -->
          <video
            bind:this={player}
            class="sb-media-player"
            src={page.videoUrl}
            controls
            playsinline
            preload="none"
            aria-label={page.title}
            onpointerdown={(event) => event.stopPropagation()}
            onerror={(event) => {
              if (event.currentTarget !== player || event.currentTarget.getAttribute('src') !== page.videoUrl)
                return;
              playing = false;
              videoError = true;
            }}
          ></video>
        {:else}<button
            type="button"
            class="sb-video-play"
            aria-label="Putar {page.title}"
            onpointerdown={(event) => event.stopPropagation()}
            onclick={(event) => {
              event.stopPropagation();
              playVideo();
            }}
            ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg
            ></button
          >{/if}
      {/if}
    </div>
  {/if}
{/snippet}

<section id="sketchbook" class="hero" bind:this={section} aria-label="Buku kenangan" tabindex="-1">
  <img
    class="botany l"
    class:is-swaying={inView}
    src="/landing-pages/meng-to-sketchbook/botany-left.png"
    alt=""
    aria-hidden="true"
  />
  <img
    class="botany r"
    class:is-swaying={inView}
    src="/landing-pages/meng-to-sketchbook/botany-right.png"
    alt=""
    aria-hidden="true"
  />
  <div class="book-intro">
    <AnimatedText as="h2" text="ada cerita di setiap halaman." {reduced} />
    <p {@attach reveal()}>tujuh foto, tiga video, dan banyak hal yang ingin diingat.</p>
  </div>
  <div class="sb-wrap" id="sbWrap" class:video-page={!turn && page.mediaType === 'video'}>
    <!-- svelte-ignore a11y_no_static_element_interactions (Pointer gestures duplicate the accessible previous/next buttons.) -->
    <div
      class="sb-stage"
      id="sbStage"
      bind:this={stage}
      onpointerdown={pointerDown}
      onpointermove={pointerMove}
      onpointerup={pointerUp}
      onpointercancel={pointerCancel}
      ondblclick={() => setView(targetX, targetY, 1)}
      ondragstart={(event) => event.preventDefault()}
    >
      <button class="sb-arrow left" id="sbLeft" aria-label="Halaman sebelumnya" onclick={() => step('prev')}
        ><svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true"
          ><polyline
            points="11,3 3,22 11,41"
            stroke="currentColor"
            stroke-width="1.1"
            stroke-linecap="round"
            stroke-linejoin="round"
          /></svg
        ></button
      >
      <div
        class="sb-3d"
        id="sb3d"
        bind:clientWidth={width}
        style:--bw="{width}px"
        style:--rx="{rx}deg"
        style:--ry="{ry}deg"
        style:--zoom={zoom}
        style:--tt="{geometry.tt}deg"
        style:--td="{geometry.td}deg"
        style:--shade={geometry.shade}
      >
        <div class="sb-tilt" id="sbTilt">
          <div class="sb-cast ambient" aria-hidden="true"></div>
          <div class="sb-cast contact" aria-hidden="true"></div>
          <div class="sb-cast hair" aria-hidden="true"></div>
          <div class="sb-book" id="sbBook" bind:this={book}>{@render spread()}</div>
        </div>
        <div
          class="zoomwrap"
          id="zoomWrap"
          aria-hidden="true"
          style:opacity={lens.opacity}
          style:mask-image={lens.mask}
          style:-webkit-mask-image={lens.mask}
        >
          <div class="zoominner" id="zoomInner" style:transform={lens.transform}>{@render spread(true)}</div>
        </div>
        <div
          class="loupe"
          id="loupe"
          bind:this={loupe}
          class:on={loupeOn}
          class:held
          style:--lr="{radius * 2}px"
          style:transform="translate3d({lx - radius}px,{ly - radius}px,0)"
          aria-hidden="true"
          onpointerdown={grabGlass}
          onpointermove={moveGlass}
          onpointerup={dropGlass}
          onpointercancel={dropGlass}
        >
          <span class="grip"></span><span class="ring"
            ><span class="lens"><span class="mag"></span></span></span
          >
        </div>
      </div>
      <button class="sb-arrow right" id="sbRight" aria-label="Halaman berikutnya" onclick={() => step('next')}
        ><svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true"
          ><polyline
            points="3,3 11,22 3,41"
            stroke="currentColor"
            stroke-width="1.1"
            stroke-linecap="round"
            stroke-linejoin="round"
          /></svg
        ></button
      >
    </div>
    <div class="sb-captions" id="sbCaptions">
      {#if turn}<p
          class="sb-caption live"
          style:opacity={1 - Math.max(0, Math.min(1, (turn.t - 0.1) / 0.28))}
        >
          {pages[turn.from].title}
        </p>
        <p class="sb-caption live" style:opacity={Math.max(0, Math.min(1, (turn.t - 0.56) / 0.3))}>
          {pages[turn.to].title}
        </p>{:else}<p class="sb-caption">{page.title}</p>{/if}
    </div>
    <div class="sb-tools" role="group" aria-label="Kontrol tampilan buku">
      <button
        class="tool"
        id="zOut"
        aria-label="Perkecil tampilan"
        disabled={targetZoom <= 0.901}
        onclick={() => {
          setView(targetX, targetY, targetZoom / 1.16);
          hintGone = true;
        }}
        ><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
          ><circle cx="8.6" cy="8.6" r="5.6" /><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8" /></svg
        ></button
      ><span class="zoom-read" id="zRead">{Math.round(targetZoom * 100)}%</span><button
        class="tool"
        id="zIn"
        aria-label="Perbesar tampilan"
        disabled={targetZoom >= 1.499}
        onclick={() => {
          setView(targetX, targetY, targetZoom * 1.16);
          hintGone = true;
        }}
        ><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
          ><circle cx="8.6" cy="8.6" r="5.6" /><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8M8.6 6.2v4.8" /></svg
        ></button
      ><span class="tool-sep" aria-hidden="true"></span><button
        class="tool"
        id="loupeBtn"
        aria-label="Nyalakan atau matikan kaca pembesar"
        aria-pressed={loupeOn}
        onclick={() => (loupeOn = !loupeOn)}
        ><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
          ><circle cx="8.8" cy="8.8" r="5.8" /><path d="M13 13l4.4 4.4M6.4 7.2a3.2 3.2 0 0 1 2.4-1.4" /></svg
        ></button
      >
    </div>
    <p class="sb-hint" id="sbHint" class:gone={hintGone}>
      Seret halaman untuk membalik · geser kaca pembesar untuk melihat lebih dekat
    </p>
  </div>
  <button
    class="hero-down"
    id="heroDown"
    aria-label="Lihat catatan kecil"
    onclick={() =>
      document
        .getElementById('about')
        ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })}
    ><svg viewBox="0 0 44 22" width="34" height="17" fill="none" aria-hidden="true"
      ><polyline points="3,3 22,11 41,3" stroke="currentColor" stroke-width="1.1" /><polyline
        points="3,11 22,19 41,11"
        stroke="currentColor"
        stroke-width="1.1"
      /></svg
    ></button
  >
</section>
