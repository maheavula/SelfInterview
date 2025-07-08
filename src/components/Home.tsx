import React, { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { BrainCircuit, User, Pencil, LayoutGrid } from 'lucide-react';
import { Footer } from './Footer';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const { user, logout } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<{
    fullName: string;
    graduation: string;
    year: string;
    phone: string;
    experience: string;
    role: string;
  }>({
    fullName: '',
    graduation: '',
    year: '',
    phone: '',
    experience: '',
    role: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const email = user?.email || '';

  // Modal close on outside click
  const modalRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Fetch profile from Firestore when modal opens
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (profileOpen && user?.uid) {
        setLoadingProfile(true);
        setEditMode(false);
        setError('');
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              fullName: data.fullName || '',
              graduation: data.graduation || '',
              year: data.year || '',
              phone: data.phone || '',
              experience: data.experience || '',
              role: data.role || '',
            });
          } else {
            setProfile({ fullName: '', graduation: '', year: '', phone: '', experience: '', role: '' });
            setEditMode(true); // If no profile, go straight to edit mode
          }
        } catch (err) {
          setError('Failed to load profile.');
        } finally {
          setLoadingProfile(false);
        }
      }
    };
    if (profileOpen) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileOpen, user?.uid]);

  // On initial page load, fetch profile to set isProfileComplete for AI instruction
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        setLoadingProfile(true);
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              fullName: data.fullName || '',
              graduation: data.graduation || '',
              year: data.year || '',
              phone: data.phone || '',
              experience: data.experience || '',
              role: data.role || '',
            });
          }
        } catch (err) {
          // ignore
        } finally {
          setLoadingProfile(false);
        }
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Save handler
  const handleProfileSave = async () => {
    setError('');
    // Validation
    if (!profile.fullName || !profile.graduation || !profile.year || !profile.phone || !profile.experience || !profile.role) {
      setError('Please fill in all fields.');
      return;
    }
    if (!user?.uid) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        email: user.email || '',
        updatedAt: new Date().toISOString(),
      });
      setEditMode(false);
    } catch (err) {
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
      await logout();
    navigate('/');
  };

  // Helper to check if profile is filled
  const isProfileComplete = Object.values(profile).every(v => typeof v === 'string' ? v.trim() !== '' : true);

  // Handler for Get Started
  const handleGetStarted = () => {
    if (isProfileComplete) {
      navigate('/interview');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-x-hidden">
      {/* Mesh grid and floating blobs background */}
      <div className="mesh-grid absolute inset-0 opacity-20 pointer-events-none z-0"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-float z-0"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-float-slow z-0"></div>

      {/* Header */}
      <header className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center select-none">
              <BrainCircuit className="h-8 w-8 text-violet-500 animate-pulse-glow" />
              <span className="ml-2 text-2xl font-bold">
                <span className="text-white">self</span>
                <span className="gradient-text">interview</span>
                <span className="text-xs align-top ml-1 text-violet-500">AI+</span>
              </span>
            </div>
            {/* Separate Profile and Logout buttons */}
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white font-semibold shadow focus:outline-none"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutGrid className="w-5 h-5" />
                Dashboard
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white font-semibold shadow focus:outline-none"
                onClick={() => setProfileOpen(true)}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white font-semibold shadow focus:outline-none"
                onClick={handleLogout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full">
        {/* Unique Welcome Banner */}
        <motion.section
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-2xl mx-auto relative mb-12"
        >
          {/* Animated gradient border */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-gray-800 via-gray-900 to-gray-950 blur-lg opacity-60 animate-gradient-shift z-0"></div>
          <div className="relative rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl z-10 overflow-hidden bg-black/60 backdrop-blur-md border border-white/10">
            {/* Floating sparkles */}
            <div className="absolute top-4 left-8 animate-float-slow text-violet-400 opacity-70 text-2xl">✨</div>
            <div className="absolute bottom-6 right-8 animate-float text-sky-400 opacity-70 text-2xl">🌟</div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 via-sky-400 to-purple-500 flex items-center justify-center shadow-xl border-4 border-white/20 mb-4"
            >
              <span className="text-6xl animate-bounce">🤖</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 gradient-text drop-shadow-lg">
              Welcome, {firstName}!
            </h1>
            <p className="text-lg text-sky-100 mb-4 font-medium">
              "Every answer you give is a step closer to your dream job. Let's make today count!"
            </p>
            <span className="inline-block text-violet-300 font-semibold text-base mt-2">Your AI coach is ready to help you shine ✨</span>
          </div>
        </motion.section>

        {/* Unique Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full max-w-3xl mx-auto rounded-3xl p-12 flex flex-col items-center text-center shadow-2xl mb-12 relative overflow-hidden bg-gray-900/70 backdrop-blur-md border border-white/10"
        >
          {/* Extra floating icons */}
          <div className="absolute top-6 right-10 animate-float text-indigo-400 opacity-60 text-3xl">💡</div>
          <div className="absolute bottom-8 left-10 animate-float-slow text-purple-400 opacity-60 text-3xl">🚀</div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 gradient-text drop-shadow-lg">
            Unlock Your Interview Superpowers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-200 mb-8 font-medium">
            Get personalized, real-time feedback and boost your confidence with every session. Your journey to success starts here—let's make it unforgettable!
          </p>
          <motion.button
            whileHover={isProfileComplete ? { scale: 1.12, boxShadow: '0 0 32px 8px #a259ff, 0 0 16px 4px #6366f1' } : {}}
            whileTap={isProfileComplete ? { scale: 0.97 } : {}}
            className={`px-12 py-4 rounded-2xl font-bold text-white text-2xl bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-2xl transition-all duration-300 focus:outline-none ring-2 ring-purple-400/40 ring-offset-2 ${isProfileComplete ? 'hover:shadow-purple-500/60 animate-pulse-glow' : 'opacity-60 cursor-not-allowed'}`}
            onClick={handleGetStarted}
            disabled={!isProfileComplete}
            aria-disabled={!isProfileComplete}
          >
            Get Started
          </motion.button>
          {(!loadingProfile && !isProfileComplete) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-3 flex items-center justify-center gap-2"
            >
              <span className="text-lg md:text-xl animate-bounce bg-gradient-to-br from-indigo-500 via-sky-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg rounded-full p-1">🧠</span>
              <span className="px-3 py-1.5 rounded-xl font-medium text-sky-200 bg-black/60 border border-violet-500/30 shadow animate-pulse-glow text-xs md:text-sm flex items-center" style={{letterSpacing: '0.01em', minWidth: 0, maxWidth: 260}}>
                <span className="gradient-text font-bold mr-1">AI:</span>
                <span className="typewriter-small">
                  Kindly fill your profile
                </span>
              </span>
              <style>{`
                .typewriter-small {
                  display: inline-block;
                  overflow: hidden;
                  white-space: nowrap;
                  border-right: 2px solid #a259ff;
                  animation: typing-small 2.5s steps(60, end) 1, blink-small 1s step-end infinite;
                  max-width: 180px;
                }
                @keyframes typing-small {
                  from { width: 0 }
                  to { width: 100% }
                }
                @keyframes blink-small {
                  50% { border-color: transparent }
                }
              `}</style>
            </motion.div>
          )}
        </motion.section>

        {/* Profile Setup Modal */}
        {profileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div ref={modalRef} className="bg-gray-900/90 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative">
              <h2 className="text-2xl font-bold gradient-text mb-6 text-center">
                {editMode || (!profile.fullName && !profile.graduation && !profile.year && !profile.phone && !profile.experience && !profile.role)
                  ? 'Complete Your Profile'
                  : 'Profile Details'}
              </h2>
              {/* Edit button */}
              {!editMode && !loadingProfile && (
                <button className="absolute top-4 right-12 text-indigo-300 hover:text-white" onClick={() => setEditMode(true)} aria-label="Edit Profile">
                  <Pencil className="w-6 h-6" />
                </button>
              )}
              {error && (
                <div className="mb-4 text-center text-red-400 font-semibold">{error}</div>
              )}
              {loadingProfile ? (
                <div className="text-center text-gray-300 py-8">Loading...</div>
              ) : editMode ? (
                <form className="flex flex-col gap-4">
                  <input type="text" placeholder="Full Name" className="rounded-lg px-4 py-2 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
                  <input type="text" placeholder="Graduation (e.g. B.Tech, B.Sc)" className="rounded-lg px-4 py-2 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400" value={profile.graduation} onChange={e => setProfile(p => ({ ...p, graduation: e.target.value }))} />
                  <input type="text" placeholder="Year of Passing" className="rounded-lg px-4 py-2 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400" value={profile.year} onChange={e => setProfile(p => ({ ...p, year: e.target.value }))} />
                  <input type="email" placeholder="Email" className="rounded-lg px-4 py-2 bg-gray-800 text-gray-400 cursor-not-allowed" value={email} readOnly />
                  <input type="tel" placeholder="Phone Number" className="rounded-lg px-4 py-2 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                  <select className="rounded-lg px-4 py-2 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-sky-400" value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}>
                    <option value="">Experience Level</option>
                    <option value="Fresher">Fresher</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={`${i + 1} years`}>{i + 1} years</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Desired Job Role" className="rounded-lg px-4 py-2 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400" value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} />
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={handleProfileSave} disabled={saving} className="flex-1 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 focus:outline-none text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditMode(false)} className="flex-1 px-8 py-3 rounded-xl font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-all duration-300 focus:outline-none text-lg">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4 text-left text-white">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/10">
                    <span className="bg-gradient-to-br from-indigo-500 via-sky-400 to-purple-500 p-2 rounded-full"><User className="w-6 h-6 text-white" /></span>
                    <div>
                      <div className="text-lg font-bold">{profile.fullName}</div>
                      <div className="text-xs text-gray-400">{email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/60">
                      <span className="text-indigo-300 font-semibold"><svg className="w-5 h-5 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" /></svg></span>
                      <span className="text-sm"><span className="font-semibold text-gray-300">Graduation:</span> {profile.graduation}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/60">
                      <span className="text-purple-300 font-semibold"><svg className="w-5 h-5 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /></svg></span>
                      <span className="text-sm"><span className="font-semibold text-gray-300">Year of Passing:</span> {profile.year}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/60">
                      <span className="text-sky-300 font-semibold"><svg className="w-5 h-5 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 2a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2h8z" /></svg></span>
                      <span className="text-sm"><span className="font-semibold text-gray-300">Phone:</span> {profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/60">
                      <span className="text-violet-300 font-semibold"><svg className="w-5 h-5 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 014-4h0a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg></span>
                      <span className="text-sm"><span className="font-semibold text-gray-300">Experience:</span> {profile.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-800/60">
                      <span className="text-indigo-200 font-semibold"><svg className="w-5 h-5 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 01-8 0" /><path d="M12 3v4" /><path d="M12 17v4" /><path d="M4 12h16" /></svg></span>
                      <span className="text-sm"><span className="font-semibold text-gray-300">Desired Role:</span> {profile.role}</span>
                    </div>
                  </div>
                </div>
              )}
              <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setProfileOpen(false)} aria-label="Close">&times;</button>
            </div>
      </div>
        )}
      </main>

      {/* Footer (same as landing) */}
      <Footer />
    </div>
  );
} 