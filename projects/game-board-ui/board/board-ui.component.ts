import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { GameActionType, Item } from '@dream/game-board';
import { HumanInputService } from './service/human-input.service';
import { ItemCardComponent } from '../common';
import { ActionHistoryComponent } from './action-history.component';
import { ActionHistoryEntry } from './action-history-entry';
import { PlayerHandComponent } from './player-hand.component';
import { TurnQueueComponent } from './turn-queue.component';
import { HealthBarComponent } from './health-bar.component';
import { StatusEffectsComponent } from './status-effects.component';
import { StatusEffectDisplayData } from './status-effects-display-data';
import { UiGameState } from './ui-game-state';

@Component({
  selector: 'app-board-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PlayerHandComponent,
    TurnQueueComponent,
    ItemCardComponent,
    ActionHistoryComponent,
    HealthBarComponent,
    StatusEffectsComponent,
  ],
  template: `
    @let s = state();

    <div
      data-testid="board-ui"
      class="opponent-area"
      [class.active]="isOpponentActive()"
    >
      <app-player-hand
        [items]="s.opponent.items"
        [interactive]="false"
        side="opponent"
      />
      <app-health-bar
        [health]="s.opponent.health"
        [maxHealth]="s.opponent.maxHealth"
        variant="opponent"
      ></app-health-bar>
    </div>

    <div class="main-area">
      <app-turn-queue
        [turnQueue]="turnQueue()"
        [playerId]="s.player.id"
        (skipTurn)="onSkipTurn()"
      />
      <div class="center-content">
        <div class="status-effects-top">
          <app-status-effects
            [statusEffects]="opponentStatusEffects()"
            [playerId]="s.opponent.id"
            side="opponent"
          />
        </div>
        <div class="last-played-wrapper" role="status" aria-live="polite">
          @if (lastPlayedItem(); as item) {
            <app-item-card
              class="last-played-item"
              [itemId]="item.id"
              data-testid="last-played-card"
            />
          } @else {
            <div class="last-played-placeholder">Awaiting the first play</div>
          }
        </div>
        <div class="status-effects-bottom">
          <app-status-effects
            [statusEffects]="playerStatusEffects()"
            [playerId]="s.player.id"
            side="player"
          />
        </div>
      </div>
      <app-action-history
        [actions]="actionHistory()"
        [playerId]="s.player.id"
      />
    </div>

    <div class="player-area" [class.active]="isPlayerActive()">
      <app-health-bar
        [health]="s.player.health"
        [maxHealth]="s.player.maxHealth"
        variant="player"
      ></app-health-bar>
      <app-player-hand
        [items]="s.player.items"
        [interactive]="isPlayerActive()"
        side="player"
        (itemSelected)="onItemPlayed($event)"
      />
    </div>
  `,
})
export class BoardUiComponent {
  private readonly humanInputService = inject(HumanInputService);

  readonly state = input.required<UiGameState>();
  readonly lastPlayedItem = input<Item | null>(null);
  readonly actionHistory = input.required<ActionHistoryEntry[]>();

  readonly isPlayerTurn = computed(
    () => this.state().turnInfo.currentPlayerId === this.state().player.id,
  );

  readonly isPlayerActive = computed(
    () => this.isPlayerTurn() && !this.state().isGameOver,
  );

  readonly isOpponentActive = computed(
    () => !this.isPlayerTurn() && !this.state().isGameOver,
  );

  readonly playerStatusEffects = computed<StatusEffectDisplayData[]>(
    () => this.state().playerStatusEffects,
  );

  readonly opponentStatusEffects = computed<StatusEffectDisplayData[]>(
    () => this.state().opponentStatusEffects,
  );

  readonly turnQueue = computed(() => this.state().turnInfo.turnQueue ?? []);

  onItemPlayed(item: Item): void {
    this.humanInputService.submitAction({
      type: GameActionType.PLAY_ITEM,
      playerId: this.state().player.id,
      itemId: item.id,
    });
  }

  onSkipTurn(): void {
    this.humanInputService.submitAction({
      type: GameActionType.PLAY_ITEM,
      playerId: this.state().player.id,
    });
  }
}
