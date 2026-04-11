import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignService, EnemyConfig } from './campaign.service';
import {
  ItemManagementService,
  ForgedItemData,
} from './item-management.service';

@Injectable({
  providedIn: 'root',
})
export class FightManagerService {
  private readonly router = inject(Router);
  private readonly campaignService = inject(CampaignService);
  private readonly itemManagement = inject(ItemManagementService);

  readonly currentEnemy = signal<EnemyConfig | null>(null);

  reset(): void {
    this.currentEnemy.set(null);
  }

  setEnemy(config: EnemyConfig): void {
    this.currentEnemy.set(config);
  }

  buildFightState(): string | null {
    const enemy = this.currentEnemy();
    if (!enemy) {
      return null;
    }

    const equipped = this.itemManagement.equippedItems();
    const itemIds = equipped
      .filter((item): item is ForgedItemData => item !== null)
      .map((item) => item.item.id)
      .join(',');
    const stats = this.itemManagement.playerStats();

    const playerConfig = `${itemIds}|${stats.hp}|${stats.speed}`;
    const enemyConfig = `${enemy.items}|${enemy.health}|${enemy.speed}`;

    return `${playerConfig};${enemyConfig}`;
  }

  async startFight(): Promise<void> {
    try {
      await this.campaignService.loadEnemies();
    } catch {
      console.error('[FightManager] Failed to load enemies');
      return;
    }

    const enemy = this.campaignService.getNextEnemy();
    if (!enemy) {
      console.error('[FightManager] No enemy available');
      return;
    }

    this.setEnemy(enemy);
    const state = this.buildFightState();

    if (state) {
      this.router.navigate(['/'], { queryParams: { state } });
    }
  }
}
