'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DateTime } from 'luxon';
import { signOut } from 'next-auth/react';
import { PreacherType, DEFAULT_GOALS, User } from '@/domain/User';
import { Entry, SessionType } from '@/domain/Entry';

interface DashboardContextType {
  userId: string;
  user: User | null;
  entries: Entry[];
  isLoading: boolean;

  // Modals state
  showAddModal: boolean;
  setShowAddModal: (val: boolean) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (val: boolean) => void;
  entryToDelete: string | null;
  setEntryToDelete: (val: string | null) => void;
  isDeleting: boolean;
  editingEntry: Entry | null;
  formError: string;
  setFormError: (val: string) => void;
  isSubmitting: boolean;

  // Settings state
  showSettingsModal: boolean;
  setShowSettingsModal: (val: boolean) => void;
  settingsPreacherType: PreacherType;
  setSettingsPreacherType: (val: PreacherType) => void;
  settingsMonthlyGoal: number;
  setSettingsMonthlyGoal: (val: number) => void;
  isSavingSettings: boolean;
  settingsError: string;
  setSettingsError: (val: string) => void;
  showExportSuccess: boolean;
  disableLogout: boolean;

  // Form state
  formDate: string;
  setFormDate: (val: string) => void;
  formHours: number;
  setFormHours: (val: number) => void;
  formMinutes: number;
  setFormMinutes: (val: number) => void;
  formType: SessionType;
  setFormType: (val: SessionType) => void;
  formNotes: string;
  setFormNotes: (val: string) => void;

  // Computed values
  reportedHours: number;
  progressPercentage: number;
  hoursLeft: number;
  percentageLeft: number;
  circumference: number;
  strokeDashoffset: number;
  hasChanges: boolean;
  stats: {
    totalMinutes: number;
    byType: Record<SessionType, number>;
  };

  // Actions
  fetchDashboardData: () => Promise<void>;
  openSettingsModal: () => void;
  handleLogout: () => void;
  handlePreacherTypeChange: (type: PreacherType) => void;
  handleSaveSettings: (e: React.FormEvent) => Promise<void>;
  handleSaveEntry: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  openDeleteModal: (id: string) => void;
  handleEdit: (entry: Entry) => void;
  resetForm: () => void;
  handleExportWhatsApp: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({
  userId,
  children
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
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

  useEffect(() => {
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
  const [disableLogout, setDisableLogout] = useState(false);

  // Form State
  const [formDate, setFormDate] = useState(DateTime.now().toISODate()!);
  const [formHours, setFormHours] = useState(1);
  const [formMinutes, setFormMinutes] = useState(0);
  const [formType, setFormType] = useState<SessionType>('house_to_house');
  const [formNotes, setFormNotes] = useState('');

  const openSettingsModal = () => {
    if (user) {
      setSettingsPreacherType(user.preacherType || 'publisher');
      setSettingsMonthlyGoal(user.monthlyGoal ?? 0);
    }
    setSettingsError('');
    setShowSettingsModal(true);
  };

  const handleLogout = () => {
    setDisableLogout(true);
    signOut();
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

  // Check if form has changes when editing
  const hasChanges = editingEntry ? (
    formDate !== DateTime.fromMillis(editingEntry.preachingDate).toISODate() ||
    formHours !== editingEntry.hours ||
    formMinutes !== editingEntry.minutes ||
    formType !== editingEntry.type ||
    formNotes.trim() !== (editingEntry.notes || '')
  ) : true;

  // Computed stats
  const stats = entries.reduce((acc, curr) => {
    acc.totalMinutes += (curr.hours * 60) + curr.minutes;
    acc.byType[curr.type] = (acc.byType[curr.type] || 0) + (curr.hours * 60) + curr.minutes;
    return acc;
  }, { totalMinutes: 0, byType: {} as Record<SessionType, number> });

  const reportedHours = Math.floor(stats.totalMinutes / 60);

  const goal = user?.monthlyGoal ?? 0;
  const progressPercentage = goal > 0
    ? Math.min(100, Math.round((reportedHours / goal) * 100))
    : 0;
  const hoursLeft = goal > 0
    ? Math.max(0, goal - reportedHours)
    : 0;
  const percentageLeft = Math.max(0, 100 - progressPercentage);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const handleExportWhatsApp = () => {
    if (!user) return;
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
    <DashboardContext.Provider
      value={{
        userId,
        user,
        entries,
        isLoading,

        showAddModal,
        setShowAddModal,
        showDeleteModal,
        setShowDeleteModal,
        entryToDelete,
        setEntryToDelete,
        isDeleting,
        editingEntry,
        formError,
        setFormError,
        isSubmitting,

        showSettingsModal,
        setShowSettingsModal,
        settingsPreacherType,
        setSettingsPreacherType,
        settingsMonthlyGoal,
        setSettingsMonthlyGoal,
        isSavingSettings,
        settingsError,
        setSettingsError,
        showExportSuccess,
        disableLogout,

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

        reportedHours,
        progressPercentage,
        hoursLeft,
        percentageLeft,
        circumference,
        strokeDashoffset,
        hasChanges,
        stats,

        fetchDashboardData,
        openSettingsModal,
        handleLogout,
        handlePreacherTypeChange,
        handleSaveSettings,
        handleSaveEntry,
        handleDelete,
        openDeleteModal,
        handleEdit,
        resetForm,
        handleExportWhatsApp
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
