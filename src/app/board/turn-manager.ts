
/**
 * Responsible for calculating and managing the turn order based on player speeds.
 * Uses a Bresenham-like algorithm to distribute turns as equally as possible.
 */
export class TurnManager {
  private readonly playerOne: { id: string; speed: number };
  private readonly playerTwo: { id: string; speed: number };
  private turnGenerator!: Generator<string>;
  private turnQueue: string[] = [];
  private accumulatedError: number = 0;

  constructor(playerOne: { id: string; speed: number }, playerTwo: { id: string; speed: number }) {
    this.playerOne = { ...playerOne };
    this.playerTwo = { ...playerTwo };
    this.reset();
  }

  /**
   * Getter to retrieve the next 10 turns.
   */
  get nextTurns(): string[] {
    return this.getNextTurns(10);
  }

  /**
   * Returns the next X turns.
   */
  getNextTurns(count: number): string[] {
    while (this.turnQueue.length < count) {
      const next = this.turnGenerator.next();
      if (next.done) break;
      this.turnQueue.push(next.value);
    }
    return this.turnQueue.slice(0, count);
  }

  /**
   * Advances to the next turn, removing the current one from the sequence.
   */
  advanceTurn(): void {
    if (this.turnQueue.length === 0) {
      this.turnGenerator.next();
    } else {
      this.turnQueue.shift();
    }
  }

  /**
   * Refreshes the turn sequence with new speeds and specifies who should go first.
   */
  refresh(playerOneSpeed: number, playerTwoSpeed: number, firstPlayerId: string): void {
    this.playerOne.speed = playerOneSpeed;
    this.playerTwo.speed = playerTwoSpeed;
    this.reset(firstPlayerId);
  }

  /**
   * Creates a deep clone of the TurnManager.
   */
  clone(): TurnManager {
    const cloned = new TurnManager(this.playerOne, this.playerTwo);
    cloned.accumulatedError = this.accumulatedError;
    cloned.turnQueue = [...this.turnQueue];
    cloned.turnGenerator = cloned.createTurnGenerator(this.accumulatedError);
    return cloned;
  }

  private reset(firstPlayerId?: string): void {
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
