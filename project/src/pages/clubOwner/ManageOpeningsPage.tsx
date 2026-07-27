import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api, {
  type Club,
  type Opening,
  type Application,
  type Profile,
  type ApplicationStatus,
} from '../../lib/api';
import { StatusBadge } from '../../components/Badges';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { Briefcase, Plus, X, Loader2, Users, Download, Clock } from 'lucide-react';

export function ManageOpeningsPage() {
  const { profile } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  // Applicant viewing
  const [viewingOpening, setViewingOpening] = useState<Opening | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!profile) return;
    const uid = profile.id;
    async function fetchData() {
      const { data: clubData } = await api.get(`/clubs/owner/${uid}`);
      if (clubData) {
        setClub(clubData as Club);
        const { data: details } = await api.get(`/clubs/${(clubData as Club).id}/details`);
        setOpenings((details.openings as Opening[]) || []);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!club || !title) return;
    const payload = {
      club_id: club.id,
      title,
      description,
      deadline: deadline || null,
    };
    if (editingId) {
      try {
        const { data } = await api.put(`/clubs/${club.id}/openings/${editingId}`, payload);
        toast.success('Opening updated!');
        setOpenings(openings.map((o) => (o.id === editingId ? { ...o, ...data } : o)));
        resetForm();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to update');
      }
    } else {
      try {
        const { data } = await api.post(`/clubs/${club.id}/openings`, { ...payload, status: 'open' });
        toast.success('Opening created!');
        setOpenings([data as Opening, ...openings]);
        resetForm();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to create');
      }
    }
  };

  const toggleStatus = async (opening: Opening) => {
    const newStatus = opening.status === 'open' ? 'closed' : 'open';
    try {
      await api.put(`/clubs/${club?.id}/openings/${opening.id}`, { status: newStatus });
      toast.success(`Opening ${newStatus === 'open' ? 'opened' : 'closed'}`);
      setOpenings(openings.map((o) => (o.id === opening.id ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const deleteOpening = async (id: string) => {
    if (!confirm('Delete this opening? All applications will also be removed.')) return;
    try {
      await api.delete(`/clubs/${club?.id}/openings/${id}`);
      toast.success('Opening deleted');
      setOpenings(openings.filter((o) => o.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const viewApplicants = async (opening: Opening) => {
    setViewingOpening(opening);
    const { data } = await api.get(`/clubs/${club?.id}/openings/${opening.id}/applications`);
    setApplications((data as Application[]) || []);
  };

  const updateApplicantStatus = async (appId: string, status: ApplicationStatus) => {
    try {
      await api.put(`/clubs/${club?.id}/openings/applications/${appId}/status`, { status });
      toast.success(`Applicant ${status}`);
      setApplications(applications.map((a) => (a.id === appId ? { ...a, status } : a)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const exportCSV = () => {
    if (!viewingOpening || applications.length === 0) return;
    const headers = ['Name', 'Email', 'Roll Number', 'Department', 'Year', 'Contact Number', 'Status', 'Applied At', 'Cover Note'];
    const rows = applications.map((a) => {
      const s = a.student as unknown as Profile;
      return [
        a.full_name || s?.name || '',
        s?.email || '',
        a.roll_number || s?.college_id || '',
        a.department_name || s?.branch || '',
        a.year || s?.year || '',
        a.contact_number || '',
        a.status,
        new Date(a.applied_at).toLocaleDateString(),
        a.cover_note?.replace(/"/g, '""') || '',
      ].map((v) => `"${v}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viewingOpening.title.replace(/\s+/g, '_')}_applicants.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingScreen />;

  if (!club) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No club found"
        message="Create a club first to manage openings."
        action={{ label: 'Create Club', to: '/club-owner/create-club' }}
      />
    );
  }

  if (club.status !== 'approved') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
          <p className="text-amber-800 font-medium">Your club is pending approval.</p>
          <p className="text-sm text-amber-600 mt-1">You can manage openings once your club is approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Manage Openings</h1>
          </div>
          <p className="text-sm text-gray-500">Create recruitment openings and review applicants</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Opening
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Opening' : 'New Opening'}</h3>
            <button type="button" onClick={resetForm}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Opening title (e.g. Frontend Developer)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the role, requirements, what students will learn..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            rows={3}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <Loader2 className="hidden" />
            {editingId ? 'Update' : 'Create'} Opening
          </button>
        </form>
      )}

      {openings.length === 0 && !showForm ? (
        <EmptyState
          icon={Briefcase}
          title="No openings yet"
          message="Create your first recruitment opening to start receiving applications."
        />
      ) : (
        <div className="space-y-3">
          {openings.map((opening) => (
            <div key={opening.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{opening.title}</h3>
                    <StatusBadge status={opening.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{opening.description}</p>
                  {opening.deadline && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      Deadline: {new Date(opening.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => viewApplicants(opening)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Users className="h-3.5 w-3.5" />
                  View Applicants
                </button>
                <button
                  onClick={() => {
                    setEditingId(opening.id);
                    setTitle(opening.title);
                    setDescription(opening.description);
                    setDeadline(opening.deadline || '');
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleStatus(opening)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {opening.status === 'open' ? 'Close' : 'Reopen'}
                </button>
                <button
                  onClick={() => deleteOpening(opening.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicant Modal */}
      {viewingOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewingOpening(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900">Applicants for "{viewingOpening.title}"</h3>
                <p className="text-sm text-gray-500">{applications.length} total</p>
              </div>
              <div className="flex items-center gap-2">
                {applications.length > 0 && (
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </button>
                )}
                <button onClick={() => setViewingOpening(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-5">
              {applications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => {
                    const s = app.student as unknown as Profile;
                    const nameToShow = app.full_name || s?.name || 'Unknown';
                    const rollToShow = app.roll_number || s?.college_id || 'TBD';
                    const deptToShow = app.department_name || s?.branch || 'TBD';
                    const yearToShow = app.year || s?.year || 'TBD';
                    const contactToShow = app.contact_number || 'TBD';
 
                    return (
                      <div key={app.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base">{nameToShow}</h4>
                            <p className="text-sm text-gray-600 font-medium">{s?.email}</p>
                            <div className="text-xs text-gray-500 mt-2 space-y-1 bg-white border border-gray-100 p-2.5 rounded-lg shadow-sm">
                              <div><span className="font-semibold text-gray-700">Roll No:</span> {rollToShow}</div>
                              <div><span className="font-semibold text-gray-700">Dept:</span> {deptToShow}</div>
                              <div><span className="font-semibold text-gray-700">Year:</span> {yearToShow}</div>
                              <div><span className="font-semibold text-gray-700">Contact:</span> {contactToShow}</div>
                            </div>
                            {app.cover_note && (
                              <div className="mt-3">
                                <span className="text-xs font-semibold text-gray-700">Cover Note:</span>
                                <p className="text-sm text-gray-600 mt-1 italic bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm">
                                  "{app.cover_note}"
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Applied {new Date(app.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={app.status} />
                            <div className="flex gap-1">
                              <button
                                onClick={() => updateApplicantStatus(app.id, 'accepted')}
                                className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateApplicantStatus(app.id, 'rejected')}
                                className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
