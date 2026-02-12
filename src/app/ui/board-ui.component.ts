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
import { ItemDisplayComponent } from './item-display.component';
import { ActionHistoryComponent } from './action-history.component';
import { ActionHistoryEntry } from './action-history-entry';
import { PlayerHandComponent } from './player-hand.component';
import { TurnQueueComponent } from './turn-queue.component';
import { HealthBarComponent } from './health-bar.component';

@Component({
  selector: 'app-board-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PlayerHandComponent,
    TurnQueueComponent,
    ItemDisplayComponent,
    ActionHistoryComponent,
    HealthBarComponent,
  ],
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
      <app-health-bar
        [health]="s.opponent.health"
        variant="opponent"
      ></app-health-bar>
    </div>

    <div class="main-area">
      <app-turn-queue
        [turnQueue]="s.turnInfo.turnQueue || []"
        [playerId]="s.player.id"
        (skipTurn)="onSkipTurn()"
      />
      <div class="center-content">
        <div class="last-played-wrapper" role="status" aria-live="polite">
          @if (lastPlayedItem(); as item) {
            <app-item-display class="last-played-item" [item]="item" />
          } @else {
            <div class="last-played-placeholder">Awaiting the first play</div>
          }
        </div>
      </div>
      <app-action-history
        [actions]="actionHistory()"
        [playerId]="s.player.id"
      />
    </div>

    <div class="player-area" [class.active]="isPlayerTurn() && !s.isGameOver">
      <app-health-bar
        [health]="s.player.health"
        variant="player"
      ></app-health-bar>
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
  readonly lastPlayedItem = input<Item | null>(null);
  readonly actionHistory = input.required<ActionHistoryEntry[]>();

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
}
