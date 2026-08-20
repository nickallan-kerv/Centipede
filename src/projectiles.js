export class ProjectileSystem {
  constructor(fieldHeight) {
    this.projectiles = [];
    this.speed = 520;
    this.defaultFireCooldownSeconds = 0.17;
    this.fireCooldownSeconds = this.defaultFireCooldownSeconds;
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

  setFireCooldown(seconds) {
    this.fireCooldownSeconds = Math.max(0.05, seconds);
    this.cooldownRemaining = Math.min(this.cooldownRemaining, this.fireCooldownSeconds);
  }

  reset() {
    this.projectiles = [];
    this.cooldownRemaining = 0;
    this.fireCooldownSeconds = this.defaultFireCooldownSeconds;
  }

  consumeHits(rect) {
    if (!rect) {
      return 0;
    }

    let hits = 0;
    this.projectiles = this.projectiles.filter((p) => {
      const intersects =
        p.x < rect.x + rect.width &&
        p.x + p.width > rect.x &&
        p.y < rect.y + rect.height &&
        p.y + p.height > rect.y;

      if (intersects) {
        hits += 1;
        return false;
      }

      return true;
    });

    return hits;
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
