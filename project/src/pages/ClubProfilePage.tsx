/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, {
  type Club,
  type Achievement,
  type Opening,
  type ClubEvent,
} from '../lib/api';
import { CategoryBadge } from '../components/Badges';
import { LoadingScreen, EmptyState } from '../components/LoadingScreen';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  MapPin,
  Users,
  GraduationCap,
  Send,
  Clock,
  X,
  Instagram,
  Linkedin,
  Github,
  Globe,
  Mail,
  Phone,
  UserCheck,
  Building2,
  CalendarDays,
  Award,
} from 'lucide-react';

export function ClubProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentYear, setStudentYear] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registeringFor, setRegisteringFor] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const { data: clubData } = await api.get(`/clubs/${id}`);
        const { data: details } = await api.get(`/clubs/${id}/details`);
        if (!clubData) { setLoading(false); return; }
        setClub(clubData as Club);
        setAchievements((details.achievements as Achievement[]) || []);
        setOpenings((details.openings as Opening[]) || []);
        setEvents((details.events as ClubEvent[]) || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!rollNumber.trim()) newErrors.rollNumber = 'Roll Number is required';
    if (!studentYear.trim()) newErrors.studentYear = 'Year is required';
    if (!departmentName.trim()) newErrors.departmentName = 'Department Name is required';
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required';
    } else if (!/^\d{10}$/.test(contactNumber.trim())) {
      newErrors.contactNumber = 'Contact Number must be a valid 10-digit number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = async (openingId: string) => {
    if (!profile) {
      navigate('/login');
      return;
    }
    if (profile.role !== 'student') {
      toast.error('Only students can apply to openings');
      return;
    }

    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      await api.post('/applications', {
        opening_id: openingId,
        cover_note: coverNote,
        full_name: fullName,
        roll_number: rollNumber,
        year: studentYear,
        department_name: departmentName,
        contact_number: contactNumber,
      });
      toast.success('Application submitted successfully!');
      setApplyingTo(null);
      setFullName('');
      setRollNumber('');
      setStudentYear('');
      setDepartmentName('');
      setContactNumber('');
      setCoverNote('');
      setErrors({});
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!profile) {
      navigate('/login');
      return;
    }
    if (profile.role !== 'student') {
      toast.error('Only students can register for events');
      return;
    }

    try {
      await api.post('/registrations', { event_id: eventId });
      toast.success('Registered successfully!');
      setRegisteringFor(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register');
    }
  };

  if (loading) return <LoadingScreen />;

  if (!club) {
    return (
      <EmptyState
        icon={Users}
        title="Club not found"
        message="This club may not exist or has not been approved yet."
        action={{ label: 'Back to Home', to: '/' }}
      />
    );
  }

  const isOwner = profile?.id === club.owner_id;
  const openOpenings = openings.filter((o) => o.status === 'open');
  const isRecruitmentOpen = openOpenings.length > 0;

  // Sync count overrides or dynamic counts
  const finalMemberCount = club.memberCount || 0;
  const finalAchievementsCount = club.achievementsCount !== undefined && club.achievementsCount > 0 
    ? club.achievementsCount 
    : achievements.length;
  const finalEventsCount = club.upcomingEventsCount !== undefined && club.upcomingEventsCount > 0 
    ? club.upcomingEventsCount 
    : events.length;

  // Gather all images for the gallery
  const galleryImages = [
    ...(club.gallery || []),
    ...achievements.map(a => a.image_url).filter(Boolean),
    ...events.map(e => e.poster_url).filter(Boolean)
  ].filter((value, index, self) => self.indexOf(value) === index); // Deduplicate

  const handleJoinClick = () => {
    document.getElementById('openings-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </Link>

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Banner Area */}
        <div className="h-[250px] relative w-full overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900">
          {club.banner_url ? (
            <img src={club.banner_url} alt={`${club.name} Banner`} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="absolute inset-0 opacity-40 mix-blend-overlay">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400 via-blue-500 to-indigo-900" />
            </div>
          )}
          {isOwner && (
            <Link
              to="/club-owner/manage"
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-semibold px-4 py-2 rounded-xl shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white flex items-center gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              Manage & Edit Club
            </Link>
          )}
        </div>

        {/* Logo Overlapping and Name Area */}
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-white shadow-2xl border-4 border-white flex items-center justify-center relative z-10 shrink-0">
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-teal-500">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{club.name}</h1>
                <CategoryBadge category={club.category} />
              </div>
              <p className="text-gray-500 text-sm font-medium flex items-center justify-center md:justify-start gap-1.5">
                <Building2 className="h-4 w-4 text-blue-500" />
                Est. {club.establishedYear || 'N/A'} • {finalMemberCount} Members
              </p>
            </div>
          </div>

          {/* Badges Grid (SaaS Style) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-gray-100 pt-6">
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 text-center">
              <span className="block text-xs font-semibold text-blue-500 uppercase tracking-wider">Established</span>
              <span className="text-lg font-bold text-blue-900">{club.establishedYear || 'N/A'}</span>
            </div>
            <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-3 text-center">
              <span className="block text-xs font-semibold text-teal-500 uppercase tracking-wider">Members</span>
              <span className="text-lg font-bold text-teal-900">{finalMemberCount}</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 text-center">
              <span className="block text-xs font-semibold text-amber-500 uppercase tracking-wider">Achievements</span>
              <span className="text-lg font-bold text-amber-900">{finalAchievementsCount}</span>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 text-center">
              <span className="block text-xs font-semibold text-indigo-500 uppercase tracking-wider">Events</span>
              <span className="text-lg font-bold text-indigo-900">{finalEventsCount}</span>
            </div>
            <div className="col-span-2 md:col-span-1 border rounded-2xl p-3 text-center flex flex-col justify-center items-center gap-0.5 shadow-sm bg-slate-50/50">
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Recruitment</span>
              <span className={`inline-flex items-center gap-1 text-sm font-extrabold px-3 py-0.5 rounded-full ${
                isRecruitmentOpen ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                <span className={`h-2 w-2 rounded-full ${isRecruitmentOpen ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                {isRecruitmentOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Information Cards & Socials (1 Column) */}
        <div className="space-y-6">
          
          {/* President Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-blue-200/60">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-blue-100 shadow-md shrink-0 flex items-center justify-center bg-blue-50">
                {club.presidentPhoto ? (
                  <img src={club.presidentPhoto} alt={club.presidentName} className="h-full w-full object-cover" />
                ) : (
                  <UserCheck className="h-7 w-7 text-blue-600" />
                )}
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-blue-600 uppercase tracking-wider">Club President</span>
                <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{club.presidentName || 'TBD'}</h3>
              </div>
            </div>
            {club.presidentEmail && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-2">
                <p className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${club.presidentEmail}`}>{club.presidentEmail}</a>
                </p>
                {club.presidentPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{club.presidentPhone}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Faculty Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-teal-200/60">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-teal-100 shadow-md shrink-0 flex items-center justify-center bg-teal-50">
                <GraduationCap className="h-8 w-8 text-teal-600" />
              </div>
              <div className="space-y-1">
                <span className="block text-xs font-bold text-teal-600 uppercase tracking-wider">Faculty Coordinator</span>
                <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{club.facultyName || club.faculty_advisor || 'TBD'}</h3>
              </div>
            </div>
            {club.facultyPhone && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{club.facultyPhone}</span>
                </p>
              </div>
            )}
          </div>

          {/* General Contacts Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 space-y-4">
            <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Contact Information</h4>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase leading-none">Email</span>
                  <a href={`mailto:${club.clubEmail || club.owner?.email}`} className="font-semibold text-gray-800 hover:text-blue-600">{club.clubEmail || club.owner?.email || 'TBD'}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Phone className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase leading-none">Phone Hotline</span>
                  <span className="font-semibold text-gray-800">{club.clubPhone || 'TBD'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Web */}
          {(club.instagram || club.linkedin || club.github || club.website) && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 text-center space-y-4">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Social Networks</h4>
              <div className="flex items-center justify-center gap-3">
                {club.instagram && (
                  <a
                    href={club.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 w-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gradient-to-tr hover:from-amber-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 shadow-sm"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {club.linkedin && (
                  <a
                    href={club.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 w-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blue-700 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 shadow-sm"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {club.github && (
                  <a
                    href={club.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 w-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 shadow-sm"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {club.website && (
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 w-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-teal-600 hover:text-white hover:border-transparent transition-all duration-300 hover:scale-110 shadow-sm"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: About, Openings, Events, Achievements (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Club */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              About Club
            </h2>
            <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
              {club.description || 'No description available for this club.'}
            </p>
          </div>

          {/* Active Openings (Scroll target) */}
          <div id="openings-section" className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Active Openings
              </h2>
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700">
                {openOpenings.length}
              </span>
            </div>
            {openOpenings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                No active openings right now. Check back later!
              </div>
            ) : (
              <div className="space-y-4">
                {openOpenings.map((opening) => (
                  <div key={opening.id} className="rounded-2xl border border-gray-200 p-5 bg-white shadow-sm hover:border-blue-300 transition-all duration-300 hover:shadow-md group">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{opening.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{opening.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-gray-100">
                      {opening.deadline ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Apply before: {new Date(opening.deadline).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">No deadline set</div>
                      )}
                      
                      <button
                        onClick={() => {
                          if (!profile) {
                            navigate('/login');
                            return;
                          }
                          if (profile.role !== 'student') {
                            toast.error('Only students can apply to openings');
                            return;
                          }
                          setFullName(profile.name || '');
                          setRollNumber(profile.college_id || '');
                          setStudentYear(profile.year || '');
                          setDepartmentName(profile.branch || '');
                          setContactNumber('');
                          setCoverNote('');
                          setErrors({});
                          setApplyingTo(opening.id);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105"
                      >
                        <Send className="h-4 w-4" />
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                Upcoming Events
              </h2>
              <span className="rounded-full bg-teal-100 px-3 py-0.5 text-xs font-bold text-teal-700">
                {events.length}
              </span>
            </div>
            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                No upcoming events listed at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300">
                    {event.poster_url && (
                      <div className="h-36 w-full overflow-hidden relative">
                        <img
                          src={event.poster_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <h3 className="font-extrabold text-gray-900 text-base line-clamp-1">{event.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{event.description}</p>
                      
                      <div className="flex flex-col gap-1 text-[11px] font-semibold text-gray-400">
                        {event.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-teal-500" />
                            {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        )}
                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-rose-500" />
                            {event.venue}
                          </span>
                        )}
                      </div>

                      <div className="pt-2">
                        {registeringFor === event.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="flex-1 text-center py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setRegisteringFor(null)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRegisteringFor(event.id)}
                            className="w-full text-center py-2 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 hover:border-teal-300 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.02]"
                          >
                            Register for Event
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Award className="h-5 w-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
            </div>
            {achievements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                No achievements listed yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((ach) => (
                  <div key={ach.id} className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm flex gap-3 hover:shadow-md hover:border-amber-300 transition-all duration-300">
                    {ach.image_url && (
                      <img
                        src={ach.image_url}
                        alt={ach.title}
                        className="h-16 w-16 object-cover rounded-xl border border-gray-100 shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-gray-900 text-sm leading-snug">{ach.title}</h3>
                      <p className="text-xs text-gray-500 leading-normal line-clamp-2">{ach.description}</p>
                      {ach.date && (
                        <p className="text-[10px] text-gray-400 font-semibold pt-1">
                          {new Date(ach.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Gallery Grid */}
          {galleryImages.length > 0 && (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
                Photo Gallery
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative h-28 sm:h-32 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Call-To-Action (Join Button) */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-extrabold text-gray-900 text-lg">Interested in joining {club.name}?</h3>
              <p className="text-xs text-gray-500">
                {isRecruitmentOpen 
                  ? "Recruitment is currently active! Choose a position and apply." 
                  : "Recruitment is closed. Connect with the team via email or hotlines."}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end">
              {isRecruitmentOpen ? (
                <button
                  onClick={handleJoinClick}
                  className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 font-bold shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Join Club
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-end">
                  <button
                    disabled
                    className="w-full sm:w-auto text-center bg-gray-100 text-gray-400 rounded-xl px-6 py-3 font-bold border border-gray-200 cursor-not-allowed"
                  >
                    Recruitment Closed
                  </button>
                  <div className="text-xs text-gray-500 text-center sm:text-left leading-tight shrink-0">
                    <span className="font-bold text-gray-700 block">Contact Info:</span>
                    {club.clubEmail || club.presidentEmail || "N/A"}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Application Form Modal */}
      {applyingTo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
          onClick={() => setApplyingTo(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Application Form</h3>
                <p className="text-sm text-gray-500">
                  Applying for "{openings.find((o) => o.id === applyingTo)?.title || 'Opening'}"
                </p>
              </div>
              <button
                onClick={() => setApplyingTo(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApply(applyingTo);
              }}
              className="p-5 space-y-4 overflow-y-auto max-h-[70vh]"
            >
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.fullName ? 'border-rose-500' : 'border-gray-300'
                  } px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  required
                />
                {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.rollNumber ? 'border-rose-500' : 'border-gray-300'
                  } px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  required
                />
                {errors.rollNumber && <p className="text-xs text-rose-500 mt-1">{errors.rollNumber}</p>}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={studentYear}
                  onChange={(e) => setStudentYear(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.studentYear ? 'border-rose-500' : 'border-gray-300'
                  } px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white transition-all`}
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
                {errors.studentYear && <p className="text-xs text-rose-500 mt-1">{errors.studentYear}</p>}
              </div>

              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <select
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.departmentName ? 'border-rose-500' : 'border-gray-300'
                  } px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white transition-all`}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Other">Other</option>
                </select>
                {errors.departmentName && <p className="text-xs text-rose-500 mt-1">{errors.departmentName}</p>}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  maxLength={10}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className={`w-full rounded-lg border ${
                    errors.contactNumber ? 'border-rose-500' : 'border-gray-300'
                  } px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all`}
                  required
                />
                {errors.contactNumber && <p className="text-xs text-rose-500 mt-1">{errors.contactNumber}</p>}
              </div>

              {/* Cover Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Note (Optional)</label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Tell the club why you'd be a great fit..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setApplyingTo(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
