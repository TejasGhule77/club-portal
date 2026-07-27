import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { type Club, type Profile } from '../../lib/api';
import { StatusBadge, CategoryBadge } from '../../components/Badges';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { ClipboardList, Check, X, Loader2 } from 'lucide-react';

export function PendingClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [owners, setOwners] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  async function fetchClubs() {
    setLoading(true);
    const { data } = await api.get('/admin/pending-clubs');
    if (data) {
      setClubs(data as Club[]);
      const ownerMap: Record<string, Profile> = {};
      (data as any[]).forEach((item) => {
        if (item.owner) ownerMap[item.owner.id] = item.owner;
      });
      setOwners(ownerMap);
    }
    setLoading(false);
  }

  const approveClub = async (clubId: string) => {
    setProcessing(true);
    try {
      await api.put(`/clubs/${clubId}/status`, { status: 'approved' });
      toast.success('Club approved!');
      setClubs(clubs.filter((c) => c.id !== clubId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
    setProcessing(false);
  };

  const rejectClub = async (clubId: string) => {
    setProcessing(true);
    try {
      await api.put(`/clubs/${clubId}/status`, { status: 'rejected', rejection_reason: rejectionReason });
      toast.success('Club rejected');
      setClubs(clubs.filter((c) => c.id !== clubId));
      setRejectingId(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
    setProcessing(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="h-5 w-5 text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900">Pending Club Requests</h1>
        </div>
        <p className="text-sm text-gray-500">Review and approve new club creation requests</p>
      </div>

      {clubs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No pending requests"
          message="All club requests have been reviewed."
        />
      ) : (
        <div className="space-y-4">
          {clubs.map((club) => (
            <div key={club.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-teal-100 flex-shrink-0 overflow-hidden">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {club.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{club.name}</h3>
                    <CategoryBadge category={club.category} />
                    <StatusBadge status={club.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{club.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Faculty: {club.faculty_advisor || 'TBD'}</span>
                    <span>Owner: {owners[club.owner_id]?.name || 'Unknown'}</span>
                    <span>Created: {new Date(club.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {rejectingId === club.id ? (
                <div className="mt-4 space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <label className="block text-sm font-medium text-rose-800">Rejection Reason (optional)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    className="w-full rounded-lg border border-rose-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectClub(club.id)}
                      disabled={processing}
                      className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    >
                      {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => approveClub(club.id)}
                    disabled={processing}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(club.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
