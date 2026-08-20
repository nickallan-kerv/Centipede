import { describe, expect, it } from "vitest";
import {
  consumeSegmentHits,
  createCentipedeForLevel,
  intersectsCentipede,
  updateCentipede
} from "../src/centipede-system.js";

class FakeProjectileSystem {
  constructor(hitsBySegmentIndex) {
    this.hitsBySegmentIndex = new Map(hitsBySegmentIndex);
    this.cursor = 0;
  }

  consumeHits() {
    const hits = this.hitsBySegmentIndex.get(this.cursor) ?? 0;
    this.cursor += 1;
    return hits;
  }
}

describe("centipede-system", () => {
  it("creates a segmented centipede", () => {
    const centipede = createCentipedeForLevel(640, 1, () => 0.5, 6);

    expect(centipede.segments).toHaveLength(6);
    expect(centipede.segments[0].width).toBeGreaterThan(0);
    expect(centipede.segments[0].x).toBeGreaterThan(0);
  });

  it("reverses direction and descends when it reaches an edge", () => {
    const centipede = createCentipedeForLevel(140, 1, () => 0.98, 3);
    const startY = centipede.segments[0].y;
    const startDirection = centipede.direction;

    updateCentipede(centipede, 0.2, 140, 600);

    expect(centipede.direction).toBe(-startDirection);
    expect(centipede.segments[0].y).toBe(startY + centipede.stepDown);
  });

  it("removes hit segments and reports destroyed count", () => {
    const centipede = createCentipedeForLevel(640, 1, () => 0.2, 4);
    const projectileSystem = new FakeProjectileSystem([
      [0, 0],
      [1, 1],
      [2, 0],
      [3, 1]
    ]);

    const result = consumeSegmentHits(centipede, projectileSystem);

    expect(result.destroyedSegments).toBe(2);
    expect(centipede.segments).toHaveLength(2);
  });

  it("detects player intersection with any segment", () => {
    const centipede = createCentipedeForLevel(640, 1, () => 0.4, 2);
    const first = centipede.segments[0];

    expect(
      intersectsCentipede(centipede, {
        x: first.x,
        y: first.y,
        width: first.width,
        height: first.height
      })
    ).toBe(true);
  });
});
