import type { ClubStatus, ApplicationStatus, OpeningStatus } from '../lib/api';

export function StatusBadge({ status }: { status: ClubStatus | ApplicationStatus | OpeningStatus }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    approved: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
    rejected: 'bg-rose-100 text-rose-800 ring-rose-600/20',
    open: 'bg-sky-100 text-sky-800 ring-sky-600/20',
    closed: 'bg-gray-200 text-gray-700 ring-gray-500/20',
    accepted: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  };

  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    open: 'Open',
    closed: 'Closed',
    accepted: 'Accepted',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    technical: 'bg-blue-100 text-blue-800 ring-blue-600/20',
    cultural: 'bg-pink-100 text-pink-800 ring-pink-600/20',
    sports: 'bg-orange-100 text-orange-800 ring-orange-600/20',
    literary: 'bg-purple-100 text-purple-800 ring-purple-600/20',
    social: 'bg-teal-100 text-teal-800 ring-teal-600/20',
    other: 'bg-gray-100 text-gray-800 ring-gray-600/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[category] || styles.other}`}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
