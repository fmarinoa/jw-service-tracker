"use client";

import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { DateTime } from "luxon";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TYPE_LABELS } from "./constants";
import { useDashboard } from "./DashboardProvider";

export function RecentActivityCard() {
  const {
    entries,
    handleEdit,
    openDeleteModal,
    page,
    totalPages,
    fetchDashboardData,
    monthOffset,
    handleMonthChange,
    isEntriesLoading,
  } = useDashboard();

  const formatLongDate = (millis: number) => {
    const dt = DateTime.fromMillis(millis).setLocale("es");
    const formatted = dt.toFormat("EEEE d 'de' MMMM 'del' yyyy");
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <CardTitle>Actividad Reciente</CardTitle>
        <div className="flex bg-border/40 p-1 rounded-lg border border-border/80">
          {[0, -1, -2].map((offset) => {
            const date = DateTime.now()
              .setZone("America/Lima")
              .plus({ months: offset });
            const label = date.setLocale("es").toFormat("LLL");
            const capitalizedLabel =
              label.charAt(0).toUpperCase() + label.slice(1);
            const isActive = monthOffset === offset;
            return (
              <button
                key={offset}
                onClick={() => handleMonthChange(offset)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                {capitalizedLabel}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isEntriesLoading ? (
          <div className="divide-y divide-border/60 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-4 flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className="h-4.5 w-1/3 bg-muted rounded-md" />
                  <div className="h-3.5 w-1/4 bg-muted rounded-md" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-muted rounded-md" />
                  <div className="h-8 w-8 bg-muted rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No hay registros para este mes
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {formatLongDate(entry.preachingDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.hours}h {entry.minutes}m • {TYPE_LABELS[entry.type]}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      &quot;{entry.notes}&quot;
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-2">
                <Button
                  variant="outline"
                  onClick={() => fetchDashboardData(page - 1)}
                  disabled={page === 1}
                  className="gap-1 px-3 py-1 h-8 text-xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </Button>
                <span className="text-xs text-muted-foreground font-semibold">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchDashboardData(page + 1)}
                  disabled={page === totalPages}
                  className="gap-1 px-3 py-1 h-8 text-xs cursor-pointer"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
