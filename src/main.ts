import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

async function bootstrap(): Promise<void> {
  const scripts: Promise<void>[] = [];
  if (environment.googleClientScriptUrl) {
    scripts.push(loadScript(environment.googleClientScriptUrl));
  }
  if (environment.googleMapsApiKey) {
    scripts.push(
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          environment.googleMapsApiKey,
        )}&libraries=places&loading=async`,
      ),
    );
  }
  await Promise.all(scripts.map((p) => p.catch(() => undefined)));
  await platformBrowserDynamic().bootstrapModule(AppModule);
}

bootstrap().catch((err) => console.error(err));
