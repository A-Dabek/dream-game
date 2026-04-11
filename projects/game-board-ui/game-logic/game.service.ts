import { Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  GameOrchestrator,
  type GameState,
  type LogEntry,
  type Player,
  type Board,
} from '@dream/game-board';
import { Subject } from 'rxjs';
import { GameServiceInterface } from './game.model';

@Injectable()
export class GameService implements GameServiceInterface {
  private _gameState$ = new Subject<GameState | null>();
  readonly gameState = toSignal(
    this._gameState$.asObservable(),
  ) as Signal<GameState | null>;
  private _logs$ = new Subject<LogEntry[]>();
  readonly logs$ = this._logs$.asObservable();

  private orchestrator = new GameOrchestrator({
    onGameStateChange: (state) => this._gameState$.next(state),
    onLogs: (logs) => this._logs$.next(logs),
  });

  async startGame(player1: Player, player2: Player): Promise<Board> {
    return this.orchestrator.startGame(player1, player2);
  }
}
