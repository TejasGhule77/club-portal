import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { type Club } from '../../lib/api';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Shield, Users, Building2, Briefcase, Calendar, TrendingUp, ClipboardList, UserCog } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalClubs: 0,
    pendingClubs: 0,
    approvedClubs: 0,
    totalStudents: 0,
    totalOwners: 0,
    totalOpenings: 0,
    totalEvents: 0,
    totalApplications: 0,
    totalRegistrations: 0,
  });
  const [topOpenings, setTopOpenings] = useState<{ title: string; count: number; club_name: string }[]>([]);
  const [topEvents, setTopEvents] = useState<{ title: string; count: number; club_name: string }[]>([]);
  const [recentClubs, setRecentClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: statsData } = await api.get('/admin/stats');
        setStats(statsData);

        const { data: topOpen } = await api.get('/admin/top-openings');
        setTopOpenings(topOpen || []);

        const { data: topEve } = await api.get('/admin/top-events');
        setTopEvents(topEve || []);

        const { data: recent } = await api.get('/admin/recent-clubs');
        setRecentClubs((recent as Club[]) || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-sm text-gray-500">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Building2} label="Total Clubs" value={stats.totalClubs} color="blue" />
        <StatCard icon={Users} label="Students" value={stats.totalStudents} color="teal" />
        <StatCard icon={Users} label="Club Owners" value={stats.totalOwners} color="amber" />
        <StatCard icon={Briefcase} label="Openings" value={stats.totalOpenings} color="sky" />
        <StatCard icon={Calendar} label="Events" value={stats.totalEvents} color="rose" />
        <StatCard icon={ClipboardList} label="Applications" value={stats.totalApplications} color="emerald" />
        <StatCard icon={Calendar} label="Registrations" value={stats.totalRegistrations} color="purple" />
        <StatCard icon={TrendingUp} label="Pending Clubs" value={stats.pendingClubs} color="orange" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/admin/pending-clubs"
          className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <ClipboardList className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Pending Club Approvals</h3>
            <p className="text-sm text-gray-500">{stats.pendingClubs} awaiting review</p>
          </div>
        </Link>
        <Link
          to="/admin/users"
          className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <UserCog className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Manage Users</h3>
            <p className="text-sm text-gray-500">{stats.totalStudents + stats.totalOwners} total users</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Openings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Most Applied Openings
          </h3>
          {topOpenings.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topOpenings.map((o, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{o.title}</p>
                    <p className="text-xs text-gray-400">{o.club_name}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    {o.count} apps
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Events */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-teal-600" />
            Most Registered Events
          </h3>
          {topEvents.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-2">
              {topEvents.map((e, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.club_name}</p>
                  </div>
                  <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-700">
                    {e.count} regs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Clubs */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold text-gray-900 mb-4">Recently Created Clubs</h3>
        {recentClubs.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No clubs yet</p>
        ) : (
          <div className="space-y-2">
            {recentClubs.map((club) => (
              <div key={club.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{club.name}</p>
                  <p className="text-xs text-gray-400">{club.category} • {new Date(club.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  club.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  club.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {club.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    teal: 'text-teal-600 bg-teal-50',
    amber: 'text-amber-600 bg-amber-50',
    sky: 'text-sky-600 bg-sky-50',
    rose: 'text-rose-600 bg-rose-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]} mb-3`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
