import { describe, expect, it } from "vitest";
import {
  applyPlayerHit,
  applyProjectileHits,
  createGameState,
  getDifficultyForLevel,
  getLevelFromScore,
  resetGameState
} from "../src/game-rules.js";

describe("game-rules", () => {
  it("computes level from score thresholds", () => {
    expect(getLevelFromScore(0, 1000)).toBe(1);
    expect(getLevelFromScore(999, 1000)).toBe(1);
    expect(getLevelFromScore(1000, 1000)).toBe(2);
    expect(getLevelFromScore(2500, 1000)).toBe(3);
  });

  it("returns harder difficulty values for higher levels", () => {
    const level1 = getDifficultyForLevel(1);
    const level5 = getDifficultyForLevel(5);

    expect(level5.enemyMinSpeed).toBeGreaterThan(level1.enemyMinSpeed);
    expect(level5.projectileCooldown).toBeLessThan(level1.projectileCooldown);
    expect(level5.enemyDefeatRespawnDelay).toBeLessThan(level1.enemyDefeatRespawnDelay);
  });

  it("updates score and level when projectile hits occur", () => {
    const initial = createGameState(3, 1000);
    const next = applyProjectileHits(initial, 11, 100);

    expect(next.score).toBe(1100);
    expect(next.level).toBe(2);
  });

  it("decrements lives and sets game over at zero", () => {
    let state = createGameState(2, 1000);
    state = applyPlayerHit(state);
    expect(state.lives).toBe(1);
    expect(state.isGameOver).toBe(false);

    state = applyPlayerHit(state);
    expect(state.lives).toBe(0);
    expect(state.isGameOver).toBe(true);
  });

  it("resets game state to initial values", () => {
    const modified = {
      ...createGameState(3, 1000),
      score: 900,
      lives: 1,
      isGameOver: true,
      level: 4
    };

    const reset = resetGameState(modified);
    expect(reset.score).toBe(0);
    expect(reset.lives).toBe(3);
    expect(reset.level).toBe(1);
    expect(reset.isGameOver).toBe(false);
  });
});
