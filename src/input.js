export class InputController {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();

    window.addEventListener("keydown", (event) => {
      const code = event.code;
      if (!this.down.has(code)) {
        this.pressed.add(code);
      }
      this.down.add(code);

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(code)) {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.down.delete(event.code);
    });
  }

  isDown(code) {
    return this.down.has(code);
  }

  consumePressed(code) {
    if (!this.pressed.has(code)) {
      return false;
    }
    this.pressed.delete(code);
    return true;
  }

  endFrame() {
    this.pressed.clear();
  }
}
