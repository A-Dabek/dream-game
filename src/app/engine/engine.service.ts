import {computed, Injectable, signal} from '@angular/core';
import {ItemId} from '../item';
import {EnginePlayer, EngineState} from './engine.model';

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

  initializeGame(playerOne: EnginePlayer, playerTwo: EnginePlayer): void {
    this.engineStateSignal.set({
      playerOne,
      playerTwo
    });
  }

  play(itemId: ItemId): void {
    // Placeholder for future item effect logic
    // To be implemented with external item effect handlers
  }

  resetGame(): void {
    this.engineStateSignal.set(null);
  }
}

