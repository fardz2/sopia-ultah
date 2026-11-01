import { readFile, writeFile } from 'node:fs/promises';

// Keep the text baked into curved-page/loupe textures in sync with accessible
// Svelte descriptions. Existing embedded photographs and page artwork stay intact.
const notes = JSON.parse(
  await readFile(new URL('../src/lib/birthday/memory-notes.json', import.meta.url), 'utf8'),
);
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const [i, note] of notes.entries()) {
  const file = new URL(
    `../public/landing-pages/birthday-media/kenangan-${String(i + 1).padStart(2, '0')}.svg`,
    import.meta.url,
  );
  const original = await readFile(file, 'utf8');
  let svg = original;
  svg = svg.replace(/\s*<g id="memory-note">[\s\S]*?<\/g>/, '');
  svg = svg.replace(/\s*<text\b[^>]*\by="500"[^>]*>[\s\S]*?<\/text>/, '');
  const heading = `<text x="145" y="475" fill="#383126" font-family="Georgia,serif" font-size="45" font-style="italic">${escape(note.heading)}</text>`;
  const body = `<text x="145" y="555" fill="#514c43" font-family="Georgia,serif" font-size="43">${note.lines.map((line, lineIndex) => `<tspan x="145" dy="${lineIndex ? 57 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
  const closing = `<text x="145" y="1050" fill="#78532f" font-family="Georgia,serif" font-size="27" font-style="italic">${escape(note.closing)}</text>`;
  svg = svg.replace('</svg>', `  <g id="memory-note">${heading}${body}${closing}</g>\n</svg>`);
  if (svg !== original) await writeFile(file, svg);
}
process.stdout.write(`Updated ${notes.length} book notes.\n`);
