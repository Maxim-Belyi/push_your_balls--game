import { Larva } from "./larva.js";

export class Egg {
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
