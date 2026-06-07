import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { DateTime } from 'luxon';
import { fetchAuthSession } from 'aws-amplify/auth';
import { sumEntries, PreachingEntry, UserGoal, PreachingSessionType } from '@jw-tracker/shared';

import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Dialog } from './components/ui/dialog';
import { Textarea } from './components/ui/textarea';

const LOCAL_AUTH_KEY = 'jw_service_tracker_auth';
const LOCAL_ENTRIES_KEY = 'jw_service_tracker_entries';
const LOCAL_GOAL_KEY = 'jw_service_tracker_goal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [showSignUp, setShowSignUp] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [entries, setEntries] = useState<PreachingEntry[]>([]);
  const [goal, setGoal] = useState<UserGoal>({
    userId: 'default',
    monthlyHourGoal: 50,
    preacherType: 'regular_pioneer',
  });

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<PreachingEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');

  const [formDate, setFormDate] = useState<string>(DateTime.now().toISODate()!);
  const [formHours, setFormHours] = useState<number>(1);
  const [formMinutes, setFormMinutes] = useState<number>(0);
  const [formType, setFormType] = useState<PreachingSessionType>(PreachingSessionType.HOUSE_TO_HOUSE);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const storedAuth = localStorage.getItem(LOCAL_AUTH_KEY);
    if (storedAuth) {
      const user = JSON.parse(storedAuth);
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadUserData(user.email);
    }
  }, []);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken;
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('No active Cognito session, making request without Authorization header:', e);
    }
    return headers;
  };

  const fetchEntries = async (email: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_GATEWAY_URL;
    if (!apiUrl) {
      const allEntries = localStorage.getItem(LOCAL_ENTRIES_KEY);
      if (allEntries) {
        const parsed = JSON.parse(allEntries) as PreachingEntry[];
        setEntries(parsed.filter(e => e.userId === email));
      } else {
        setEntries([]);
      }
      return;
    }

    try {
      setIsSyncing(true);
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiUrl}/entries?limit=100`, { headers });
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      console.error('Failed to fetch entries from API:', err);
      // Fallback to local storage
      const allEntries = localStorage.getItem(LOCAL_ENTRIES_KEY);
      if (allEntries) {
        const parsed = JSON.parse(allEntries) as PreachingEntry[];
        setEntries(parsed.filter(e => e.userId === email));
      } else {
        setEntries([]);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const loadUserData = (email: string) => {
    const storedGoal = localStorage.getItem(LOCAL_GOAL_KEY + '_' + email);
    if (storedGoal) {
      setGoal(JSON.parse(storedGoal));
    } else {
      setGoal({
        userId: email,
        monthlyHourGoal: 50,
        preacherType: 'regular_pioneer',
      });
    }

    fetchEntries(email);
  };

  const handleLoginSuccess = (email: string) => {
    const user = { email };
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    loadUserData(email);
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setEntries([]);
  };

  const handleSync = async () => {
    if (!isOnline) return;
    const email = currentUser?.email || 'default';
    await fetchEntries(email);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formHours === 0 && formMinutes === 0) {
      setFormError('El tiempo total debe ser mayor a 0.');
      return;
    }

    const email = currentUser?.email || 'default';
    const preachingDate = DateTime.fromISO(formDate, { zone: 'utc' }).toMillis();

    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_GATEWAY_URL;

    if (!apiUrl) {
      // Local/Mock Mode
      if (editingEntry) {
        const updatedEntries = entries.map(item => {
          if (item.id === editingEntry.id) {
            return {
              ...item,
              preachingDate,
              hours: formHours,
              minutes: formMinutes,
              type: formType,
              notes: formNotes || undefined,
              updatedAt: DateTime.now().toMillis(),
            };
          }
          return item;
        });
        setEntries(updatedEntries);
        localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
      } else {
        const newRecord: PreachingEntry = {
          id: Math.random().toString(36).substring(2, 9),
          userId: email,
          preachingDate,
          hours: formHours,
          minutes: formMinutes,
          type: formType,
          notes: formNotes || undefined,
          createdAt: DateTime.now().toMillis(),
          updatedAt: DateTime.now().toMillis(),
        };
        const updatedEntries = [newRecord, ...entries];
        setEntries(updatedEntries);
        localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
      }
      setShowAddModal(false);
      resetForm();
      return;
    }

    // Online Mode
    try {
      setIsSyncing(true);
      const headers = await getAuthHeaders();
      const body = {
        preachingDate,
        hours: formHours,
        minutes: formMinutes,
        type: formType,
        notes: formNotes || null,
      };

      if (editingEntry) {
        // PUT /entries/{id}
        const res = await fetch(`${apiUrl}/entries/${editingEntry.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Error ${res.status}: ${res.statusText}`);
        }

        const updated = await res.json() as PreachingEntry;
        const updatedEntries = entries.map(item => item.id === updated.id ? updated : item);
        setEntries(updatedEntries);
        localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
      } else {
        // POST /entries
        const res = await fetch(`${apiUrl}/entries`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Error ${res.status}: ${res.statusText}`);
        }

        const created = await res.json() as PreachingEntry;
        const updatedEntries = [created, ...entries];
        setEntries(updatedEntries);
        localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
      }

      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to save entry:', err);
      setFormError('Error al guardar el registro: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preaching record?')) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_GATEWAY_URL;

    if (!apiUrl) {
      // Local/Mock Mode
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(updated));
      return;
    }

    // Online Mode
    try {
      setIsSyncing(true);
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiUrl}/entries/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${res.status}: ${res.statusText}`);
      }

      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(updated));
    } catch (err: any) {
      console.error('Failed to delete entry:', err);
      alert('Error al eliminar el registro: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditClick = (entry: PreachingEntry) => {
    setEditingEntry(entry);
    setFormDate(DateTime.fromMillis(entry.preachingDate, { zone: 'utc' }).toISODate()!);
    setFormHours(entry.hours);
    setFormMinutes(entry.minutes);
    setFormType(entry.type);
    setFormNotes(entry.notes || '');
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingEntry(null);
    setFormDate(DateTime.now().toISODate());
    setFormHours(1);
    setFormMinutes(0);
    setFormType(PreachingSessionType.HOUSE_TO_HOUSE);
    setFormNotes('');
    setFormError('');
  };

  const handleGoalChange = (goalHours: number, type: UserGoal['preacherType']) => {
    const email = currentUser?.email || 'default';
    const newGoal: UserGoal = {
      userId: email,
      monthlyHourGoal: goalHours,
      preacherType: type,
    };
    setGoal(newGoal);
    localStorage.setItem(LOCAL_GOAL_KEY + '_' + email, JSON.stringify(newGoal));
  };

  const handleExportWhatsApp = () => {
    const stats = sumEntries(entries);
    const now = DateTime.now();
    const monthName = now.setLocale('es-ES').monthLong.toUpperCase();
    const year = now.year;

    const roundedHours = Math.floor(stats.totalMinutes / 60);

    const text = `📖 *Informe de Actividad*
📅 *Mes:* ${monthName} ${year}
👤 *Publicador:* ${currentUser?.email}

⏱️ *Total de horas:* ${roundedHours}

Generado por *JW Service Tracker*`;

    navigator.clipboard.writeText(text);
    alert('¡Reporte copiado al portapapeles! Listo para pegar y enviar por WhatsApp.');
  };

  if (!isAuthenticated || !currentUser) {
    if (showSignUp) {
      return (
        <SignUp
          onSignUpSuccess={handleLoginSuccess}
          onBackToLogin={() => setShowSignUp(false)}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSignUpClick={() => setShowSignUp(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar
        isOnline={isOnline}
        isSyncing={isSyncing}
        onSync={handleSync}
        email={currentUser.email}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-all duration-300 ${activeTab === 'dashboard'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-all duration-300 ${activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            History Log
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-all duration-300 ${activeTab === 'settings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            Goal Settings
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <Dashboard
            entries={entries}
            goal={goal}
            onAddClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            onExportClick={handleExportWhatsApp}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteEntry}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <History
            entries={entries}
            onAddClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteEntry}
          />
        )}

        {activeTab === 'settings' && (
          <Settings goal={goal} onGoalChange={handleGoalChange} />
        )}
      </main>

      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingEntry ? 'Edit Preaching Entry' : 'Add Preaching Entry'}
      >
        <form onSubmit={handleSaveEntry} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date</label>
              <Input
                type="date"
                required
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Hours</label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  value={formHours}
                  onChange={e => setFormHours(parseInt(e.target.value) || 0)}
                  className="text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Mins</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={formMinutes}
                  onChange={e => setFormMinutes(parseInt(e.target.value) || 0)}
                  className="text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo de Predicación</label>
            <select
              value={formType}
              onChange={e => setFormType(e.target.value as PreachingSessionType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={PreachingSessionType.HOUSE_TO_HOUSE}>Casa en casa</option>
              <option value={PreachingSessionType.REVISITS}>Revisitas</option>
              <option value={PreachingSessionType.BIBLE_STUDY}>Estudio Bíblico</option>
              <option value={PreachingSessionType.OTHER}>Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (Optional)</label>
            <Textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Preaching in commercial area, street preaching..."
            />
          </div>

          {formError && (
            <div className="flex items-center gap-1.5 text-red-600 text-xs bg-red-50 p-2.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Save Entry
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
