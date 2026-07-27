import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api, {
  CATEGORIES,
  type Club,
  type ClubCategory,
  type Achievement,
} from '../../lib/api';
import { LoadingScreen, EmptyState } from '../../components/LoadingScreen';
import { Settings, Trophy, Plus, Trash2, Upload, Loader2, X } from 'lucide-react';

export function ManageClubPage() {
  const { profile } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ClubCategory>('technical');
  const [facultyAdvisor, setFacultyAdvisor] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // New fields
  const [presidentName, setPresidentName] = useState('');
  const [presidentPhoto, setPresidentPhoto] = useState('');
  const [presidentEmail, setPresidentEmail] = useState('');
  const [presidentPhone, setPresidentPhone] = useState('');
  const [facultyPhone, setFacultyPhone] = useState('');
  const [clubEmail, setClubEmail] = useState('');
  const [clubPhone, setClubPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [memberCount, setMemberCount] = useState('0');
  const [achievementsCount, setAchievementsCount] = useState('0');
  const [upcomingEventsCount, setUpcomingEventsCount] = useState('0');
  const [bannerUrl, setBannerUrl] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);

  // Achievement form
  const [achTitle, setAchTitle] = useState('');
  const [achDescription, setAchDescription] = useState('');
  const [achDate, setAchDate] = useState('');
  const [achImage, setAchImage] = useState('');
  const [showAchForm, setShowAchForm] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const uid = profile.id;
    async function fetchData() {
      const { data: clubData } = await api.get(`/clubs/owner/${uid}`);
      if (clubData) {
        const c = clubData as Club;
        setClub(c);
        setName(c.name);
        setDescription(c.description);
        setCategory(c.category);
        setFacultyAdvisor(c.faculty_advisor || c.facultyName || '');
        setLogoUrl(c.logo_url || '');
        
        // Populate new fields
        setPresidentName(c.presidentName || '');
        setPresidentPhoto(c.presidentPhoto || '');
        setPresidentEmail(c.presidentEmail || '');
        setPresidentPhone(c.presidentPhone || '');
        setFacultyPhone(c.facultyPhone || '');
        setClubEmail(c.clubEmail || '');
        setClubPhone(c.clubPhone || '');
        setInstagram(c.instagram || '');
        setLinkedin(c.linkedin || '');
        setGithub(c.github || '');
        setWebsite(c.website || '');
        setEstablishedYear(c.establishedYear ? String(c.establishedYear) : '');
        setMemberCount(c.memberCount ? String(c.memberCount) : '0');
        setAchievementsCount(c.achievementsCount ? String(c.achievementsCount) : '0');
        setUpcomingEventsCount(c.upcomingEventsCount ? String(c.upcomingEventsCount) : '0');
        setBannerUrl(c.banner_url || '');
        setGallery(c.gallery || []);

        const { data: details } = await api.get(`/clubs/${c.id}/details`);
        setAchievements((details.achievements as Achievement[]) || []);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!club) return;
    setSaving(true);
    try {
      await api.put(`/clubs/${club.id}`, {
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
        achievementsCount: achievementsCount ? parseInt(achievementsCount) : 0,
        upcomingEventsCount: upcomingEventsCount ? parseInt(upcomingEventsCount) : 0,
        banner_url: bannerUrl,
        gallery,
      });
      toast.success('Club updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setSaving(false);
  };

  const handleLogo = async (file: File) => {
    if (file.size > 2_000_000) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePresidentPhoto = async (file: File) => {
    if (file.size > 2_000_000) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPresidentPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleBanner = async (file: File) => {
    if (file.size > 2_000_000) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBannerUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGalleryAdd = async (file: File) => {
    if (file.size > 2_000_000) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setGallery([...gallery, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryRemove = (indexToRemove: number) => {
    setGallery(gallery.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAchImage = async (file: File) => {
    if (file.size > 2_000_000) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAchImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addAchievement = async (e: FormEvent) => {
    e.preventDefault();
    if (!club || !achTitle) return;
    try {
      const { data } = await api.post(`/clubs/${club.id}/achievements`, {
        title: achTitle,
        description: achDescription,
        date: achDate || null,
        image_url: achImage,
      });
      setAchievements([data as Achievement, ...achievements]);
      toast.success('Achievement added!');
      setAchTitle('');
      setAchDescription('');
      setAchDate('');
      setAchImage('');
      setShowAchForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add achievement');
    }
  };

  const deleteAchievement = async (id: string) => {
    try {
      await api.delete(`/clubs/${club?.id}/achievements/${id}`);
      setAchievements(achievements.filter((a) => a.id !== id));
      toast.success('Achievement removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingScreen />;

  if (!club) {
    return (
      <EmptyState
        icon={Settings}
        title="No club to manage"
        message="You need to create a club first."
        action={{ label: 'Create Club', to: '/club-owner/create-club' }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Manage Club</h1>
        </div>
        <p className="text-sm text-gray-500">Edit your club details and manage achievements</p>
      </div>

      {/* Club Settings */}
      <form onSubmit={handleSave} className="space-y-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Advisor / Coordinator Name</label>
            <input
              type="text"
              value={facultyAdvisor}
              onChange={(e) => setFacultyAdvisor(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 overflow-hidden border border-gray-200">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Achievements Count Override</label>
              <input
                type="number"
                value={achievementsCount}
                onChange={(e) => setAchievementsCount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="e.g. 12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upcoming Events Count Override</label>
              <input
                type="number"
                value={upcomingEventsCount}
                onChange={(e) => setUpcomingEventsCount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="e.g. 3"
              />
            </div>
          </div>
        </div>

        {/* Club Banner & Logo & Gallery Uploads */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 tracking-wide uppercase">Club Design Assets & Gallery</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Logo</label>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
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
                    onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* Banner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club Banner (Top banner image)</label>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-32 items-center justify-center rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
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
                    onChange={(e) => e.target.files?.[0] && handleBanner(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Gallery Manager */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gallery Photos</label>
            <div className="flex flex-wrap gap-3 items-center">
              {gallery.map((img, index) => (
                <div key={index} className="relative h-20 w-20 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={img} alt={`Gallery ${index}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleGalleryRemove(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
                  >
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </button>
                </div>
              ))}
              <label className="cursor-pointer h-20 w-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-gray-50 transition-colors">
                <Plus className="h-5 w-5 text-gray-400" />
                <span className="text-[10px] text-gray-400 mt-1">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleGalleryAdd(e.target.files[0])}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400">Max 2MB per photo. Photos will be displayed in the Club Profile gallery grid.</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </form>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
          </div>
          <button
            onClick={() => setShowAchForm(!showAchForm)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {showAchForm && (
          <form onSubmit={addAchievement} className="mb-4 space-y-3 rounded-xl border border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between">
              <h3 className="font-medium text-gray-700 text-sm">New Achievement</h3>
              <button type="button" onClick={() => setShowAchForm(false)}>
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={achTitle}
              onChange={(e) => setAchTitle(e.target.value)}
              placeholder="Achievement title"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
            <textarea
              value={achDescription}
              onChange={(e) => setAchDescription(e.target.value)}
              placeholder="Description"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={achDate}
                onChange={(e) => setAchDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
              <label className="cursor-pointer flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                {achImage ? 'Image selected' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleAchImage(e.target.files[0])}
                />
              </label>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add Achievement
            </button>
          </form>
        )}

        {achievements.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No achievements added yet.</p>
        ) : (
          <div className="space-y-3">
            {achievements.map((ach) => (
              <div key={ach.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
                {ach.image_url && (
                  <img src={ach.image_url} alt={ach.title} className="h-16 w-16 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{ach.title}</h3>
                  <p className="text-sm text-gray-500">{ach.description}</p>
                  {ach.date && (
                    <p className="text-xs text-gray-400 mt-1">{new Date(ach.date).toLocaleDateString()}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteAchievement(ach.id)}
                  className="text-gray-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
