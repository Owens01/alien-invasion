// utils/audio.ts

const sounds: Record<string, HTMLAudioElement> = {};
let isMuted = false;
let fadeInterval: NodeJS.Timeout | null = null;
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let droneOscillators: OscillatorNode[] = [];
let droneGains: GainNode[] = [];
let isPlaying = false;

// Initialize Audio Context on user interaction (first sound play)
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// 🎹 Procedural Space Drone Generator
function startDrone() {
  if (isPlaying || !audioCtx || !masterGain) return;
  isPlaying = true;

  // Create 3 oscillators for a chord (Root, Fifth, Octave)
  const freqs = [55, 82.41, 110]; // Low A chord

  freqs.forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();

    osc.type = i === 0 ? "sawtooth" : "sine";
    osc.frequency.value = freq;

    // Slight detune for "spacey" feel
    osc.detune.value = (Math.random() - 0.5) * 10;

    // Filter for the sawtooth to make it darker
    if (i === 0) {
      const filter = audioCtx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    // LFO to modulate volume slowly
    const lfo = audioCtx!.createOscillator();
    lfo.frequency.value = 0.1 + Math.random() * 0.1; // Very slow
    const lfoGain = audioCtx!.createGain();
    lfoGain.gain.value = 0.3; // Modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();

    gain.gain.value = 0.1; // Base volume
    gain.connect(masterGain!);
    osc.start();

    droneOscillators.push(osc);
    droneGains.push(gain);
  });
}

function stopDrone() {
  if (!isPlaying) return;

  const now = audioCtx?.currentTime || 0;
  droneGains.forEach((g) => {
    g.gain.linearRampToValueAtTime(0, now + 2); // 2s fade out
  });

  setTimeout(() => {
    droneOscillators.forEach((o) => o.stop());
    droneOscillators = [];
    droneGains = [];
    isPlaying = false;
  }, 2000);
}

// 🔊 Play short SFX (shoot, explosion, etc.)
export function playSound(name: string, volume = 0.5) {
  if (isMuted) return;
  initAudio(); // Ensure context is ready

  if (!sounds[name]) {
    let src = "";
    if (name === "playerShoot") {
      // High pitch laser
      src =
        "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...";
      // (Using a placeholder short string for brevity in prompt, but I will use a real simple generated base64 or keep the existing one as playerShoot)
      // Actually, I'll use the existing "shoot" sound for playerShoot and a different one for enemyShoot.
      src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYQAAAAA/////wAA//8AAP//AAD//wAA//8AAP//AAD//wAA";
    } else if (name === "enemyShoot") {
      // Lower pitch / noise
      src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZAAAAAA//8AAP//AAD//wAA//8AAP//AAD//wAA//8AAP//AAD//wAA";
    } else if (name === "explode") {
      // Noise burst
      src =
        "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWQAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAD//wAA";
    } else {
      // Fallback/Menu click
      src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYQAAAAA/////wAA//8AAP//AAD//wAA//8AAP//AAD//wAA";
    }
    sounds[name] = new Audio(src);
  }

  const snd = sounds[name].cloneNode(true) as HTMLAudioElement;
  snd.volume = volume;
  snd.play().catch(() => {});
}

// 🎶 Main music controller
export function playMusic(name: string, volume = 0.4) {
  if (isMuted) return;
  initAudio();
  if (masterGain) masterGain.gain.setValueAtTime(volume, audioCtx!.currentTime);
  startDrone();
}

// 🕹️ Fade out current music smoothly
export function fadeOutMusic(duration = 1000) {
  stopDrone();
}

// 🔁 Resume / fade in music
export function resumeMusic(targetVolume = 0.4, duration = 1000) {
  if (isMuted) return;
  initAudio();
  if (masterGain)
    masterGain.gain.setValueAtTime(targetVolume, audioCtx!.currentTime);
  startDrone();
}

// ⏹️ Stop music entirely
export function stopMusic() {
  stopDrone();
}

// 🔇 Toggle mute / unmute
export function toggleMusic() {
  isMuted = !isMuted;
  if (isMuted) {
    stopMusic();
  } else {
    playMusic("theme");
  }
}

export function getMusicMuted() {
  return isMuted;
}
