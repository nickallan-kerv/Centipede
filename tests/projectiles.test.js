import { describe, expect, it } from "vitest";
import { ProjectileSystem } from "../src/projectiles.js";

describe("projectiles", () => {
  it("enforces fire cooldown", () => {
    const system = new ProjectileSystem(600);
    const fired1 = system.tryFire(100, 200);
    const fired2 = system.tryFire(100, 200);

    expect(fired1).toBe(true);
    expect(fired2).toBe(false);

    system.update(0.2);
    expect(system.tryFire(100, 200)).toBe(true);
  });

  it("removes projectiles that leave bounds", () => {
    const system = new ProjectileSystem(600);
    system.tryFire(100, 10);
    system.update(1.0);

    expect(system.count()).toBe(0);
  });

  it("consumes hits and removes intersecting projectiles", () => {
    const system = new ProjectileSystem(600);
    system.tryFire(50, 100);

    const hits = system.consumeHits({ x: 45, y: 80, width: 20, height: 30 });
    expect(hits).toBe(1);
    expect(system.count()).toBe(0);
  });

  it("resets cooldown and projectile collection", () => {
    const system = new ProjectileSystem(600);
    system.tryFire(50, 100);
    system.setFireCooldown(0.1);
    system.reset();

    expect(system.count()).toBe(0);
    expect(system.fireCooldownSeconds).toBe(system.defaultFireCooldownSeconds);
  });
});
