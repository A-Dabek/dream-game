import { Injectable, signal, computed } from '@angular/core';
import { EngineState } from './engine.model';
import { Player } from '../board';

@Injectable({
  providedIn: 'root'
})
export class EngineService {
  private engineStateSignal = signal<EngineState | null>(null);

  engineState = computed(() => this.engineStateSignal());

  playerOneHealth = computed(() => this.engineStateSignal()?.playerOne.health ?? 0);

  playerTwoHealth = computed(() => this.engineStateSignal()?.playerTwo.health ?? 0);

  playerOneItems = computed(() => this.engineStateSignal()?.playerOne.items ?? []);

  playerTwoItems = computed(() => this.engineStateSignal()?.playerTwo.items ?? []);

  initializeGame(playerOne: Player, playerTwo: Player): void {
    this.engineStateSignal.set({
      playerOne,
      playerTwo
    });
  }

  play(itemName: string): void {
    // Placeholder for future item effect logic
    // To be implemented with external item effect handlers
  }

  resetGame(): void {
    this.engineStateSignal.set(null);
  }
}

