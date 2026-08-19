import { Game } from "./game.js";

const canvas = document.getElementById("game");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Game canvas not found.");
}

const game = new Game(canvas);

let lastTimeMs = performance.now();

function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - lastTimeMs) / 1000);
  lastTimeMs = nowMs;

  game.update(dt);
  game.draw();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
