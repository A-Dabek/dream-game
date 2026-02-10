import {
  PlayerSpeed,
  TurnEntry,
  TurnManagerInterface,
} from '../turn-manager.model';

type TurnEntryPayload = Omit<TurnEntry, 'turnId'>;

const TurnManager: TurnManagerInterface = {
  initializeTurnQueue(
    playerOne: PlayerSpeed,
    playerTwo: PlayerSpeed,
    count: number,
    firstPlayerId?: string,
  ): TurnEntry[] {
    const initialError = determineInitialError(
      playerOne,
      playerTwo,
      firstPlayerId,
    );
    const payload = generateTurnEntries(
      playerOne,
      playerTwo,
      count,
      initialError,
    );
    return assignStableTurnIds([], payload, new Map());
  },

  advanceTurnQueue(
    playerOne: PlayerSpeed,
    playerTwo: PlayerSpeed,
    queue: TurnEntry[],
    advanceBy = 1,
  ): TurnEntry[] {
    if (advanceBy <= 0) return [...queue];

    const removeCount = Math.min(advanceBy, queue.length);
    const trimmed = queue.slice(removeCount);
    const tailEntry = queue[queue.length - 1];
    const initialError =
      tailEntry?.accumulatedError ??
      determineInitialError(playerOne, playerTwo);
    const payload = generateTurnEntries(
      playerOne,
      playerTwo,
      removeCount,
      initialError,
    );
    const nextIdByPlayer = buildNextTurnIdMap(queue);
    const appended = assignStableTurnIds([], payload, nextIdByPlayer);

    return [...trimmed, ...appended];
  },

  recalculateTurnQueue(
    playerOne: PlayerSpeed,
    playerTwo: PlayerSpeed,
    queue: TurnEntry[],
  ): TurnEntry[] {
    if (queue.length <= 1) return [...queue];

    const [current, ...rest] = queue;
    const initialError = current.accumulatedError;
    const payload = generateTurnEntries(
      playerOne,
      playerTwo,
      rest.length,
      initialError,
    );
    const nextIdByPlayer = buildNextTurnIdMap(queue);
    const recalculated = assignStableTurnIds(rest, payload, nextIdByPlayer);

    return [current, ...recalculated];
  },
};

function determineInitialError(
  playerOne: PlayerSpeed,
  playerTwo: PlayerSpeed,
  preferredFirst?: string,
): number {
  if (preferredFirst === playerOne.id) return 0;
  if (preferredFirst === playerTwo.id) return playerOne.speed;
  const combinedSpeed = playerOne.speed + playerTwo.speed;
  return combinedSpeed / 2;
}

function generateTurnEntries(
  playerOne: PlayerSpeed,
  playerTwo: PlayerSpeed,
  count: number,
  initialError: number,
): TurnEntryPayload[] {
  if (count <= 0) return [];

  const entries: TurnEntryPayload[] = [];
  const combinedSpeed = playerOne.speed + playerTwo.speed;
  let runningError = initialError;

  if (combinedSpeed === 0) {
    for (let index = 0; index < count; index += 1) {
      entries.push({
        playerId: playerOne.id,
        accumulatedError: 0,
      });
    }
    return entries;
  }

  for (let index = 0; index < count; index += 1) {
    runningError -= playerOne.speed;
    let nextPlayerId = playerTwo.id;
    if (runningError < 0) {
      nextPlayerId = playerOne.id;
      runningError += combinedSpeed;
    }
    entries.push({
      playerId: nextPlayerId,
      accumulatedError: runningError,
    });
  }

  return entries;
}

function assignStableTurnIds(
  previousEntries: TurnEntry[],
  payloads: TurnEntryPayload[],
  nextIdByPlayer: Map<string, number>,
): TurnEntry[] {
  const items: TurnEntry[] = [];
  let searchIndex = 0;

  for (const entry of payloads) {
    const matchIndex = findNextMatchIndex(previousEntries, searchIndex, entry.playerId);
    if (matchIndex !== -1) {
      items.push({
        ...entry,
        turnId: previousEntries[matchIndex].turnId,
      });
      searchIndex = matchIndex + 1;
      continue;
    }

    items.push({
      ...entry,
      turnId: createTurnId(entry.playerId, nextIdByPlayer),
    });
  }

  return items;
}

function findNextMatchIndex(
  entries: TurnEntry[],
  startIndex: number,
  playerId: string,
): number {
  for (let i = startIndex; i < entries.length; i++) {
    if (entries[i].playerId === playerId) {
      return i;
    }
  }
  return -1;
}

function createTurnId(playerId: string, counters: Map<string, number>): string {
  const next = counters.get(playerId) ?? 0;
  counters.set(playerId, next + 1);
  return `${playerId}-${next}`;
}

function buildNextTurnIdMap(entries: TurnEntry[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const entry of entries) {
    const current = map.get(entry.playerId) ?? 0;
    const parsed = parseTrailingNumber(entry.turnId);
    if (parsed !== null) {
      map.set(entry.playerId, Math.max(current, parsed + 1));
    } else if (!map.has(entry.playerId)) {
      map.set(entry.playerId, current);
    }
  }

  return map;
}

function parseTrailingNumber(value: string): number | null {
  const match = value.match(/(\d+)$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export { TurnManager };
