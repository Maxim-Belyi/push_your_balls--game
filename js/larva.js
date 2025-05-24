import { Sounds } from "./audio.js";
import { playerGameScore, hatchlingsLost } from "./variables.js";
import { Firefly } from "./particle.js";
import { Spark } from "./particle.js";

export class Larva {
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