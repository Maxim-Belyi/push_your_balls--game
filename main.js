import { Sounds } from "./js/audio.js";
import { Player } from "./js/player.js";
import { Obstacle } from "./js/obstacle.js";
import { Enemy } from "./js/enemy.js";
import { Particle } from "./js/particle.js";

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");

  const playerGameScore = document.getElementById("player-score-value");
  const hatchlingsLost = document.getElementById("enemy-score-value");
  let playerHatchlings = parseInt(playerGameScore.innerText);
  let enemyHatchlings = parseInt(hatchlingsLost.innerText);

  let numberOfObstacles = 8;

  let maxNumberOfEggs = 7;
  let eggsAppearanceInterval = 2000;

  let numberOfEnemies = 4;

  const gameFps = 30;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.fillStyle = "white";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "black";
  ctx.font = "50px Bangers, cursive";
  ctx.textAlign = "center";

  class Egg {
    constructor(game) {
      this.game = game;
      this.collisionRadius = 50;
      this.margin = this.collisionRadius * 2;
      this.collisionX =
        this.margin + Math.random() * (this.game.width - this.margin * 1.5);
      this.collisionY =
        this.game.topMargin +
        Math.random() * (this.game.height - this.game.topMargin - this.margin);

      this.image = document.getElementById("egg");
      this.spriteWidth = 110;
      this.spriteHeight = 135;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.hatchInterval = 8000;
      this.hatchTimer = 0;
      this.markedForDeletion = false;
    }
    draw(context) {
      context.drawImage(this.image, this.spriteX, this.spriteY);
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
        const displayTimer = (this.hatchTimer * 0.01).toFixed(0);
        context.fillText(
          displayTimer,
          this.collisionX,
          this.collisionY - this.collisionRadius
        );
      }
    }

    update(deltaTime) {
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 10;

      //collisions
      let collisionObjects = [
        this.game.player,
        ...this.game.obstacles,
        ...this.game.enemies,
      ];
      collisionObjects.forEach((object) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });
      //hatching
      if (
        this.hatchTimer > this.hatchInterval ||
        this.collisionY < this.game.topMargin
      ) {
        this.game.hatchlings.push(
          new Larva(this.game, this.collisionX, this.collisionY)
        );
        this.markedForDeletion = true;
        this.game.removeGameObjects();
      } else {
        this.hatchTimer += deltaTime;
      }
    }
  }

  class Larva {
    constructor(game, x, y) {
      this.game = game;
      this.collisionX = x;
      this.collisionY = y;
      this.collisionRadius = 40;
      this.image = document.getElementById("larva");
      this.spriteWidth = 150;
      this.spriteHeight = 150;
      this.sparksValue = 9;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.spriteX;
      this.spriteY;
      this.speedY = 1 + Math.random();
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 2);
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.spriteX,
        this.spriteY,
        this.width,
        this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(
          this.collisionX,
          this.collisionY,
          this.collisionRadius,
          0,
          Math.PI * 2
        );
        context.save();
        context.globalAlpha = 0.5;
        context.fill();
        context.restore();
        context.stroke();
      }
    }

    update() {
      this.collisionY -= this.speedY;
      this.spriteX = this.collisionX - this.width * 0.5;
      this.spriteY = this.collisionY - this.height * 0.5 - 35;

      // move to safety place
      if (this.collisionY < this.game.topMargin) {
        this.markedForDeletion = true;
        this.game.removeGameObjects();
        this.game.score++;
        Sounds.play("larvaSaved");

        playerGameScore.innerText = this.game.score;
        for (let i = 0; i < this.sparksValue; i++) {
          Sounds.play("larvaSaved");
          this.game.particles.push(
            new Firefly(this.game, this.collisionX, this.collisionY, "gold")
          );
        }
      }

      //collision with gameObjects
      let collisionObjects = [this.game.player, ...this.game.obstacles];
      collisionObjects.forEach((object) => {
        let [collision, distance, sumOfRadii, dx, dy] =
          this.game.checkCollision(this, object);
        if (collision) {
          const unit_x = dx / distance;
          const unit_y = dy / distance;
          this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
          this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
        }
      });

      // collision with enemies
      this.game.enemies.forEach((enemy) => {
        if (this.game.checkCollision(this, enemy)[0]) {
          this.markedForDeletion = true;
          this.game.removeGameObjects();
          this.game.lostHatchlings++;
          Sounds.play("larvaEaten");
          hatchlingsLost.innerText = this.game.lostHatchlings;
          for (let i = 0; i < this.sparksValue; i++) {
            this.game.particles.push(
              new Spark(this.game, this.collisionX, this.collisionY, "red")
            );
          }
        }
      });
    }
  }

  class Firefly extends Particle {
    update() {
      this.angle += this.va;
      this.collisionX += Math.cos(this.angle) * this.speedX;
      this.collisionY -= this.speedY;
      if (this.collisionY < 0 - this.radius) {
        this.markedForDeletion = true;
        this.game.removeGameObjects();
      }
    }
  }

  class Spark extends Particle {
    update() {
      this.angle += this.va * 0.5;
      this.collisionX -= Math.sin(this.angle) * this.speedX;
      this.collisionY -= Math.cos(this.angle) * this.speedY;
      if (this.radius > 0.1) this.radius -= 0.05;
      if (this.radius < 0.2) {
        this.markedForDeletion = true;
        this.game.removeGameObjects();
      }
    }
  }

  class Game {
    constructor(canvas) {
      this.gameOver = true;
      this.canvas = canvas;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.topMargin = 260;
      this.debug = false;
      this.player = new Player(this);
      this.fps = gameFps;
      this.timer = 0;
      this.interval = 1000 / this.fps;
      this.eggTimer = 0;
      this.lastEnemyAddedAtScore = 0;
      this.lastEggsScore = 0;
      this.lastSpeedBoostScore = 0;
      this.eggInterval = eggsAppearanceInterval;
      this.numberOfObstacles = numberOfObstacles;
      this.maxEggs = maxNumberOfEggs;
      this.winningScore = 100;
      this.obstacles = [];
      this.enemies = [];
      this.eggs = [];
      this.hatchlings = [];
      this.particles = [];
      this.gameObjects = [];
      this.score = playerHatchlings;
      this.lostHatchlings = enemyHatchlings;
      this.mouse = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        pressed: false,
      };

      const startGameWrapper = document.getElementById("start-game-div");
      const startGameButton = document.getElementById("start-game-button");
      if (
        startGameButton.addEventListener("click", () => {
          musicToggle.disabled = false;
          this.gameOver = false;
          Sounds.play("main");
          game.init();
          animate(0);
          startGameWrapper.classList.add("visually-hidden");
        })
      );

      canvas.addEventListener("mousedown", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = true;
      });

      canvas.addEventListener("mouseup", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.mouse.pressed = false;
      });

      canvas.addEventListener("mousemove", (e) => {
        if (this.mouse.pressed) {
          this.mouse.x = e.offsetX;
          this.mouse.y = e.offsetY;
        }
      });

      window.addEventListener("keydown", (e) => {
        if (e.key == "z") this.debug = !this.debug;
      });
    }

    render(context, deltaTime) {
      if (this.timer > this.interval) {
        context.clearRect(0, 0, this.width, this.height);
        this.gameObjects = [
          this.player,
          ...this.enemies,
          ...this.eggs,
          ...this.obstacles,
          ...this.hatchlings,
          ...this.particles,
        ];

        // pseudo 3d
        this.gameObjects.sort((a, b) => {
          return a.collisionY - b.collisionY;
        });
        this.gameObjects.forEach((object) => {
          object.draw(context);
          object.update(deltaTime);
        });
      }
      this.timer += deltaTime;

      //add eggs periodically
      if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs) {
        this.addEgg();
        this.eggTimer = 0;
      } else {
        this.eggTimer += deltaTime;
      }

      // frequency of enemy appearances
      if (
        this.score > 0 &&
        this.score % 5 === 0 &&
        this.score !== this.lastEnemyAddedAtScore && this.enemies.length <= 15
      ) {
        this.addEnemy();
        this.lastEnemyAddedAtScore = this.score;
      }

      // frequency of eggs appearances
      if (
        this.score > 0 &&
        this.score % 20 === 0 &&
        this.score !== this.lastEggsScore
      ) {
        this.addEgg();
        this.lastEggsScore = this.score;
      }

      // increasing the speed of the player and enemies
      if (
        this.score > 0 &&
        this.score % 10 === 0 &&
        this.score !== this.lastSpeedBoostScore &&
        this.lastSpeedBoostScore <= 12
      ) {
        this.player.speedModifier += 1;
        this.enemies.speedModifier++;
        this.lastSpeedBoostScore = this.score;
        eggsAppearanceInterval = eggsAppearanceInterval - 150;
        console.log(
          `speed increased for ${this.player.speedModifier} to score = ${this.score}`
        );
      }

      //win / lose message
      if (this.score >= this.winningScore) {
        this.gameOver = true;
        document.getElementById("score-html-display").textContent = this.score;
        document.getElementById("end-game-div").classList.remove("visually-hidden");
        document.getElementById("score-html-hatchling").textContent = this.lostHatchlings;
      }
    }

    checkCollision(a, b) {
      const dx = a.collisionX - b.collisionX;
      const dy = a.collisionY - b.collisionY;
      const distance = Math.hypot(dy, dx);
      const sumOfRadii = a.collisionRadius + b.collisionRadius;

      return [distance < sumOfRadii, distance, sumOfRadii, dx, dy];
    }

    addEgg() {
      this.eggs.push(new Egg(this));
    }

    addEnemy() {
      this.enemies.push(new Enemy(this));
    }

    removeGameObjects() {
      this.eggs = this.eggs.filter((object) => !object.markedForDeletion);
      this.hatchlings = this.hatchlings.filter(
        (object) => !object.markedForDeletion
      );

      this.particles = this.particles.filter(
        (object) => !object.markedForDeletion
      );
    }

    init() {
      for (let i = 0; i < numberOfEnemies; i++) {
        this.addEnemy();
      }

      let attempts = 0;
      while (this.obstacles.length < this.numberOfObstacles && attempts < eggsAppearanceInterval) {
        let testObstacle = new Obstacle(this);
        let overlap = false;
        this.obstacles.forEach((obstacle) => {
          const dx = testObstacle.collisionX - obstacle.collisionX;
          const dy = testObstacle.collisionY - obstacle.collisionY;
          const distance = Math.hypot(dy, dx);
          const distanceBuffer = 250;
          const sumOfRadii =
            testObstacle.collisionRadius +
            obstacle.collisionRadius +
            distanceBuffer;
          if (distance < sumOfRadii) {
            overlap = true;
          }
        });
        const margin = testObstacle.collisionRadius * 2;
        if (
          !overlap &&
          testObstacle.spriteX > 0 &&
          testObstacle.spriteX < this.width - testObstacle.width &&
          testObstacle.collisionY > this.topMargin + margin &&
          testObstacle.collisionY < this.height - margin
        ) {
          this.obstacles.push(testObstacle);
        }
        attempts++;
      }
    }
  }
  const game = new Game(canvas);
  game.init();

  //music toggle
  const musicToggle = document.getElementById("music-toggle");
  musicToggle.disabled = true;
  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      const [musicToggleOff, musicToggleOn] = musicToggle.children;

      musicToggleOn.classList.toggle("visually-hidden");
      musicToggleOff.classList.toggle("visually-hidden");
      Sounds.toggleMute();
      console.log("is pause: ", Sounds.isMuted);
      console.log("is playing: ", Sounds.isPlaying);
    });
  }

  //calculate and correct delta animation time
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    game.render(ctx, deltaTime);
    if (!game.gameOver) requestAnimationFrame(animate);
  }

  animate(0);
});
