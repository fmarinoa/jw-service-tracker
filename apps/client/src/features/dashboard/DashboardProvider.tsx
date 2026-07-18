import {
  DEFAULT_GOALS,
  Entry,
  getCurrentIsoDate,
  isoDateToMillis,
  millisToIsoDate,
  PreacherType,
  SessionType,
  User,
} from '@jw-tracker/shared';
import { DateTime } from 'luxon';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert, Clipboard, Share } from 'react-native';

import { EntriesApi } from '../../services/entriesApi';
import { UserApi } from '../../services/userApi';
import { AuthTokenStorage } from '../../storage/authTokens';
import { useAuth } from '../auth/useAuth';

interface DashboardContextType {
  user: User | null;
  entries: Entry[];
  isLoading: boolean;
  isEntriesLoading: boolean;

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
  settingsMonthlyGoal: number | '';
  setSettingsMonthlyGoal: (val: number | '') => void;
  isSavingSettings: boolean;
  settingsError: string;
  setSettingsError: (val: string) => void;
  showExportSuccess: boolean;
  disableLogout: boolean;

  // Form state
  formDate: string;
  setFormDate: (val: string) => void;
  formHours: number | '';
  setFormHours: (val: number | '') => void;
  formMinutes: number | '';
  setFormMinutes: (val: number | '') => void;
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

  // Pagination state
  page: number;
  totalPages: number;
  totalEntries: number;
  setPage: (val: number) => void;

  // Export states
  showExportOptions: boolean;
  setShowExportOptions: (val: boolean) => void;
  exportingMonthOffset: number | null;

  // Month selection state
  monthOffset: number;
  setMonthOffset: (val: number) => void;
  handleMonthChange: (offset: number) => Promise<void>;

  // Actions
  fetchDashboardData: (
    page?: number,
    offset?: number,
    forceFetchUser?: boolean,
  ) => Promise<void>;
  openSettingsModal: () => void;
  handleLogout: () => void;
  handlePreacherTypeChange: (type: PreacherType) => void;
  handleSaveSettings: () => Promise<void>;
  handleSaveEntry: () => Promise<void>;
  handleDelete: () => Promise<void>;
  openDeleteModal: (id: string) => void;
  handleEdit: (entry: Entry) => void;
  resetForm: () => void;
  handleExportReport: (offset: number) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntriesLoading, setIsEntriesLoading] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  // Month selection state
  const [monthOffset, setMonthOffset] = useState(0);

  // Export states
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportingMonthOffset, setExportingMonthOffset] = useState<
    number | null
  >(null);

  // Monthly stats state
  const [stats, setStats] = useState({
    totalMinutes: 0,
    byType: {
      house_to_house: 0,
      revisits: 0,
      bible_study: 0,
      other: 0,
    } as Record<SessionType, number>,
  });

  const fetchDashboardData = useCallback(
    async (
      targetPage: number = 1,
      offset: number = monthOffset,
      forceFetchUser: boolean = false,
    ) => {
      try {
        const shouldFetchUser = !user || forceFetchUser;
        if (shouldFetchUser) {
          setIsLoading(true);
        } else {
          setIsEntriesLoading(true);
        }

        const token = await AuthTokenStorage.getAccessToken();

        const fetchPromises: [Promise<any>, Promise<any> | null] = [
          EntriesApi.getEntries(targetPage, offset),
          shouldFetchUser && token
            ? UserApi.getProfile()
            : Promise.resolve(null),
        ];

        const [entriesData, userData] = await Promise.all(fetchPromises);

        if (userData) {
          setUser(userData);
        }

        setEntries(entriesData.entries);
        setStats(entriesData.stats);
        setTotalEntries(entriesData.total);

        const newTotalPages = Math.ceil(entriesData.total / 10) || 1;
        setTotalPages(newTotalPages);

        if (targetPage > newTotalPages && newTotalPages > 0) {
          const secondEntriesData = await EntriesApi.getEntries(
            newTotalPages,
            offset,
          );
          setEntries(secondEntriesData.entries);
          setStats(secondEntriesData.stats);
          setTotalEntries(secondEntriesData.total);
          setPage(newTotalPages);
          setMonthOffset(offset);
          return;
        }

        setPage(targetPage);
        setMonthOffset(offset);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
        setIsEntriesLoading(false);
      }
    },
    [user, monthOffset],
  );

  const handleMonthChange = useCallback(
    async (offset: number) => {
      if (offset < -2 || offset > 0) return;
      await fetchDashboardData(1, offset);
    },
    [fetchDashboardData],
  );

  useEffect(() => {
    fetchDashboardData(1, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsPreacherType, setSettingsPreacherType] =
    useState<PreacherType>('publisher');
  const [settingsMonthlyGoal, setSettingsMonthlyGoal] = useState<number | ''>(
    0,
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [disableLogout, setDisableLogout] = useState(false);

  // Form State
  const [formDate, setFormDate] = useState(getCurrentIsoDate());
  const [formHours, setFormHours] = useState<number | ''>(1);
  const [formMinutes, setFormMinutes] = useState<number | ''>(0);
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
    logout();
  };

  const handlePreacherTypeChange = (type: PreacherType) => {
    setSettingsPreacherType(type);
    const defaultGoal = DEFAULT_GOALS[type];
    setSettingsMonthlyGoal(defaultGoal !== null ? defaultGoal : 0);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsError('');
    try {
      const updatedUser = await UserApi.updateSettings({
        preacherType: settingsPreacherType,
        monthlyGoal:
          settingsMonthlyGoal === '' ? 0 : Number(settingsMonthlyGoal),
      });

      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      setShowSettingsModal(false);
    } catch (err) {
      setSettingsError(
        err instanceof Error
          ? err.message
          : 'Error al guardar la configuración',
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Check if form has changes when editing
  const hasChanges = editingEntry
    ? formDate !== millisToIsoDate(editingEntry.preachingDate) ||
      (formHours === '' ? 0 : Number(formHours)) !== editingEntry.hours ||
      (formMinutes === '' ? 0 : Number(formMinutes)) !== editingEntry.minutes ||
      formType !== editingEntry.type ||
      formNotes.trim() !== (editingEntry.notes || '')
    : true;

  const reportedHours = Math.floor(stats.totalMinutes / 60);

  const goal = user?.monthlyGoal ?? 0;
  const progressPercentage =
    goal > 0 ? Math.min(100, Math.round((reportedHours / goal) * 100)) : 0;
  const hoursLeft = goal > 0 ? Math.max(0, goal - reportedHours) : 0;
  const percentageLeft = Math.max(0, 100 - progressPercentage);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  const handleExportReport = async (offset: number) => {
    if (!user) return;
    setExportingMonthOffset(offset);
    try {
      let targetStats = stats;
      const targetMonth = DateTime.now()
        .setZone('America/Lima')
        .plus({ months: offset });
      const monthName =
        targetMonth.setLocale('es-ES').monthLong?.toUpperCase() || '';
      const year = targetMonth.year;

      if (offset !== monthOffset) {
        const data = await EntriesApi.getEntries(1, offset);
        targetStats = data.stats;
      }

      const totalHours = Math.floor(targetStats.totalMinutes / 60);

      const text = `📖 *Informe de Actividad*
📅 *Mes:* ${monthName} ${year}
👤 *Publicador:* ${user.name || user.phone}

⏱️ *Total de horas:* ${totalHours}

Generado por *JW Service Tracker*`;

      Clipboard.setString(text);
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 5000);

      // On mobile, also trigger native share
      try {
        await Share.share({
          message: text,
        });
      } catch {
        // Silently ignore share failures on platforms that don't support it (e.g. web browser)
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo exportar el informe.');
    } finally {
      setExportingMonthOffset(null);
    }
  };

  const resetForm = () => {
    setFormDate(getCurrentIsoDate());
    setFormHours(1);
    setFormMinutes(0);
    setFormType('house_to_house');
    setFormNotes('');
    setEditingEntry(null);
    setFormError('');
  };

  const handleSaveEntry = async () => {
    const trimmedNotes = formNotes.trim();
    let validationError: string | null = null;

    const parsedHours = formHours === '' ? 0 : Number(formHours);
    const parsedMinutes = formMinutes === '' ? 0 : Number(formMinutes);

    const totalMinutes = parsedHours * 60 + parsedMinutes;
    if (totalMinutes > 24 * 60) {
      validationError =
        'La duración total no puede exceder las 24 horas en un día.';
    }

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (parsedHours === 0 && parsedMinutes === 0) {
      setFormError('El tiempo debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        preachingDate: isoDateToMillis(formDate),
        hours: parsedHours,
        minutes: parsedMinutes,
        type: formType,
        notes: trimmedNotes,
      };

      if (editingEntry) {
        await EntriesApi.updateEntry(editingEntry.id, payload);
      } else {
        await EntriesApi.createEntry(payload);
      }

      await fetchDashboardData(page, monthOffset);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Error al guardar la entrada',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await EntriesApi.deleteEntry(entryToDelete);
      await fetchDashboardData(page, monthOffset);
      setShowDeleteModal(false);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Error al eliminar la entrada',
      );
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
    setFormDate(millisToIsoDate(entry.preachingDate));
    setFormHours(entry.hours);
    setFormMinutes(entry.minutes);
    setFormType(entry.type);
    setFormNotes(entry.notes || '');
    setShowAddModal(true);
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        entries,
        isLoading,
        isEntriesLoading,

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

        page,
        totalPages,
        totalEntries,
        setPage,
        showExportOptions,
        setShowExportOptions,
        exportingMonthOffset,
        monthOffset,
        setMonthOffset,
        handleMonthChange,

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
        handleExportReport,
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
