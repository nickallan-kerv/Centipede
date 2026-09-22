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

function ensureChains(centipede) {
  if (!centipede) {
    return;
  }

  if (!Array.isArray(centipede.chains)) {
    centipede.chains = [
      {
        direction: centipede.direction ?? 1,
        segments: Array.isArray(centipede.segments) ? centipede.segments : []
      }
    ];
  }

  for (const chain of centipede.chains) {
    if (typeof chain.direction !== "number") {
      chain.direction = centipede.direction ?? 1;
    }

    if (!Array.isArray(chain.segments)) {
      chain.segments = [];
    }
  }
}

function syncLegacyView(centipede) {
  centipede.segments = centipede.chains.flatMap((chain) => chain.segments);
  if (centipede.chains.length > 0) {
    centipede.direction = centipede.chains[0].direction;
  }
}

function updateChain(chain, speed, stepDown, segmentGap, dt, fieldWidth, fieldHeight, obstacles) {
  if (!chain || chain.segments.length === 0) {
    return;
  }

  const previousSegments = chain.segments.map((segment) => ({
    x: segment.x,
    y: segment.y
  }));

  const deltaX = chain.direction * speed * dt;
  const head = chain.segments[0];
  const nextHeadX = head.x + deltaX;
  const outOfBounds = nextHeadX <= 0 || nextHeadX + head.width >= fieldWidth;
  const turnRequired = outOfBounds || wouldHitObstacle(head, nextHeadX, obstacles);

  if (turnRequired) {
    chain.direction *= -1;
    head.y = Math.min(fieldHeight - head.height, head.y + stepDown);
  } else {
    head.x += deltaX;
  }

  const desiredGap = segmentGap ?? head.width + 4;
  const maxAxisStep = speed * dt;
  const axisCompleteThreshold = Math.max(1, desiredGap * 0.08);
  const axisAlignmentThreshold = 0.35;
  const minGap = desiredGap * 0.85;
  const maxGap = desiredGap * 1.15;
  const maxSeparation = desiredGap * 1.2;

  const clampStep = (value, maxStep) => {
    if (Math.abs(value) <= maxStep) {
      return value;
    }
    return Math.sign(value) * maxStep;
  };

  for (let i = 1; i < chain.segments.length; i += 1) {
    const leader = chain.segments[i - 1];
    const follower = chain.segments[i];
    const previousLeader = previousSegments[i - 1];
    const target = {
      x: previousLeader.x,
      y: previousLeader.y
    };
    const beforeX = follower.x;
    const beforeY = follower.y;

    if (!follower.followAxis) {
      const startDx = target.x - follower.x;
      const startDy = target.y - follower.y;
      follower.followAxis = Math.abs(startDx) >= Math.abs(startDy) ? "x" : "y";
    }

    const dx = target.x - follower.x;
    const dy = target.y - follower.y;

    if (follower.followAxis === "x") {
      follower.x += clampStep(dx, maxAxisStep);

      if (Math.abs(target.x - follower.x) <= axisCompleteThreshold) {
        follower.followAxis = "y";
      }
    } else {
      follower.y += clampStep(dy, maxAxisStep);

      // Do not switch back to X until this segment is vertically aligned
      // with its followed neighbor, which preserves horizontal row alignment.
      if (Math.abs(leader.y - follower.y) <= axisAlignmentThreshold) {
        follower.y = leader.y;
        follower.followAxis = "x";
      }
    }

    // Keep spacing in a narrow band while honoring axis-only movement.
    const axisDelta =
      follower.followAxis === "x" ? leader.x - follower.x : leader.y - follower.y;
    const axisGap = Math.abs(axisDelta);

    if (axisGap > maxGap) {
      const excess = axisGap - maxGap;
      const correction = Math.min(excess, maxAxisStep * 0.6);
      if (follower.followAxis === "x") {
        follower.x += Math.sign(axisDelta) * correction;
      } else {
        follower.y += Math.sign(axisDelta) * correction;
      }
    } else if (axisGap < minGap) {
      const deficit = minGap - axisGap;
      const correction = Math.min(deficit, maxAxisStep * 0.6);
      if (follower.followAxis === "x") {
        follower.x -= Math.sign(axisDelta) * correction;
      } else {
        follower.y -= Math.sign(axisDelta) * correction;
      }
    }

    follower.x = Math.min(fieldWidth - follower.width, Math.max(0, follower.x));
    follower.y = Math.min(fieldHeight - follower.height, Math.max(0, follower.y));

    // Hard safety clamp: never allow segments to separate beyond maxSeparation.
    const sepX = leader.x - follower.x;
    const sepY = leader.y - follower.y;
    const separation = Math.hypot(sepX, sepY);
    if (separation > maxSeparation && separation > 0) {
      const unitX = sepX / separation;
      const unitY = sepY / separation;
      follower.x = leader.x - unitX * maxSeparation;
      follower.y = leader.y - unitY * maxSeparation;
      follower.x = Math.min(fieldWidth - follower.width, Math.max(0, follower.x));
      follower.y = Math.min(fieldHeight - follower.height, Math.max(0, follower.y));
    }

    // Prevent catching up inside the intended chain gap.
    const finalSeparation = Math.hypot(leader.x - follower.x, leader.y - follower.y);
    if (finalSeparation < desiredGap * 0.7) {
      follower.x = beforeX;
      follower.y = beforeY;
    }
  }
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
    speed: difficulty.enemyMinSpeed * 1.2,
    stepDown: 16,
    segmentGap: segmentWidth + segmentSpacing,
    segments,
    chains: [
      {
        direction: 1,
        segments
      }
    ]
  };
}

export function updateCentipede(centipede, dt, fieldWidth, fieldHeight, obstacles = []) {
  if (!centipede) {
    return centipede;
  }

  ensureChains(centipede);
  if (centipede.chains.length === 0) {
    syncLegacyView(centipede);
    return centipede;
  }

  for (const chain of centipede.chains) {
    updateChain(
      chain,
      centipede.speed,
      centipede.stepDown,
      centipede.segmentGap,
      dt,
      fieldWidth,
      fieldHeight,
      obstacles
    );
  }

  centipede.chains = centipede.chains.filter((chain) => chain.segments.length > 0);
  syncLegacyView(centipede);

  return centipede;
}

export function consumeSegmentHits(centipede, projectileSystem) {
  if (!centipede) {
    return { destroyedSegments: 0, spawnedMushrooms: [] };
  }

  ensureChains(centipede);
  if (centipede.chains.length === 0) {
    syncLegacyView(centipede);
    return { destroyedSegments: 0, spawnedMushrooms: [] };
  }

  let destroyedSegments = 0;
  const spawnedMushrooms = [];
  const nextChains = [];

  for (const chain of centipede.chains) {
    let activeChunk = [];

    const flushChunk = () => {
      if (activeChunk.length === 0) {
        return;
      }

      delete activeChunk[0].followAxis;
      nextChains.push({
        direction: chain.direction,
        segments: activeChunk
      });
      activeChunk = [];
    };

    for (const segment of chain.segments) {
      const hits = projectileSystem.consumeHits(segment);
      if (hits > 0) {
        destroyedSegments += 1;
        spawnedMushrooms.push({
          x: segment.x,
          y: segment.y,
          width: segment.width,
          height: segment.height
        });
        flushChunk();
        continue;
      }

      activeChunk.push(segment);
    }

    flushChunk();
  }

  centipede.chains = nextChains;
  syncLegacyView(centipede);

  return {
    destroyedSegments,
    spawnedMushrooms,
    chainCount: centipede.chains.length
  };
}

export function intersectsCentipede(centipede, rect) {
  if (!centipede) {
    return false;
  }

  ensureChains(centipede);
  return centipede.chains.some((chain) =>
    chain.segments.some((segment) => intersects(segment, rect))
  );
}
