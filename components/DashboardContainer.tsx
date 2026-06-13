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
  MoreHorizontal
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { Input } from './ui/input';
import { User } from '@/domain/User';
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

export default function DashboardContainer({ initialEntries, user }: { initialEntries: Entry[], user: User }) {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  
  // Sincronizar estado local con las props del servidor cuando hay revalidación
  React.useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const stats = entries.reduce((acc, curr) => {
    acc.totalMinutes += (curr.hours * 60) + curr.minutes;
    acc.byType[curr.type] = (acc.byType[curr.type] || 0) + (curr.hours * 60) + curr.minutes;
    return acc;
  }, { totalMinutes: 0, byType: {} as Record<SessionType, number> });

  const reportedHours = Math.floor(stats.totalMinutes / 60);

  const formatLongDate = (millis: number) => {
    const dt = DateTime.fromMillis(millis).setLocale('es');
    const formatted = dt.toFormat("EEEE d 'de' MMMM 'del' yyyy");
    // Capitalizar primera letra
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const [showExportSuccess, setShowExportSuccess] = useState(false);

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

    const validationError = Entry.validate({
      hours: formHours,
      minutes: formMinutes,
      notes: trimmedNotes
    });

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
      
      router.refresh();
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
      router.refresh();
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
      <header className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold text-primary">JW Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.name || user.phone}</span>
          <Button variant="ghost" onClick={() => signOut()} className="text-red-600">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">Horas del Mes</p>
                <h2 className="text-5xl font-black text-primary mt-1">{reportedHours}h</h2>
              </div>
              <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="gap-2">
                <Plus className="w-5 h-5" /> Registrar
              </Button>
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
                <span className="font-bold">{Math.floor((stats.byType[type] || 0)/60)}h</span>
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
          {formError && <p className="text-red-600 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting || !!(editingEntry && !hasChanges)}>
            {isSubmitting ? 'Guardando...' : editingEntry ? 'Actualizar' : 'Guardar'}
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
