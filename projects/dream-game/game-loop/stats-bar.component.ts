import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconTextComponent } from '../common/icon-text.component';
import { InterfaceIconName } from '../common/interface-icon-registry';
import { PlayerStats } from './player-progress.service';

export interface NavButton {
  iconName: InterfaceIconName;
  text: string;
  link: string;
}

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [IconTextComponent, RouterLink],
  template: `
    <app-icon-text
      iconName="matrices"
      [text]="stats().matrices.toString()"
      data-testid="stat-matrices"
    ></app-icon-text>
    <div class="spacer"></div>
    @if (navButton()) {
      <a class="nav-btn" [routerLink]="navButton()!.link" data-testid="nav-btn">
        <app-icon-text
          [iconName]="navButton()!.iconName"
          [text]="navButton()!.text"
        />
      </a>
    }
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
      align-items: center;
    }

    .spacer {
      flex: 1;
    }

    .nav-btn {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
  `,
})
export class StatsBarComponent {
  readonly stats = input.required<PlayerStats>();
  readonly navButton = input<NavButton | null>(null);
}
