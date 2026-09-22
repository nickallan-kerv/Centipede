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

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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
    const trailingY = centipede.segments[1].y;

    updateCentipede(centipede, 0.2, 140, 600);

    expect(centipede.direction).toBe(-startDirection);
    expect(centipede.segments[0].y).toBe(startY + centipede.stepDown);
    expect(centipede.segments[1].y).toBeLessThanOrEqual(centipede.segments[0].y);
    const gap = distanceBetween(centipede.segments[0], centipede.segments[1]);
    expect(gap).toBeGreaterThanOrEqual(centipede.segmentGap * 0.7);
    expect(gap).toBeLessThanOrEqual(centipede.segmentGap * 1.3);
  });

  it("does not make the tail back up immediately when direction changes", () => {
    const centipede = createCentipedeForLevel(180, 1, () => 0.98, 6);
    const tail = centipede.segments[centipede.segments.length - 1];
    const tailStartX = tail.x;

    updateCentipede(centipede, 0.16, 180, 600);

    const tailAfterTurn = centipede.segments[centipede.segments.length - 1];
    expect(tailAfterTurn.x).toBeGreaterThanOrEqual(tailStartX);
  });

  it("does not allow tail to collapse into the head", () => {
    const centipede = createCentipedeForLevel(1100, 1, () => 0.5, 8);
    const initialDistance = distanceBetween(
      centipede.segments[0],
      centipede.segments[centipede.segments.length - 1]
    );

    for (let i = 0; i < 20; i += 1) {
      updateCentipede(centipede, 0.05, 1100, 600);
    }

    const finalDistance = distanceBetween(
      centipede.segments[0],
      centipede.segments[centipede.segments.length - 1]
    );
    expect(finalDistance).toBeGreaterThan(initialDistance * 0.75);
  });

  it("keeps the tail moving every frame during forward travel", () => {
    const centipede = createCentipedeForLevel(1000, 1, () => 0.55, 7);
    const tailMotion = [];

    for (let i = 0; i < 8; i += 1) {
      const tailBefore = centipede.segments[centipede.segments.length - 1];
      const beforeX = tailBefore.x;
      const beforeY = tailBefore.y;

      updateCentipede(centipede, 0.05, 1000, 600);

      const tailAfter = centipede.segments[centipede.segments.length - 1];
      const moved = Math.hypot(tailAfter.x - beforeX, tailAfter.y - beforeY);
      tailMotion.push(moved);
    }

    for (const moved of tailMotion) {
      expect(moved).toBeGreaterThan(0);
    }
  });

  it("does not move all segments as a rigid block", () => {
    const centipede = createCentipedeForLevel(1000, 1, () => 0.52, 6);
    const before = centipede.segments.map((segment) => ({ x: segment.x, y: segment.y }));

    updateCentipede(centipede, 0.05, 1000, 600);

    const headDeltaX = centipede.segments[0].x - before[0].x;
    const secondDeltaX = centipede.segments[1].x - before[1].x;
    expect(headDeltaX).toBeGreaterThan(0);
    expect(secondDeltaX).toBeGreaterThan(0);
    expect(secondDeltaX).toBeLessThanOrEqual(headDeltaX);
  });

  it("keeps chain spacing stable while following the head", () => {
    const centipede = createCentipedeForLevel(1200, 1, () => 0.45, 6);
    const expectedGap = centipede.segmentGap;

    for (let i = 0; i < 24; i += 1) {
      updateCentipede(centipede, 0.05, 1200, 600);
    }

    for (let i = 1; i < centipede.segments.length; i += 1) {
      const gap = distanceBetween(centipede.segments[i - 1], centipede.segments[i]);
      expect(gap).toBeLessThanOrEqual(expectedGap + 2);
      expect(gap).toBeGreaterThanOrEqual(expectedGap - 2);
    }
  });

  it("reverses direction and descends when next move would hit an obstacle", () => {
    const centipede = createCentipedeForLevel(220, 1, () => 0.7, 3);
    const startY = centipede.segments[0].y;
    const startDirection = centipede.direction;
    const obstacle = {
      x: centipede.segments[0].x + 8,
      y: centipede.segments[0].y,
      width: 20,
      height: 20
    };

    updateCentipede(centipede, 0.1, 220, 600, [obstacle]);

    expect(centipede.direction).toBe(-startDirection);
    expect(centipede.segments[0].y).toBe(startY + centipede.stepDown);
  });

  it("propagates turn descent smoothly through the chain", () => {
    const centipede = createCentipedeForLevel(240, 1, () => 0.6, 5);
    const beforeY = centipede.segments.map((segment) => segment.y);
    const obstacle = {
      x: centipede.segments[0].x + 6,
      y: centipede.segments[0].y,
      width: 20,
      height: 20
    };

    updateCentipede(centipede, 0.12, 240, 600, [obstacle]);

    expect(centipede.segments[0].y).toBeGreaterThan(beforeY[0]);
    expect(centipede.segments[1].y).toBeLessThanOrEqual(centipede.segments[0].y);

    for (let i = 1; i < centipede.segments.length; i += 1) {
      const gap = distanceBetween(centipede.segments[i - 1], centipede.segments[i]);
      expect(gap).toBeLessThanOrEqual(centipede.segmentGap * 1.3);
      expect(gap).toBeGreaterThanOrEqual(centipede.segmentGap * 0.75);
    }
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

  it("splits into two chains when a middle segment is hit", () => {
    const centipede = createCentipedeForLevel(640, 1, () => 0.2, 5);
    const projectileSystem = new FakeProjectileSystem([[2, 1]]);

    const result = consumeSegmentHits(centipede, projectileSystem);

    expect(result.destroyedSegments).toBe(1);
    expect(result.spawnedMushrooms).toHaveLength(1);
    expect(centipede.chains).toHaveLength(2);
    expect(centipede.chains[0].segments).toHaveLength(2);
    expect(centipede.chains[1].segments).toHaveLength(2);
    expect(centipede.segments).toHaveLength(4);
  });

  it("promotes the next segment to head when the head is hit", () => {
    const centipede = createCentipedeForLevel(640, 1, () => 0.2, 4);
    const expectedHead = centipede.segments[1];
    const projectileSystem = new FakeProjectileSystem([[0, 1]]);

    consumeSegmentHits(centipede, projectileSystem);

    expect(centipede.chains).toHaveLength(1);
    expect(centipede.chains[0].segments[0]).toBe(expectedHead);
    expect(centipede.segments).toHaveLength(3);
  });

  it("returns destroyed segment positions for mushroom spawning", () => {
    const centipede = createCentipedeForLevel(640, 1, () => 0.2, 3);
    const hitSegment = centipede.segments[1];
    const projectileSystem = new FakeProjectileSystem([[1, 1]]);

    const result = consumeSegmentHits(centipede, projectileSystem);

    expect(result.spawnedMushrooms).toHaveLength(1);
    expect(result.spawnedMushrooms[0].x).toBe(hitSegment.x);
    expect(result.spawnedMushrooms[0].y).toBe(hitSegment.y);
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
