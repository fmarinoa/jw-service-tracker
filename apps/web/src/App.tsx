import type { CheckUpdateResponse } from '@jw-tracker/shared';
import React, { useEffect, useState } from 'react';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { InstallationGuide } from './components/InstallationGuide';
import { ReleaseNotes } from './components/ReleaseNotes';
import { fetchLatestRelease } from './services/api';

export const App: React.FC = () => {
  const [release, setRelease] = useState<CheckUpdateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetchLatestRelease().then((data) => {
      if (isMounted) {
        setRelease(data);
        setLoading(false);
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
        <main className="max-w-4xl mx-auto py-6">
          <Hero release={release} loading={loading} />
          <ReleaseNotes release={release} />
          <InstallationGuide />
        </main>
      </div>

      <footer className="w-full py-6 border-t border-border/40 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} JW Service Tracker. Todos los
          derechos reservados.
        </p>
      </footer>
    </div>
  );
};
