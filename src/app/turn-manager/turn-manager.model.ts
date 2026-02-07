export interface TurnEntry {
  readonly playerId: string;
  readonly id: string;
}

export interface TurnManagerInterface {
  readonly accumulatedError: number;
  readonly nextTurns: TurnEntry[];

  getNextTurns(count: number): TurnEntry[];

  advanceTurn(steps?: number): void;

  refresh(
    playerOneSpeed: number,
    playerTwoSpeed: number,
    activeTurn?: TurnEntry,
    queueLength?: number,
  ): TurnEntry[];

  reset(firstPlayerId?: string): void;
}
