import {
  Component,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Board, GameState } from './board';
import { Player, createCpuPlayer } from './player';
import { Item, ItemId } from './item';
import { BoardUiComponent } from './ui';
import { PlayerRating } from './rating';
import { FirstAvailableStrategy } from './ai';

@Component({
  selector: 'app-root',
  imports: [BoardUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (gameState(); as state) {
    <app-board-ui [gameState]="state" (itemPlayed)="onItemPlayed($event)" />
  } `,
})
export class App implements OnInit {
  private board!: Board;
  protected readonly gameState = signal<GameState | null>(null);

  private humanPlayer!: Player;
  private cpuPlayer!: Player;

  ngOnInit() {
    this.humanPlayer = {
      id: 'player',
      name: 'You',
      rating: new PlayerRating(),
      strategy: new FirstAvailableStrategy(),
      loadout: {
        health: 20,
        speed: 8,
        items: [
          { id: '_blueprint_attack', instanceId: 'p1' },
          { id: '_blueprint_attack', instanceId: 'p2' },
          { id: '_blueprint_self_damage', instanceId: 'p3' },
          { id: '_blueprint_negate_damage', instanceId: 'p4' },
          { id: '_dummy', instanceId: 'p5' },
        ],
      },
    };

    this.cpuPlayer = createCpuPlayer('cpu', 'CPU');

    this.board = new Board(
      { ...this.humanPlayer.loadout, id: this.humanPlayer.id },
      { ...this.cpuPlayer.loadout, id: this.cpuPlayer.id },
    );

    this.gameState.set(this.board.gameState);

    // If CPU goes first, process its turn
    this.processCpuTurns();
  }

  onItemPlayed(item: Item) {
    if (this.board.isGameOver) {
      return;
    }

    try {
      this.board.playItem(item.id, this.humanPlayer.id);
      this.gameState.set(this.board.gameState);

      this.processCpuTurns();
    } catch (e) {
      console.error(e);
    }
  }

  private processCpuTurns() {
    while (
      !this.board.isGameOver &&
      this.board.currentPlayerId === this.cpuPlayer.id
    ) {
      const action = this.cpuPlayer.strategy.decide(this.board);
      if (action.itemId) {
        this.board.playItem(action.itemId as ItemId, action.playerId);
      } else {
        this.board.pass(action.playerId);
      }
      this.gameState.set(this.board.gameState);
    }
  }
}
