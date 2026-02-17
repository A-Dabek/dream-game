import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  Player,
  PlayerConfig,
  createGamePlayers,
  GamePlayersConfig,
} from '@dream/game-board';
import { BoardUiComponent } from '../board/board-ui.component';
import { PreGameScreenComponent } from './pre-game-screen.component';
import { PostGameScreenComponent } from './post-game-screen.component';
import { UiStateService } from '../board/service/ui-state.service';
import { HumanStrategy } from '../board/service/human-strategy';
import { GameService } from '../game-logic/game.service';

@Component({
  selector: 'app-game-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BoardUiComponent, PreGameScreenComponent, PostGameScreenComponent],
  template: `
    <div class="screens-container" data-testid="game-container">
      @switch (stage()) {
        @case ('pre') {
          <app-pre-game-screen
            class="screen"
            data-testid="pre-game-screen"
            [player]="humanPlayer().loadout"
            [opponent]="cpuPlayer().loadout"
            (onReady)="handleReady()"
            animate.enter="slide-in"
            animate.leave="slide-out"
          />
        }
        @case ('game') {
          @if (state(); as s) {
            <app-board-ui
              class="screen"
              data-testid="game-screen"
              [state]="s"
              [lastPlayedItem]="lastPlayedItem()"
              [actionHistory]="actionHistory()"
              animate.enter="slide-in"
              animate.leave="slide-out"
            />
          }
        }
        @case ('post') {
          @if (state(); as s) {
            <app-post-game-screen
              class="screen"
              data-testid="post-game-screen"
              [player]="humanPlayer().loadout"
              [opponent]="cpuPlayer().loadout"
              [winnerId]="s.winnerId!"
              (restart)="handleRestart()"
              animate.enter="slide-in"
              animate.leave="slide-out"
            />
          }
        }
      }
    </div>
  `,
})
export class GameContainerComponent {
  readonly uiStateService = inject(UiStateService);

  private readonly gameService = inject(GameService);

  private readonly humanStrategy = inject(HumanStrategy);

  readonly config = input.required<GamePlayersConfig>();

  readonly state = this.uiStateService.uiState;
  readonly lastPlayedItem = this.uiStateService.lastPlayedItem;
  readonly actionHistory = this.uiStateService.actionHistory;

  readonly stage = signal<'pre' | 'game' | 'post'>('pre');

  readonly humanPlayer = signal<Player>(null as unknown as Player);
  readonly cpuPlayer = signal<Player>(null as unknown as Player);

  constructor() {
    effect(() => {
      const config = this.config();
      const { humanPlayer, cpuPlayer } = this.createPlayers(config);
      this.humanPlayer.set(humanPlayer);
      this.cpuPlayer.set(cpuPlayer);
    });

    effect(() => {
      const s = this.state();
      if (s?.isGameOver) {
        this.stage.set('post');
      }
    });
  }

  handleReady() {
    this.stage.set('game');
    void this.gameService.startGame(this.humanPlayer(), this.cpuPlayer());
    const initial = this.gameService.gameState();
    this.uiStateService.initialize(initial);
  }

  handleRestart() {
    this.stage.set('pre');
    // Re-create players on restart to ensure fresh state
    const config = this.config();
    const { humanPlayer, cpuPlayer } = this.createPlayers(config);
    this.humanPlayer.set(humanPlayer);
    this.cpuPlayer.set(cpuPlayer);
  }

  private createPlayers(config: {
    player1?: PlayerConfig;
    player2?: PlayerConfig;
  }): { humanPlayer: Player; cpuPlayer: Player } {
    const { player1, player2 } = createGamePlayers(config);
    return {
      humanPlayer: { ...player1, name: 'You', strategy: this.humanStrategy },
      cpuPlayer: { ...player2, name: 'CPU' },
    };
  }
}
