import { InputController } from "./input.js";
import { Player } from "./player.js";
import { ProjectileSystem } from "./projectiles.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.fieldWidth = canvas.width;
    this.fieldHeight = canvas.height;

    this.input = new InputController();
    this.player = new Player(this.fieldWidth, this.fieldHeight);
    this.projectiles = new ProjectileSystem(this.fieldHeight);

    this.isPaused = false;
    this.elapsedSeconds = 0;
    this.shotsFired = 0;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
  }

  update(dt) {
    if (this.input.consumePressed("KeyP")) {
      this.togglePause();
    }

    if (this.isPaused) {
      this.input.endFrame();
      return;
    }

    this.elapsedSeconds += dt;

    this.player.update(dt, this.input);

    if (this.input.isDown("Space")) {
      const muzzle = this.player.getMuzzle();
      const fired = this.projectiles.tryFire(muzzle.x, muzzle.y);
      if (fired) {
        this.shotsFired += 1;
      }
    }

    this.projectiles.update(dt);
    this.input.endFrame();
  }

  draw() {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.fieldWidth, this.fieldHeight);

    this.drawPlayRegion(ctx);
    this.player.draw(ctx);
    this.projectiles.draw(ctx);
    this.drawHud(ctx);

    if (this.isPaused) {
      this.drawPauseOverlay(ctx);
    }
  }

  drawPlayRegion(ctx) {
    const playerZoneTop = this.player.playMinY;

    ctx.fillStyle = "rgba(96, 165, 250, 0.08)";
    ctx.fillRect(0, playerZoneTop, this.fieldWidth, this.fieldHeight - playerZoneTop);

    ctx.strokeStyle = "rgba(96, 165, 250, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, playerZoneTop);
    ctx.lineTo(this.fieldWidth, playerZoneTop);
    ctx.stroke();
  }

  drawHud(ctx) {
    ctx.fillStyle = "#dbe6f5";
    ctx.font = "16px Segoe UI, sans-serif";
    ctx.fillText(`Time: ${this.elapsedSeconds.toFixed(1)}s`, 12, 24);
    ctx.fillText(`Projectiles: ${this.projectiles.count()}`, 12, 46);
    ctx.fillText(`Shots Fired: ${this.shotsFired}`, 12, 68);

    ctx.fillStyle = this.isPaused ? "#fbbf24" : "#34d399";
    ctx.fillText(this.isPaused ? "Status: Paused" : "Status: Running", 12, 90);
  }

  drawPauseOverlay(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, this.fieldWidth, this.fieldHeight);

    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    ctx.font = "bold 36px Segoe UI, sans-serif";
    ctx.fillText("Paused", this.fieldWidth / 2, this.fieldHeight / 2 - 8);

    ctx.fillStyle = "#dbe6f5";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText("Press P to resume", this.fieldWidth / 2, this.fieldHeight / 2 + 26);
    ctx.textAlign = "left";
  }
}
