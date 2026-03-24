import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forge-view',
  standalone: true,
  template: `
    <p>Forge View - Coming Soon</p>
    <button (click)="proceedToBackpack()">Proceed</button>
  `,
})
export class ForgeViewComponent {
  readonly router = inject(Router);

  proceedToBackpack(): void {
    this.router.navigate(['game-loop', 'backpack']);
  }
}
