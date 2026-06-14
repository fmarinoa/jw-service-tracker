'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { SessionType } from '@/domain/Entry';
import { useDashboard } from './DashboardProvider';
import { TYPE_LABELS } from './constants';

export function EntryDialog() {
  const {
    showAddModal,
    setShowAddModal,
    editingEntry,
    handleSaveEntry,
    formDate,
    setFormDate,
    formHours,
    setFormHours,
    formMinutes,
    setFormMinutes,
    formType,
    setFormType,
    formNotes,
    setFormNotes,
    formError,
    isSubmitting,
    hasChanges
  } = useDashboard();

  return (
    <Dialog
      isOpen={showAddModal}
      onClose={() => setShowAddModal(false)}
      title={editingEntry ? 'Editar Registro' : 'Nuevo Registro'}
    >
      <form onSubmit={handleSaveEntry} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Fecha</label>
            <Input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Horas</label>
              <Input
                type="number"
                value={formHours}
                onChange={(e) => setFormHours(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Mins</label>
              <Input
                type="number"
                value={formMinutes}
                onChange={(e) => setFormMinutes(parseInt(e.target.value) || 0)}
                min={0}
                max={59}
              />
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase">Tipo</label>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value as SessionType)}
            className="w-full p-2.5 rounded-lg border border-border bg-background text-sm"
          >
            {(Object.keys(TYPE_LABELS) as SessionType[]).map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-muted-foreground uppercase">Notas</label>
            <span className="text-[10px] text-muted-foreground">
              {formNotes.length}/50
            </span>
          </div>
          <textarea
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value.slice(0, 50))}
            className="w-full p-2.5 rounded-lg border border-border bg-background text-sm resize-none"
            rows={2}
            placeholder="Notas opcionales..."
          />
        </div>
        {formError && (
          <p className="text-red-600 text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {formError}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !!(editingEntry && !hasChanges)}
        >
          {isSubmitting ? 'Guardando...' : editingEntry ? 'Actualizar' : 'Guardar'}
        </Button>
      </form>
    </Dialog>
  );
}
