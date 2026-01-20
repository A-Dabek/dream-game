import {
  ChangeDetectionStrategy,
  Component,
  inject,
  effect,
  OnInit,
} from '@angular/core';
import { BoardUiComponent } from './board-ui.component';
import { UiStateService } from './ui-state.service';
import { GameService } from '../game';
import { HumanStrategy } from './human-strategy';
import { createCpuPlayer, Player } from '../player';
import { PlayerRating } from '../rating';

@Component({
  selector: 'app-game-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BoardUiComponent],
  template: `
    @if (state(); as s) {
      <app-board-ui [state]="s" />
    } @else {
      <div class="loading">Initializing game state...</div>
    }
  `,
  styles: `
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #1a1a1a;
      color: #e0e0e0;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
  `,
})
export class GameContainerComponent implements OnInit {
  private readonly uiStateService = inject(UiStateService);
  private readonly gameService = inject(GameService);
  private readonly humanStrategy = inject(HumanStrategy);

  readonly state = this.uiStateService.uiState;

  constructor() {
    effect(() => {
      const initial = this.gameService.gameState();
      if (initial) {
        this.uiStateService.initialize(initial);
      }
    });
  }

  ngOnInit() {
    const humanPlayer: Player = {
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

    const cpuPlayer = createCpuPlayer('cpu', 'CPU');

    this.gameService.startGame(humanPlayer, cpuPlayer);
  }
}
