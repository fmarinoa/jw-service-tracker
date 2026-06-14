"use client";

import { Share2 } from "lucide-react";
import React from "react";

import { SessionType } from "@/domain/Entry";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TYPE_ICONS, TYPE_LABELS } from "./constants";
import { useDashboard } from "./DashboardProvider";

export function SummaryCard() {
  const { stats, showExportSuccess, handleExportWhatsApp } = useDashboard();

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
        ) : (
          <Button
            onClick={handleExportWhatsApp}
            variant="outline"
            className="w-full mt-2 gap-2"
          >
            <Share2 className="w-4 h-4" /> Exportar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
