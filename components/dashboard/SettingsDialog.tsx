"use client";

import { AlertCircle } from "lucide-react";
import React from "react";

import {
  DEFAULT_GOALS,
  PREACHER_TYPE_LABELS,
  PreacherType,
} from "@/domain/User";

import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { useDashboard } from "./DashboardProvider";

export function SettingsDialog() {
  const {
    showSettingsModal,
    setShowSettingsModal,
    settingsPreacherType,
    handlePreacherTypeChange,
    settingsMonthlyGoal,
    setSettingsMonthlyGoal,
    handleSaveSettings,
    isSavingSettings,
    settingsError,
  } = useDashboard();

  return (
    <Dialog
      isOpen={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
      title="Configuración de Predicador"
    >
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Tipo de Predicador
          </label>
          <select
            value={settingsPreacherType}
            onChange={(e) =>
              handlePreacherTypeChange(e.target.value as PreacherType)
            }
            className="w-full p-2.5 mt-1.5 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
          >
            {(Object.keys(PREACHER_TYPE_LABELS) as PreacherType[]).map(
              (type) => (
                <option key={type} value={type}>
                  {PREACHER_TYPE_LABELS[type]}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Meta de Horas Mensual
            </label>
            {DEFAULT_GOALS[settingsPreacherType] !== null && (
              <button
                type="button"
                onClick={() =>
                  setSettingsMonthlyGoal(
                    DEFAULT_GOALS[settingsPreacherType] || 0,
                  )
                }
                className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
              >
                Restablecer por defecto ({DEFAULT_GOALS[settingsPreacherType]}h)
              </button>
            )}
          </div>
          <Input
            type="number"
            value={settingsMonthlyGoal}
            onChange={(e) => {
              const val = e.target.value;
              setSettingsMonthlyGoal(val === "" ? "" : parseInt(val) || 0);
            }}
            min={0}
            className="mt-1.5"
          />
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
            Esta meta se utilizará para calcular tu progreso mensual en el panel
            principal.
          </p>
        </div>
        {settingsError && (
          <p className="text-red-600 text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {settingsError}
          </p>
        )}
        <Button
          type="submit"
          className="w-full mt-2 cursor-pointer"
          disabled={isSavingSettings}
        >
          {isSavingSettings ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </form>
    </Dialog>
  );
}
