import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'icon',
    pathMatch: 'full',
  },
  {
    path: 'icon',
    loadComponent: () =>
      import('./pages/icon-showcase.component').then(
        (m) => m.IconShowcaseComponent,
      ),
  },
  {
    path: 'item-display',
    loadComponent: () =>
      import('./pages/item-display-showcase.component').then(
        (m) => m.ItemDisplayShowcaseComponent,
      ),
  },
];
