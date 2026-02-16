export interface PlayerSpeed {
  readonly id: string;
  readonly speed: number;
}

export interface TurnEntry {
  readonly playerId: string;
  readonly turnId: string;
  readonly accumulatedError: number;
}

export interface TurnManagerInterface {
  initializeTurnQueue(
    playerOne: PlayerSpeed,
    playerTwo: PlayerSpeed,
    count: number,
    firstPlayerId?: string,
  ): TurnEntry[];
  advanceTurnQueue(
    playerOne: PlayerSpeed,
    playerTwo: PlayerSpeed,
    queue: TurnEntry[],
    advanceBy?: number,
  ): TurnEntry[];
  recalculateTurnQueue(
    playerOne: PlayerSpeed,
    playerTwo: PlayerSpeed,
    queue: TurnEntry[],
  ): TurnEntry[];
}
