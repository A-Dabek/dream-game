import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameViewComponent } from './game/game-view.component';

@Component({
  selector: 'app-root',
  imports: [GameViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-game-view />`,
})
export class App {}
