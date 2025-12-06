// utils/audio.ts

const sounds: Record<string, HTMLAudioElement> = {};
let music: HTMLAudioElement | null = null;
let isMuted = false;
let fadeInterval: NodeJS.Timeout | null = null;

const musicLibrary: Record<string, string> = {
  theme: "/sounds/theme.mp3", // 🎵 Replace with your actual path
  intro: "/sounds/intro.mp3",
  battle: "/sounds/battle.mp3",
};

// 🔊 Play short SFX (shoot, explosion, etc.)
export function playSound(name: string, volume = 0.5) {
  if (isMuted) return;

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
  stopMusic();

  const src = musicLibrary[name] || musicLibrary["theme"];
  music = new Audio(src);
  music.loop = true;
  music.volume = volume;
  music.play().catch(() => {});
}

// 🕹️ Fade out current music smoothly
export function fadeOutMusic(duration = 1000) {
  if (!music) return;
  if (fadeInterval) clearInterval(fadeInterval);

  const startVol = music.volume;
  const step = startVol / (duration / 50);

  fadeInterval = setInterval(() => {
    if (!music) return;
    if (music.volume > step) {
      music.volume -= step;
    } else {
      music.pause();
      music.volume = startVol; // reset for next time
      clearInterval(fadeInterval!);
    }
  }, 50);
}

// 🔁 Resume / fade in music
export function resumeMusic(targetVolume = 0.4, duration = 1000) {
  if (!music || isMuted) return;

  if (fadeInterval) clearInterval(fadeInterval);
  music.play().catch(() => {});

  let vol = 0;
  music.volume = 0;

  const step = targetVolume / (duration / 50);
  fadeInterval = setInterval(() => {
    if (!music) return;
    if (vol < targetVolume) {
      vol += step;
      music.volume = Math.min(vol, targetVolume);
    } else {
      clearInterval(fadeInterval!);
    }
  }, 50);
}

// ⏹️ Stop music entirely
export function stopMusic() {
  if (fadeInterval) clearInterval(fadeInterval);
  if (music) {
    music.pause();
    music = null;
  }
}

// 🔇 Toggle mute / unmute
export function toggleMusic() {
  isMuted = !isMuted;
  if (isMuted) {
    if (music) music.pause();
  } else {
    if (music) music.play().catch(() => {});
  }
}

export function getMusicMuted() {
  return isMuted;
}
