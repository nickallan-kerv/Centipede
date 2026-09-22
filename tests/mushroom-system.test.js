import { describe, expect, it } from "vitest";
import {
  consumeMushroomHits,
  createMushroomState,
  getMushroomObstacles,
  resetMushroomState,
  spawnMushrooms
} from "../src/mushroom-system.js";

class FakeProjectileSystem {
  constructor(hitsByIndex) {
    this.hitsByIndex = new Map(hitsByIndex);
    this.cursor = 0;
  }

  consumeHits() {
    const hits = this.hitsByIndex.get(this.cursor) ?? 0;
    this.cursor += 1;
    return hits;
  }
}

describe("mushroom-system", () => {
  it("creates deterministic mushroom state with requested count", () => {
    let call = 0;
    const randomFn = () => {
      call += 1;
      return call % 2 === 0 ? 0.5 : 0.25;
    };

    const state = createMushroomState(640, 600, 360, randomFn, 4);

    expect(state.mushrooms).toHaveLength(4);
    expect(state.mushrooms[0].width).toBe(18);
    expect(state.mushrooms[0].hitsRemaining).toBe(3);
  });

  it("applies projectile hits and removes destroyed mushrooms", () => {
    const state = createMushroomState(640, 600, 360, () => 0.3, 3);
    const projectileSystem = new FakeProjectileSystem([
      [0, 1],
      [1, 3],
      [2, 0]
    ]);

    const result = consumeMushroomHits(state, projectileSystem);

    expect(result.damaged).toBe(2);
    expect(result.destroyed).toBe(1);
    expect(state.mushrooms).toHaveLength(2);
    expect(state.mushrooms[0].hitsRemaining).toBe(2);
  });

  it("resets mushrooms back to initial state", () => {
    const state = createMushroomState(640, 600, 360, () => 0.2, 2);
    consumeMushroomHits(
      state,
      new FakeProjectileSystem([
        [0, 3],
        [1, 1]
      ])
    );

    resetMushroomState(state);

    expect(state.mushrooms).toHaveLength(2);
    expect(state.mushrooms[0].hitsRemaining).toBe(3);
  });

  it("exposes active mushrooms as centipede obstacles", () => {
    const state = createMushroomState(640, 600, 360, () => 0.4, 2);

    const obstacles = getMushroomObstacles(state);

    expect(obstacles).toHaveLength(2);
    expect(obstacles[0]).toHaveProperty("x");
    expect(obstacles[0]).toHaveProperty("width");
  });

  it("spawns mushrooms at provided positions", () => {
    const state = createMushroomState(640, 600, 360, () => 0.4, 0);

    const result = spawnMushrooms(state, [
      { x: 40, y: 50 },
      { x: 120, y: 90 }
    ]);

    expect(result.spawned).toBe(2);
    expect(state.mushrooms).toHaveLength(2);
    expect(state.mushrooms[0].hitsRemaining).toBe(3);
  });

  it("does not spawn overlapping duplicate mushrooms", () => {
    const state = createMushroomState(640, 600, 360, () => 0.4, 0);

    spawnMushrooms(state, [{ x: 80, y: 80 }]);
    const result = spawnMushrooms(state, [{ x: 80, y: 80 }]);

    expect(result.spawned).toBe(0);
    expect(state.mushrooms).toHaveLength(1);
  });
});
