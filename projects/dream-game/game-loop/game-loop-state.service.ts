import { Injectable, inject } from '@angular/core';
import { PlayerProgressService, PlayerStats } from './player-progress.service';
import {
  ItemManagementService,
  ForgedItemData,
  Position,
  ItemBonusStats,
} from './item-management.service';
import { FightManagerService } from './fight-manager.service';

export type { ForgedItemData, Position, ItemBonusStats, PlayerStats };
export { forgeItemStats } from './item-management.service';

@Injectable({
  providedIn: 'root',
})
export class GameLoopStateService {
  private readonly playerProgress = inject(PlayerProgressService);
  private readonly itemManagement = inject(ItemManagementService);
  private readonly fightManager = inject(FightManagerService);

  readonly playerStats = this.itemManagement.playerStats;

  resetRun(): void {
    this.playerProgress.reset();
    this.itemManagement.reset();
    this.fightManager.reset();
  }

  startFight(): void {
    void this.fightManager.startFight();
  }

  addReward(matrices: number): void {
    this.playerProgress.addMatrices(matrices);
  }
}
