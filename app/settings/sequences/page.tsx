'use client';

import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { SequenceSettings } from '@/src/components/settings/SequenceSettings';

export default function SequencesSettingsPage() {
  return (
    <ResponsiveShell title="Pengaturan Penomoran Dokumen">
      <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <SequenceSettings />
        </div>
      </div>
    </ResponsiveShell>
  );
}
