import { Download } from 'lucide-react';
import React from 'react';

import appScreenshot from '../assets/app-screenshot.webp';
import type { Platform } from '../hooks/usePlatform';

interface HeroProps {
  platform: Platform;
  onPlatformChange: (platform: Platform) => void;
  downloadUrl?: string | null;
}

const toggleBase =
  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors duration-200';
const toggleActive = `${toggleBase} bg-primary text-primary-foreground`;
const toggleInactive = `${toggleBase} bg-transparent border border-border text-muted-foreground hover:text-foreground`;

export const Hero: React.FC<HeroProps> = ({
  platform,
  onPlatformChange,
  downloadUrl,
}) => {
  const pwaUrl =
    import.meta.env.VITE_PWA_URL || 'https://app.jw-service-tracker.com';
  const isIOS = platform === 'ios';

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-12 pt-16 sm:pt-24 pb-12 flex flex-col lg:flex-row gap-16 items-center">
      <div className="flex-1 w-full">
        <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
          Para publicadores
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight text-foreground mb-5">
          Lleva el control de tu predicación sin complicarte
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mb-9 leading-relaxed">
          Registra tus horas de servicio en segundos y recibe tu informe listo
          para entregar cada fin de mes.
        </p>

        {isIOS ? (
          <div className="flex flex-col gap-3.5 max-w-sm">
            <a
              href={pwaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center px-7 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base transition-colors duration-200 active:scale-95"
            >
              Usar la Web App
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La app nativa para iPhone está en camino. Mientras tanto, esta
              versión web funciona igual de bien.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3.5 max-w-lg">
            {downloadUrl ? (
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base transition-colors duration-200 active:scale-95"
              >
                <Download className="w-4 h-4" strokeWidth={2.2} />
                Descargar APK
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-primary/70 text-primary-foreground font-bold text-base cursor-not-allowed opacity-90"
              >
                <Download className="w-4 h-4" strokeWidth={2.2} />
                Descargar APK
              </button>
            )}
            <a
              href={pwaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-4 rounded-2xl border border-border bg-card hover:bg-muted/80 text-foreground font-bold text-base transition-colors duration-200"
            >
              Usar la Web App
            </a>
            <p className="w-full text-sm text-muted-foreground mt-1">
              Próximamente disponible en Google Play.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2.5 mt-10 pt-7 border-t border-border">
          <span className="text-xs text-muted-foreground mr-1">
            Ver guía para:
          </span>
          <button
            type="button"
            onClick={() => onPlatformChange('android')}
            className={platform === 'android' ? toggleActive : toggleInactive}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => onPlatformChange('ios')}
            className={isIOS ? toggleActive : toggleInactive}
          >
            iPhone
          </button>
        </div>
      </div>

      <div className="shrink-0 flex justify-center">
        <div className="w-[280px] h-[580px] rounded-[36px] bg-card border border-border shadow-lg p-3.5">
          <img
            src={appScreenshot}
            alt="Captura de la app JW Reporta"
            className="w-full h-full rounded-[24px] object-cover"
          />
        </div>
      </div>
    </section>
  );
};
