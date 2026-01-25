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
    <style>
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        max-width: 500px;
        margin: 0 auto;
        position: relative;
        background: #1a1a1a;
        color: #e0e0e0;
        overflow: hidden;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      .opponent-area {
        flex: 0 0 auto;
        transition: background-color 0.3s ease;
      }

      .opponent-area.active {
        background: #7d1f1f;
        box-shadow: inset 0 -4px 10px rgba(160, 82, 82, 0.1);
      }

      .main-area {
        flex: 1 1 auto;
        display: flex;
        flex-direction: row;
        overflow: hidden;
      }

      .center-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .player-area {
        flex: 0 0 auto;
        transition: background-color 0.3s ease;
      }

      .player-area.active {
        background: #4c6b56;
        box-shadow: inset 0 4px 10px rgba(74, 124, 89, 0.1);
      }

      .health-bar-container {
        width: 80%;
        margin: 0.5rem 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2rem;
      }

      .health-bar {
        width: 100%;
        height: 1.2rem;
        background: #333;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid #444;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .health-fill {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        transition: width 0.3s ease-out;
      }

      .player-health {
        background: #4a7c59;
      }

      .opponent-health {
        background: #a05252;
      }

      .health-text {
        position: relative;
        z-index: 1;
        font-size: 0.8rem;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
      }

      .game-over {
        text-align: center;
        padding: 2rem;
        background: #2a2a2a;
        border-radius: 8px;
        border: 1px solid #444;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
      }

      .game-over h2 {
        margin-top: 0;
        color: #fff;
      }

      .game-over p {
        font-size: 1.2rem;
        margin-bottom: 0;
      }
    </style>

    @let s = state();

    <div
      class="opponent-area"
      [class.active]="!isPlayerTurn() && !s.isGameOver"
    >
      <app-player-hand [items]="s.opponent.items" [interactive]="false" />
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
