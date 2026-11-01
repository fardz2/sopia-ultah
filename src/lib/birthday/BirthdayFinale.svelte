<script lang="ts">
  import { onMount } from 'svelte';
  import { galleryPhotos, framePhoto } from './media';
  import { photoGather, inkReveal } from './textMotion';
  let {
    reduced = false,
    onback,
    onbook,
  }: { reduced?: boolean; onback: () => void; onbook: () => void } = $props();
  let panel: HTMLElement;
  let ready = $state(false),
    replay = $state(0);
  const photos = [
    ...galleryPhotos,
    { src: framePhoto, alt: 'Foto bersama dalam kumpulan kenangan.' },
    {
      src: '/WhatsApp%20Image%202026-10-29%20at%2012.41.13%20(2).jpeg',
      alt: 'Foto terakhir dalam rangkaian hadiah untuk Sopia.',
    },
  ];
  const places = [
    [30, 26, -9],
    [70, 26, 8],
    [15, 47, -6],
    [85, 47, 7],
    [30, 67, -5],
    [70, 67, 6],
    [50, 84, -3],
  ];
  onMount(() => {
    ready = true;
    panel.focus({ preventScroll: true });
  });
</script>

<section class="birthday-finale" bind:this={panel} tabindex="-1" aria-labelledby="birthdayFinaleTitle">
  <h2 id="birthdayFinaleTitle">sepotong waktu.<br /><em>sepenuh hati.</em></h2>
  <p class="finale-dedication">aku sayang kamu, sopia.</p>
  {#if ready}{#key replay}
      <div class="finale-heart" aria-label="Tujuh foto membentuk hati">
        <svg class="finale-heart-line" viewBox="0 0 100 100" aria-hidden="true"
          ><path
            d="M50 88C36 76 9 58 9 35C9 12 37 8 50 27C63 8 91 12 91 35C91 58 64 76 50 88Z"
            fill="none"
            stroke="currentColor"
            stroke-width="0.4"
            pathLength="1"
          /></svg
        >
        {#each photos as photo, i (photo.src)}<img
            src={photo.src}
            alt={photo.alt}
            width="567"
            height="1280"
            draggable="false"
            style:left="{places[i][0]}%"
            style:top="{places[i][1]}%"
            style:transform="translate(-50%,-50%) rotate({places[i][2]}deg)"
            in:photoGather|global={{ index: i, reduced }}
          />{/each}
      </div>
      <p class="finale-signature">
        <span>dengan seluruh sayangku,</span><strong in:inkReveal|global={{ reduced }}>Faridz</strong><span
          >pacarmu.</span
        >
      </p>
    {/key}{/if}
  <div class="ritual-actions">
    <button
      id="birthdayFinaleBook"
      class="birthday-control birthday-control-primary"
      type="button"
      onclick={onbook}>buka buku kita</button
    >
    <button class="birthday-control" type="button" onclick={onback}>kembali ke surat</button>
  </div>
  <button id="birthdayFinaleReplay" class="finale-replay" type="button" onclick={() => replay++}
    >lihat sekali lagi</button
  >
</section>
