"use client";

import { DateTime } from "luxon";
import { signOut } from "next-auth/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Entry, SessionType } from "@/domain/Entry";
import { DEFAULT_GOALS, PreacherType, User } from "@/domain/User";

interface DashboardContextType {
  userId: string;
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
  settingsMonthlyGoal: number | "";
  setSettingsMonthlyGoal: (val: number | "") => void;
  isSavingSettings: boolean;
  settingsError: string;
  setSettingsError: (val: string) => void;
  showExportSuccess: boolean;
  disableLogout: boolean;

  // Form state
  formDate: string;
  setFormDate: (val: string) => void;
  formHours: number | "";
  setFormHours: (val: number | "") => void;
  formMinutes: number | "";
  setFormMinutes: (val: number | "") => void;
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
  handleSaveSettings: (e: React.FormEvent) => Promise<void>;
  handleSaveEntry: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  openDeleteModal: (id: string) => void;
  handleEdit: (entry: Entry) => void;
  resetForm: () => void;
  handleExportWhatsApp: (offset: number) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
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

        const fetchPromises: [Promise<Response>, Promise<Response> | null] = [
          fetch(`/api/entries?page=${targetPage}&monthOffset=${offset}`),
          shouldFetchUser ? fetch("/api/user") : null,
        ];

        const [entriesRes, userRes] = await Promise.all([
          fetchPromises[0],
          fetchPromises[1] || Promise.resolve(null),
        ]);

        if (!entriesRes.ok || (userRes && !userRes.ok)) {
          throw new Error("Error al obtener datos");
        }

        const entriesData = await entriesRes.json();

        if (userRes) {
          const userData = await userRes.json();
          setUser(new User(userData.user));
        }

        setEntries(
          entriesData.entries.map((e: Partial<Entry>) => new Entry(e)),
        );
        setStats(entriesData.stats);
        setTotalEntries(entriesData.total);

        const newTotalPages = Math.ceil(entriesData.total / 10) || 1;
        setTotalPages(newTotalPages);

        if (targetPage > newTotalPages && newTotalPages > 0) {
          const res = await fetch(
            `/api/entries?page=${newTotalPages}&monthOffset=${offset}`,
          );
          if (res.ok) {
            const secondEntriesData = await res.json();
            setEntries(
              secondEntriesData.entries.map(
                (e: Partial<Entry>) => new Entry(e),
              ),
            );
            setStats(secondEntriesData.stats);
            setTotalEntries(secondEntriesData.total);
            setPage(newTotalPages);
            setMonthOffset(offset);
            return;
          }
        }

        setPage(targetPage);
        setMonthOffset(offset);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        setIsEntriesLoading(false);
      }
    },
    [user, monthOffset],
  );

  const handleMonthChange = useCallback(
    async (offset: number) => {
      await fetchDashboardData(1, offset);
    },
    [fetchDashboardData],
  );

  useEffect(() => {
    if (userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDashboardData(1, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsPreacherType, setSettingsPreacherType] =
    useState<PreacherType>("publisher");
  const [settingsMonthlyGoal, setSettingsMonthlyGoal] = useState<number | "">(0);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [disableLogout, setDisableLogout] = useState(false);

  // Form State
  const [formDate, setFormDate] = useState(DateTime.now().toISODate()!);
  const [formHours, setFormHours] = useState<number | "">(1);
  const [formMinutes, setFormMinutes] = useState<number | "">(0);
  const [formType, setFormType] = useState<SessionType>("house_to_house");
  const [formNotes, setFormNotes] = useState("");

  const openSettingsModal = () => {
    if (user) {
      setSettingsPreacherType(user.preacherType || "publisher");
      setSettingsMonthlyGoal(user.monthlyGoal ?? 0);
    }
    setSettingsError("");
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
    setSettingsError("");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preacherType: settingsPreacherType,
          monthlyGoal: settingsMonthlyGoal === "" ? 0 : Number(settingsMonthlyGoal),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar la configuración");
      }

      await fetchDashboardData(page, monthOffset, true);
      setShowSettingsModal(false);
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Check if form has changes when editing
  const hasChanges = editingEntry
    ? formDate !==
        DateTime.fromMillis(editingEntry.preachingDate).toISODate() ||
      (formHours === "" ? 0 : Number(formHours)) !== editingEntry.hours ||
      (formMinutes === "" ? 0 : Number(formMinutes)) !== editingEntry.minutes ||
      formType !== editingEntry.type ||
      formNotes.trim() !== (editingEntry.notes || "")
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

  const handleExportWhatsApp = async (offset: number) => {
    if (!user) return;
    setExportingMonthOffset(offset);
    try {
      let targetStats = stats;
      const targetMonth = DateTime.now()
        .setZone("America/Lima")
        .plus({ months: offset });
      const monthName =
        targetMonth.setLocale("es-ES").monthLong?.toUpperCase() || "";
      const year = targetMonth.year;

      if (offset !== 0) {
        const res = await fetch(
          `/api/entries?page=1&limit=1&monthOffset=${offset}`,
        );
        if (!res.ok)
          throw new Error("Error al obtener datos del mes seleccionado");
        const data = await res.json();
        targetStats = data.stats;
      }

      const totalHours = Math.floor(targetStats.totalMinutes / 60);

      const text = `📖 *Informe de Actividad*
📅 *Mes:* ${monthName} ${year}
👤 *Publicador:* ${user.name || user.phone}

⏱️ *Total de horas:* ${totalHours}

Generado por *JW Service Tracker*`;

      await navigator.clipboard.writeText(text);
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("No se pudo exportar el informe.");
    } finally {
      setExportingMonthOffset(null);
    }
  };

  const resetForm = () => {
    setFormDate(DateTime.now().toISODate()!);
    setFormHours(1);
    setFormMinutes(0);
    setFormType("house_to_house");
    setFormNotes("");
    setEditingEntry(null);
    setFormError("");
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNotes = formNotes.trim();
    let validationError: string | null = null;

    const parsedHours = formHours === "" ? 0 : Number(formHours);
    const parsedMinutes = formMinutes === "" ? 0 : Number(formMinutes);

    try {
      const entry = new Entry({
        hours: parsedHours,
        minutes: parsedMinutes,
        notes: trimmedNotes,
      });
      entry.validateHourPlusMinutes();
    } catch (err) {
      validationError =
        err instanceof Error ? err.message : "Error de validación";
    }

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (parsedHours === 0 && parsedMinutes === 0) {
      setFormError("El tiempo debe ser mayor a 0");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const payload = {
        preachingDate: DateTime.fromISO(formDate).toMillis(),
        hours: parsedHours,
        minutes: parsedMinutes,
        type: formType,
        notes: trimmedNotes,
      };

      const res = editingEntry
        ? await fetch(`/api/entries/${editingEntry.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      await fetchDashboardData(page, monthOffset);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/entries/${entryToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
      await fetchDashboardData(page, monthOffset);
      setShowDeleteModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
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
    setFormNotes(entry.notes || "");
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
        isEntriesLoading,

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
        handleExportWhatsApp,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
