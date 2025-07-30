import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BrainCircuit, User, LayoutGrid, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { setDoc, doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import Feedback from './Feedback';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<{
    fullName: string;
    graduation: string;
    year: string;
    branch: string;
    experience: string;
    role: string;
  }>({
    fullName: '',
    graduation: '',
    year: '',
    branch: '',
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
              branch: data.branch || '',
              experience: data.experience || '',
              role: data.role || '',
            });
          } else {
            setProfile({ fullName: '', graduation: '', year: '', branch: '', experience: '', role: '' });
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
  }, [profileOpen, user?.uid]);

  // Save handler
  const handleProfileSave = async () => {
    setError('');
    if (!profile.fullName || !profile.graduation || !profile.year || !profile.branch || !profile.experience || !profile.role) {
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
  };

  // Delete interview history function
  const deleteInterviewHistory = async (item: any) => {
    if (!item.id) return;
    
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'interviewFeedbacks', item.id));
      // Remove from local state
      setInterviewHistory(prev => prev.filter(historyItem => historyItem.id !== item.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting interview history:', error);
      alert('Failed to delete interview history. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  // Interview history state
  const [interviewHistory, setInterviewHistory] = useState<Array<{
    id: string;
    feedback: any;
    interviewType: string;
    userInputs?: {
      name: string;
      jobRole: string;
      company: string;
      experience: string;
      interviewType: string;
      jobDescription: string;
      resumeText: string;
      email?: string;
    };
    timestamp: string;
    user: string | null;
  }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7;

  // Helper function to get interview type from various sources
  const getInterviewType = (item: any) => {
    // First try userInputs
    if (item.userInputs?.interviewType) {
      return item.userInputs.interviewType;
    }
    // Then try direct interviewType field
    if (item.interviewType) {
      return item.interviewType;
    }
    // Finally try to extract from feedback data if available
    if (item.feedback?.interviewType) {
      return item.feedback.interviewType;
    }
    return 'N/A';
  };

  // Ensure user email is set in sessionStorage for interview tracking
  React.useEffect(() => {
    if (user?.email) {
      sessionStorage.setItem('userEmail', user.email);
    }
  }, [user?.email]);

  // Check if user just completed an interview and should see feedback
  useEffect(() => {
    const shouldShowFeedback = sessionStorage.getItem('showFeedbackModal');
    if (shouldShowFeedback === 'true') {
      setShowFeedback(true);
      sessionStorage.removeItem('showFeedbackModal');
    }
  }, []);

  // Fetch interview history on mount
  React.useEffect(() => {
    const fetchHistory = async () => {
      if (!email) return;
      setLoadingHistory(true);
      try {
        // Fetch all feedbacks and filter by user email on client side
        // This handles both new feedbacks (with proper user field) and existing ones (with null user)
        const q = query(
          collection(db, 'interviewFeedbacks'),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const allData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Array<{
          id: string;
          feedback: any;
          interviewType: string;
          userInputs?: {
            name: string;
            jobRole: string;
            company: string;
            experience: string;
            interviewType: string;
            jobDescription: string;
            resumeText: string;
            email?: string;
          };
          timestamp: string;
          user: string | null;
        }>;
        
        console.log('Current user email:', email);
        console.log('All feedbacks from database:', allData);
        
        // Improved filtering logic - check for exact email match or null user
        const filteredData = allData.filter(item => {
          const userMatch = item.user === email;
          const nullUser = item.user === null;
          const userInputsMatch = item.userInputs?.email === email;
          
          // Also check if the user email is stored in sessionStorage for this session
          const sessionUserEmail = sessionStorage.getItem('userEmail');
          const sessionMatch = item.user === sessionUserEmail;
          
          console.log(`Item ${item.id}: user="${item.user}", userInputs.email="${item.userInputs?.email}", sessionEmail="${sessionUserEmail}", currentEmail="${email}", matches=${userMatch || nullUser || userInputsMatch || sessionMatch}`);
          
          return userMatch || nullUser || userInputsMatch || sessionMatch;
        });
        
        // If no user-specific data found, show all data as fallback (for debugging)
        if (filteredData.length === 0 && allData.length > 0) {
          console.log('No user-specific data found, showing all data as fallback');
          setInterviewHistory(allData);
          setCurrentPage(0);
          return;
        }
        
        // Deduplicate entries that might have been created within seconds of each other
        const deduplicatedData = filteredData.reduce((acc: any[], current: any) => {
          const existingIndex = acc.findIndex(item => 
            item.user === current.user && 
            item.timestamp === current.timestamp &&
            Math.abs(new Date(item.timestamp).getTime() - new Date(current.timestamp).getTime()) < 5000 // 5 seconds window
          );
          
          if (existingIndex === -1) {
            acc.push(current);
          } else {
            // Keep the one with more complete data
            const existing = acc[existingIndex];
            if (current.userInputs && !existing.userInputs) {
              acc[existingIndex] = current;
            }
          }
          return acc;
        }, []);
        
        console.log('Filtered feedbacks for user:', filteredData);
        console.log('Final deduplicated feedbacks:', deduplicatedData);
        setInterviewHistory(deduplicatedData);
        // Reset to first page when history changes
        setCurrentPage(0);
      } catch (err) {
        console.error('Failed to fetch interview history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [email]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-x-hidden">
      <div className="mesh-grid absolute inset-0 opacity-20 pointer-events-none z-0"></div>
      <header className="relative z-10 w-full py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-violet-500 animate-pulse-glow" />
            <span className="text-2xl font-bold">
              <span className="text-white">self</span>
              <span className="gradient-text">interview</span>
              <span className="text-xs align-top ml-1 text-violet-500">AI+</span>
            </span>
            <span className="ml-4 text-lg text-sky-300 font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
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
      </header>
      {/* Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div ref={modalRef} className="bg-gray-900/90 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative">
            <h2 className="text-2xl font-bold gradient-text mb-6 text-center">
              {editMode || (!profile.fullName && !profile.graduation && !profile.year && !profile.branch && !profile.experience && !profile.role)
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
                <input type="text" placeholder="Branch (e.g. CSE, ECE)" className="rounded-lg px-4 py-2 bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400" value={profile.branch} onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))} />
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
                    <span className="text-sm"><span className="font-semibold text-gray-300">Branch:</span> {profile.branch}</span>
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full">
        <div className="w-full max-w-2xl mx-auto glass-effect rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 gradient-text drop-shadow-lg">Welcome, {firstName}!</h1>
          <p className="text-lg text-sky-100 mb-6 font-medium">Here you can view your progress, stats, and manage your interview sessions.</p>
          {/* Interview History Table */}
          <div className="w-full mt-8">
            {/* Debug Section */}
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Debug Info</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Current User Email: {email}</div>
                <div>Session Email: {sessionStorage.getItem('userEmail')}</div>
                <div>Total History Items: {interviewHistory.length}</div>
                <div>Loading: {loadingHistory ? 'Yes' : 'No'}</div>
              </div>
              <button 
                onClick={() => {
                  console.log('Manual refresh triggered');
                  // Trigger fetchHistory again
                  const fetchHistory = async () => {
                    if (!email) return;
                    setLoadingHistory(true);
                    try {
                      const q = query(
                        collection(db, 'interviewFeedbacks'),
                        orderBy('timestamp', 'desc')
                      );
                      const querySnapshot = await getDocs(q);
                      const allData = querySnapshot.docs.map(doc => ({ 
                        id: doc.id, 
                        ...doc.data() 
                      })) as Array<{
                        id: string;
                        feedback: any;
                        interviewType: string;
                        userInputs?: {
                          name: string;
                          jobRole: string;
                          company: string;
                          experience: string;
                          interviewType: string;
                          jobDescription: string;
                          resumeText: string;
                          email?: string;
                        };
                        timestamp: string;
                        user: string | null;
                      }>;
                      console.log('Manual refresh - All data:', allData);
                      setInterviewHistory(allData);
                    } catch (err) {
                      console.error('Manual refresh failed:', err);
                    } finally {
                      setLoadingHistory(false);
                    }
                  };
                  fetchHistory();
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh History
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-4 text-left">Interview History</h2>
            {loadingHistory ? (
              <div className="text-center text-gray-400 py-8">Loading history...</div>
            ) : interviewHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <div className="text-lg mb-2">No interview history found.</div>
                <div className="text-sm">Complete your first mock interview to see feedback here!</div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl bg-black/40 border border-white/10">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-700 via-sky-700 to-purple-700 text-white">
                      <th className="px-4 py-3 font-semibold">#</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                      <th className="px-4 py-3 font-semibold">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {interviewHistory
                      .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                      .map((item, idx) => (
                      <tr key={item.id} className="border-b border-white/10 hover:bg-gray-800/40 transition">
                        <td className="px-4 py-3 text-gray-200">{currentPage * itemsPerPage + idx + 1}</td>
                        <td className="px-4 py-3 text-sky-300 font-medium">{getInterviewType(item)}</td>
                        <td className="px-4 py-3 text-gray-300">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</td>
                        <td className="px-4 py-3">
                          <button
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 text-white font-semibold shadow hover:scale-105 transition"
                            onClick={() => { 
                              setSelectedFeedback({ 
                                ...item.feedback, 
                                userInputs: item.userInputs 
                              }); 
                              setFeedbackModalOpen(true); 
                            }}
                          >
                            View Feedback
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300 hover:scale-110 shadow-lg"
                            onClick={() => handleDeleteClick(item)}
                            title="Delete this interview history"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                {interviewHistory.length > itemsPerPage && (
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-800/40 border-t border-white/10">
                    <div className="text-sm text-gray-300">
                      Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, interviewHistory.length)} of {interviewHistory.length} interviews
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <span className="text-sm text-gray-300 px-2">
                        {currentPage + 1} of {Math.ceil(interviewHistory.length / itemsPerPage)}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(interviewHistory.length / itemsPerPage) - 1, prev + 1))}
                        disabled={currentPage >= Math.ceil(interviewHistory.length / itemsPerPage) - 1}
                        className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Start Interview Button */}
          <button
            className="mt-10 px-10 py-4 rounded-2xl font-bold text-white text-xl bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-xl transition-all duration-300 focus:outline-none ring-2 ring-purple-400/40 ring-offset-2 hover:scale-105 hover:shadow-purple-500/60 animate-pulse-glow"
            onClick={() => navigate('/interview')}
          >
            Start Interview
          </button>
        </div>
      </main>
      {/* Feedback Modal */}
      {feedbackModalOpen && selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900/90 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-bold gradient-text mb-6 text-center">Interview Feedback</h2>
            <div className="text-left text-white space-y-6">
              {/* User Information */}
              {selectedFeedback.userInputs && (
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl p-6 border border-indigo-500/30">
                  <div className="font-semibold text-lg mb-4 text-indigo-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Interview Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedFeedback.userInputs.name && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Name:</span>
                        <span className="text-white">{selectedFeedback.userInputs.name}</span>
                      </div>
                    )}
                    {selectedFeedback.userInputs.jobRole && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Role:</span>
                        <span className="text-white">{selectedFeedback.userInputs.jobRole}</span>
                      </div>
                    )}
                    {selectedFeedback.userInputs.company && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Company:</span>
                        <span className="text-white">{selectedFeedback.userInputs.company}</span>
                      </div>
                    )}
                    {selectedFeedback.userInputs.experience && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Experience:</span>
                        <span className="text-white">{selectedFeedback.userInputs.experience}</span>
                      </div>
                    )}
                    {selectedFeedback.userInputs.interviewType && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-medium">Interview Type:</span>
                        <span className="text-sky-300 font-semibold">{selectedFeedback.userInputs.interviewType}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Overall Scores */}
              {(selectedFeedback.overallScore || selectedFeedback.communicationScore || selectedFeedback.technicalScore || selectedFeedback.logicalScore || selectedFeedback.behavioralScore) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {selectedFeedback.overallScore && (
                    <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl p-4 border border-indigo-500/30">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-300">{selectedFeedback.overallScore}/100</div>
                        <div className="text-sm text-gray-300">Overall Score</div>
                      </div>
                    </div>
                  )}
                  {selectedFeedback.communicationScore && (
                    <div className="bg-gradient-to-br from-sky-600/20 to-blue-600/20 rounded-xl p-4 border border-sky-500/30">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-sky-300">{selectedFeedback.communicationScore}/100</div>
                        <div className="text-sm text-gray-300">Communication</div>
                      </div>
                    </div>
                  )}
                  {/* Show appropriate score based on interview type */}
                  {(() => {
                    const interviewType = selectedFeedback.userInputs?.interviewType || selectedFeedback.interviewType || '';
                    const isHRorManagerial = interviewType.toLowerCase().includes('hr') || 
                                           interviewType.toLowerCase().includes('behavioral') || 
                                           interviewType.toLowerCase().includes('managerial');
                    
                    if (isHRorManagerial) {
                      // For HR/Behavioral/Managerial interviews, show logical & behavioral score
                      return selectedFeedback.logicalBehavioralScore && (
                        <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-xl p-4 border border-emerald-500/30">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-300">{selectedFeedback.logicalBehavioralScore}/100</div>
                            <div className="text-sm text-gray-300">Logical & Behavioral</div>
                          </div>
                        </div>
                      );
                    } else {
                      // For technical interviews, show technical score
                      return selectedFeedback.technicalScore && (
                        <div className="bg-gradient-to-br from-purple-600/20 to-violet-600/20 rounded-xl p-4 border border-purple-500/30">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-300">{selectedFeedback.technicalScore}/100</div>
                            <div className="text-sm text-gray-300">Technical</div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Interview Summary */}
              {selectedFeedback.interviewSummary && (
                <div>
                  <div className="font-semibold text-lg mb-3 text-sky-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Interview Summary
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 text-gray-200 leading-relaxed">{selectedFeedback.interviewSummary}</div>
                </div>
              )}

              {/* Individual Question Evaluations */}
              {selectedFeedback.questions && Array.isArray(selectedFeedback.questions) && (
                <div>
                  <div className="font-semibold text-lg mb-3 text-indigo-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Detailed Question Analysis
                  </div>
                  <div className="space-y-4">
                    {selectedFeedback.questions.map((q: any, i: number) => (
                      <div key={i} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50">
                        <div className="mb-3">
                          <div className="font-semibold text-purple-200 mb-2">Q{i + 1}: {q.question}</div>
                          <div className="text-gray-300 text-sm bg-gray-900/50 rounded p-2">
                            <span className="font-semibold text-gray-400">Your Answer:</span> {q.answer}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.communicationScore && (
                            <div className="bg-sky-900/30 rounded p-3 border border-sky-700/30">
                              <div className="text-sm text-sky-300 font-semibold mb-1">Communication Score: {q.communicationScore}/10</div>
                              {q.fluencyComment && (
                                <div className="text-xs text-gray-300">{q.fluencyComment}</div>
                              )}
                            </div>
                          )}
                          {q.technicalScore && (
                            <div className="bg-purple-900/30 rounded p-3 border border-purple-700/30">
                              <div className="text-sm text-purple-300 font-semibold mb-1">Technical Score: {q.technicalScore}/10</div>
                              {q.techComment && (
                                <div className="text-xs text-gray-300">{q.techComment}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Suggestions */}
              {selectedFeedback.overallSuggestions && Array.isArray(selectedFeedback.overallSuggestions) && selectedFeedback.overallSuggestions.length > 0 && (
                <div>
                  <div className="font-semibold text-lg mb-3 text-green-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Improvement Suggestions
                  </div>
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/30">
                    <ul className="space-y-2">
                      {selectedFeedback.overallSuggestions.map((suggestion: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-gray-200">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setFeedbackModalOpen(false)} aria-label="Close">&times;</button>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900/90 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Delete Interview History</h2>
            </div>
            <div className="text-white mb-6">
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete this interview history? This action cannot be undone.
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-1">Interview Type:</div>
                <div className="text-white font-medium">{getInterviewType(itemToDelete)}</div>
                <div className="text-sm text-gray-400 mb-1 mt-2">Date:</div>
                <div className="text-white font-medium">
                  {itemToDelete.timestamp ? new Date(itemToDelete.timestamp).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => deleteInterviewHistory(itemToDelete)}
                disabled={deleting}
              >
                {deleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-all duration-300 focus:outline-none"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" 
              onClick={() => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
              }} 
              aria-label="Close"
              disabled={deleting}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <Feedback onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
} 