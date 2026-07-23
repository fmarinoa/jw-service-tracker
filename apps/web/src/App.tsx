import type { CheckUpdateResponse } from '@jw-tracker/shared';
import React, { useEffect, useState } from 'react';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InstallationGuide } from './components/InstallationGuide';
import { usePlatform } from './hooks/usePlatform';
import { fetchLatestRelease } from './services/api';

export const App: React.FC = () => {
  const [release, setRelease] = useState<CheckUpdateResponse | null>(null);
  const { platform, setPlatform } = usePlatform();

  useEffect(() => {
    let isMounted = true;
    fetchLatestRelease().then((data) => {
      if (isMounted) {
        setRelease(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header />
        <main>
          <Hero
            platform={platform}
            onPlatformChange={setPlatform}
            downloadUrl={release?.downloadUrl}
          />
          <InstallationGuide platform={platform} />
        </main>
      </div>

      <footer className="w-full py-7 px-6 border-t border-border text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} JW Reporta. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
};
