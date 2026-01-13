import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { GameService } from './game/game.service';
import { createCpuPlayer, Player } from './player';
import { PlayerRating } from './rating';
import { BoardUiComponent, HumanStrategy } from './ui';

@Component({
  selector: 'app-root',
  imports: [BoardUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (gameService.gameState(); as state) {
    <app-board-ui [gameState]="state" />
  } `,
})
export class App implements OnInit {
  protected readonly gameService = inject(GameService);
  private readonly humanStrategy = new HumanStrategy();

  private humanPlayer!: Player;
  private cpuPlayer!: Player;

  ngOnInit() {
    this.humanPlayer = {
      id: 'player',
      name: 'You',
      rating: new PlayerRating(),
      strategy: this.humanStrategy,
      loadout: {
        health: 20,
        speed: 8,
        items: [
          { id: '_blueprint_attack', instanceId: 'p1' },
          { id: '_blueprint_attack', instanceId: 'p2' },
          { id: '_blueprint_self_damage', instanceId: 'p3' },
          { id: '_blueprint_negate_damage', instanceId: 'p4' },
          { id: '_dummy', instanceId: 'p5' },
        ],
      },
    };

    this.cpuPlayer = createCpuPlayer('cpu', 'CPU');

    this.gameService.startGame(this.humanPlayer, this.cpuPlayer);
  }
}
