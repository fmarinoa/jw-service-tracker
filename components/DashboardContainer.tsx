'use client';

import React, { useState } from 'react';
import { DateTime } from 'luxon';
import {
  Plus,
  Share2,
  BookOpen,
  RefreshCw,
  Edit2,
  Trash2,
  LogOut,
  AlertCircle,
  GraduationCap,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { signOut } from 'next-auth/react';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { Input } from './ui/input';
import { PreacherType, PREACHER_TYPE_LABELS, DEFAULT_GOALS, User } from '@/domain/User';
import { Entry, SessionType } from '@/domain/Entry';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

const TYPE_LABELS: Record<SessionType, string> = {
  house_to_house: 'Casa en casa',
  revisits: 'Revisitas',
  bible_study: 'Estudio Bíblico',
  other: 'Otro'
};

const TYPE_ICONS: Record<SessionType, React.ReactNode> = {
  house_to_house: <BookOpen className="w-4 h-4 text-primary" />,
  revisits: <RefreshCw className="w-4 h-4 text-primary" />,
  bible_study: <GraduationCap className="w-4 h-4 text-primary" />,
  other: <MoreHorizontal className="w-4 h-4 text-primary" />
};

export default function DashboardContainer({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [userRes, entriesRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/entries')
      ]);

      if (!userRes.ok || !entriesRes.ok) {
        throw new Error('Error al obtener datos');
      }

      const userData = await userRes.json();
      const entriesData = await entriesRes.json();

      setUser(new User(userData.user));
      setEntries(entriesData.map((e: any) => new Entry(e)));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId, fetchDashboardData]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsPreacherType, setSettingsPreacherType] = useState<PreacherType>('publisher');
  const [settingsMonthlyGoal, setSettingsMonthlyGoal] = useState<number>(0);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const openSettingsModal = () => {
    if (user) {
      setSettingsPreacherType(user.preacherType || 'publisher');
      setSettingsMonthlyGoal(user.monthlyGoal ?? 0);
    }
    setSettingsError('');
    setShowSettingsModal(true);
  };

  const handlePreacherTypeChange = (type: PreacherType) => {
    setSettingsPreacherType(type);
    const defaultGoal = DEFAULT_GOALS[type];
    setSettingsMonthlyGoal(defaultGoal !== null ? defaultGoal : 0);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsError('');
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preacherType: settingsPreacherType,
          monthlyGoal: settingsMonthlyGoal,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar la configuración');
      }

      await fetchDashboardData();
      setShowSettingsModal(false);
    } catch (err: any) {
      setSettingsError(err.message || 'Error al guardar');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Form State
  const [formDate, setFormDate] = useState(DateTime.now().toISODate()!);
  const [formHours, setFormHours] = useState(1);
  const [formMinutes, setFormMinutes] = useState(0);
  const [formType, setFormType] = useState<SessionType>('house_to_house');
  const [formNotes, setFormNotes] = useState('');

  // Check if form has changes when editing
  const hasChanges = editingEntry ? (
    formDate !== DateTime.fromMillis(editingEntry.preachingDate).toISODate() ||
    formHours !== editingEntry.hours ||
    formMinutes !== editingEntry.minutes ||
    formType !== editingEntry.type ||
    formNotes.trim() !== (editingEntry.notes || '')
  ) : true;

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <header className="flex justify-between items-center py-4 border-b border-border/40">
          <div className="space-y-2">
            <div className="h-8 w-40 bg-muted rounded-md" />
            <div className="h-4 w-24 bg-muted rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-muted rounded-md hidden sm:block" />
            <div className="h-5 w-20 bg-muted rounded-md" />
            <div className="h-8 w-8 bg-muted rounded-md" />
          </div>
        </header>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Stats Card Skeleton */}
          <div className="md:col-span-2 border border-border/80 rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-muted rounded-md" />
                <div className="h-12 w-28 bg-muted rounded-md" />
              </div>
              <div className="h-10 w-28 bg-muted rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-32 bg-muted rounded-md" />
                <div className="h-3 w-16 bg-muted rounded-md" />
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full" />
            </div>
          </div>

          {/* Summary Card Skeleton */}
          <div className="border border-border/80 rounded-xl p-6 space-y-4">
            <div className="h-4 w-20 bg-muted rounded-md mb-2" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted rounded-full" />
                    <div className="h-4.5 w-24 bg-muted rounded-md" />
                  </div>
                  <div className="h-4 w-8 bg-muted rounded-md" />
                </div>
              ))}
            </div>
            <div className="h-10 w-full bg-muted rounded-md" />
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="border border-border/80 rounded-xl p-6 space-y-4">
          <div className="h-5 w-36 bg-muted rounded-md" />
          <div className="divide-y divide-border/60">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-4 flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-4.5 w-48 bg-muted rounded-md" />
                  <div className="h-3.5 w-32 bg-muted rounded-md" />
                  <div className="h-3.5 w-56 bg-muted rounded-md" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-muted rounded-md" />
                  <div className="h-8 w-8 bg-muted rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = entries.reduce((acc, curr) => {
    acc.totalMinutes += (curr.hours * 60) + curr.minutes;
    acc.byType[curr.type] = (acc.byType[curr.type] || 0) + (curr.hours * 60) + curr.minutes;
    return acc;
  }, { totalMinutes: 0, byType: {} as Record<SessionType, number> });

  const reportedHours = Math.floor(stats.totalMinutes / 60);

  const progressPercentage = user.monthlyGoal > 0
    ? Math.min(100, Math.round((reportedHours / user.monthlyGoal) * 100))
    : 0;
  const hoursLeft = user.monthlyGoal > 0
    ? Math.max(0, user.monthlyGoal - reportedHours)
    : 0;
  const percentageLeft = Math.max(0, 100 - progressPercentage);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const formatLongDate = (millis: number) => {
    const dt = DateTime.fromMillis(millis).setLocale('es');
    const formatted = dt.toFormat("EEEE d 'de' MMMM 'del' yyyy");
    // Capitalizar primera letra
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const handleExportWhatsApp = () => {
    const now = DateTime.now();
    const monthName = now.setLocale('es-ES').monthLong.toUpperCase();
    const year = now.year;

    const text = `📖 *Informe de Actividad*
📅 *Mes:* ${monthName} ${year}
👤 *Publicador:* ${user.name || user.phone}

⏱️ *Total de horas:* ${reportedHours}

Generado por *JW Service Tracker*`;

    navigator.clipboard.writeText(text);
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 5000);
  };

  const resetForm = () => {
    setFormDate(DateTime.now().toISODate()!);
    setFormHours(1);
    setFormMinutes(0);
    setFormType('house_to_house');
    setFormNotes('');
    setEditingEntry(null);
    setFormError('');
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNotes = formNotes.trim();
    let validationError: string | null = null;

    try {
      const entry = new Entry({
        hours: formHours,
        minutes: formMinutes,
        notes: trimmedNotes
      });
      entry.validateHourPlusMinutes();
    } catch (err) {
      validationError = err instanceof Error ? err.message : 'Error de validación';
    }

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (formHours === 0 && formMinutes === 0) {
      setFormError('El tiempo debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        preachingDate: DateTime.fromISO(formDate).toMillis(),
        hours: formHours,
        minutes: formMinutes,
        type: formType,
        notes: trimmedNotes
      };

      if (editingEntry) {
        await fetch(`/api/entries/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await fetchDashboardData();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setFormError('Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/entries/${entryToDelete}`, {
        method: 'DELETE',
      });
      await fetchDashboardData();
      setShowDeleteModal(false);
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setEntryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setFormDate(DateTime.fromMillis(entry.preachingDate).toISODate()!);
    setFormHours(entry.hours);
    setFormMinutes(entry.minutes);
    setFormType(entry.type);
    setFormNotes(entry.notes || '');
    setShowAddModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center py-4 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">JW Tracker</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {PREACHER_TYPE_LABELS[user.preacherType || 'publisher']}
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
            <span className="hidden sm:inline text-xs font-semibold">Configurar</span>
          </Button>
          <span className="text-sm font-medium border-l pl-3 py-1 border-border text-foreground">{user.name || user.phone}</span>
          <Button variant="ghost" onClick={() => signOut()} className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2 rounded-lg cursor-pointer">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm border-border/80">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Info Column */}
              <div className="sm:col-span-2 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Horas del Mes</p>
                      <h2 className="text-5xl font-black text-primary mt-1 tracking-tight">{reportedHours}h</h2>
                    </div>
                    <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="gap-2 shadow-sm hover:brightness-95 transition-all">
                      <Plus className="w-5 h-5" /> Registrar
                    </Button>
                  </div>

                  {user.monthlyGoal > 0 ? (
                    <div className="space-y-3 mt-6">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
                        <span>Progreso de la meta</span>
                        <span className="text-primary font-bold">{reportedHours} de {user.monthlyGoal} horas ({progressPercentage}%)</span>
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
                <span className="font-bold">{Math.floor((stats.byType[type] || 0) / 60)}h</span>
              </div>
            ))}
            {showExportSuccess ? (
              <div className="w-full mt-2 h-10 flex items-center justify-center text-sm font-bold text-green-700 bg-green-50 rounded-lg border-2 border-green-600 animate-pulse">
                ¡Copiado al portapapeles!
              </div>
            ) : (
              <Button onClick={handleExportWhatsApp} variant="outline" className="w-full mt-2 gap-2">
                <Share2 className="w-4 h-4" /> Exportar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No hay registros este mes</div>
          ) : (
            <div className="divide-y divide-border">
              {entries.map(entry => (
                <div key={entry.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{formatLongDate(entry.preachingDate)}</p>
                    <p className="text-sm text-muted-foreground">{entry.hours}h {entry.minutes}m • {TYPE_LABELS[entry.type]}</p>
                    {entry.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{entry.notes}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="p-2" onClick={() => handleEdit(entry)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" className="p-2 text-red-600" onClick={() => openDeleteModal(entry.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingEntry ? "Editar Registro" : "Nuevo Registro"}>
        <form onSubmit={handleSaveEntry} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Fecha</label>
              <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Horas</label>
                <Input type="number" value={formHours} onChange={e => setFormHours(parseInt(e.target.value))} min={0} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Mins</label>
                <Input type="number" value={formMinutes} onChange={e => setFormMinutes(parseInt(e.target.value))} min={0} max={59} />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Tipo</label>
            <select
              value={formType}
              onChange={e => setFormType(e.target.value as SessionType)}
              className="w-full p-2.5 rounded-lg border border-border bg-background text-sm"
            >
              {(Object.keys(TYPE_LABELS) as SessionType[]).map(type => (
                <option key={type} value={type}>{TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase">Notas</label>
              <span className="text-[10px] text-muted-foreground">{formNotes.length}/50</span>
            </div>
            <textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value.slice(0, 50))}
              className="w-full p-2.5 rounded-lg border border-border bg-background text-sm resize-none"
              rows={2}
              placeholder="Notas opcionales..."
            />
          </div>
          {formError && <p className="text-red-600 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting || !!(editingEntry && !hasChanges)}>
            {isSubmitting ? 'Guardando...' : editingEntry ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Dialog>

      <Dialog isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Configuración de Predicador">
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de Predicador</label>
            <select
              value={settingsPreacherType}
              onChange={e => handlePreacherTypeChange(e.target.value as PreacherType)}
              className="w-full p-2.5 mt-1.5 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            >
              {(Object.keys(PREACHER_TYPE_LABELS) as PreacherType[]).map(type => (
                <option key={type} value={type}>{PREACHER_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Meta de Horas Mensual</label>
              {DEFAULT_GOALS[settingsPreacherType] !== null && (
                <button
                  type="button"
                  onClick={() => setSettingsMonthlyGoal(DEFAULT_GOALS[settingsPreacherType] || 0)}
                  className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                >
                  Restablecer por defecto ({DEFAULT_GOALS[settingsPreacherType]}h)
                </button>
              )}
            </div>
            <Input
              type="number"
              value={settingsMonthlyGoal}
              onChange={e => setSettingsMonthlyGoal(parseInt(e.target.value) || 0)}
              min={0}
              className="mt-1.5"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
              Esta meta se utilizará para calcular tu progreso mensual en el panel principal.
            </p>
          </div>
          {settingsError && <p className="text-red-600 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {settingsError}</p>}
          <Button type="submit" className="w-full mt-2 cursor-pointer" disabled={isSavingSettings}>
            {isSavingSettings ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </form>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
