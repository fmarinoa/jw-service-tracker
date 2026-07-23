import React from 'react';

import appScreenshot from '../assets/app-screenshot.webp';

interface AppScreenshotMockupProps {
  className?: string;
}

export const AppScreenshotMockup: React.FC<AppScreenshotMockupProps> = ({
  className = '',
}) => (
  <div className={className}>
    <div className="w-[280px] h-[580px] rounded-[36px] bg-card border border-border shadow-lg p-3.5">
      <img
        src={appScreenshot}
        alt="Captura de la app JW Reporta"
        className="w-full h-full rounded-[24px] object-cover"
      />
    </div>
  </div>
);
