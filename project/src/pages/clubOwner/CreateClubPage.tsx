import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api, { CATEGORIES, type ClubCategory } from '../../lib/api';
import { Building2, Loader2, Upload } from 'lucide-react';

export function CreateClubPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ClubCategory>('technical');
  const [facultyAdvisor, setFacultyAdvisor] = useState(''); // synced with facultyName
  const [facultyPhone, setFacultyPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  // New details
  const [presidentName, setPresidentName] = useState('');
  const [presidentEmail, setPresidentEmail] = useState('');
  const [presidentPhone, setPresidentPhone] = useState('');
  const [presidentPhoto, setPresidentPhoto] = useState('');
  const [clubEmail, setClubEmail] = useState('');
  const [clubPhone, setClubPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [memberCount, setMemberCount] = useState('0');
  
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePresidentPhoto = async (file: File) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPresidentPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !description || !facultyAdvisor) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!profile) return;

    setLoading(true);
    try {
      await api.post('/clubs', {
        name,
        description,
        category,
        faculty_advisor: facultyAdvisor,
        facultyName: facultyAdvisor,
        facultyPhone,
        logo_url: logoUrl,
        presidentName,
        presidentEmail,
        presidentPhone,
        presidentPhoto,
        clubEmail,
        clubPhone,
        instagram,
        linkedin,
        github,
        website,
        establishedYear: establishedYear ? parseInt(establishedYear) : null,
        memberCount: memberCount ? parseInt(memberCount) : 0,
      });
      toast.success('Club request submitted! Awaiting admin approval.');
      await refreshProfile();
      navigate('/club-owner/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create club');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Create Club Request</h1>
        </div>
        <p className="text-sm text-gray-500">
          Submit your club for admin approval. Once approved, you can add openings and events.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Club Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            placeholder="e.g. Robotics Society"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            rows={4}
            placeholder="Tell students what your club is about..."
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ClubCategory)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Advisor / Coordinator Name *</label>
            <input
              type="text"
              value={facultyAdvisor}
              onChange={(e) => setFacultyAdvisor(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="Prof. John Smith"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Advisor Phone</label>
            <input
              type="text"
              value={facultyPhone}
              onChange={(e) => setFacultyPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="e.g. +1 555-0199"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
            <input
              type="number"
              value={establishedYear}
              onChange={(e) => setEstablishedYear(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              placeholder="e.g. 2024"
            />
          </div>
        </div>

        {/* President Details */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">Club President Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">President Name</label>
              <input
                type="text"
                value={presidentName}
                onChange={(e) => setPresidentName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="President Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">President Email</label>
              <input
                type="email"
                value={presidentEmail}
                onChange={(e) => setPresidentEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="president@college.edu"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">President Phone</label>
              <input
                type="text"
                value={presidentPhone}
                onChange={(e) => setPresidentPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="e.g. 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">President Photo</label>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 overflow-hidden">
                  {presidentPhoto ? (
                    <img src={presidentPhoto} alt="President" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePresidentPhoto(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Club Contacts */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">Club Contact Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Email</label>
              <input
                type="email"
                value={clubEmail}
                onChange={(e) => setClubEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="club@college.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Phone / Hotline</label>
              <input
                type="text"
                value={clubPhone}
                onChange={(e) => setClubPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="Club Phone Number"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">Social Links & Stats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Link</label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Link</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Link</label>
              <input
                type="url"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website Link</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Members Count</label>
              <input
                type="number"
                value={memberCount}
                onChange={(e) => setMemberCount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="e.g. 50"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Club Logo</label>
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Choose File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-1">Optional. Max 2MB. Stored as base64 preview.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Submit for Approval
        </button>
      </form>
    </div>
  );
}
