import { TurnManagerInterface } from '../engine.model';

/**
 * Responsible for calculating and managing the turn order based on player speeds.
 * Uses a Bresenham-like algorithm to distribute turns as equally as possible.
 */
export class TurnManager implements TurnManagerInterface {
  private readonly playerOne: { id: string; speed: number };
  private readonly playerTwo: { id: string; speed: number };
  private turnGenerator!: Generator<string>;
  private turnQueue: string[] = [];
  accumulatedError: number = 0;

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

  get nextTurns(): string[] {
    return this.getNextTurns(10);
  }

  getNextTurns(count: number): string[] {
    while (this.turnQueue.length < count) {
      const next = this.turnGenerator.next();
      if (next.done) break;
      this.turnQueue.push(next.value);
    }
    return this.turnQueue.slice(0, count);
  }

  advanceTurn(): void {
    if (this.turnQueue.length === 0) {
      this.turnGenerator.next();
    } else {
      this.turnQueue.shift();
    }
  }

  refresh(
    playerOneSpeed: number,
    playerTwoSpeed: number,
    firstPlayerId: string,
  ): void {
    this.playerOne.speed = playerOneSpeed;
    this.playerTwo.speed = playerTwoSpeed;
    this.reset(firstPlayerId);
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
    this.turnQueue = [];
  }

  private *createTurnGenerator(initialError: number): Generator<string> {
    let runningError = initialError;
    const speed1 = this.playerOne.speed;
    const speed2 = this.playerTwo.speed;
    const combinedSpeed = speed1 + speed2;

    if (combinedSpeed === 0) {
      while (true) yield this.playerOne.id;
    }

    while (true) {
      runningError -= speed1;
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
