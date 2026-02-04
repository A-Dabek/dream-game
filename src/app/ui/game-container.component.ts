import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { GameService } from '../game';
import { createCpuPlayer, Player } from '../player';
import { PlayerRating } from '../rating';
import { BoardUiComponent } from './board-ui.component';
import { HumanStrategy } from './human-strategy';
import { UiStateService } from './ui-state.service';
import { VsScreenComponent } from './vs-screen.component';

@Component({
  selector: 'app-game-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BoardUiComponent, VsScreenComponent],
  template: `
    <div class="screens-container">
      @if (vsHidden()) {
        @if (state(); as state) {
          <app-board-ui
            class="screen"
            [state]="state"
            animate.enter="slide-in"
          />
        }
      } @else {
        <app-vs-screen
          class="screen"
          [player]="humanPlayer.loadout"
          [opponent]="cpuPlayer.loadout"
          (onReady)="handleReady()"
          animate.leave="slide-out"
        />
      }
    </div>
  `,
  styles: `
    :host {
      position: relative;
      height: 100vh;
      overflow: hidden;
    }

    .slide-out {
      transform: translateX(-100%);
      transition: transform 0.6s;
      z-index: 2;
      position: absolute;
    }

    .slide-in {
      animation: slideRight 0.6s;
      z-index: 1;
      position: absolute;
    }

    @keyframes slideLeft {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-100%);
      }
    }

    @keyframes slideRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }
  `,
})
export class GameContainerComponent {
  readonly uiStateService = inject(UiStateService);

  readonly state = this.uiStateService.uiState;

  readonly vsHidden = signal(false);

  readonly cpuPlayer: Player = createCpuPlayer('cpu', 'CPU');

  private readonly gameService = inject(GameService);

  private readonly humanStrategy = inject(HumanStrategy);

  readonly humanPlayer: Player = {
    id: 'player',
    name: 'You',
    rating: new PlayerRating(),
    strategy: this.humanStrategy,
    loadout: {
      health: 20,
      speed: 8,
      items: [{ id: '_blueprint_attack', instanceId: 'p1' }],
    },
  };

  constructor() {
    effect(() => {
      const initial = this.gameService.gameState();
      if (initial) {
        this.uiStateService.initialize(initial);
      }
    });
  }

  handleReady() {
    this.vsHidden.set(true);
    this.gameService.startGame(this.humanPlayer, this.cpuPlayer);
  }
}
