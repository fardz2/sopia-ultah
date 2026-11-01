<script lang="ts">
  import { onMount } from 'svelte';
  import AnimatedText from './AnimatedText.svelte';
  import { portraitPhoto } from './media';
  import type { BirthdayState } from './date';
  import { reveal } from './reveal';
  import { paperCurtain, counterFold } from './textMotion';
  let {
    day,
    reduced = false,
    paused = false,
    onopen,
  }: { day: BirthdayState; reduced?: boolean; paused?: boolean; onopen: () => void } = $props();
  let hero: HTMLElement, visual: HTMLElement, portrait: HTMLImageElement;
  let active = $state(false),
    printReady = $state(false),
    x = $state(0),
    y = $state(0);
  let targetX = 0,
    targetY = 0,
    frame = 0,
    fine = false;
  const units = [
    { key: 'days', label: 'hari' },
    { key: 'hours', label: 'jam' },
    { key: 'minutes', label: 'menit' },
    { key: 'seconds', label: 'detik' },
  ] as const;
  function reset() {
    active = false;
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function draw() {
    frame = 0;
    if (!active || paused) return;
    const factor = reduced ? 1 : 0.22;
    x += (targetX - x) * factor;
    y += (targetY - y) * factor;
    if (Math.abs(targetX - x) < 0.3 && Math.abs(targetY - y) < 0.3) {
      x = targetX;
      y = targetY;
    } else frame = requestAnimationFrame(draw);
  }
  function move(event: MouseEvent) {
    if (!fine || paused) return;
    const rect = visual.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) * visual.clientWidth) / rect.width;
    targetY = ((event.clientY - rect.top) * visual.clientHeight) / rect.height;
    if (!active) {
      x = targetX;
      y = targetY;
      active = true;
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }
  onMount(() => {
    if (portrait.complete) printReady = true;
    const query = matchMedia('(hover:hover) and (pointer:fine)');
    fine = query.matches;
    const changed = () => {
      fine = query.matches;
      reset();
    };
    query.addEventListener('change', changed);
    hero.addEventListener('mousemove', move, { passive: true });
    hero.addEventListener('mouseleave', reset);
    return () => {
      query.removeEventListener('change', changed);
      hero.removeEventListener('mousemove', move);
      hero.removeEventListener('mouseleave', reset);
      cancelAnimationFrame(frame);
    };
  });
  $effect(() => {
    if (paused) reset();
  });
</script>

<svelte:window onresize={reset} onpagehide={reset} />
<section class="portrait-hero" id="portraitHero" bind:this={hero} aria-labelledby="portraitTitle">
  <header class="portrait-topline">
    <div class="portrait-meta" {@attach reveal()}>
      <span>sopia</span><span>{day.unlocked ? 'arsip kenangan' : 'sebuah kejutan'}</span>
    </div>
    <span class="portrait-year" {@attach reveal()}>f / s</span>
    <div class="portrait-date-meta" {@attach reveal(0.055)}>
      <span>(</span><span>07 november</span><span>/</span><span>setiap tahun</span><span>)</span>
    </div>
  </header>
  <div class="portrait-main">
    <h1 class="portrait-title" id="portraitTitle" aria-label="Sopia Nurfitria">
      <AnimatedText text="sopia" {reduced} />
      <span class="portrait-title-row"
        ><span class="portrait-plus" aria-hidden="true"
          ><svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18" /></svg></span
        ><AnimatedText text="nurfitria" delayOffset={0.12} {reduced} /></span
      >
    </h1>
    <figure class="portrait-visual" id="portraitVisual" bind:this={visual}>
      <img
        bind:this={portrait}
        class="portrait-layer portrait-clean"
        src={portraitPhoto}
        alt="Sopia di antara cahaya lampu malam."
        draggable="false"
        fetchpriority="high"
        width="567"
        height="1280"
        onload={() => (printReady = true)}
        onerror={() => (printReady = true)}
      />
      <img
        class="portrait-layer portrait-gold"
        src={portraitPhoto}
        alt=""
        aria-hidden="true"
        draggable="false"
        width="567"
        height="1280"
      />
      <img
        class="portrait-layer portrait-reveal"
        id="portraitReveal"
        src={portraitPhoto}
        alt=""
        aria-hidden="true"
        draggable="false"
        width="567"
        height="1280"
        style="mask-position:{x - 55}px {y - 70}px;-webkit-mask-position:{x - 55}px {y - 70}px;opacity:{active
          ? 1
          : 0}"
      />
      <div class="portrait-scrim" aria-hidden="true"></div>
      {#if !printReady}<div
          class="portrait-curtain"
          aria-hidden="true"
          out:paperCurtain={{ reduced }}
        ></div>{/if}
      <figcaption class="portrait-photo-note">
        <span>sepotong waktu, disimpan.</span><span class="portrait-spotlight-hint">gerakkan kursor</span>
      </figcaption>
    </figure>
  </div>
  <div class="portrait-footer">
    <div class="birthday-intro" id="birthdayIntro" class:is-today={day.today}>
      <p class="birthday-date" id="birthdayDate">{day.dateLabel}</p>
      <div
        class="birthday-countdown"
        id="birthdayCountdown"
        role="timer"
        aria-live="off"
        aria-label={day.ariaLabel}
      >
        {#if !day.today}<div
            class="birthday-countdown-values"
            id="birthdayCountdownValues"
            out:counterFold={{ reduced }}
          >
            {#each units as unit (unit.key)}<div class="birthday-countdown-unit">
                <span class="birthday-countdown-value" data-birthday-unit={unit.key}
                  >{unit.key === 'days'
                    ? String(day[unit.key])
                    : String(day[unit.key]).padStart(2, '0')}</span
                ><span class="birthday-countdown-unit-label">{unit.label}</span>
              </div>{/each}
          </div>
          <p class="birthday-countdown-label" id="birthdayCountdownLabel">menuju hari spesialmu</p>{:else}<div
            class="birthday-today-moment"
            id="birthdayToday"
            role="status"
            aria-live="polite"
          >
            <AnimatedText
              as="p"
              className="birthday-today"
              text="hari ini tentang kamu, sayang."
              delayOffset={0.22}
              {reduced}
            />
            <span>selamat ulang tahun, sopia.</span>
          </div>{/if}
      </div>
      {#if day.unlocked}<div class="birthday-actions" id="birthdayActions">
          <button
            type="button"
            class="birthday-open"
            id="birthdayOpen"
            aria-haspopup="dialog"
            aria-controls="birthdayGreeting"
            onclick={onopen}>{day.today ? 'buka ucapan untukmu' : 'buka lagi surat dariku'}</button
          >
        </div>{/if}
    </div>
    <div class="portrait-footer-copy">
      <AnimatedText
        as="p"
        className="portrait-note"
        mode="words"
        text={day.unlocked
          ? 'untuk kamu, yang ingin aku rayakan lebih dari setiap 7 november. aku kumpulkan foto, potongan waktu, dan sedikit dari banyaknya rasa sayangku di sini. selamat datang di hadiah kecilmu, sopia.'
          : 'ada sesuatu yang sedang aku siapkan untukmu. tunggu sebentar lagi, sayang.'}
        {reduced}
      />
      <div class="portrait-endline">
        <span {@attach reveal()}>dari faridz, pacarmu.</span><span {@attach reveal(0.055)}>( gulir ↓ )</span>
      </div>
    </div>
  </div>
</section>
