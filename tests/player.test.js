import { describe, expect, it } from "vitest";
import { Player } from "../src/player.js";

function inputStub(activeCodes) {
  return {
    isDown(code) {
      return activeCodes.includes(code);
    }
  };
}

describe("player", () => {
  it("moves right when right key is pressed", () => {
    const player = new Player(800, 600);
    const startX = player.x;

    player.update(0.1, inputStub(["ArrowRight"]));

    expect(player.x).toBeGreaterThan(startX);
  });

  it("stays within movement bounds", () => {
    const player = new Player(800, 600);

    for (let i = 0; i < 200; i += 1) {
      player.update(0.1, inputStub(["ArrowLeft", "ArrowUp"]));
    }

    expect(player.x).toBeGreaterThanOrEqual(player.playMinX);
    expect(player.y).toBeGreaterThanOrEqual(player.playMinY);
  });

  it("resets to start position", () => {
    const player = new Player(800, 600);
    player.update(0.2, inputStub(["ArrowRight", "ArrowUp"]));

    player.resetPosition();
    expect(player.x).toBe(player.startX);
    expect(player.y).toBe(player.startY);
  });
});
