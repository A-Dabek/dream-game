import { Injectable, signal, inject } from '@angular/core';
import { Item } from '@dream/game-board';
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

export interface MoveMode {
  active: boolean;
  item: Item;
  fromArea: 'equip' | 'backpack';
  fromIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameLoopStateService {
  private readonly playerProgress = inject(PlayerProgressService);
  private readonly itemManagement = inject(ItemManagementService);
  private readonly fightManager = inject(FightManagerService);

  readonly moveMode = signal<MoveMode | null>(null);

  // Proxies for template access if needed, though components should ideally inject specific services
  readonly matrices = this.playerProgress.matrices;

  resetRun(): void {
    this.playerProgress.reset();
    this.itemManagement.reset();
    this.fightManager.reset();
    this.moveMode.set(null);
  }

  // Orchestration methods that might still be useful here or could be moved to components
  startFight(): void {
    void this.fightManager.startFight();
  }
}
