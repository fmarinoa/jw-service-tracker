"use client";

import { LogOut, Settings } from "lucide-react";

import { PREACHER_TYPE_LABELS } from "@/domain/User";

import { Button } from "../ui/button";
import { useDashboard } from "./DashboardProvider";

export function DashboardHeader() {
  const { user, openSettingsModal, disableLogout, handleLogout } =
    useDashboard();

  if (!user) return null;

  return (
    <header className="flex justify-between items-center py-4 border-b border-border/40">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-primary">
          JW Tracker
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
          {PREACHER_TYPE_LABELS[user.preacherType || "publisher"]}
          {user.monthlyGoal > 0 && (
            <>
              <br />
              Meta: {user.monthlyGoal} horas
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={openSettingsModal}
          className="text-muted-foreground hover:text-primary hover:bg-primary/5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-semibold">
            Configurar
          </span>
        </Button>
        <span className="text-sm font-medium border-l pl-3 py-1 border-border text-foreground">
          {user.name || user.phone}
        </span>
        <Button
          disabled={disableLogout}
          variant="ghost"
          onClick={handleLogout}
          className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2 rounded-lg cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
