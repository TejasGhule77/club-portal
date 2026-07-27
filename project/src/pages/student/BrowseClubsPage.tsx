import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { CATEGORIES, type Club, type ClubCategory } from '../../lib/api';
import { CategoryBadge } from '../../components/Badges';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { Search, Compass, Users, ArrowRight } from 'lucide-react';

export function BrowseClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ClubCategory | 'all'>('all');

  useEffect(() => {
    async function fetchClubs() {
      const { data } = await api.get('/clubs?status=approved');
      setClubs((data as Club[]) || []);
      setLoading(false);
    }
    fetchClubs();
  }, []);

  const filtered = clubs.filter((club) => {
    const matchesSearch =
      !search ||
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || club.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Browse Clubs</h1>
        </div>
        <p className="text-sm text-gray-500">Discover and join clubs that match your interests</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ClubCategory | 'all')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clubs found"
          message="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((club) => (
            <Link
              key={club.id}
              to={`/clubs/${club.id}`}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden"
            >
              <div className="h-32 bg-gradient-to-br from-blue-100 to-teal-100 relative overflow-hidden">
                {club.logo_url ? (
                  <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md">
                      <span className="text-2xl font-bold text-blue-600">
                        {club.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {club.name}
                  </h3>
                  <CategoryBadge category={club.category} />
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {club.description || 'No description available.'}
                </p>
                <div className="mt-3 flex items-center gap-1 text-sm text-blue-600 font-medium">
                  View Details
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
