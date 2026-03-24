import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-backpack-view',
  standalone: true,
  template: `
    <p>Backpack View - Coming Soon</p>
    <button (click)="proceedToForge()">Proceed</button>
  `,
})
export class BackpackViewComponent {
  readonly router = inject(Router);

  proceedToForge(): void {
    this.router.navigate(['game-loop', 'forge']);
  }
}
