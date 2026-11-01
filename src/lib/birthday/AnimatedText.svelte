<script lang="ts">
  import { onMount } from 'svelte';
  import { letterDrop, wordArrival } from './textMotion';
  interface Props {
    text?: string;
    lines?: string[];
    as?: 'h1' | 'h2' | 'p' | 'span';
    id?: string;
    className?: string;
    label?: string;
    reduced?: boolean;
    visible?: boolean;
    mode?: 'letters' | 'words';
    delayOffset?: number;
  }
  let {
    text = '',
    lines,
    as = 'span',
    id,
    className = '',
    label,
    reduced = false,
    visible,
    mode = 'letters',
    delayOffset = 0,
  }: Props = $props();
  let element: HTMLElement;
  let observed = $state(false);
  const source = $derived(lines ?? [text]);
  const content = $derived(source.map((line) => line.split(/(\s+)/).filter(Boolean)));
  const segmenter =
    typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('id', { granularity: 'grapheme' }) : null;
  const characters = (word: string) =>
    segmenter ? Array.from(segmenter.segment(word), (part) => part.segment) : Array.from(word);
  const total = $derived(
    content
      .flat()
      .filter((word) => word.trim())
      .reduce((sum, word) => sum + characters(word).length, 0),
  );
  const stagger = $derived(Math.min(0.024, 0.26 / Math.max(1, total - 1)));
  const show = $derived(reduced || visible === true || (visible === undefined && observed));
  const prepared = $derived.by(() => {
    let letter = 0,
      wordIndex = 0;
    return content.map((words) =>
      words.map((word) => ({
        word,
        delay: Math.min(wordIndex++ * 0.022, 0.18),
        chars: characters(word).map((char) => ({ char, delay: letter++ * stagger + delayOffset })),
      })),
    );
  });
  onMount(() => {
    if (visible !== undefined || !('IntersectionObserver' in window)) {
      observed = true;
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observed = true;
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  });
</script>

<svelte:element
  this={as}
  bind:this={element}
  {id}
  class="{className}{show ? ' is-visible' : ''}"
  aria-label={label ?? source.join(' ')}
  data-letters={mode === 'letters' ? '' : undefined}
  data-words={mode === 'words' ? '' : undefined}
>
  {#each prepared as words, lineIndex (lineIndex)}
    <span class:text-line={lines !== undefined}>
      {#each words as word, wordIndex (wordIndex)}
        {#if !word.word.trim()}{word.word}
        {:else if mode === 'words'}
          {#if show}<span
              class="motion-word"
              aria-hidden="true"
              in:wordArrival={{ delay: word.delay, reduced }}>{word.word}</span
            >{:else}<span class="motion-word" aria-hidden="true" style="opacity:.3;transform:translateY(.4em)"
              >{word.word}</span
            >{/if}
        {:else}<span class="letter-word" aria-hidden="true"
            >{#each word.chars as glyph, letterIndex (letterIndex)}<span class="letter-clip"
                >{#if show}<span
                    class="letter-glyph"
                    style:--letter-delay="{glyph.delay}s"
                    in:letterDrop={{ delay: glyph.delay, reduced }}>{glyph.char}</span
                  >{:else}<span class="letter-glyph" style="transform:translateY(-135%)">{glyph.char}</span
                  >{/if}</span
              >{/each}</span
          >{/if}
      {/each}
    </span>
  {/each}
</svelte:element>
