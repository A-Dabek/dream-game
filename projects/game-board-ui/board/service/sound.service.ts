import { Injectable } from '@angular/core';
import { ItemId } from '@dream/game-board';
import { ItemConventionRegistry } from '../../conventions/convention-registry';

const SFX_BASE_PATH = '/assets/sfx';
const FALLBACK_SOUND = `${SFX_BASE_PATH}/basic.wav`;

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  playItemSound(itemId: ItemId): void {
    const entry = ItemConventionRegistry.getItemConvention(itemId);
    const soundPath = `${SFX_BASE_PATH}/${entry.icon}.wav`;

    this.playAudio(soundPath).catch(() => {
      this.playAudio(FALLBACK_SOUND).catch((error) => {
        console.warn('Failed to play fallback sound:', error);
      });
    });
  }

  private async playAudio(path: string): Promise<void> {
    const audio = new Audio(path);

    return new Promise((resolve, reject) => {
      audio.addEventListener(
        'canplaythrough',
        () => {
          audio.play().then(resolve).catch(reject);
        },
        { once: true },
      );

      audio.addEventListener(
        'error',
        () => {
          reject(new Error(`Failed to load audio: ${path}`));
        },
        { once: true },
      );

      audio.load();
    });
  }
}
