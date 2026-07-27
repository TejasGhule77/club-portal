import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { type Club, type Opening, type ClubEvent, type Achievement } from '../../lib/api';
import { StatusBadge, CategoryBadge } from '../../components/Badges';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Building2, Briefcase, Calendar, Trophy, Users, Plus, Settings } from 'lucide-react';

export function OwnerDashboard() {
  const { profile } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const uid = profile.id;
    async function fetchData() {
      const { data: clubData } = await api.get(`/clubs/owner/${uid}`);
      if (clubData) {
        setClub(clubData as Club);
        const clubId = (clubData as Club).id;
        const { data: details } = await api.get(`/clubs/${clubId}/details`);
        setOpenings((details.openings as Opening[]) || []);
        setEvents((details.events as ClubEvent[]) || []);
        setAchievements((details.achievements as Achievement[]) || []);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile]);

  if (loading) return <LoadingScreen />;

  if (!club) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mx-auto mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">You don't have a club yet</h1>
          <p className="text-sm text-gray-500 mt-1">Create a club request to get started</p>
        </div>
        <div className="text-center">
          <Link
            to="/club-owner/create-club"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Club Request
          </Link>
        </div>
      </div>
    );
  }

  const openOpenings = openings.filter((o) => o.status === 'open').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
        </div>
        <p className="text-sm text-gray-500">Manage your club, openings, and events</p>
      </div>

      {/* Club Status Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100">
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{club.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <CategoryBadge category={club.category} />
                <StatusBadge status={club.status} />
              </div>
            </div>
          </div>
          {club.status === 'approved' && (
            <Link
              to="/club-owner/manage"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              Manage Club
            </Link>
          )}
        </div>
        {club.status === 'pending' && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            Your club is awaiting admin approval. You'll be able to add openings and events once approved.
          </div>
        )}
        {club.status === 'rejected' && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
            Your club request was rejected. {club.rejection_reason && `Reason: ${club.rejection_reason}`}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Briefcase className="h-5 w-5" />
            <span className="text-2xl font-bold">{openOpenings}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Open Positions</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-teal-600">
            <Calendar className="h-5 w-5" />
            <span className="text-2xl font-bold">{events.length}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Events</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-amber-500">
            <Trophy className="h-5 w-5" />
            <span className="text-2xl font-bold">{achievements.length}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Achievements</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-5 w-5" />
            <span className="text-2xl font-bold">{openings.length}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Total Openings</p>
        </div>
      </div>

      {/* Quick Links */}
      {club.status === 'approved' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/club-owner/openings"
            className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <Briefcase className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Manage Openings</h3>
            <p className="text-sm text-gray-500 mt-1">Create, edit, and review applicants</p>
          </Link>
          <Link
            to="/club-owner/events"
            className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-teal-300 transition-all"
          >
            <Calendar className="h-8 w-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-teal-600">Manage Events</h3>
            <p className="text-sm text-gray-500 mt-1">Create events and view registrations</p>
          </Link>
          <Link
            to="/club-owner/manage"
            className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-amber-300 transition-all"
          >
            <Settings className="h-8 w-8 text-amber-500 mb-3" />
            <h3 className="font-semibold text-gray-900 group-hover:text-amber-600">Edit Club</h3>
            <p className="text-sm text-gray-500 mt-1">Update description, logo, achievements</p>
          </Link>
        </div>
      )}
    </div>
  );
}
