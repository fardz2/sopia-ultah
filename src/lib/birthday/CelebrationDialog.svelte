<script lang="ts">
  import { onMount, tick } from 'svelte';
  import AnimatedText from './AnimatedText.svelte';
  import { createBirthdayMusic } from './music';
  import { letterLift } from './textMotion';
  import BirthdayCandle from './BirthdayCandle.svelte';
  import BirthdayFinale from './BirthdayFinale.svelte';
  import type { RitualPhase } from './world/types';
  import './styles/ritual.css';
  let {
    open = $bindable(false),
    reduced = false,
    hidden = false,
    preview = false,
    world = false,
    phase = $bindable<RitualPhase>('sealed'),
    blow = $bindable(0),
    replay = $bindable(0),
    onbook,
  }: {
    open?: boolean;
    reduced?: boolean;
    hidden?: boolean;
    preview?: boolean;
    world?: boolean;
    phase?: RitualPhase;
    blow?: number;
    replay?: number;
    onbook: () => void;
  } = $props();
  let dialog: HTMLDialogElement;
  let envelopeButton = $state<HTMLButtonElement>();
  let letterPanel = $state<HTMLDivElement>();
  let playing = $state(false),
    volume = $state(35),
    note = $state('musik kotak musik · ketuk untuk memutar'),
    supported = $state(true),
    titleVisible = $state(false);
  const dialogTitle = $derived(
    phase === 'letter'
      ? 'birthdayGreetingTitle'
      : phase === 'candle'
        ? 'birthdayCandleTitle'
        : phase === 'finale'
          ? 'birthdayFinaleTitle'
          : 'birthdayEnvelopeTitle',
  );
  let petals = $state<
    {
      id: number;
      x: string;
      size: string;
      color: string;
      time: string;
      delay: string;
      drift: string;
      spin: string;
    }[]
  >([]);
  let music: ReturnType<typeof createBirthdayMusic> | undefined;
  let petalTimer = 0,
    titleFrame = 0,
    envelopeTimer = 0,
    entranceRun = 0,
    destroyed = false;
  let previousFocus: HTMLElement | null = null, previousOverflow = '', scrollPosition = 0, locked = false;
  function unlockPage() {
    if(!locked)return;locked=false;document.documentElement.style.overflow=previousOverflow;
    window.scrollTo({top:scrollPosition,behavior:'instant'});previousFocus?.isConnected&&previousFocus.focus({preventScroll:true});
  }
  async function revealTitle() {
    const run = ++entranceRun;
    titleVisible = false;
    await tick();
    if (destroyed || !open || phase !== 'letter' || run !== entranceRun) return;
    dialog.scrollTop = 0;
    letterPanel?.focus({ preventScroll: true });
    titleFrame = requestAnimationFrame(() => {
      titleFrame = 0;
      if (!destroyed && open && phase === 'letter' && run === entranceRun) titleVisible = true;
    });
  }
  function revealLetter() {
    clearTimeout(envelopeTimer);
    envelopeTimer = 0;
    if (destroyed || !open) return;
    phase = 'letter';
    burst();
    revealTitle();
  }
  function unseal() {
    if (phase !== 'sealed' || !open) return;
    phase = 'opening';
    if (reduced) revealLetter();
    else envelopeTimer = window.setTimeout(revealLetter, 420);
  }
  function showRitual(next: 'candle' | 'finale') {
    entranceRun++;
    cancelAnimationFrame(titleFrame);
    music?.stop();
    clear();
    phase = next;
    if(next==='candle')blow=0;
    if(next==='finale')replay++;
    tick().then(() => {
      if (!destroyed && open && phase === next) dialog.scrollTop = 0;
    });
  }
  function showLetter() {
    phase = 'letter';
    revealTitle();
  }
  function visitBook() {
    dismiss();
    onbook();
  }
  function clear() {
    clearTimeout(petalTimer);
    petals = [];
  }
  function burst() {
    clear();
    if (reduced || hidden || world) return;
    const colors = ['#a87b48', '#a4aa88', '#cbb48c', '#8f9c7d'];
    petals = Array.from({ length: innerWidth <= 640 ? 12 : 18 }, (_, i) => ({
      id: i,
      x: ((i * 37 + 7) % 100) + '%',
      size: 6 + (i % 5) + 'px',
      color: colors[i % 4],
      time: 3.1 + (i % 4) * 0.2 + 's',
      delay: (i % 6) * 0.1 + 's',
      drift: (i % 2 ? 1 : -1) * (24 + i * 3) + 'px',
      spin: (i % 2 ? 1 : -1) * (100 + i * 13) + 'deg',
    }));
    petalTimer = window.setTimeout(clear, 4400);
  }
  function dismiss() {
    entranceRun++;
    cancelAnimationFrame(titleFrame);
    clearTimeout(envelopeTimer);
    open = false;
    titleVisible = false;
    phase = 'sealed';
    music?.stop();
    clear();
  }
  onMount(() => {
    music = createBirthdayMusic((active, message) => {
      playing = active;
      note = message;
    });
    supported = music.supported;
    if (!supported) note = 'browser ini belum mendukung musik. ucapannya tetap bisa dinikmati.';
    return () => {
      destroyed = true;
      entranceRun++;
      cancelAnimationFrame(titleFrame);
      clearTimeout(envelopeTimer);
      music?.destroy();
      clearTimeout(petalTimer);
      unlockPage();
    };
  });
  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) {
      previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
      previousOverflow=document.documentElement.style.overflow;scrollPosition=scrollY;locked=true;document.documentElement.style.overflow='hidden';
      phase = 'sealed';
      titleVisible = false;
      dialog.showModal();
      dialog.scrollTop = 0;
      envelopeButton?.focus({ preventScroll: true });
    } else if (!open && dialog.open) {
      dialog.close();
      music?.stop();
      clear();
      clearTimeout(envelopeTimer);
      envelopeTimer=0;
      unlockPage();
    }
  });
  $effect(() => {
    if (hidden) {
      music?.stop();
      clear();
      clearTimeout(envelopeTimer);envelopeTimer=0;
      cancelAnimationFrame(titleFrame);
    }else if(open&&phase==='opening'&&!envelopeTimer){
      envelopeTimer=window.setTimeout(revealLetter,420);
    }else if(open&&phase==='letter'&&!titleVisible){
      revealTitle();
    }
    if (reduced) {
      clear();
      if (phase === 'opening') revealLetter();
    }
  });
</script>

<svelte:window
  onpagehide={() => {
    music?.stop();
    clear();
  }}
/>
<dialog
  class="birthday-greeting"
  class:world-ritual={world}
  id="birthdayGreeting"
  bind:this={dialog}
  aria-labelledby={dialogTitle}
  data-phase={phase}
  onclose={dismiss}
>
  <div class="celebration-petals" id="birthdayPetals" aria-hidden="true">
    {#each petals as petal (petal.id)}<span
        class="celebration-petal"
        style:--petal-x={petal.x}
        style:--petal-size={petal.size}
        style:--petal-color={petal.color}
        style:--petal-time={petal.time}
        style:--petal-delay={petal.delay}
        style:--petal-drift={petal.drift}
        style:--petal-spin={petal.spin}
      ></span>{/each}
  </div>
  <div class="birthday-letter">
    <div class="birthday-letter-head">
      <p class="birthday-letter-date">7 november · dari faridz, untuk sopia</p>
      <button
        type="button"
        class="birthday-close"
        id="birthdayClose"
        aria-label="Tutup ucapan"
        onclick={dismiss}
        ><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"
          ><path d="m4 4 12 12M16 4 4 16" /></svg
        ></button
      >
    </div>
    {#if preview}<p class="birthday-preview" id="birthdayPreview">
        pratinjau hari ulang tahun · tanggal asli tetap mengikuti WIB
      </p>{/if}
    {#if phase === 'sealed' || phase === 'opening'}
      <div class="birthday-envelope-scene" class:is-opening={phase === 'opening'}>
        <h2 id="birthdayEnvelopeTitle">ada surat untukmu,<br /><em>sopia.</em></h2>
        <button
          type="button"
          class="birthday-envelope"
          data-world-target="letter"
          id="birthdayUnseal"
          bind:this={envelopeButton}
          aria-label="Buka surat ulang tahun untuk Sopia"
          disabled={phase === 'opening'}
          onclick={unseal}
        >
          <span class="envelope-back" aria-hidden="true"></span>
          <span class="envelope-card" aria-hidden="true"
            ><span>untuk sayangku</span><strong>sopia nurfitria</strong><span>dari faridz</span></span
          >
          <span class="envelope-front" aria-hidden="true"></span>
          <span class="envelope-flap" aria-hidden="true"></span>
          <span class="envelope-seal" aria-hidden="true">f</span>
        </button>
        <p class="birthday-envelope-prompt">
          {phase === 'opening' ? 'sedang membuka surat…' : 'ketuk amplop untuk membuka'}
        </p>
      </div>
    {:else if phase === 'letter'}
      <div class="birthday-letter-content" tabindex="-1" bind:this={letterPanel} in:letterLift={{ reduced }}>
        <AnimatedText
          as="h2"
          id="birthdayGreetingTitle"
          lines={['selamat ulang tahun,', 'sopia.']}
          label="Selamat ulang tahun, Sopia Nurfitria!"
          visible={titleVisible}
          {reduced}
        />
        <div class="birthday-letter-copy">
          <p>
            Sayang, selamat ulang tahun. Aku senang bisa menyebutmu pacarku, dan hari ini aku ingin kamu
            merasa dirayakan, diperhatikan, dan dicintai.
          </p>
          <p>
            Doaku untukmu sederhana: semoga hatimu lebih tenang, tubuhmu sehat, dan mimpimu satu per satu
            menemukan jalannya. Saat hari terasa berat, semoga kamu ingat bahwa kamu boleh bercerita, boleh
            lelah, dan tidak perlu selalu terlihat kuat di depanku.
          </p>
          <p>
            Aku juga ingin terus belajar menyayangimu dengan lebih baik. Mendengarkanmu lebih sungguh,
            memahami hal-hal kecil tentangmu, dan ikut bahagia atas setiap langkah yang kamu pilih.
          </p>
          <p>Aku sayang kamu, Sopia. Selamat bertambah usia, perempuan yang ingin aku rayakan.</p>
        </div>
        <p class="birthday-signature">
          <span>dengan seluruh sayangku,</span><strong>Faridz</strong><span>pacarmu.</span>
        </p>
        <div class="birthday-music">
          <div class="birthday-music-row">
            <button
              type="button"
              class="birthday-control"
              id="birthdayMusic"
              aria-pressed={playing}
              disabled={!supported}
              onclick={() => (playing ? music?.stop() : music?.play())}
              ><svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                aria-hidden="true"
                ><path d="M8 14V5l8-2v9M8 7l8-2" /><ellipse cx="5.6" cy="14.7" rx="2.4" ry="1.8" /><ellipse
                  cx="13.6"
                  cy="12.7"
                  rx="2.4"
                  ry="1.8"
                /></svg
              ><span id="birthdayMusicLabel">{playing ? 'hentikan musik' : 'putar musik'}</span></button
            ><label class="birthday-volume" for="birthdayVolume"
              >volume <input
                type="range"
                id="birthdayVolume"
                min="0"
                max="100"
                bind:value={volume}
                disabled={!supported}
                oninput={(event) => music?.setVolume(Number(event.currentTarget.value))}
                aria-label="Volume musik ulang tahun"
              /></label
            >
          </div>
          <p class="birthday-music-note" id="birthdayMusicNote" role="status" aria-live="polite">{note}</p>
        </div>
        <div class="birthday-letter-actions">
          <button
            type="button"
            class="birthday-control birthday-control-primary"
            id="birthdayWish"
            onclick={() => showRitual('candle')}>buat satu permohonan</button
          >
          <button type="button" class="birthday-control" id="birthdayBook" onclick={visitBook}
            >buka buku kenangan</button
          ><button type="button" class="birthday-control" id="birthdayAgain" onclick={burst}
            >rayakan lagi</button
          >
        </div>
        <button
          class="finale-replay"
          id="birthdayFinaleOpen"
          type="button"
          onclick={() => showRitual('finale')}>ada satu penutup kecil untukmu</button
        >
      </div>
    {:else if phase === 'candle'}
      <BirthdayCandle {reduced} {hidden} {world} bind:progress={blow} onback={showLetter} onfinale={() => showRitual('finale')} />
    {:else if phase === 'finale'}
      <BirthdayFinale {reduced} {world} onreplay={()=>replay++} onback={showLetter} onbook={visitBook} />
    {/if}
  </div>
</dialog>
