import { getDifficultyForLevel } from "./game-rules.js";

export function createEnemyForLevel(fieldWidth, level, randomFn = Math.random) {
  const difficulty = getDifficultyForLevel(level);
  const speedSpan = difficulty.enemyMaxSpeed - difficulty.enemyMinSpeed;

  return {
    width: 26,
    height: 18,
    x: randomFn() * (fieldWidth - 26),
    y: -20,
    speed: difficulty.enemyMinSpeed + randomFn() * speedSpan
  };
}
