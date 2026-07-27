import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { type Application, type Registration } from '../../lib/api';
import { StatusBadge } from '../../components/Badges';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { Briefcase, Calendar, Clock, MapPin, Compass, GraduationCap } from 'lucide-react';

export function StudentDashboard() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'applications' | 'events'>('applications');

  useEffect(() => {
    if (!profile) return;
    const uid = profile.id;
    async function fetchData() {
      try {
        const [{ data: appData }, { data: regData }] = await Promise.all([
          api.get(`/applications/student/${uid}`),
          api.get(`/registrations/student/${uid}`),
        ]);
        setApplications((appData as Application[]) || []);
        setRegistrations((regData as Registration[]) || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile]);

  if (loading) return <LoadingScreen />;

  const pendingApps = applications.filter((a) => a.status === 'pending').length;
  const acceptedApps = applications.filter((a) => a.status === 'accepted').length;
  const pendingRegs = registrations.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {profile?.name?.split(' ')[0] || 'Student'}
          </h1>
        </div>
        <p className="text-sm text-gray-500">Track your applications and event registrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Clock className="h-5 w-5" />
            <span className="text-2xl font-bold">{pendingApps}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Pending Applications</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Briefcase className="h-5 w-5" />
            <span className="text-2xl font-bold">{acceptedApps}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Accepted Applications</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-teal-600">
            <Calendar className="h-5 w-5" />
            <span className="text-2xl font-bold">{pendingRegs}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Event Registrations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab('applications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'applications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          My Applications ({applications.length})
        </button>
        <button
          onClick={() => setTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'events'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="h-4 w-4" />
          My Registrations ({registrations.length})
        </button>
      </div>

      {tab === 'applications' ? (
        applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            message="Browse clubs and apply to openings to get started."
            action={{ label: 'Browse Clubs', to: '/student/clubs' }}
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {(app.opening_id as any)?.title || 'Opening'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {(app.opening_id as any)?.club_id?.name || 'Club'}
                    </p>
                    {app.cover_note && (
                      <p className="text-sm text-gray-400 mt-2 italic">"{app.cover_note}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Applied {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        registrations.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No event registrations"
            message="Browse clubs and register for events to see them here."
            action={{ label: 'Browse Clubs', to: '/student/clubs' }}
          />
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div key={reg.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {(reg.event_id as any)?.title || 'Event'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {(reg.event_id as any)?.club_id?.name || 'Club'}
                    </p>
                    {reg.event?.date && (
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date((reg.event_id as any)?.date).toLocaleDateString()}
                        </span>
                        {reg.event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {(reg.event_id as any)?.venue}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={reg.status} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <div className="mt-6">
        <Link
          to="/student/clubs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Compass className="h-4 w-4" />
          Browse more clubs
        </Link>
      </div>
    </div>
  );
}
