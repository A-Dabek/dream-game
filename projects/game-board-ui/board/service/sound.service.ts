import { Injectable } from '@angular/core';
import { ItemId } from '@dream/game-board';
import { ItemConventionRegistry } from '../../conventions/convention-registry';
import { environment } from '../../environments/environment';

const SFX_BASE_PATH = '/assets/sfx/game-items';
const INTERFACE_SFX_BASE_PATH = '/assets/sfx/game-interface';
const FALLBACK_SOUND = `${SFX_BASE_PATH}/basic.wav`;

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private backgroundAudio: HTMLAudioElement | null = null;

  playItemSound(itemId: ItemId): void {
    if (environment.disableSounds) {
      return;
    }

    const entry = ItemConventionRegistry.getItemConvention(itemId);
    const soundPath = `${SFX_BASE_PATH}/${entry.icon}.wav`;

    this.playAudio(soundPath).catch(() => {
      this.playAudio(FALLBACK_SOUND).catch((error) => {
        console.warn('Failed to play fallback sound:', error);
      });
    });
  }

  playBackground(): void {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio = null;
    }
    this.playInterfaceSound('background', true);
  }

  playWin(): void {
    this.playInterfaceSound('win');
  }

  playLoss(): void {
    this.playInterfaceSound('loss');
  }

  playPass(): void {
    this.playInterfaceSound('pass');
  }

  stopBackground(): void {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio = null;
    }
  }

  private async playInterfaceSound(
    soundName: string,
    loop = false,
  ): Promise<void> {
    if (environment.disableSounds) {
      return;
    }

    const soundPath = `${INTERFACE_SFX_BASE_PATH}/${soundName}.wav`;
    try {
      const audio = await this.playAudio(soundPath, loop);
      if (soundName === 'background') {
        this.backgroundAudio = audio;
      }
    } catch (error) {
      console.warn(`Failed to play interface sound: ${soundName}`, error);
    }
  }

  private async playAudio(
    path: string,
    loop = false,
  ): Promise<HTMLAudioElement> {
    const audio = new Audio(path);
    audio.loop = loop;

    return new Promise((resolve, reject) => {
      audio.addEventListener(
        'canplaythrough',
        () => {
          audio
            .play()
            .then(() => resolve(audio))
            .catch(reject);
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
