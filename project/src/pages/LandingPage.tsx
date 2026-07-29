import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { CATEGORIES, type Club, type ClubCategory } from '../lib/api';
import college1 from '../assets/college1.jpg';
import college2 from '../assets/college2.jpg';
import college3 from '../assets/college3.jpg';
import { CategoryBadge } from '../components/Badges';
import { LoadingScreen, EmptyState } from '../components/LoadingScreen';
import { toast } from 'react-hot-toast';
import {
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Calendar,
  Briefcase,
  Compass,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Send,
  Shield,
  Award
} from 'lucide-react';

// Animated counter component for the statistics section
function AnimatedCounter({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    if (end === 0) return;
    const totalTicks = 50;
    const increment = end / totalTicks;
    const stepTime = duration / totalTicks;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span className="font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight">{count}</span>;
}

export function LandingPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ClubCategory | 'all'>('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Contact form state
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const heroSlides = [
    {
      image: college1,
      tag: "Discover. Connect. Join.",
      title: "Your Gateway to Campus Communities",
      description: "Explore active student clubs, register for upcoming events, and find exciting recruitment opportunities in one unified portal."
    },
    {
      image: college2,
      tag: "Collaborate & Build",
      title: "Fostering Innovation and Skills",
      description: "Step into our tech hubs, code labs, and workshop groups. Turn theoretical learning into real-world student-led projects."
    },
    {
      image: college3,
      tag: "Learn & Grow",
      title: "Holistic Student Development",
      description: "Participate in leadership programs, cultural festivals, and sports chapters designed to enrich your academic journey."
    }
  ];

  useEffect(() => {
    async function fetchClubs() {
      try {
        const { data } = await api.get('/clubs?status=approved');
        setClubs(data as Club[]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchClubs();
  }, []);

  // Slide rotation logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const filtered = clubs.filter((club) => {
    const matchesSearch =
      !search ||
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || club.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Thank you for reaching out! Your message has been sent.");
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1200);
  };

  const scrollToClubs = () => {
    const element = document.getElementById('explore-clubs-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <section className="relative h-[620px] sm:h-[680px] bg-slate-950 overflow-hidden flex items-center">
        {/* Background Images Slideshow */}
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt="Campus Life"
              className="w-full h-full object-cover animate-slow-float origin-center"
            />
            {/* Gradient overlays to maintain high contrast for readable text */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-2xl text-left">
            
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 backdrop-blur-md px-4 py-1.5 text-xs sm:text-sm text-blue-300 mb-6 ring-1 ring-blue-500/30 animate-fade-in-down">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>{heroSlides[currentSlide].tag}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight transition-all duration-700 animate-fade-in-up">
              {heroSlides[currentSlide].title}
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl transition-all duration-700 delay-100 animate-fade-in-up">
              {heroSlides[currentSlide].description}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-4 animate-fade-in-up delay-200">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={scrollToClubs}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                Browse Clubs
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative -mt-10 z-20 max-w-5xl mx-auto px-4 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 divide-x divide-gray-100">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
                <Users className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600 shrink-0" />
                <AnimatedCounter end={clubs.length || 8} />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mt-2 uppercase tracking-wider">Active Clubs</p>
            </div>

            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
                <Briefcase className="h-5 w-5 sm:h-7 sm:w-7 text-emerald-600 shrink-0" />
                <AnimatedCounter end={120} />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mt-2 uppercase tracking-wider">Openings</p>
            </div>

            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
                <Calendar className="h-5 w-5 sm:h-7 sm:w-7 text-orange-600 shrink-0" />
                <AnimatedCounter end={75} />
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mt-2 uppercase tracking-wider">Events Held</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5" />
              <span>About ClubPortal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Integrating College Communities & Empowering Student Potential
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Welcome to our central hub for campus life. ClubPortal acts as a bridge between active, student-run organizations and the student body. We provide students the ability to learn, network, and grow beyond classroom instruction.
            </p>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
              Whether you want to lead technological projects, participate in athletic meets, organize cultural events, or apply for internal roles to gain corporate-like exposure, our platform simplifies exploration, applications, and updates under moderated institutional channels.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Official Approvals</h4>
                  <p className="text-xs text-gray-500">Every organization and posting is fully vetted by dedicated faculty advisors.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Skills & Portfolio</h4>
                  <p className="text-xs text-gray-500">Build real experiences, acquire certificates, and enrich your resume profile.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image display */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl transform rotate-3 scale-105 opacity-10 blur-lg" />
            <div className="relative border-4 border-white bg-white rounded-3xl shadow-xl overflow-hidden group">
              <img
                src={college3}
                alt="Beautiful College Campus walkway"
                className="w-full h-[320px] sm:h-[380px] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl text-white">
                <p className="text-xs text-blue-300 font-semibold tracking-wider uppercase mb-1">Our Environment</p>
                <h4 className="text-sm sm:text-base font-bold">Inspiring Academic Surroundings</h4>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-md px-3 py-1 uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            An Ecosystem Designed for Campus Success
          </h2>
          <p className="text-base sm:text-lg text-gray-500">
            A comprehensive workflow built exclusively for students, recruiters, and institution coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Centralized Directory</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              No more searching paper noticeboards. Get all official student club contacts, descriptions, and rosters in one list.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Easy Applications</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Submit your candidate applications, write answers to selection questions, and review application statuses online.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-100 transition-all text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Quick Event RSVPs</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              RSVP with a single tap, get details about time, venue, and eligibility criteria, and mark your personal calendar.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Faculty Moderated</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Security and standards guaranteed. Every posting, recruitment cycle, and club profile requires approval from faculty.
            </p>
          </div>
        </div>
      </section>

      {/* Clubs Grid Section */}
      <section id="explore-clubs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Explore Clubs</h2>
            <p className="text-sm text-gray-500 mt-1">Find campus teams that match your academic and co-curricular interests</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clubs..."
                className="rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none w-full sm:w-64 bg-white transition-all"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ClubCategory | 'all')}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white font-medium text-gray-700 transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingScreen />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No clubs found"
            message="Try adjusting your search query or selecting another category filter."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((club) => (
              <Link
                key={club.id}
                to={`/clubs/${club.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-50/50 relative overflow-hidden flex items-center justify-center shrink-0">
                  {club.logo_url ? (
                    <img 
                      src={club.logo_url} 
                      alt={club.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-blue-100 group-hover:scale-105 transition-transform duration-300">
                      <span className="text-2xl font-black text-blue-600">
                        {club.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {club.name}
                    </h3>
                    <div className="shrink-0">
                      <CategoryBadge category={club.category} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1">
                    {club.description || 'No description available.'}
                  </p>
                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-400 mt-auto">
                    <span className="flex items-center gap-1 font-medium">
                      <Award className="h-4 w-4 text-blue-500" />
                      Faculty: {club.faculty_advisor || 'TBD'}
                    </span>
                    <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                      View Profile <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Call To Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 sm:p-12 lg:p-16 text-center text-white">
          {/* Decorative glowing blobs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Shape Your College Experience?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 leading-relaxed">
              Sign up today to discover matching organizations, sign up for recruitment tests, and join team projects.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-semibold text-blue-900 shadow-md hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200"
              >
                Join as Student
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-transparent px-7 py-4 text-sm font-semibold text-white border border-white/30 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                Moderator Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-md px-3 py-1 uppercase tracking-wider">
                Reach Out
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">
                Get In Touch With Us
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Have questions regarding registration, creating a new club, or recruiting guidelines? Drop us a message.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Email Address</h4>
                
                  <p className="text-xs sm:text-sm text-gray-500">tejasghule114@gmail.com</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Phone Line</h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">+91 7387929005</p>
                  <p className="text-xs sm:text-sm text-gray-500">Mon - Fri, 9:00 AM - 5:00 PM</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Our Location</h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Rajarambapu Institute of Technology, Rajaramnagar</p>
                  <p className="text-xs sm:text-sm text-gray-500">Tal. Walwa, Dist. Sangli, Maharashtra, India (415414)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 sm:p-8 lg:p-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send A Message</h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Subject of query"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Type your message..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors cursor-pointer"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}
