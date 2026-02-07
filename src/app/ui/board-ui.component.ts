import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { GameActionType, GameState } from '../board';
import { Item } from '../item';
import { HumanInputService } from './human-input.service';
import { PlayerHandComponent } from './player-hand.component';
import { TurnQueueComponent } from './turn-queue.component';

@Component({
  selector: 'app-board-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PlayerHandComponent, TurnQueueComponent],
  template: `
    @let s = state();

    <div
      class="opponent-area"
      [class.active]="!isPlayerTurn() && !s.isGameOver"
    >
      <app-player-hand
        [items]="s.opponent.items"
        [interactive]="false"
        side="opponent"
      />
      <div class="center-content">
        <div class="health-bar-container">
          <div class="health-bar">
            <div
              class="health-fill opponent-health"
              [style.width.%]="opponentHealthPercent()"
            ></div>
            <span class="health-text">{{ s.opponent.health }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-area">
      <app-turn-queue
        [turnQueue]="s.turnInfo.turnQueue || []"
        [playerId]="s.player.id"
        (skipTurn)="onSkipTurn()"
      />
      <div class="center-content">
        @if (s.isGameOver) {
          <div class="game-over">
            <h2>Game Over</h2>
            <p>
              Winner:
              {{ s.winnerId === s.player.id ? 'You' : 'Opponent' }}
            </p>
          </div>
        }
      </div>
    </div>

    <div class="player-area" [class.active]="isPlayerTurn() && !s.isGameOver">
      <div class="center-content">
        <div class="health-bar-container">
          <div class="health-bar">
            <div
              class="health-fill player-health"
              [style.width.%]="playerHealthPercent()"
            ></div>
            <span class="health-text">{{ s.player.health }}</span>
          </div>
        </div>
      </div>
      <app-player-hand
        [items]="s.player.items"
        [interactive]="isPlayerTurn() && !s.isGameOver"
        side="player"
        (itemSelected)="onItemPlayed($event)"
      />
    </div>
  `,
})
export class BoardUiComponent {
  private readonly humanInputService = inject(HumanInputService);

  readonly state = input.required<GameState>();

  onItemPlayed(item: Item) {
    this.humanInputService.submitAction({
      type: GameActionType.PLAY_ITEM,
      playerId: this.state().player.id,
      itemId: item.id,
    });
  }

  onSkipTurn() {
    this.humanInputService.submitAction({
      type: GameActionType.PLAY_ITEM,
      playerId: this.state().player.id,
    });
  }

  readonly isPlayerTurn = computed(
    () => this.state().turnInfo.currentPlayerId === this.state().player.id,
  );

  readonly playerHealthPercent = computed(() =>
    Math.max(0, Math.min(100, (this.state().player.health / 100) * 100)),
  );

  readonly opponentHealthPercent = computed(() =>
    Math.max(0, Math.min(100, (this.state().opponent.health / 100) * 100)),
  );
}
