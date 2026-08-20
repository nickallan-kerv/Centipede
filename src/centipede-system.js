import { getDifficultyForLevel } from "./game-rules.js";

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function wouldHitObstacle(segment, nextX, obstacles) {
  const nextBounds = {
    x: nextX,
    y: segment.y,
    width: segment.width,
    height: segment.height
  };

  return obstacles.some((obstacle) => intersects(nextBounds, obstacle));
}

export function createCentipedeForLevel(fieldWidth, level, randomFn = Math.random, segmentCount = 10) {
  const difficulty = getDifficultyForLevel(level);
  const segmentWidth = 18;
  const segmentHeight = 14;
  const segmentSpacing = 4;
  const spawnY = 28;
  const bodyWidth = segmentCount * segmentWidth + (segmentCount - 1) * segmentSpacing;
  const minHeadX = Math.max(segmentWidth - 1, bodyWidth - segmentWidth);
  const maxHeadX = Math.max(minHeadX, fieldWidth - segmentWidth);
  const headX = minHeadX + randomFn() * Math.max(1, maxHeadX - minHeadX);

  const segments = [];
  for (let i = 0; i < segmentCount; i += 1) {
    segments.push({
      x: headX - i * (segmentWidth + segmentSpacing),
      y: spawnY,
      width: segmentWidth,
      height: segmentHeight
    });
  }

  return {
    direction: 1,
    speed: difficulty.enemyMinSpeed * 0.9,
    stepDown: 16,
    segments
  };
}

export function updateCentipede(centipede, dt, fieldWidth, fieldHeight, obstacles = []) {
  if (!centipede || centipede.segments.length === 0) {
    return centipede;
  }

  const deltaX = centipede.direction * centipede.speed * dt;

  const turnRequired = centipede.segments.some((segment) => {
    const nextX = segment.x + deltaX;
    const outOfBounds = nextX <= 0 || nextX + segment.width >= fieldWidth;
    return outOfBounds || wouldHitObstacle(segment, nextX, obstacles);
  });

  if (turnRequired) {
    centipede.direction *= -1;
    for (const segment of centipede.segments) {
      segment.y = Math.min(fieldHeight - segment.height, segment.y + centipede.stepDown);
    }
    return centipede;
  }

  for (const segment of centipede.segments) {
    segment.x += deltaX;
  }

  return centipede;
}

export function consumeSegmentHits(centipede, projectileSystem) {
  if (!centipede || centipede.segments.length === 0) {
    return { destroyedSegments: 0 };
  }

  let destroyedSegments = 0;
  const remaining = [];

  for (const segment of centipede.segments) {
    const hits = projectileSystem.consumeHits(segment);
    if (hits > 0) {
      destroyedSegments += 1;
      continue;
    }
    remaining.push(segment);
  }

  centipede.segments = remaining;
  return { destroyedSegments };
}

export function intersectsCentipede(centipede, rect) {
  if (!centipede || centipede.segments.length === 0) {
    return false;
  }

  return centipede.segments.some((segment) => intersects(segment, rect));
}
