import React from 'react';

export const InstallationGuide: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-16">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-foreground text-center mb-8">
          Guía de instalación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Paso 1 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-background border border-border/80 flex items-center justify-center mb-3 shadow-xs">
              <svg
                className="w-7 h-7 text-foreground stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v12m0 0l-3-3m3 3l3-3M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">
              1. Descargar APK
            </span>
          </div>

          {/* Paso 2 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-background border border-border/80 flex items-center justify-center mb-3 shadow-xs">
              <svg
                className="w-7 h-7 text-foreground stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">
              2. Permitir fuentes desconocidas
            </span>
          </div>

          {/* Paso 3 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-background border border-border/80 flex items-center justify-center mb-3 shadow-xs">
              <svg
                className="w-7 h-7 text-foreground stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-foreground">
              3. Instalar y abrir
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
