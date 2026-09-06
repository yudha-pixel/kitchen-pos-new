const rupiah = new Intl.NumberFormat('id-ID');

export const formatRupiah = (amount: number): string => `Rp ${rupiah.format(amount)}`;

export const formatTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export const elapsedMinutes = (dateString: string | Date): number =>
  Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);

export const formatElapsed = (dateString: string | Date): string => {
  const diff = elapsedMinutes(dateString);
  if (diff < 1) return 'Baru saja';
  if (diff < 60) return `${diff} menit`;
  return `${Math.floor(diff / 60)} jam ${diff % 60} menit`;
};

// Document dates may be absent on a draft. Render a dash rather than falling
// back to Date.now(), which both lies about the date and is impure at render.
const MISSING_DATE = '—';

export const formatDocumentDate = (dateString: string | Date | null | undefined): string =>
  dateString
    ? new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    : MISSING_DATE;

export const formatDocumentDateTime = (dateString: string | Date | null | undefined): string =>
  dateString ? new Date(dateString).toLocaleString('id-ID') : MISSING_DATE;
