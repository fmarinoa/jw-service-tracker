import { ArrowUpRight } from 'lucide-react';
import React from 'react';

export const Header: React.FC = () => {
  const pwaUrl = import.meta.env.VITE_PWA_URL;

  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="font-extrabold text-primary-foreground text-sm tracking-tight">
              JW
            </span>
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">
            JW Reporta
          </span>
        </div>

        <a
          href={pwaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-card hover:bg-muted/80 text-foreground font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full border border-border transition-colors duration-200"
        >
          <span>Usar Web App</span>
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.2} />
        </a>
      </div>
    </header>
  );
};
