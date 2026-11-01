<script lang="ts">
  import { onMount } from 'svelte';
  let {
    visible = false,
    reduced = false,
    paused = false,
  }: { visible?: boolean; reduced?: boolean; paused?: boolean } = $props();
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null = null;
  let frame = 0,
    size = 0,
    ratio = 1;
  function draw(time = 0) {
    if (!context || !size) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size, size);
    context.translate(size / 2, size / 2);
    context.strokeStyle = 'rgba(120,83,47,.16)';
    context.lineWidth = 0.75;
    for (const radius of [0.28, 0.43]) {
      context.beginPath();
      context.arc(0, 0, size * radius, 0, Math.PI * 2);
      context.stroke();
    }
    const seconds = reduced ? 0 : time / 1000;
    context.rotate(seconds * 0.035);
    for (let i = 0; i < 220; i++) {
      const angle = i * 2.399,
        radius = Math.sqrt((i + 0.5) / 220) * size * 0.43;
      context.globalAlpha = reduced ? 0.75 : 0.4 + 0.6 * Math.sin(seconds * 1.2 + i * 0.7) ** 2;
      context.fillStyle = i % 23 === 0 ? '#78532f' : '#514c43';
      context.beginPath();
      context.arc(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        i % 23 === 0 ? 2.1 : 0.7 + (i % 3) * 0.18,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    context.globalAlpha = 1;
  }
  function loop(time: number) {
    frame = 0;
    if (!visible || paused) return;
    draw(time);
    if (!reduced) frame = requestAnimationFrame(loop);
  }
  function resize() {
    if (!canvas) return;
    size = canvas.getBoundingClientRect().width;
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * ratio);
    canvas.height = canvas.width;
    draw();
  }
  onMount(() => {
    context = canvas.getContext('2d');
    resize();
    if (visible && !paused) frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  });
  $effect(() => {
    if (visible && !paused) {
      if (!frame) frame = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (reduced) draw();
  });
</script>

<svelte:window onresize={resize} />
<figure class="wish-sky">
  <canvas id="wishStars" bind:this={canvas} aria-hidden="true"></canvas>
  <figcaption><span>sebanyak bintang, sebanyak doa.</span><span>untuk sopia.</span></figcaption>
</figure>
