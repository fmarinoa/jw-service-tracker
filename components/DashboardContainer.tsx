'use client';

import { DashboardProvider, useDashboard } from './dashboard/DashboardProvider';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { HoursCard } from './dashboard/HoursCard';
import { SummaryCard } from './dashboard/SummaryCard';
import { RecentActivityCard } from './dashboard/RecentActivityCard';
import { EntryDialog } from './dashboard/EntryDialog';
import { SettingsDialog } from './dashboard/SettingsDialog';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import { DashboardSkeleton } from './dashboard/DashboardSkeleton';

function DashboardContent() {
  const {
    isLoading,
    user,
    showDeleteModal,
    setShowDeleteModal,
    handleDelete,
    isDeleting
  } = useDashboard();

  if (isLoading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <DashboardHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HoursCard />
        <SummaryCard />
      </div>
      <RecentActivityCard />
      <EntryDialog />
      <SettingsDialog />
      <ConfirmDeleteDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function DashboardContainer({ userId }: { userId: string }) {
  return (
    <DashboardProvider userId={userId}>
      <DashboardContent />
    </DashboardProvider>
  );
}
