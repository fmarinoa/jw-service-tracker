import { AlertTriangle } from "lucide-react";
import React from "react";

import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export const ConfirmDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Eliminar registro?",
  description = "Esta acción no se puede deshacer. El registro se borrará permanentemente.",
  isLoading = false,
}: ConfirmDeleteDialogProps) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{description}</p>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="ghost"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
