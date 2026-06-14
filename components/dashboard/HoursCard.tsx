'use client';

import { Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useDashboard } from './DashboardProvider';

export function HoursCard() {
  const {
    user,
    reportedHours,
    progressPercentage,
    hoursLeft,
    percentageLeft,
    circumference,
    strokeDashoffset,
    resetForm,
    setShowAddModal,
    openSettingsModal
  } = useDashboard();

  if (!user) return null;

  return (
    <Card className="md:col-span-2 shadow-sm border-border/80">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Info Column */}
          <div className="sm:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    Horas del Mes
                  </p>
                  <h2 className="text-5xl font-black text-primary mt-1 tracking-tight">
                    {reportedHours}h
                  </h2>
                </div>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="gap-2 shadow-sm hover:brightness-95 transition-all"
                >
                  <Plus className="w-5 h-5" /> Registrar
                </Button>
              </div>

              {user.monthlyGoal > 0 ? (
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                    <span>Progreso de la meta</span>
                    <span className="text-primary font-bold">
                      {reportedHours} de {user.monthlyGoal} horas ({progressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-border/40 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-700 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  {reportedHours >= user.monthlyGoal ? (
                    <p className="text-xs text-green-700 font-bold mt-2 flex items-center gap-1">
                      🎉 ¡Felicidades! Has completado tu meta del mes.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                      Llevas el <span className="font-bold text-foreground">{progressPercentage}%</span> de tu meta. Te faltan <span className="font-bold text-primary">{hoursLeft} horas</span> para cumplirla ({percentageLeft}% restante).
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-border/60 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Sin meta de horas configurada.</span>
                  <button
                    onClick={openSettingsModal}
                    className="text-primary font-bold hover:underline transition-all cursor-pointer"
                  >
                    Configurar una meta
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Graphic Column */}
          {user.monthlyGoal > 0 && (
            <div className="flex flex-col items-center justify-center bg-card/60 p-4 rounded-xl border border-border/50 shadow-inner">
              <div className="relative flex items-center justify-center w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track */}
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-border/40"
                  />
                  {/* Progress */}
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  {hoursLeft > 0 ? (
                    <>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Faltan</span>
                      <span className="text-xl font-black text-primary leading-none my-0.5">{hoursLeft}h</span>
                      <span className="text-[10px] font-semibold text-muted-foreground">-{percentageLeft}%</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[9px] uppercase tracking-wider text-green-700 font-bold">Completado</span>
                      <span className="text-xl font-black text-green-600 leading-none my-0.5">Listo</span>
                      <span className="text-[10px] font-bold text-green-700">100%</span>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {hoursLeft > 0 ? 'En progreso' : '¡Completada!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
