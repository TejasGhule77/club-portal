import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api, {
  type Club,
  type ClubEvent,
  type Registration,
  type Profile,
  type ApplicationStatus,
} from '../../lib/api';
import { StatusBadge } from '../../components/Badges';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { Calendar, Plus, X, MapPin, Users, Download, Trash2 } from 'lucide-react';

export function ManageEventsPage() {
  const { profile } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [posterUrl, setPosterUrl] = useState('');

  const [viewingEvent, setViewingEvent] = useState<ClubEvent | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    if (!profile) return;
    const uid = profile.id;
    async function fetchData() {
      const { data: clubData } = await api.get(`/clubs/owner/${uid}`);
      if (clubData) {
        setClub(clubData as Club);
        const { data: details } = await api.get(`/clubs/${(clubData as Club).id}/details`);
        setEvents((details.events as ClubEvent[]) || []);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setVenue('');
    setPosterUrl('');
    setEditingId(null);
    setShowForm(false);
  };

  const handlePoster = async (file: File) => {
    if (file.size > 2_000_000) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPosterUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!club || !title) return;
    const payload = {
      club_id: club.id,
      title,
      description,
      date: date ? new Date(date).toISOString() : null,
      venue,
      poster_url: posterUrl,
    };
    if (editingId) {
      try {
        const { data } = await api.put(`/clubs/${club.id}/events/${editingId}`, payload);
        toast.success('Event updated!');
        setEvents(events.map((ev) => (ev.id === editingId ? { ...ev, ...data } : ev)));
        resetForm();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to update');
      }
    } else {
      try {
        const { data } = await api.post(`/clubs/${club.id}/events`, payload);
        toast.success('Event created!');
        setEvents([data as ClubEvent, ...events]);
        resetForm();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to create');
      }
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event? All registrations will also be removed.')) return;
    try {
      await api.delete(`/clubs/${club?.id}/events/${id}`);
      toast.success('Event deleted');
      setEvents(events.filter((ev) => ev.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const viewRegistrations = async (event: ClubEvent) => {
    setViewingEvent(event);
    const { data } = await api.get(`/clubs/${club?.id}/events/${event.id}/registrations`);
    setRegistrations((data as Registration[]) || []);
  };

  const updateRegStatus = async (regId: string, status: ApplicationStatus) => {
    try {
      await api.put(`/clubs/${club?.id}/events/registrations/${regId}/status`, { status });
      toast.success(`Registration ${status}`);
      setRegistrations(registrations.map((r) => (r.id === regId ? { ...r, status } : r)));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const exportCSV = () => {
    if (!viewingEvent || registrations.length === 0) return;
    const headers = ['Name', 'Email', 'College ID', 'Branch', 'Year', 'Status', 'Registered At'];
    const rows = registrations.map((r) => {
      const s = r.student as unknown as Profile;
      return [
        s?.name || '',
        s?.email || '',
        s?.college_id || '',
        s?.branch || '',
        s?.year || '',
        r.status,
        new Date(r.registered_at).toLocaleDateString(),
      ].map((v) => `"${v}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${viewingEvent.title.replace(/\s+/g, '_')}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingScreen />;

  if (!club) {
    return (
      <EmptyState
        icon={Calendar}
        title="No club found"
        message="Create a club first to manage events."
        action={{ label: 'Create Club', to: '/club-owner/create-club' }}
      />
    );
  }

  if (club.status !== 'approved') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
          <p className="text-amber-800 font-medium">Your club is pending approval.</p>
          <p className="text-sm text-amber-600 mt-1">You can manage events once your club is approved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-teal-600" />
            <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
          </div>
          <p className="text-sm text-gray-500">Create events and manage registrations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Event' : 'New Event'}</h3>
            <button type="button" onClick={resetForm}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Event description..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Auditorium A"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Poster</label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 overflow-hidden">
                {posterUrl ? (
                  <img src={posterUrl} alt="Poster" className="w-full h-full object-cover" />
                ) : (
                  <Calendar className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePoster(e.target.files[0])}
                />
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {editingId ? 'Update' : 'Create'} Event
          </button>
        </form>
      )}

      {events.length === 0 && !showForm ? (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          message="Create your first event to start receiving registrations."
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {event.poster_url && (
                  <img
                    src={event.poster_url}
                    alt={event.title}
                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {event.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(event.date).toLocaleString()}
                      </span>
                    )}
                    {event.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.venue}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => viewRegistrations(event)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Users className="h-3.5 w-3.5" />
                  View Registrations
                </button>
                <button
                  onClick={() => {
                    setEditingId(event.id);
                    setTitle(event.title);
                    setDescription(event.description);
                    setDate(event.date ? new Date(event.date).toISOString().slice(0, 16) : '');
                    setVenue(event.venue);
                    setPosterUrl(event.poster_url);
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewingEvent(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900">Registrations for "{viewingEvent.title}"</h3>
                <p className="text-sm text-gray-500">{registrations.length} total</p>
              </div>
              <div className="flex items-center gap-2">
                {registrations.length > 0 && (
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </button>
                )}
                <button onClick={() => setViewingEvent(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-5">
              {registrations.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg) => {
                    const s = reg.student as unknown as Profile;
                    return (
                      <div key={reg.id} className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{s?.name || 'Unknown'}</h4>
                            <p className="text-sm text-gray-500">{s?.email}</p>
                            {s?.branch && s?.year && (
                              <p className="text-xs text-gray-400 mt-1">{s.branch} • {s.year}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Registered {new Date(reg.registered_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={reg.status} />
                            <div className="flex gap-1">
                              <button
                                onClick={() => updateRegStatus(reg.id, 'accepted')}
                                className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateRegStatus(reg.id, 'rejected')}
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
