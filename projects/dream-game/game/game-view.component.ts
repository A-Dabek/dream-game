import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { UrlGameConfigService } from './url-game-config.service';
import { GamePlayersConfig } from '@dream/game-board';
import { GameContainerComponent } from '@dream/game-board-ui';
import {
  DEFAULT_CPU_CONFIG,
  DEFAULT_HUMAN_CONFIG,
} from './game-view.constants';

@Component({
  selector: 'app-game-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameContainerComponent],
  template: ` <app-game-container [config]="resolvedConfig()" /> `,
})
export class GameViewComponent {
  private readonly urlConfigService = inject(UrlGameConfigService);

  readonly config = input<GamePlayersConfig>();

  readonly resolvedConfig = computed(() => {
    return (
      this.config() ??
      this.urlConfigService.parseConfigFromUrl() ?? {
        player1: DEFAULT_HUMAN_CONFIG,
        player2: DEFAULT_CPU_CONFIG,
      }
    );
  });
}
