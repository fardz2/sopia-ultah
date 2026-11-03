<script lang="ts">
  import {onMount} from 'svelte';
  import BirthdayWorld from '../../src/lib/birthday/BirthdayWorld.svelte';
  import WorldBookControls from '../../src/lib/birthday/WorldBookControls.svelte';
  import CelebrationDialog from '../../src/lib/birthday/CelebrationDialog.svelte';
  import {BirthdayExperience} from '../../src/lib/birthday/world/experience.svelte';
  import type {ScreenRect} from '../../src/lib/birthday/world/types';
  import type {WorldSnapshot,WorldStatus} from '../../src/lib/birthday/world/types';
  let status=$state<WorldStatus>('idle');
  const experience=new BirthdayExperience();
  let rects=$state<{spread:ScreenRect|null;video:ScreenRect|null}>({spread:null,video:null});
  let snapshot=$state.raw<WorldSnapshot>({unlocked:false,hidden:false,story:{chapter:'opening',progress:0},ritual:{open:false,phase:'sealed',revision:0,blow:0,replay:0},book:{index:0,turn:null,nextId:1,zoom:1,loupe:{on:false,u:.5,v:.5},videoPlaying:false}});
  const view=$derived({...snapshot,ritual:{open:experience.greetingOpen,phase:experience.phase,revision:0,blow:experience.blow,replay:experience.replay},book:{...snapshot.book,...experience.book,zoom:experience.zoom,loupe:experience.loupe,videoPlaying:experience.videoPlaying}});
  onMount(()=>{Object.assign(window,{__worldSet:(patch:Partial<WorldSnapshot>)=>snapshot={...snapshot,...patch},__worldSeek:(index:number)=>experience.dispatch({type:'seek',index})});});
</script>
<BirthdayWorld snapshot={view} onstatus={value=>status=value} onprojection={value=>rects=value} onturnend={id=>experience.dispatch({type:'complete',id})}/>
{#if snapshot.story.chapter==='book'}<WorldBookControls {experience} spread={rects.spread} video={rects.video} hidden={snapshot.hidden}/>{/if}
<div class="fixture-controls"><span id="fixtureStatus">{status}</span><button id="fixtureHide" onclick={()=>snapshot={...snapshot,hidden:!snapshot.hidden}}>toggle hidden</button><button id="fixtureRitual" onclick={()=>{snapshot={...snapshot,unlocked:true};experience.greetingOpen=true;}}>open letter</button></div>
<CelebrationDialog world={status==='ready'} bind:open={experience.greetingOpen} bind:phase={experience.phase} bind:blow={experience.blow} bind:replay={experience.replay} hidden={snapshot.hidden} onbook={()=>{}}/>
<figure data-world-target="portrait"></figure>
<style>:global(body){margin:0;background:#ece7dc}.fixture-controls{position:relative;z-index:3}figure{position:fixed;left:65%;top:20%;width:28%;height:55%;pointer-events:none}</style>
