import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import {
  RandomItemRegistrar,
  RandomItemDefinition,
  setRandomItemConventionRegistrar,
} from '@dream/game-board';
import { registerItemConvention } from '@dream/game-board-ui';
import { firstValueFrom } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        setRandomItemConventionRegistrar(registerItemConvention);
        const http = inject(HttpClient);
        return async () => {
          try {
            const items = await firstValueFrom(
              http.get<RandomItemDefinition[]>('assets/random_items.json'),
            );
            items.forEach((item) => RandomItemRegistrar.register(item));
          } catch (e) {
            console.warn('Failed to load random items:', e);
          }
        };
      },
      multi: true,
    },
  ],
};
