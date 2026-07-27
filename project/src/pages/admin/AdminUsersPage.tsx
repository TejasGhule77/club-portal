import { useEffect, useState } from 'react';
import api, { type Profile, type Club, type UserRole } from '../../lib/api';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { UserCog, GraduationCap, Building2, Shield, Search } from 'lucide-react';

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [clubs, setClubs] = useState<Record<string, Club>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  useEffect(() => {
    async function fetchData() {
      const { data } = await api.get('/admin/users');
      setUsers((data.users as Profile[]) || []);
      const clubMap: Record<string, Club> = {};
      Object.entries(data.clubs || {}).forEach(([key, val]) => {
        clubMap[key] = val as Club;
      });
      setClubs(clubMap);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleIcon = (role: UserRole) => {
    if (role === 'student') return <GraduationCap className="h-4 w-4 text-blue-600" />;
    if (role === 'clubOwner') return <Building2 className="h-4 w-4 text-amber-600" />;
    return <Shield className="h-4 w-4 text-gray-600" />;
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <UserCog className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
        </div>
        <p className="text-sm text-gray-500">{users.length} total users on the platform</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="clubOwner">Club Owners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={UserCog} title="No users found" message="Try adjusting your search or filters." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Branch/Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Club</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => {
                const userClub = clubs[user.id];
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <span className="text-sm font-bold text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        {roleIcon(user.role)}
                        <span className="capitalize">{user.role === 'clubOwner' ? 'Club Owner' : user.role}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">
                      {user.branch ? `${user.branch}` : '—'}
                      {user.year ? ` • ${user.year}` : ''}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
                      {userClub ? userClub.name : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
