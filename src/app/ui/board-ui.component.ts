import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { GameState } from '../board';
import { Item } from '../item';
import { PlayerHandComponent } from './player-hand.component';
import { TurnQueueComponent } from './turn-queue.component';

@Component({
  selector: 'app-board-ui',
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
        background: #fff;
        overflow: hidden;
      }
      .opponent-area {
        flex: 0 0 auto;
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
      }
      .health-bar {
        width: 80%;
        height: 1rem;
        background: #eee;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
        overflow: hidden;
        border: 1px solid #ccc;
      }
      .health-fill {
        height: 100%;
        transition: width 0.3s ease-out;
      }
      .player-health {
        background: #28a745;
      }
      .opponent-health {
        background: #dc3545;
      }
      .turn-indicator {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.1);
        font-weight: bold;
      }
    </style>

    <div class="opponent-area">
      <app-player-hand
        [items]="gameState().opponent.items"
        [interactive]="false"
      />
      <div class="center-content">
        <div class="health-bar">
          <div
            class="health-fill opponent-health"
            [style.width.%]="opponentHealthPercent()"
          ></div>
        </div>
        <div>Opponent HP: {{ gameState().opponent.health }}</div>
      </div>
    </div>

    <div class="main-area">
      <app-turn-queue
        [turnQueue]="gameState().turnInfo.turnQueue || []"
        [playerId]="gameState().player.id"
      />
      <div class="center-content">
        @if (gameState().isGameOver) {
          <div class="game-over">
            <h2>Game Over</h2>
            <p>
              Winner:
              {{
                gameState().winnerId === gameState().player.id
                  ? 'You'
                  : 'Opponent'
              }}
            </p>
          </div>
        } @else {
          <div class="turn-indicator">
            {{ isPlayerTurn() ? 'Your Turn' : "Opponent's Turn" }}
          </div>
        }
      </div>
    </div>

    <div class="player-area">
      <div class="center-content">
        <div>Your HP: {{ gameState().player.health }}</div>
        <div class="health-bar">
          <div
            class="health-fill player-health"
            [style.width.%]="playerHealthPercent()"
          ></div>
        </div>
      </div>
      <app-player-hand
        [items]="gameState().player.items"
        [interactive]="isPlayerTurn() && !gameState().isGameOver"
        (itemSelected)="itemPlayed.emit($event)"
      />
    </div>
  `,
})
export class BoardUiComponent {
  readonly gameState = input.required<GameState>();
  readonly itemPlayed = output<Item>();

  readonly isPlayerTurn = computed(
    () =>
      this.gameState().turnInfo.currentPlayerId === this.gameState().player.id,
  );

  readonly playerHealthPercent = computed(() =>
    Math.max(0, Math.min(100, (this.gameState().player.health / 100) * 100)),
  );

  readonly opponentHealthPercent = computed(() =>
    Math.max(0, Math.min(100, (this.gameState().opponent.health / 100) * 100)),
  );
}
