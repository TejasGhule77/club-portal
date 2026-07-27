import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Building2,
  Shield,
  Home,
  Compass,
  Briefcase,
  CalendarDays,
  Settings,
  ClipboardList,
  UserCog,
  Linkedin,
  Github,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/clubs', label: 'Browse Clubs', icon: Compass },
  ];

  const ownerLinks = [
    { to: '/club-owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/club-owner/manage', label: 'Manage Club', icon: Settings },
    { to: '/club-owner/openings', label: 'Openings', icon: Briefcase },
    { to: '/club-owner/events', label: 'Events', icon: CalendarDays },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/pending-clubs', label: 'Pending Clubs', icon: ClipboardList },
    { to: '/admin/users', label: 'Users', icon: UserCog },
  ];

  let links: { to: string; label: string; icon: typeof Home }[] = [];
  if (profile?.role === 'student') links = studentLinks;
  else if (profile?.role === 'clubOwner') links = ownerLinks;
  else if (profile?.role === 'admin') links = adminLinks;

  const roleIcon =
    profile?.role === 'student' ? GraduationCap : profile?.role === 'clubOwner' ? Building2 : Shield;
  const RoleIcon = roleIcon;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-105">
              <img
                src={logoImg}
                alt="ClubPortal Logo"
                className="h-11 sm:h-12 w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
              <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:block">
                ClubPortal
              </span>
            </Link>

            {links.length > 0 && (
              <div className="hidden md:flex items-center gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive(link.to)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                  <RoleIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{profile.name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive(link.to)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {profile ? (
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 text-center hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white text-center hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/';
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
          
          {/* Left Column: Logo and Bio */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <img
                src={logoImg}
                alt="ClubPortal Logo"
                className="h-10 w-auto object-contain rounded bg-white p-0.5"
              />
              <span className="text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                ClubPortal
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A comprehensive student development and moderation network. Discover campus organizations, explore internships or student openings, and track recruitment outcomes effortlessly.
            </p>
          </div>

          {/* Middle Column: Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm hover:text-white hover:underline transition-all">
                  Home
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('explore-clubs-section')}
                  className="text-sm text-left hover:text-white hover:underline transition-all focus:outline-none"
                >
                  About
                </button>
              </li>
              <li>
                <Link to="/student/clubs" className="text-sm hover:text-white hover:underline transition-all">
                  Jobs
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('explore-clubs-section')}
                  className="text-sm text-left hover:text-white hover:underline transition-all focus:outline-none"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Right Column: Contact info & Socials */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Contact Information</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>tejasghule114@gmail.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>+91 7387929005</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-orange-400 shrink-0" />
                <span className="leading-tight">Rajarambapu Institute of Technology, Rajaramnagar</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="pt-3 flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/tejas-n-ghule/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:-translate-y-0.5 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://github.com/tejas-ghule"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-pink-600 hover:border-pink-600 hover:-translate-y-0.5 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            &copy; 2026 All Rights Reserved.
          </p>
          <p className="text-xs text-slate-500 font-medium text-center sm:text-right">
            Designed & Developed by{' '}
            <a
              href="https://www.linkedin.com/in/tejas-n-ghule/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 hover:underline transition-colors"
            >
              Tejas N. Ghule
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
