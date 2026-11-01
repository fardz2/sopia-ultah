export function createBirthdayMusic(onState: (playing: boolean, note: string) => void) {
  const AudioEngine =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  let audio: AudioContext | undefined,
    master: GainNode | undefined,
    playing = false,
    run = 0,
    endTimer = 0,
    idleTimer = 0,
    volume = 35;
  const voices = new Set<OscillatorNode>();
  const idleNote = 'musik kotak musik · instrumental ulang tahun';
  function stop() {
    const token = ++run;
    clearTimeout(endTimer);
    clearTimeout(idleTimer);
    playing = false;
    onState(false, idleNote);
    if (!audio || !master) return;
    const now = audio.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0, now, 0.015);
    voices.forEach((voice) => {
      try {
        voice.stop(now + 0.06);
      } catch {}
    });
    idleTimer = window.setTimeout(() => {
      if (token === run && !playing && audio?.state === 'running') audio.suspend().catch(() => {});
    }, 90);
  }
  function chime(midi: number, start: number, duration: number, level = 1) {
    if (!audio || !master) return;
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    for (const [ratio, strength] of [
      [1, 0.23],
      [2.01, 0.045],
    ]) {
      const voice = audio.createOscillator(),
        envelope = audio.createGain();
      voice.type = 'sine';
      voice.frequency.value = frequency * ratio;
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(strength * level, start + 0.009);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      voice.connect(envelope);
      envelope.connect(master);
      voices.add(voice);
      voice.onended = () => {
        voices.delete(voice);
        voice.disconnect();
        envelope.disconnect();
      };
      voice.start(start);
      voice.stop(start + duration + 0.02);
    }
  }
  async function play() {
    if (!AudioEngine || document.hidden) return;
    const token = ++run;
    clearTimeout(idleTimer);
    try {
      if (!audio) {
        audio = new AudioEngine();
        master = audio.createGain();
        const compressor = audio.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.ratio.value = 3;
        master.connect(compressor);
        compressor.connect(audio.destination);
      }
      if (audio.state !== 'running') await audio.resume();
      if (token !== run || document.hidden) return;
      const start = audio.currentTime + 0.06,
        beat = 60 / 92;
      master!.gain.cancelScheduledValues(audio.currentTime);
      master!.gain.setTargetAtTime((volume / 100) * 0.42, audio.currentTime, 0.025);
      const melody = [
        [67, 0.5],
        [67, 0.5],
        [69, 1],
        [67, 1],
        [72, 1],
        [71, 2],
        [67, 0.5],
        [67, 0.5],
        [69, 1],
        [67, 1],
        [74, 1],
        [72, 2],
        [67, 0.5],
        [67, 0.5],
        [79, 1],
        [76, 1],
        [72, 1],
        [71, 1],
        [69, 1.5],
        [77, 0.5],
        [77, 0.5],
        [76, 1],
        [72, 1],
        [74, 1],
        [72, 2.5],
      ];
      let cursor = 0;
      for (const [note, beats] of melody) {
        chime(note, start + cursor * beat, Math.max(0.8, beats * beat + 0.5));
        cursor += beats;
      }
      const chords: [number, number[]][] = [
        [0, [48, 52, 55]],
        [6, [55, 59, 62]],
        [12, [48, 52, 55]],
        [16, [53, 57, 60]],
        [21, [55, 59, 62]],
        [24, [48, 52, 55]],
      ];
      chords.forEach(([at, chord]) =>
        chord.forEach((note, index) => chime(note, start + at * beat + index * 0.045, 1.8, 0.18)),
      );
      playing = true;
      onState(true, 'selamat ulang tahun · musik kotak musik sedang diputar');
      endTimer = window.setTimeout(stop, (cursor * beat + 2) * 1000);
    } catch {
      stop();
      onState(false, 'musik belum dapat diputar. ketuk sekali lagi untuk mencoba.');
    }
  }
  return {
    supported: Boolean(AudioEngine),
    play,
    stop,
    setVolume(value: number) {
      volume = value;
      if (audio && master && playing)
        master.gain.setTargetAtTime((volume / 100) * 0.42, audio.currentTime, 0.025);
    },
    destroy() {
      stop();
      clearTimeout(idleTimer);
      if (audio) audio.close().catch(() => {});
    },
  };
}
