export const Sounds = {
  audio: {},
  isPlaying: true,
  isMuted: false,
  init() {
    this.audio.main = new Audio("https://github.com/Maxim-Belyi/push_your_balls--game/raw/refs/heads/main/media/main-theme.mp3");
    this.audio.main.volume = 0.3;
    this.audio.main.loop = true;

    this.audio.larvaEaten = new Audio("https://github.com/Maxim-Belyi/push_your_balls--game/raw/refs/heads/main/media/larva-eaten.mp3");
    this.audio.larvaEaten.volume = 0.2;

    this.audio.larvaSaved = new Audio("https://github.com/Maxim-Belyi/push_your_balls--game/raw/refs/heads/main/media/larva-saved.mp3");
    this.audio.larvaSaved.volume = 0.2;
  },

  play(name) {
    this.audio[name].play();
  },

  pauseAll() {
    Object.values(this.audio).forEach((audio) => audio.pause());
  },

  resumeAll() {
    Object.values(this.audio).forEach((audio) => {
      audio.play();
    });
  },

  toggleMute() {
    if (this.isPlaying) {
      this.pauseAll();
      this.isPlaying = false;
      this.isMuted = true;

    } else if (this.isMuted) {
      this.resumeAll();
      this.isPlaying = true;
      this.isMuted = false
    }
  },
};

// document.getElementById("music-toggle")?.addEventListener("click", () => {
//   Sounds.toggleMute();
// });

Sounds.init();
