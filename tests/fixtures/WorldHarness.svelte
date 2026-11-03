<script lang="ts">
  import BirthdayWorld from '../../src/lib/birthday/BirthdayWorld.svelte';
  import type {WorldSnapshot,WorldStatus} from '../../src/lib/birthday/world/types';
  let status=$state<WorldStatus>('idle');
  let snapshot=$state.raw<WorldSnapshot>({unlocked:false,hidden:false,story:{chapter:'opening',progress:0},ritual:{open:false,phase:'sealed',revision:0,blow:0,replay:0},book:{index:0,turn:null,nextId:1,zoom:1,loupe:{on:false,u:.5,v:.5},videoPlaying:false}});
</script>
<BirthdayWorld {snapshot} onstatus={value=>status=value}/>
<div class="fixture-controls"><span id="fixtureStatus">{status}</span><button id="fixtureHide" onclick={()=>snapshot={...snapshot,hidden:!snapshot.hidden}}>toggle hidden</button></div>
<figure data-world-target="portrait"></figure>
<style>:global(body){margin:0;background:#ece7dc}.fixture-controls{position:relative;z-index:3}figure{position:fixed;left:65%;top:20%;width:28%;height:55%;pointer-events:none}</style>
