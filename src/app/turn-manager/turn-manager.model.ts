export interface TurnManagerInterface {
  readonly nextTurns: string[];

  getNextTurns(count: number): string[];

  advanceTurn(): void;

  refresh(
    playerOneSpeed: number,
    playerTwoSpeed: number,
    firstPlayerId: string,
  ): void;

  reset(firstPlayerId?: string): void;
}
