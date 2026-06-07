import { Wifi, WifiOff, RefreshCw, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  isOnline: boolean;
  isSyncing: boolean;
  onSync: () => void;
  email: string;
  onLogout: () => void;
}

export const Navbar = ({ isOnline, isSyncing, onSync, email, onLogout }: NavbarProps) => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">JW Service</h1>
          {isOnline ? (
            <span className="flex items-center gap-1 text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              <Wifi className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              <WifiOff className="w-3 h-3" /> Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onSync}
            disabled={isSyncing || !isOnline}
            className={`p-2 h-auto w-auto hover:bg-background ${isSyncing ? 'animate-spin' : ''}`}
            title="Sync Data"
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>

          <div className="flex items-center gap-2 border-l border-border pl-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{email}</span>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="p-2 h-auto w-auto hover:bg-red-50 text-muted-foreground hover:text-red-600"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
