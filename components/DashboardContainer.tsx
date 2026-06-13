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
  AlertCircle
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { Input } from './ui/input';
import { User } from '@/domain/User';
import { Entry, SessionType } from '@/domain/Entry';

export default function DashboardContainer({ initialEntries, user }: { initialEntries: Entry[], user: User }) {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  
  // Sincronizar estado local con las props del servidor cuando hay revalidación
  React.useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formDate, setFormDate] = useState(DateTime.now().toISODate()!);
  const [formHours, setFormHours] = useState(1);
  const [formMinutes, setFormMinutes] = useState(0);
  const [formType, setFormType] = useState<SessionType>('house_to_house');
  const [formNotes, setFormNotes] = useState('');

  const stats = entries.reduce((acc, curr) => {
    acc.totalMinutes += (curr.hours * 60) + curr.minutes;
    acc.byType[curr.type] = (acc.byType[curr.type] || 0) + (curr.hours * 60) + curr.minutes;
    return acc;
  }, { totalMinutes: 0, byType: {} as Record<SessionType, number> });

  const reportedHours = Math.floor(stats.totalMinutes / 60);

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
    alert('¡Reporte copiado!');
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
        notes: formNotes
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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar registro?')) return;
    try {
      await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      });
      router.refresh();
    } catch (err) {
      alert('Error al eliminar');
    }
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
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Casa en casa</span>
              <span className="font-bold">{Math.floor((stats.byType['house_to_house'] || 0)/60)}h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" /> Revisitas</span>
              <span className="font-bold">{Math.floor((stats.byType['revisits'] || 0)/60)}h</span>
            </div>
            <Button onClick={handleExportWhatsApp} variant="outline" className="w-full mt-2 gap-2">
              <Share2 className="w-4 h-4" /> Exportar
            </Button>
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
                    <p className="font-medium">{DateTime.fromMillis(entry.preachingDate).toISODate()}</p>
                    <p className="text-sm text-muted-foreground">{entry.hours}h {entry.minutes}m • {entry.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="p-2" onClick={() => handleEdit(entry)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" className="p-2 text-red-600" onClick={() => handleDelete(entry.id)}><Trash2 className="w-4 h-4" /></Button>
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
              <option value="house_to_house">Casa en casa</option>
              <option value="revisits">Revisitas</option>
              <option value="bible_study">Estudio Bíblico</option>
              <option value="other">Otro</option>
            </select>
          </div>
          {formError && <p className="text-red-600 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {formError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : editingEntry ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
