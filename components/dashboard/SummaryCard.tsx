"use client";

import { Share2 } from "lucide-react";
import { DateTime } from "luxon";

import { SessionType } from "@/domain/Entry";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TYPE_ICONS, TYPE_LABELS } from "./constants";
import { useDashboard } from "./DashboardProvider";

export function SummaryCard() {
  const {
    stats,
    showExportSuccess,
    handleExportWhatsApp,
    showExportOptions,
    setShowExportOptions,
    exportingMonthOffset,
  } = useDashboard();

  const handlerExport = (offset: number) => {
    handleExportWhatsApp(offset);
    setShowExportOptions(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resumen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(Object.keys(TYPE_LABELS) as SessionType[]).map((type) => (
          <div key={type} className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              {TYPE_ICONS[type]}
              {TYPE_LABELS[type]}
            </span>
            <span className="font-bold">
              {Math.floor((stats.byType[type] || 0) / 60)}h
            </span>
          </div>
        ))}
        {showExportSuccess ? (
          <div className="w-full mt-2 h-10 flex items-center justify-center text-sm font-bold text-green-700 bg-green-50 rounded-lg border-2 border-green-600 animate-pulse">
            ¡Copiado al portapapeles!
          </div>
        ) : showExportOptions ? (
          <div className="space-y-2 mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground font-semibold">
              Selecciona el mes para exportar:
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {[0, -1, -2].map((offset) => {
                const targetDate = DateTime.now()
                  .setZone("America/Lima")
                  .plus({ months: offset });
                const label = targetDate
                  .setLocale("es-ES")
                  .toFormat("MMMM yyyy");
                const capitalizedLabel =
                  label.charAt(0).toUpperCase() + label.slice(1);
                return (
                  <Button
                    key={offset}
                    onClick={() => handlerExport(offset)}
                    variant="outline"
                    className="w-full text-xs justify-start h-9 cursor-pointer"
                    disabled={exportingMonthOffset !== null}
                  >
                    {exportingMonthOffset === offset ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
                        Copiando...
                      </span>
                    ) : (
                      capitalizedLabel
                    )}
                  </Button>
                );
              })}
              <Button
                onClick={() => setShowExportOptions(false)}
                variant="ghost"
                className="w-full text-xs h-8 text-muted-foreground mt-1 cursor-pointer"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowExportOptions(true)}
            variant="outline"
            className="w-full mt-2 gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Exportar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
