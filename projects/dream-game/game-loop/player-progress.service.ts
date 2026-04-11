import { Injectable, signal } from '@angular/core';

// Base stats - player starts with these
export const BASE_HP = 1;
export const BASE_SPEED = 1;
export const BASE_MATRICES = 10;

export interface PlayerStats {
  hp: number;
  speed: number;
  matrices: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerProgressService {
  readonly matrices = signal(BASE_MATRICES);

  reset(): void {
    this.matrices.set(BASE_MATRICES);
  }

  deductMatrices(amount: number): void {
    this.matrices.update((value) => value - amount);
  }

  addMatrices(amount: number): void {
    this.matrices.update((v) => v + amount);
  }
}
