import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { GameService } from '@dream/game';
import { createGamePlayers, Player, PlayerConfig } from '@dream/player';
import {
  BoardUiComponent,
  HumanStrategy,
  PostGameScreenComponent,
  PreGameScreenComponent,
  UiStateService,
} from '@dream/ui';
import { UrlGameConfigService } from './url-game-config.service';

// Default human player configuration
const DEFAULT_HUMAN_CONFIG: PlayerConfig = {
  items: [
    '_blueprint_attack',
    '_blueprint_attack',
    '_blueprint_attack',
    '_blueprint_attack',
  ],
  health: 20,
  speed: 8,
};

// Default CPU player configuration
const DEFAULT_CPU_CONFIG: PlayerConfig = {
  items: ['punch', 'sticking_plaster', 'wingfoot', 'sticky_boot'],
  health: 18,
  speed: 7,
};

@Component({
  selector: 'app-game-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BoardUiComponent, PreGameScreenComponent, PostGameScreenComponent],
  template: `
    <div class="screens-container" data-testid="game-container">
      @switch (stage()) {
        @case ('pre') {
          <app-pre-game-screen
            class="screen"
            data-testid="pre-game-screen"
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

  private readonly urlConfigService = inject(UrlGameConfigService);

  readonly state = this.uiStateService.uiState;
  readonly lastPlayedItem = this.uiStateService.lastPlayedItem;
  readonly actionHistory = this.uiStateService.actionHistory;

  readonly stage = signal<'pre' | 'game' | 'post'>('pre');

  // Players are created based on URL config or defaults
  readonly humanPlayer: Player;
  readonly cpuPlayer: Player;

  constructor() {
    // Parse configuration from URL or use defaults
    const urlConfig = this.urlConfigService.parseConfigFromUrl();
    const config = urlConfig ?? {
      player1: DEFAULT_HUMAN_CONFIG,
      player2: DEFAULT_CPU_CONFIG,
    };
    console.log('Game config:', urlConfig);
    const { humanPlayer, cpuPlayer } = this.createPlayers(config);
    this.humanPlayer = humanPlayer;
    this.cpuPlayer = cpuPlayer;

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
