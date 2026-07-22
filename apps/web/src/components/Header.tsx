import React from 'react';

export const Header: React.FC = () => {
  const pwaUrl =
    import.meta.env.VITE_PWA_URL || 'https://app.jw-service-tracker.com';

  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-xs">
            <span className="font-bold text-foreground text-sm tracking-tight">
              JW
            </span>
          </div>
          <span className="font-bold text-foreground text-lg tracking-tight">
            JW Service Tracker
          </span>
        </div>

        {/* Action button to open Web App directly */}
        <a
          href={pwaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 bg-card hover:bg-muted/80 text-foreground font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl border border-border transition-colors duration-200 shadow-xs"
        >
          <span>Abrir Web App</span>
          <svg
            className="w-3.5 h-3.5 fill-none stroke-current"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>
      </div>
    </header>
  );
};
