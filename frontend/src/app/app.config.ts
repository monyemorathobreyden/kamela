import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

const GreenPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac', // Shade 1: Light Green
            400: '#4ade80',
            500: '#22c55e', // Shade 2: Medium Green
            600: '#16a34a',
            700: '#15803d',
            800: '#166534', // Shade 3: Dark Green
            900: '#14532d',
            950: '#052e16'
        }
    }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: GreenPreset,
            options: {
                darkModeSelector: 'none'
            }
        }
    })
  ]
};
