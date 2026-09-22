const MUSHROOM_WIDTH = 18;
const MUSHROOM_HEIGHT = 18;
const MUSHROOM_MAX_HITS = 3;

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function cloneMushroom(mushroom) {
  return {
    x: mushroom.x,
    y: mushroom.y,
    width: mushroom.width,
    height: mushroom.height,
    hitsRemaining: mushroom.hitsRemaining,
    maxHits: mushroom.maxHits
  };
}

function createMushroomLayout(fieldWidth, minY, maxY, randomFn, count) {
  const layout = [];
  const safeMinY = Math.max(16, minY);
  const safeMaxY = Math.max(safeMinY, maxY);
  const maxX = Math.max(0, fieldWidth - MUSHROOM_WIDTH);
  const yRange = Math.max(1, safeMaxY - safeMinY);

  for (let i = 0; i < count; i += 1) {
    layout.push({
      x: Math.floor(randomFn() * maxX),
      y: Math.floor(safeMinY + randomFn() * yRange),
      width: MUSHROOM_WIDTH,
      height: MUSHROOM_HEIGHT,
      hitsRemaining: MUSHROOM_MAX_HITS,
      maxHits: MUSHROOM_MAX_HITS
    });
  }

  return layout;
}

export function createMushroomState(fieldWidth, fieldHeight, playerZoneTop, randomFn = Math.random, count = 28) {
  const minY = 40;
  const maxY = Math.max(minY, playerZoneTop - 28);
  const initialMushrooms = createMushroomLayout(fieldWidth, minY, maxY, randomFn, count);

  return {
    initialMushrooms,
    mushrooms: initialMushrooms.map(cloneMushroom),
    fieldWidth,
    fieldHeight
  };
}

export function resetMushroomState(state) {
  state.mushrooms = state.initialMushrooms.map(cloneMushroom);
}

export function consumeMushroomHits(state, projectileSystem) {
  let damaged = 0;
  let destroyed = 0;

  const survivors = [];
  for (const mushroom of state.mushrooms) {
    const hits = projectileSystem.consumeHits(mushroom);
    if (hits <= 0) {
      survivors.push(mushroom);
      continue;
    }

    damaged += 1;
    const hitsRemaining = Math.max(0, mushroom.hitsRemaining - hits);
    if (hitsRemaining === 0) {
      destroyed += 1;
      continue;
    }

    survivors.push({
      ...mushroom,
      hitsRemaining
    });
  }

  state.mushrooms = survivors;
  return {
    damaged,
    destroyed
  };
}

export function getMushroomObstacles(state) {
  return state.mushrooms;
}

export function spawnMushrooms(state, positions) {
  if (!state || !Array.isArray(positions) || positions.length === 0) {
    return { spawned: 0 };
  }

  const maxX = Math.max(0, (state.fieldWidth ?? 0) - MUSHROOM_WIDTH);
  const maxY = Math.max(0, (state.fieldHeight ?? 0) - MUSHROOM_HEIGHT);
  let spawned = 0;

  for (const position of positions) {
    const candidate = {
      x: Math.max(0, Math.min(maxX, Math.round(position.x))),
      y: Math.max(0, Math.min(maxY, Math.round(position.y))),
      width: MUSHROOM_WIDTH,
      height: MUSHROOM_HEIGHT,
      hitsRemaining: MUSHROOM_MAX_HITS,
      maxHits: MUSHROOM_MAX_HITS
    };

    const overlapsExisting = state.mushrooms.some((mushroom) => intersects(mushroom, candidate));
    if (overlapsExisting) {
      continue;
    }

    state.mushrooms.push(candidate);
    spawned += 1;
  }

  return { spawned };
}

export function drawMushrooms(state, ctx) {
  for (const mushroom of state.mushrooms) {
    if (mushroom.hitsRemaining === 1) {
      ctx.fillStyle = "#fb7185";
    } else if (mushroom.hitsRemaining === 2) {
      ctx.fillStyle = "#f59e0b";
    } else {
      ctx.fillStyle = "#a3e635";
    }

    ctx.fillRect(mushroom.x, mushroom.y, mushroom.width, mushroom.height);
    ctx.strokeStyle = "#3f6212";
    ctx.lineWidth = 1;
    ctx.strokeRect(mushroom.x, mushroom.y, mushroom.width, mushroom.height);
  }
}
