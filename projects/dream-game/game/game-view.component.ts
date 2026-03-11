import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { GamePlayersConfig } from '@dream/game-board';
import { GameContainerComponent } from '@dream/game-board-ui';
import {
  DEFAULT_CPU_CONFIG,
  DEFAULT_HUMAN_CONFIG,
} from './game-view.constants';
import { UrlGameConfigService } from './url-game-config.service';

@Component({
  selector: 'app-game-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameContainerComponent],
  template: ` <app-game-container [config]="resolvedConfig()" /> `,
})
export class GameViewComponent {
  readonly config = input<GamePlayersConfig>();
  private readonly urlConfigService = inject(UrlGameConfigService);
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
