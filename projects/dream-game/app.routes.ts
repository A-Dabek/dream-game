import { Routes } from '@angular/router';
import { GameViewComponent } from './game/game-view.component';
import { GameLoopViewComponent } from './game-loop/game-loop-view.component';
import { ForgeViewComponent } from './game-loop/forge-view.component';
import { BackpackViewComponent } from './game-loop/backpack-view.component';
import { RewardViewComponent } from './game-loop/reward-view.component';

export const routes: Routes = [
  { path: '', component: GameViewComponent },
  {
    path: 'game-loop',
    component: GameLoopViewComponent,
    children: [
      { path: 'forge', component: ForgeViewComponent },
      { path: 'backpack', component: BackpackViewComponent },
      { path: 'reward', component: RewardViewComponent },
      { path: '', redirectTo: 'forge', pathMatch: 'full' },
    ],
  },
];
