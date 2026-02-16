import { Injectable } from '@angular/core';
import { ItemId } from '@dream/item';
import { ItemDisplayRegistry } from '../../common/item-display-map';

const SFX_BASE_PATH = '/assets/sfx';
const FALLBACK_SOUND = `${SFX_BASE_PATH}/basic.wav`;

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  playItemSound(itemId: ItemId): void {
    const iconName = ItemDisplayRegistry.getMetadata(itemId).iconName;
    const soundPath = `${SFX_BASE_PATH}/${iconName}.wav`;

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
