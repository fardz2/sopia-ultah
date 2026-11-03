<script lang="ts">
  import { onMount } from 'svelte';
  import BackgroundGarden from './birthday/BackgroundGarden.svelte';
  import BirthdayHero from './birthday/BirthdayHero.svelte';
  import AnimatedText from './birthday/AnimatedText.svelte';
  import MemoryBook from './birthday/MemoryBook.svelte';
  import WishSky from './birthday/WishSky.svelte';
  import CelebrationDialog from './birthday/CelebrationDialog.svelte';
  import CinematicScene from './birthday/CinematicScene.svelte';
  import { birthdayState } from './birthday/date';
  import { reveal } from './birthday/reveal';
  import { mediaPages, framePhoto, irisPhoto, wishes } from './birthday/media';
  import './birthday/styles/base.css';
  import './birthday/styles/editorial.css';
  import './birthday/styles/scroll.css';
  import './birthday/styles/background.css';
  import './birthday/styles/celebration.css';
  let { className = '', style = '' }: { className?: string; style?: string } = $props();
  let now = $state(Date.now()),
    preview = $state(false),
    reduced = $state(false),
    hidden = $state(false),
    ready = $state(false),
    greetingOpen = $state(false),
    leafReady = $state(false),
    pageIndex = $state(0),
    frameRevealed = $state(false),
    bookBusy = $state(false),
    scrolling = $state(false),
    nativeScroll = $state(false),
    galleryActive = $state(false),
    cinemaBookActive = $state(false);
  let root: HTMLDivElement;
  let bookScene = $state<{ seekBook(animate?: boolean): void }>();
  // Attachments register only the stages currently mounted. Gifts are absent
  // before release, and can appear while this tab is already open at midnight.
  const stageElements: (HTMLElement | undefined)[] = [];
  let resizeObserver: ResizeObserver | undefined;
  let scene = $state.raw({ wishesLit: 0, wishesVisible: false, covered: false });
  let scrollFrame = 0,
    clockTimer = 0,
    greetingTimer = 0,
    scrollTimer = 0,
    layoutDirty = true;
  let stages: ({ element: HTMLElement; top: number; height: number } | undefined)[] = [];
  const written = new WeakMap<HTMLElement, Map<string, string>>();
  const day = $derived(birthdayState(now, preview));
  const seen = new Set<string>();
  let pendingGreetingYear: number | undefined;
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const range = (value: number, from: number, to: number) => clamp((value - from) / (to - from));
  function storageKey(year: number) {
    return (preview ? 'sopia-birthday-preview-' : 'sopia-birthday-seen-') + year;
  }
  function markSeen(year: number) {
    const key = storageKey(year);
    seen.add(key);
    try {
      sessionStorage.setItem(key, '1');
    } catch {}
  }
  function hasSeen(year: number) {
    const key = storageKey(year);
    try {
      return seen.has(key) || sessionStorage.getItem(key) === '1';
    } catch {
      return seen.has(key);
    }
  }
  function openGreeting() {
    if (!day.unlocked) return;
    clearTimeout(greetingTimer);
    greetingTimer = 0;
    pendingGreetingYear = undefined;
    markSeen(day.year);
    greetingOpen = true;
  }
  function finishGreetingIntro() {
    greetingTimer = 0;
    const current = birthdayState(Date.now(), preview);
    if (hidden || !current.today || current.year !== pendingGreetingYear) return;
    pendingGreetingYear = undefined;
    greetingOpen = true;
  }
  function scheduleGreeting() {
    if (pendingGreetingYear === undefined || greetingTimer || hidden) return;
    if (reduced) finishGreetingIntro();
    else greetingTimer = window.setTimeout(finishGreetingIntro, 1100);
  }
  function updateClock() {
    clearTimeout(clockTimer);
    now = Date.now();
    const current = birthdayState(now, preview);
    if (!current.unlocked) greetingOpen = false;
    if (!current.today) {
      pendingGreetingYear = undefined;
      clearTimeout(greetingTimer);
      greetingTimer = 0;
    } else if (!hidden && !hasSeen(current.year)) {
      markSeen(current.year);
      pendingGreetingYear = current.year;
    }
    scheduleGreeting();
    if (!hidden) clockTimer = window.setTimeout(updateClock, 1000 - (Date.now() % 1000));
  }
  function visibility() {
    hidden = document.hidden;
    if (hidden) {
      clearTimeout(clockTimer);
      clearTimeout(greetingTimer);
      greetingTimer = 0;
    } else updateClock();
    schedule();
  }
  function readScroll() {
    scrollFrame = 0;
    if (!stageElements[0] || hidden) return;
    const y = scrollY,
      viewport = innerHeight;
    if (layoutDirty) {
      stages = stageElements.map((element) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        return { element, top: rect.top + y, height: rect.height };
      });
      layoutDirty = false;
    }
    const progress = (i: number) => {
      const stage = stages[i];
      return stage ? clamp((y - stage.top) / Math.max(1, stage.height - viewport)) : 0;
    };
    const coversViewport = (i: number) => {
      const stage = stages[i];
      return !!stage && stage.top <= y && stage.top + stage.height >= y + viewport;
    };
    const hero = reduced ? 0 : progress(0),
      frame = reduced ? 1 : progress(1),
      iris = reduced ? 1 : progress(2),
      w = reduced ? 1 : progress(3);
    if (frame > 0.55) frameRevealed = true;
    const next = {
      wishesLit: Math.floor(w * 5),
      wishesVisible: !!stages[3] && stages[3].top < y + viewport && stages[3].top + stages[3].height > y,
      covered:
        !reduced &&
        ((frame > 0.999 && coversViewport(1)) || (iris > 0.96 && coversViewport(2))),
    };
    if (
      next.wishesLit !== scene.wishesLit ||
      next.wishesVisible !== scene.wishesVisible ||
      next.covered !== scene.covered
    )
      scene = next;
    // Older browsers retain the same choreography. Variables stay on their own
    // stage, so a scroll frame never invalidates the book or the entire page.
    if (!nativeScroll) {
      writeStage(stageElements[0], { '--hero-p': hero });
      writeStage(stageElements[1], {
        '--frame-inset-y': `${34 * (1 - frame)}%`,
        '--frame-inset-x': `${30 * (1 - frame)}%`,
        '--frame-caption': range(frame, 0.55, 0.85),
        '--frame-number': 0.25 + frame * 0.75,
      });
      writeStage(stageElements[2], {
        '--iris-radius': `${iris * 78}%`,
        '--iris-heading': 1 - range(iris, 0.6, 0.95),
        '--iris-caption': range(iris, 0.5, 0.8),
      });
    }
  }
  function writeStage(element: HTMLElement | undefined, values: Record<string, string | number>) {
    if (!element) return;
    let previous = written.get(element);
    if (!previous) {
      previous = new Map();
      written.set(element, previous);
    }
    for (const [name, value] of Object.entries(values)) {
      const next = String(value);
      if (previous.get(name) === next) continue;
      element.style.setProperty(name, next);
      previous.set(name, next);
    }
  }
  function schedule() {
    if (!scrollFrame && !hidden && ready) scrollFrame = requestAnimationFrame(readScroll);
  }
  function scrolled() {
    if (!reduced) {
      scrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => (scrolling = false), 140);
    }
    schedule();
  }
  function invalidateLayout() {
    layoutDirty = true;
    schedule();
  }
  function trackStage(index: number) {
    return (element: HTMLElement) => {
      stageElements[index] = element;
      resizeObserver?.observe(element);
      invalidateLayout();
      return () => {
        resizeObserver?.unobserve(element);
        stageElements[index] = undefined;
        invalidateLayout();
      };
    };
  }
  function bookTo(index?: number) {
    if (!day.unlocked) return;
    if (index !== undefined) pageIndex = index;
    bookScene?.seekBook(!reduced);
  }
  onMount(() => {
    preview = new URLSearchParams(location.search).get('preview') === 'birthday';
    hidden = document.hidden;
    const media = matchMedia('(prefers-reduced-motion:reduce)');
    reduced = media.matches;
    nativeScroll = CSS.supports('animation-timeline: view()') && CSS.supports('animation-range: contain');
    const changed = () => {
      reduced = media.matches;
      scrolling = false;
      if (reduced && pendingGreetingYear !== undefined) {
        clearTimeout(greetingTimer);
        finishGreetingIntro();
      }
      invalidateLayout();
    };
    media.addEventListener('change', changed);
    resizeObserver = new ResizeObserver(invalidateLayout);
    resizeObserver.observe(root);
    stageElements.forEach((element) => {
      if (element) resizeObserver?.observe(element);
    });
    document.fonts.ready.then(() => {
      if (ready) invalidateLayout();
    });
    ready = true;
    updateClock();
    schedule();
    return () => {
      clearTimeout(clockTimer);
      clearTimeout(greetingTimer);
      clearTimeout(scrollTimer);
      cancelAnimationFrame(scrollFrame);
      resizeObserver?.disconnect();
      resizeObserver = undefined;
      media.removeEventListener('change', changed);
      ready = false;
    };
  });
</script>

<svelte:head
  ><title>{day.unlocked ? 'Untuk Sopia, dari Faridz — Selamat Ulang Tahun' : 'Untuk Sopia — Sebuah Kejutan dari Faridz'}</title><meta
    name="description"
    content={day.unlocked
      ? 'Hadiah ulang tahun untuk Sopia Nurfitria, dari Faridz. Cerita kecil, foto, video, dan banyak rasa sayang, setiap 7 November.'
      : 'Sebuah kejutan untuk Sopia, dari Faridz. Menunggu tanggal 7 November, pukul 00.00 WIB.'}
  /></svelte:head
>
<svelte:window
  onscroll={scrolled}
  onresize={invalidateLayout}
  onpageshow={() => {
    hidden = document.hidden;
    updateClock();
    invalidateLayout();
  }}
  onpagehide={() => {
    hidden = true;
    clearTimeout(clockTimer);
    clearTimeout(greetingTimer);
    greetingTimer = 0;
    clearTimeout(scrollTimer);
    scrolling = false;
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
  }}
/>
<svelte:document onvisibilitychange={visibility} />
<div
  bind:this={root}
  class="birthday-app {className}"
  class:motion-ready={ready}
  class:scroll-motion={!reduced}
  class:native-scroll={nativeScroll && !reduced}
  class:birthday-active={day.today}
  class:leaf-rig-ready={leafReady}
  class:background-paused={hidden ||
    greetingOpen ||
    bookBusy ||
    scrolling ||
    galleryActive ||
    cinemaBookActive}
  class:canopy-covered={scene.covered}
  data-native="svelte5"
  data-ready={ready ? '1' : '0'}
  data-birthday-state={day.today ? 'today' : 'waiting'}
  data-gift-state={day.unlocked ? (day.today ? 'birthday' : 'keepsake') : 'locked'}
  data-birthday-year={day.year}
  data-birthday-preview={preview}
  {style}
>
  <BackgroundGarden
    {reduced}
    {scrolling}
    paused={hidden ||
      greetingOpen ||
      bookBusy ||
      scene.covered ||
      galleryActive ||
      cinemaBookActive}
    onready={(value) => (leafReady = value)}
  />
  <main class="page home">
    <div class="motion-stage opening-stage" id="openingStage" {@attach trackStage(0)}>
      <BirthdayHero {day} {reduced} paused={hidden} onopen={openGreeting} />
    </div>
    {#if day.unlocked}
    <section class="motion-stage" id="frameStage" {@attach trackStage(1)} aria-labelledby="frameTitle">
      <div class="story-pin">
        <img
          class="story-photo frame-photo"
          src={framePhoto}
          alt="Sopia dan teman berfoto bersama di tengah taman dan bangunan batu."
          width="1040"
          height="780"
          loading="lazy"
          decoding="async"
          draggable="false"
        />
        <div class="frame-date" aria-label="7 November"><strong>07</strong><span>november</span></div>
        <div class="story-scrim" aria-hidden="true"></div>
        <div class="frame-caption">
          <AnimatedText
            as="h2"
            id="frameTitle"
            text="aku ingin melihatmu bahagia."
            visible={frameRevealed}
            {reduced}
          /><AnimatedText
            as="p"
            mode="words"
            text="di hari ulang tahunmu, dan di hari-hari biasa setelahnya."
            visible={frameRevealed}
            {reduced}
          />
        </div>
      </div>
    </section>
    <section class="motion-stage" id="irisStage" {@attach trackStage(2)} aria-labelledby="irisTitle">
      <div class="story-pin">
        <img
          class="story-photo iris-photo"
          src={irisPhoto}
          alt="Sopia tersenyum dengan hamparan hijau dan pegunungan di belakangnya."
          width="567"
          height="1280"
          loading="lazy"
          decoding="async"
          draggable="false"
        /><AnimatedText
          as="h2"
          id="irisTitle"
          className="iris-heading"
          lines={['di antara banyak cerita,', 'aku memilih kamu.']}
          {reduced}
        />
        <div class="story-scrim iris-scrim" aria-hidden="true"></div>
        <div class="iris-captions">
          <span {@attach reveal()}>senyummu, salah satu hal favoritku.</span><span {@attach reveal(0.055)}
            >dari faridz, untuk sopia.</span
          >
        </div>
      </div>
    </section>
    <CinematicScene
      mode="gallery"
      id="memoryCinema"
      {reduced}
      paused={hidden || greetingOpen || bookBusy}
      onactive={(value) => (galleryActive = value)}
    />
    <CinematicScene
      mode="book"
      id="bookCinema"
      bind:this={bookScene}
      {reduced}
      paused={hidden || greetingOpen || bookBusy}
      onactive={(value) => (cinemaBookActive = value)}
    >
      {#snippet children(interactive)}
        <MemoryBook
          pages={mediaPages}
          bind:index={pageIndex}
          onbusy={(value) => (bookBusy = value)}
          {reduced}
          paused={hidden || greetingOpen || !interactive}
        />
      {/snippet}
    </CinematicScene>
    <div class="rule" aria-hidden="true"></div>
    <section
      class="motion-stage wishes-stage"
      id="wishesStage"
      {@attach trackStage(3)}
      aria-labelledby="wishTitle"
    >
      <div class="story-pin wish-pin">
        <div class="wish-layout">
          <div class="wish-copy">
            <AnimatedText as="h2" id="wishTitle" lines={['lima doa dariku,', 'untuk sayangku.']} {reduced} />
            <ol class="wish-list">
              {#each wishes as wish, i (wish.time)}<li
                  class="wish-row"
                  class:is-lit={reduced || i < scene.wishesLit}
                >
                  <span class="wish-time">{wish.time}</span>
                  <div>
                    <strong>{wish.title}</strong>
                    <p>{wish.note}</p>
                  </div>
                </li>{/each}
            </ol>
          </div>
          <WishSky visible={scene.wishesVisible} {reduced} paused={hidden || greetingOpen || scrolling} />
        </div>
      </div>
    </section>
    <section id="about" class="about">
      <div>
        <p class="section-label">Catatan kecil</p>
        <p class="bio" {@attach reveal()}>
          Sopia, hadiah ini mungkin kecil dibanding semua hal yang ingin aku katakan. Aku ingin kamu tahu:
          kamu tidak harus menjadi sempurna untuk aku sayangi. Semoga tahun yang baru memberimu banyak alasan
          untuk tertawa, keberanian mengejar mimpimu, dan hati yang lebih tenang. Aku ingin terus belajar jadi
          pacar yang lebih baik untukmu. Selamat ulang tahun, sayang.
          <span class="faridz-signature">Dengan sayang, Faridz.</span>
        </p>
      </div>
      <img class="bloom" src="/landing-pages/meng-to-sketchbook/bloom.png" alt="" aria-hidden="true" />
    </section>
    <div class="rule short" aria-hidden="true"></div>
    <section id="plates" class="plates">
      <p class="section-label">Isi buku</p>
      <ol class="plate-list" id="plateList">
        {#each mediaPages as page, i (page.title)}<li>
            <button
              class="plate"
              {@attach reveal(i * 0.055)}
              aria-current={pageIndex === i ? 'true' : 'false'}
              onclick={() => bookTo(i)}
              ><span class="n">{String(i + 1).padStart(2, '0')}</span><span class="t">{page.title}</span><span
                class="p">{page.place}</span
              ></button
            >
          </li>{/each}
      </ol>
    </section>
    <div class="rule short" aria-hidden="true"></div>
    <p class="foot" id="contact" {@attach reveal()}>
      Untuk Sopia Nurfitria · dibuat dengan sayang oleh <a href="#about" class="bio-link">Faridz, pacarmu</a>.
    </p>
    {:else}
      <CinematicScene mode="book" id="giftTeaser" locked {reduced} paused={hidden} />
    {/if}
  </main>
  {#if day.unlocked}
    <CelebrationDialog bind:open={greetingOpen} {reduced} {hidden} {preview} onbook={() => bookTo()} />
  {/if}
</div>

<style>
  .birthday-app {
    position: relative;
    isolation: isolate;
    min-height: 100vh;
    background: var(--paper);
  }
</style>
