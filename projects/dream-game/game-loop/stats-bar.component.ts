import { Component, input } from '@angular/core';
import { IconTextComponent } from '../common/icon-text.component';
import { PlayerStats } from './game-loop-state.service';

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [IconTextComponent],
  template: `
    <app-icon-text
      iconName="matrices"
      [text]="stats().matrices.toString()"
      data-testid="stat-matrices"
    ></app-icon-text>
    <div class="spacer"></div>
    <app-icon-text
      iconName="hp"
      [text]="stats().hp.toString()"
      data-testid="stat-hp"
    ></app-icon-text>
    <app-icon-text
      iconName="speed"
      [text]="stats().speed.toString()"
      data-testid="stat-speed"
    ></app-icon-text>
  `,
  styles: `
    :host {
      display: flex;
      gap: 16px;
      padding: 16px;
    }

    .spacer {
      flex: 1;
    }
  `,
})
export class StatsBarComponent {
  readonly stats = input.required<PlayerStats>();
}
