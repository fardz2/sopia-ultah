<script lang="ts">
  import BirthdaySketchbookView from './lib/BirthdaySketchbookView.svelte';
</script>

<div class="shader-frame">
  <BirthdaySketchbookView />
</div>

<style>
  :global(html, body, #app) {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100%;
  }
  .shader-frame {
    width: 100%;
    min-height: 100vh;
    position: relative;
  }
</style>
