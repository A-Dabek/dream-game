import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { UrlGameConfigService } from './url-game-config.service';
import { GamePlayersConfig, PlayerConfig } from '@dream/game-board';
import { GameContainerComponent } from '@dream/game-board-ui';

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
  selector: 'app-game-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GameContainerComponent],
  template: ` <app-game-container [config]="resolvedConfig()" /> `,
})
export class GameViewComponent {
  private readonly urlConfigService = inject(UrlGameConfigService);

  readonly config = input<GamePlayersConfig>();

  readonly resolvedConfig = computed(() => {
    const urlConfig = this.urlConfigService.parseConfigFromUrl();
    const passedConfig = this.config();

    return (
      passedConfig ??
      urlConfig ?? {
        player1: DEFAULT_HUMAN_CONFIG,
        player2: DEFAULT_CPU_CONFIG,
      }
    );
  });
}
