import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { GameService } from '@dream/game';
import { createCpuPlayer, Player } from '@dream/player';
import { PlayerRating } from '@dream/rating';
import { BoardUiComponent } from '../board/board-ui.component';
import { HumanStrategy } from '../board/service/human-strategy';
import { UiStateService } from '../board/service/ui-state.service';
import { PreGameScreenComponent } from './pre-game-screen.component';
import { PostGameScreenComponent } from './post-game-screen.component';

@Component({
  selector: 'app-game-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BoardUiComponent, PreGameScreenComponent, PostGameScreenComponent],
  template: `
    <div class="screens-container">
      @switch (stage()) {
        @case ('pre') {
          <app-pre-game-screen
            class="screen"
            [player]="humanPlayer.loadout"
            [opponent]="cpuPlayer.loadout"
            (onReady)="handleReady()"
            animate.enter="slide-in"
            animate.leave="slide-out"
          />
        }
        @case ('game') {
          @if (state(); as s) {
            <app-board-ui
              class="screen"
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
              [player]="humanPlayer.loadout"
              [opponent]="cpuPlayer.loadout"
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

  readonly state = this.uiStateService.uiState;
  readonly lastPlayedItem = this.uiStateService.lastPlayedItem;
  readonly actionHistory = this.uiStateService.actionHistory;

  readonly stage = signal<'pre' | 'game' | 'post'>('pre');

  readonly cpuPlayer: Player = createCpuPlayer('cpu', 'CPU');

  readonly humanPlayer: Player = {
    id: 'player',
    name: 'You',
    rating: new PlayerRating(),
    strategy: this.humanStrategy,
    loadout: {
      health: 20,
      speed: 8,
      items: [
        { id: '_blueprint_attack', instanceId: 'p1-1' },
        { id: '_blueprint_attack', instanceId: 'p1-2' },
        { id: '_blueprint_attack', instanceId: 'p1-3' },
        { id: '_blueprint_attack', instanceId: 'p1-4' },
      ],
    },
  };

  constructor() {
    effect(() => {
      const s = this.state();
      if (s?.isGameOver) {
        this.stage.set('post');
      }
    });
  }

  handleReady() {
    this.stage.set('game');
    void this.gameService.startGame(this.humanPlayer, this.cpuPlayer);
    const initial = this.gameService.gameState();
    this.uiStateService.initialize(initial);
  }

  handleRestart() {
    this.stage.set('pre');
  }
}
