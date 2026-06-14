'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { DateTime } from 'luxon';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useDashboard } from './DashboardProvider';
import { TYPE_LABELS } from './constants';

export function RecentActivityCard() {
  const { entries, handleEdit, openDeleteModal } = useDashboard();

  const formatLongDate = (millis: number) => {
    const dt = DateTime.fromMillis(millis).setLocale('es');
    const formatted = dt.toFormat("EEEE d 'de' MMMM 'del' yyyy");
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No hay registros este mes
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div key={entry.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{formatLongDate(entry.preachingDate)}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.hours}h {entry.minutes}m • {TYPE_LABELS[entry.type]}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="p-2"
                    onClick={() => handleEdit(entry)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="p-2 text-red-600"
                    onClick={() => openDeleteModal(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
