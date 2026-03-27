import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface EnemyConfig {
  items: string;
  health: number;
  speed: number;
}

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private readonly http = inject(HttpClient);

  private enemies: EnemyConfig[] = [];
  private currentIndex = 0;
  private loaded = false;

  loadEnemies(): Promise<void> {
    if (this.loaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.http
        .get('assets/players_elo.csv', { responseType: 'text' })
        .subscribe({
          next: (csv) => {
            this.enemies = this.parseCsv(csv);
            this.currentIndex = 0;
            this.loaded = true;
            resolve();
          },
          error: (err) => {
            console.error('[CampaignService] Failed to load CSV:', err);
            reject(err);
          },
        });
    });
  }

  getNextEnemy(): EnemyConfig | null {
    if (!this.loaded || this.enemies.length === 0) {
      return null;
    }

    const enemy = this.enemies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.enemies.length;
    return enemy;
  }

  getEnemyAt(index: number): EnemyConfig | null {
    if (!this.loaded || index < 0 || index >= this.enemies.length) {
      return null;
    }
    return this.enemies[index];
  }

  reset(): void {
    this.currentIndex = 0;
  }

  /** For testing: resets both index and loaded state */
  resetAll(): void {
    this.currentIndex = 0;
    this.loaded = false;
    this.enemies = [];
  }

  private parseCsv(csv: string): EnemyConfig[] {
    const lines = csv.trim().split('\n');
    const enemies: EnemyConfig[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const match = line.match(/^"([^"]+)"/);
      if (match) {
        const configStr = match[1];
        const parts = configStr.split('|');
        if (parts.length === 3) {
          enemies.push({
            items: parts[0],
            health: parseInt(parts[1], 10),
            speed: parseInt(parts[2], 10),
          });
        }
      }
    }

    return enemies;
  }
}
