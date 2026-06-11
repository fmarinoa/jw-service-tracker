import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-foreground tracking-tight">{title}</h3>
          <Button variant="ghost" onClick={onClose} className="p-1 h-auto w-auto hover:bg-background">
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};
