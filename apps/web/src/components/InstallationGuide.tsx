import React from 'react';

import type { Platform } from '../hooks/usePlatform';

interface InstallationGuideProps {
  platform: Platform;
}

interface Step {
  title: string;
  desc: string;
}

const androidSteps: Step[] = [
  {
    title: 'Descarga el archivo APK',
    desc: 'Toca el botón de descarga arriba.',
  },
  {
    title: 'Permite instalar',
    desc: 'Acepta instalar apps de fuentes externas si tu teléfono lo pide.',
  },
  {
    title: 'Abre y listo',
    desc: 'Abre el archivo descargado para empezar a usarla.',
  },
];

const iosSteps: Step[] = [
  {
    title: 'Abre el enlace en Safari',
    desc: 'Usa el navegador Safari para que funcione correctamente.',
  },
  {
    title: 'Toca Compartir',
    desc: 'Busca el ícono de compartir en la barra del navegador.',
  },
  {
    title: "Elige 'Agregar a inicio'",
    desc: 'Así tendrás acceso directo como una app normal.',
  },
];

export const InstallationGuide: React.FC<InstallationGuideProps> = ({
  platform,
}) => {
  const isIOS = platform === 'ios';
  const steps = isIOS ? iosSteps : androidSteps;
  const title = isIOS
    ? 'Cómo agregarla a tu pantalla de inicio'
    : 'Cómo instalarla en Android';

  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-12 mb-24">
      <div className="bg-card border border-border rounded-3xl p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-foreground mb-8">{title}</h2>
        <div className="flex flex-wrap gap-8">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex-1 min-w-[200px]">
              <div className="w-10 h-10 rounded-full bg-muted text-primary flex items-center justify-center font-extrabold text-base mb-4">
                {idx + 1}
              </div>
              <div className="text-base font-bold text-foreground mb-1.5">
                {step.title}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
