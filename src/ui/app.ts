import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameContainerComponent } from './index';

@Component({
  selector: 'app-root',
  imports: [GameContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-game-container />`,
})
export class App {}
