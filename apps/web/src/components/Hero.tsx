import type { CheckUpdateResponse } from '@jw-tracker/shared';
import { DateTime } from 'luxon';
import React from 'react';

interface HeroProps {
  release: CheckUpdateResponse | null;
  loading: boolean;
}

export const Hero: React.FC<HeroProps> = ({ release, loading }) => {
  const version = release?.latestVersion || 'v0.0.1';
  const downloadUrl = release?.downloadUrl;
  const pwaUrl = import.meta.env.VITE_PWA_URL;

  const publishedAt =
    release?.publishedAt &&
    DateTime.fromISO(release.publishedAt)
      .setLocale('es')
      .toFormat('dd LLL, yyyy');

  const formattedSize = release?.size || '0 Bytes';

  return (
    <section className="flex flex-col items-center text-center pt-10 pb-6 px-4">
      {/* Insignia de Versión */}
      <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-card border border-border text-xs font-medium text-muted-foreground shadow-xs mb-6">
        {loading ? (
          <span className="animate-pulse">Cargando versión...</span>
        ) : (
          <span>
            Versión actual{' '}
            <strong className="text-foreground font-semibold">{version}</strong>
          </span>
        )}
      </div>

      {/* Título Principal */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-8">
        JW Service Tracker
      </h1>

      {/* Botones de Acción */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 w-full max-w-lg">
        {/* Botón Descargar APK (Android) */}
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[190px] inline-flex items-center justify-center space-x-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-3.5 rounded-2xl shadow-md transition-all duration-200 active:scale-95 text-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5516 0 .9997.4482.9997.9993 0 .5511-.4481.9997-.9997.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5516 0 .9997.4482.9997.9993 0 .5511-.4481.9997-.9997.9997zm11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1523-.5676.416.416 0 00-.5676.1523l-2.0223 3.503C15.59 8.2743 13.853 7.84 12 7.84c-1.853 0-3.59.4343-5.1346 1.1102L4.843 5.4472a.416.416 0 00-.5676-.1523.416.416 0 00-.1523.5676l1.9973 3.4592C2.6889 11.0543.3444 14.283.0039 18.1729h23.9922c-.3405-3.8899-2.685-7.1186-6.1146-8.8515z" />
            </svg>
            <span>Descargar APK</span>
          </a>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto min-w-[190px] inline-flex items-center justify-center space-x-2.5 bg-primary/70 text-primary-foreground font-semibold px-5 py-3.5 rounded-2xl shadow-md cursor-not-allowed opacity-90 text-sm"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5516 0 .9997.4482.9997.9993 0 .5511-.4481.9997-.9997.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9993.4482-.9993.9993-.9993c.5516 0 .9997.4482.9997.9993 0 .5511-.4481.9997-.9997.9997zm11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1523-.5676.416.416 0 00-.5676.1523l-2.0223 3.503C15.59 8.2743 13.853 7.84 12 7.84c-1.853 0-3.59.4343-5.1346 1.1102L4.843 5.4472a.416.416 0 00-.5676-.1523.416.416 0 00-.1523.5676l1.9973 3.4592C2.6889 11.0543.3444 14.283.0039 18.1729h23.9922c-.3405-3.8899-2.685-7.1186-6.1146-8.8515z" />
            </svg>
            <span>Descargar APK</span>
          </button>
        )}

        {/* Botón Usar en Navegador (PWA) */}
        <a
          href={pwaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto min-w-[170px] inline-flex items-center justify-center space-x-2 bg-card hover:bg-muted/80 text-foreground font-semibold px-5 py-3.5 rounded-2xl border border-border transition-all duration-200 text-sm shadow-xs"
        >
          <svg
            className="w-4 h-4 text-foreground stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8"
            />
          </svg>
          <span>Usar en Navegador</span>
        </a>

        {/* Botón iOS Próximamente */}
        <div className="w-full sm:w-auto min-w-[160px] inline-flex items-center justify-center space-x-2 bg-muted/60 text-muted-foreground font-medium px-4 py-3.5 rounded-2xl border border-border/70 cursor-default text-sm">
          <svg className="w-4 h-4 fill-current opacity-70" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.64 1.35-.58.67-1.09 1.75-.95 2.78 1.01.08 2.05-.53 2.67-1.28z" />
          </svg>
          <span>iOS (Próximamente)</span>
        </div>
      </div>

      {/* Metadatos */}
      <p className="text-xs sm:text-sm text-muted-foreground font-normal">
        Fecha de lanzamiento: {publishedAt} &middot; {formattedSize}
      </p>
    </section>
  );
};
