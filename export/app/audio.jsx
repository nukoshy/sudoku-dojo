// Sudoku Dojo — tiny WebAudio SFX synth. No assets; all tones generated.
// Respects the sound-effects toggle. Ambient is a soft optional drone.

(function () {
  let ctx = null;
  let sfxOn = true;
  let ambientNodes = null;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Simple enveloped oscillator voice.
  function blip(freq, dur, type, gain, when, glideTo) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // Short filtered-noise burst (paper / rubber / brush). Optional highpass.
  function noise(dur, gain, lpFreq, hpFreq) {
    const a = ac(); if (!a) return;
    const t = a.currentTime;
    const n = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, n, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = a.createBufferSource(); src.buffer = buf;
    let node = src;
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = lpFreq || 2200;
    node.connect(lp); node = lp;
    if (hpFreq) { const hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hpFreq; node.connect(hp); node = hp; }
    const g = a.createGain(); g.gain.value = gain || 0.12;
    node.connect(g).connect(a.destination);
    src.start(t);
  }

  const DojoAudio = {
    setSfx(on) { sfxOn = !!on; },
    unlock() { ac(); },                       // call on first user gesture
    // felt-tip marker: soft low body + a touch of paper
    pen() { if (sfxOn) { blip(190, 0.07, 'sine', 0.13, 0, 130); noise(0.045, 0.05, 1800); } },
    // HB pencil: lighter, brighter scratch
    pencil() { if (sfxOn) noise(0.06, 0.05, 5200, 1800); },
    // rubber eraser: soft low scrub
    erase() { if (sfxOn) { noise(0.16, 0.10, 1200); noise(0.10, 0.06, 1600, 600); } },
    // error: soft brush tap, not a buzzer
    error() { if (sfxOn) { noise(0.06, 0.07, 1000); blip(150, 0.12, 'sine', 0.06, 0, 110); } },
    select() { if (sfxOn) blip(620, 0.025, 'sine', 0.04); },
    // button: subtle paper tap
    tap() { if (sfxOn) noise(0.03, 0.045, 2600, 900); },
    // hanko press
    stamp() { if (sfxOn) { blip(140, 0.16, 'square', 0.14, 0, 70); noise(0.10, 0.10, 900); } },
    // hint: soft page turn (noise sweep)
    hint() { if (sfxOn) { noise(0.22, 0.07, 3000, 700); noise(0.12, 0.05, 1400, 400); } },
    win() {
      if (!sfxOn) return;
      [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.5, 'triangle', 0.09, i * 0.12));
      blip(196, 1.7, 'sine', 0.09, 0.2, 174);     // distant temple bell
      [1568, 2093].forEach((f, i) => blip(f, 1.4, 'sine', 0.035, 0.5 + i * 0.18)); // wind chimes
    },
    // puzzle failed: gentle descending tone (not punishing)
    lose() { if (sfxOn) { blip(330, 0.5, 'sine', 0.08, 0, 196); blip(247, 0.6, 'sine', 0.06, 0.12, 165); } },
    // Idle/ambient drone removed — sound only plays on interactions.
    setAmbient() {},
  };

  window.DojoAudio = DojoAudio;
})();
