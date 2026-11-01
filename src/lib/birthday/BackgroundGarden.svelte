<script lang="ts">
  import { onMount } from 'svelte';
  import { createLeafRig } from './leafRig';
  let {
    reduced = false,
    paused = false,
    onready,
  }: { reduced?: boolean; paused?: boolean; onready?: (ready: boolean) => void } = $props();
  let monstera: HTMLCanvasElement, fern: HTMLCanvasElement;
  let rig: ReturnType<typeof createLeafRig> | undefined;
  const motes = [
    [8, 3, 25, -7, 32],
    [26, 4, 32, -21, -24],
    [49, 3, 28, -12, 38],
    [73, 4, 30, -24, -36],
    [93, 3, 24, -4, -28],
    [17, 5, 34, -16, 26],
    [38, 3, 27, -3, -32],
    [62, 4, 31, -18, 24],
    [85, 3, 29, -10, -42],
  ];
  onMount(() => {
    rig = createLeafRig([monstera, fern], (ready) => onready?.(ready));
    rig.setOptions({ reduced, paused });
    return () => rig?.destroy();
  });
  $effect(() => {
    const options = { reduced, paused };
    rig?.setOptions(options);
  });
</script>

<svelte:window onresize={() => rig?.resize()} />
<div class="wash" aria-hidden="true"></div>
<div class="leaf-canopy" aria-hidden="true">
  <canvas
    bind:this={monstera}
    class="leaf-canvas leaf-canvas--monstera"
    id="monsteraRig"
    width="768"
    height="768"
  ></canvas>
  <canvas bind:this={fern} class="leaf-canvas leaf-canvas--fern" id="fernRig" width="768" height="768"
  ></canvas>
</div>
<div class="ambient-garden" aria-hidden="true">
  {#each motes as mote, i (i)}<i
      class="ambient-speck"
      style:--x="{mote[0]}%"
      style:--size="{mote[1]}px"
      style:--duration="{mote[2]}s"
      style:--delay="{mote[3]}s"
      style:--drift="{mote[4]}px"
    ></i>{/each}
</div>
