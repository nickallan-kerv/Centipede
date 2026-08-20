import { InputController } from "./input.js";
import { Player } from "./player.js";
import { ProjectileSystem } from "./projectiles.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D canvas context is unavailable.");
    }
    this.ctx = ctx;

    this.fieldWidth = canvas.width;
    this.fieldHeight = canvas.height;

    this.input = new InputController();
    this.player = new Player(this.fieldWidth, this.fieldHeight);
    this.projectiles = new ProjectileSystem(this.fieldHeight);

    this.isPaused = false;
    this.elapsedSeconds = 0;
    this.shotsFired = 0;

    this.score = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.isGameOver = false;

    this.enemy = this.createEnemy();
    this.enemyRespawnDelaySeconds = 0;
    this.playerHitInvulnerabilitySeconds = 0;
  }

  createEnemy() {
    return {
      width: 26,
      height: 18,
      x: Math.random() * (this.fieldWidth - 26),
      y: -20,
      speed: 120 + Math.random() * 60
    };
  }

  intersects(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  resetEnemy() {
    this.enemy = this.createEnemy();
  }

  togglePause() {
    if (this.isGameOver) {
      return;
    }
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

    if (this.isGameOver) {
      this.input.endFrame();
      return;
    }

    this.elapsedSeconds += dt;
    this.playerHitInvulnerabilitySeconds = Math.max(0, this.playerHitInvulnerabilitySeconds - dt);

    this.player.update(dt, this.input);

    if (this.input.isDown("Space")) {
      const muzzle = this.player.getMuzzle();
      const fired = this.projectiles.tryFire(muzzle.x, muzzle.y);
      if (fired) {
        this.shotsFired += 1;
      }
    }

    this.projectiles.update(dt);

    if (this.enemyRespawnDelaySeconds > 0) {
      this.enemyRespawnDelaySeconds = Math.max(0, this.enemyRespawnDelaySeconds - dt);
      if (this.enemyRespawnDelaySeconds === 0) {
        this.resetEnemy();
      }
    } else {
      this.enemy.y += this.enemy.speed * dt;
      if (this.enemy.y > this.fieldHeight + 20) {
        this.resetEnemy();
      }

      const projectileHits = this.projectiles.consumeHits(this.enemy);
      if (projectileHits > 0) {
        this.score += projectileHits * 100;
        this.resetEnemy();
      }

      if (this.playerHitInvulnerabilitySeconds === 0 && this.intersects(this.player.getBounds(), this.enemy)) {
        this.lives = Math.max(0, this.lives - 1);
        this.player.resetPosition();
        this.playerHitInvulnerabilitySeconds = 1.0;
        this.enemyRespawnDelaySeconds = 0.75;
        this.enemy = null;

        if (this.lives === 0) {
          this.isGameOver = true;
        }
      }
    }

    this.input.endFrame();
  }

  draw() {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.fieldWidth, this.fieldHeight);

    this.drawPlayRegion(ctx);
    this.player.draw(ctx);
    this.projectiles.draw(ctx);
    this.drawEnemy(ctx);
    this.drawHud(ctx);

    if (this.isPaused) {
      this.drawPauseOverlay(ctx);
    }

    if (this.isGameOver) {
      this.drawGameOverOverlay(ctx);
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
    ctx.fillText(`Score: ${this.score}`, 12, 46);
    ctx.fillText(`Lives: ${this.lives}/${this.maxLives}`, 12, 68);
    ctx.fillText(`Projectiles: ${this.projectiles.count()}`, 12, 90);
    ctx.fillText(`Shots Fired: ${this.shotsFired}`, 12, 112);

    ctx.fillStyle = this.isPaused ? "#fbbf24" : "#34d399";
    if (this.isGameOver) {
      ctx.fillStyle = "#f87171";
      ctx.fillText("Status: Game Over", 12, 134);
      return;
    }

    ctx.fillText(this.isPaused ? "Status: Paused" : "Status: Running", 12, 134);
  }

  drawEnemy(ctx) {
    if (!this.enemy) {
      return;
    }

    ctx.fillStyle = "#f97316";
    ctx.fillRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height);

    ctx.strokeStyle = "#fed7aa";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height);
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

  drawGameOverOverlay(ctx) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, this.fieldWidth, this.fieldHeight);

    ctx.fillStyle = "#f87171";
    ctx.textAlign = "center";
    ctx.font = "bold 36px Segoe UI, sans-serif";
    ctx.fillText("Game Over", this.fieldWidth / 2, this.fieldHeight / 2 - 12);

    ctx.fillStyle = "#dbe6f5";
    ctx.font = "18px Segoe UI, sans-serif";
    ctx.fillText(`Final Score: ${this.score}`, this.fieldWidth / 2, this.fieldHeight / 2 + 20);
    ctx.textAlign = "left";
  }
}
