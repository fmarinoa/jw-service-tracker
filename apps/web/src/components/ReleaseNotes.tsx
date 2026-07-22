import type { CheckUpdateResponse } from '@jw-tracker/shared';
import React from 'react';

interface ReleaseNotesProps {
  release: CheckUpdateResponse | null;
}

export const ReleaseNotes: React.FC<ReleaseNotesProps> = ({ release }) => {
  const rawNotes = release?.notes?.trim();

  const notesList = React.useMemo(() => {
    if (!rawNotes) {
      return ["Tarjetas de resumen en 'JW Service Tracker'"];
    }
    const lines = rawNotes
      .split('\n')
      .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
      .filter((line) => line.length > 0);

    return lines.length > 0 ? lines : [rawNotes];
  }, [rawNotes]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-6">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm text-left">
        <h2 className="text-lg font-bold text-foreground mb-3">
          Notas de la versión
        </h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-foreground/90">
          {notesList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              <span className="ml-1">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
