import { TurnEntry, TurnManagerInterface } from '../turn-manager.model';

const DEFAULT_QUEUE_LENGTH = 10;

export class TurnManager implements TurnManagerInterface {
  private readonly playerOne: { id: string; speed: number };
  private readonly playerTwo: { id: string; speed: number };
  private turnGenerator!: Generator<string>;
  private queue: TurnEntry[] = [];
  private readonly nextIdByPlayer: Record<string, number> = {};
  accumulatedError = 0;

  constructor(
    playerOne: { id: string; speed: number },
    playerTwo: { id: string; speed: number },
    initialError?: number,
  ) {
    this.playerOne = { ...playerOne };
    this.playerTwo = { ...playerTwo };
    if (initialError !== undefined) {
      this.accumulatedError = initialError;
      this.turnGenerator = this.createTurnGenerator(this.accumulatedError);
    } else {
      this.reset();
    }
  }

  setQueue(entries: TurnEntry[]): void {
    this.queue = [...entries];
  }

  get nextTurns(): TurnEntry[] {
    return this.getNextTurns(DEFAULT_QUEUE_LENGTH);
  }

  getNextTurns(count: number): TurnEntry[] {
    this.fillQueue(Math.max(0, count));
    return this.queue.slice(0, count);
  }

  advanceTurn(steps = 1): void {
    const removeCount = Math.max(0, Math.min(steps, this.queue.length));
    if (removeCount > 0) {
      this.queue.splice(0, removeCount);
    }
  }

  refresh(
    playerOneSpeed: number,
    playerTwoSpeed: number,
    activeTurn?: TurnEntry,
    queueLength = DEFAULT_QUEUE_LENGTH,
  ): TurnEntry[] {
    const previousQueue = [...this.queue];
    const keepEntry = activeTurn ?? previousQueue[0];
    this.playerOne.speed = playerOneSpeed;
    this.playerTwo.speed = playerTwoSpeed;
    this.reset(keepEntry?.playerId);

    const playerIds = this.generatePlayerIds(Math.max(0, queueLength));
    if (keepEntry && playerIds.length > 0) {
      playerIds[0] = keepEntry.playerId;
    }

    this.queue = this.reuseEntriesFromRawOrder(
      playerIds,
      previousQueue,
      keepEntry,
    );

    return this.queue.slice(0, queueLength);
  }

  reset(firstPlayerId?: string): void {
    const speedOne = this.playerOne.speed;
    const speedTwo = this.playerTwo.speed;
    const combinedSpeed = speedOne + speedTwo;

    if (firstPlayerId === this.playerOne.id) {
      this.accumulatedError = 0;
    } else if (firstPlayerId === this.playerTwo.id) {
      this.accumulatedError = speedOne;
    } else {
      this.accumulatedError = combinedSpeed / 2;
    }

    this.turnGenerator = this.createTurnGenerator(this.accumulatedError);
    this.queue = [];
  }

  private fillQueue(count: number): void {
    while (this.queue.length < count) {
      const next = this.turnGenerator.next();
      if (next.done) break;
      this.queue.push(this.createEntry(next.value));
    }
  }

  private generatePlayerIds(count: number): string[] {
    const ids: string[] = [];
    while (ids.length < count) {
      const next = this.turnGenerator.next();
      if (next.done) break;
      ids.push(next.value);
    }
    return ids;
  }

  private reuseEntriesFromRawOrder(
    newPlayers: string[],
    oldEntries: TurnEntry[],
    keepFirst?: TurnEntry,
  ): TurnEntry[] {
    if (keepFirst && newPlayers.length === 0) {
      return [keepFirst];
    }

    const entries: TurnEntry[] = [];
    let oldIndex = keepFirst ? 1 : 0;
    let startIndex = 0;

    if (keepFirst) {
      entries.push(keepFirst);
      startIndex = 1;
    }

    for (let i = startIndex; i < newPlayers.length; i++) {
      const playerId = newPlayers[i];
      const matchIndex = this.findNextMatchIndex(oldEntries, oldIndex, playerId);
      if (matchIndex !== -1) {
        entries.push(oldEntries[matchIndex]);
        oldIndex = matchIndex + 1;
        continue;
      }
      entries.push(this.createEntry(playerId));
    }

    return entries;
  }

  private findNextMatchIndex(
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

  private createEntry(playerId: string): TurnEntry {
    const nextId = this.nextIdByPlayer[playerId] ?? 0;
    this.nextIdByPlayer[playerId] = nextId + 1;
    return { playerId, id: `${playerId}-${nextId}` };
  }

  private *createTurnGenerator(initialError: number): Generator<string> {
    let runningError = initialError;
    const speedOne = this.playerOne.speed;
    const speedTwo = this.playerTwo.speed;
    const combinedSpeed = speedOne + speedTwo;

    if (combinedSpeed === 0) {
      while (true) {
        yield this.playerOne.id;
      }
    }

    while (true) {
      runningError -= speedOne;
      let result: string;
      if (runningError < 0) {
        result = this.playerOne.id;
        runningError += combinedSpeed;
      } else {
        result = this.playerTwo.id;
      }
      this.accumulatedError = runningError;
      yield result;
    }
  }
}
