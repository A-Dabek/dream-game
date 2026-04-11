import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { GamePlayersConfig } from '@dream/game-board';
import { GameContainerComponent } from '@dream/game-board-ui';
import { GameLoopStateService } from '../game-loop/game-loop-state.service';
import {
  DEFAULT_CPU_CONFIG,
  DEFAULT_HUMAN_CONFIG,
} from './game-view.constants';
import { UrlGameConfigService } from './url-game-config.service';

@Component({
  selector: 'app-game-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameContainerComponent],
  template: `
    <app-game-container
      [config]="resolvedConfig()"
      (continue)="onContinue($event)"
    />
  `,
})
export class GameViewComponent {
  readonly config = input<GamePlayersConfig>();
  private readonly urlConfigService = inject(UrlGameConfigService);
  private readonly router = inject(Router);
  private readonly gameLoopStateService = inject(GameLoopStateService);

  readonly resolvedConfig = computed(() => {
    return (
      this.config() ??
      this.urlConfigService.parseConfigFromUrl() ?? {
        player1: DEFAULT_HUMAN_CONFIG,
        player2: DEFAULT_CPU_CONFIG,
      }
    );
  });

  onContinue(playerWon: boolean): void {
    if (playerWon) {
      void this.router.navigate(['/game-loop/reward']);
    } else {
      this.gameLoopStateService.resetRun();
      void this.router.navigate(['/game-loop/forge']);
    }
  }
}
