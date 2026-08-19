export class ProjectileSystem {
  constructor(fieldHeight) {
    this.projectiles = [];
    this.speed = 520;
    this.fireCooldownSeconds = 0.17;
    this.cooldownRemaining = 0;
    this.fieldHeight = fieldHeight;
  }

  update(dt) {
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);

    for (const p of this.projectiles) {
      p.y -= this.speed * dt;
    }

    this.projectiles = this.projectiles.filter((p) => p.y > -16);
  }

  tryFire(originX, originY) {
    if (this.cooldownRemaining > 0) {
      return false;
    }

    this.projectiles.push({
      x: originX - 2,
      y: originY - 10,
      width: 4,
      height: 10
    });

    this.cooldownRemaining = this.fireCooldownSeconds;
    return true;
  }

  draw(ctx) {
    ctx.fillStyle = "#fbbf24";
    for (const p of this.projectiles) {
      ctx.fillRect(p.x, p.y, p.width, p.height);
    }
  }

  count() {
    return this.projectiles.length;
  }
}
