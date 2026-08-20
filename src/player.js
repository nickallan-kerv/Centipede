export class Player {
  constructor(fieldWidth, fieldHeight) {
    this.width = 28;
    this.height = 20;
    this.speed = 300;

    this.playMinX = 0;
    this.playMaxX = fieldWidth;
    this.playMinY = Math.floor(fieldHeight * 0.62);
    this.playMaxY = fieldHeight;

    this.x = fieldWidth / 2 - this.width / 2;
    this.y = fieldHeight - this.height - 16;

    this.startX = this.x;
    this.startY = this.y;
  }

  update(dt, input) {
    let dx = 0;
    let dy = 0;

    if (input.isDown("ArrowLeft") || input.isDown("KeyA")) {
      dx -= 1;
    }
    if (input.isDown("ArrowRight") || input.isDown("KeyD")) {
      dx += 1;
    }
    if (input.isDown("ArrowUp") || input.isDown("KeyW")) {
      dy -= 1;
    }
    if (input.isDown("ArrowDown") || input.isDown("KeyS")) {
      dy += 1;
    }

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy) || 1;
      dx /= length;
      dy /= length;
    }

    this.x += dx * this.speed * dt;
    this.y += dy * this.speed * dt;

    this.x = Math.max(this.playMinX, Math.min(this.x, this.playMaxX - this.width));
    this.y = Math.max(this.playMinY, Math.min(this.y, this.playMaxY - this.height));
  }

  getMuzzle() {
    return {
      x: this.x + this.width / 2,
      y: this.y
    };
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  resetPosition() {
    this.x = this.startX;
    this.y = this.startY;
  }

  draw(ctx) {
    ctx.fillStyle = "#34d399";
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
  }
}
