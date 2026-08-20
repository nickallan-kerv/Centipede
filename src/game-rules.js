export function createGameState(maxLives = 3, pointsPerLevel = 1000) {
  return {
    score: 0,
    lives: maxLives,
    maxLives,
    isGameOver: false,
    level: 1,
    pointsPerLevel
  };
}

export function getLevelFromScore(score, pointsPerLevel) {
  return 1 + Math.floor(score / pointsPerLevel);
}

export function getDifficultyForLevel(level) {
  const projectileCooldown = Math.max(0.09, 0.17 - (level - 1) * 0.01);
  const enemyDefeatRespawnDelay = Math.max(0.12, 0.28 - (level - 1) * 0.015);
  const speedScale = 1 + (level - 1) * 0.18;

  return {
    projectileCooldown,
    enemyDefeatRespawnDelay,
    enemyMinSpeed: 120 * speedScale,
    enemyMaxSpeed: 180 * speedScale
  };
}

export function applyProjectileHits(state, hitCount, pointsPerHit = 100) {
  if (hitCount <= 0) {
    return state;
  }

  const score = state.score + hitCount * pointsPerHit;
  const level = getLevelFromScore(score, state.pointsPerLevel);

  return {
    ...state,
    score,
    level
  };
}

export function applyPlayerHit(state) {
  const lives = Math.max(0, state.lives - 1);
  return {
    ...state,
    lives,
    isGameOver: lives === 0
  };
}

export function resetGameState(state) {
  return {
    ...state,
    score: 0,
    lives: state.maxLives,
    isGameOver: false,
    level: 1
  };
}
