// utils/audio.ts

// utils/audio.ts

const sounds: Record<string, HTMLAudioElement> = {};
let isMuted = false;
let bgMusic: HTMLAudioElement | null = null;
let currentMusicVolume = 0.4;
let fadeInterval: NodeJS.Timeout | null = null;

// Initialize Audio Context (still useful for some interactions, though we are switching to HTML5 Audio for files mainly)
// We'll keep the structure simple: use HTML5 Audio for everything for simplicity with provided files.

export function initAudio() {
  if (!bgMusic) {
    bgMusic = new Audio("/sounds/Envato-background_music.mp3");
    bgMusic.loop = true;
  }
}

// 🔊 Play short SFX (shoot, explosion, etc.)
export function playSound(name: string, volume = 0.5) {
  if (isMuted) return;

  if (!sounds[name]) {
    let src = "";
    if (name === "playerShoot") {
      src = "/sounds/mixkit-falling-hit-my-ship.wav";
    } else if (name === "smallEnemyShoot") {
      src = "/sounds/mixkit-short-laser-gun-shot-small_enemy.wav";
    } else if (name === "bigEnemyShoot") {
      src = "/sounds/mixkit-space-shot-big_enemy.wav";
    } else if (name === "enemyShoot") {
      // Fallback for legacy calls
      src = "/sounds/mixkit-short-laser-gun-shot-small_enemy.wav";
    } else if (name === "explode") {
      // Noise burst (keep existing base64 or placeholder)
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

  if (bgMusic) {
    bgMusic.volume = volume;
    currentMusicVolume = volume;
    bgMusic.play().catch((e) => console.warn("Music play failed:", e));
  }
}

// 🕹️ Fade out current music smoothly
export function fadeOutMusic(duration = 1000) {
  if (!bgMusic || bgMusic.paused) return;

  const startVolume = bgMusic.volume;
  const steps = 10;
  const stepTime = duration / steps;
  let step = 0;

  if (fadeInterval) clearInterval(fadeInterval);

  fadeInterval = setInterval(() => {
    step++;
    const newVol = startVolume * (1 - step / steps);
    if (bgMusic) bgMusic.volume = Math.max(0, newVol);

    if (step >= steps) {
      if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0; // Optional: reset to start
      }
      if (fadeInterval) clearInterval(fadeInterval);
    }
  }, stepTime);
}

// 🔁 Resume / fade in music
export function resumeMusic(targetVolume = 0.4, duration = 1000) {
  if (isMuted) return;
  initAudio();

  if (fadeInterval) clearInterval(fadeInterval);

  if (bgMusic) {
    bgMusic.volume = 0;
    bgMusic.play().catch((e) => console.warn("Music resume failed:", e));

    const steps = 10;
    const stepTime = duration / steps;
    let step = 0;

    fadeInterval = setInterval(() => {
      step++;
      const newVol = targetVolume * (step / steps);
      if (bgMusic) bgMusic.volume = Math.min(targetVolume, newVol);

      if (step >= steps) {
        if (fadeInterval) clearInterval(fadeInterval);
      }
    }, stepTime);
  }
}

// ⏹️ Stop music entirely
export function stopMusic() {
  if (fadeInterval) clearInterval(fadeInterval);
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}

// 🔇 Toggle mute / unmute
export function toggleMusic() {
  isMuted = !isMuted;
  if (isMuted) {
    stopMusic();
  } else {
    playMusic("theme", currentMusicVolume);
  }
}

export function getMusicMuted() {
  return isMuted;
}
