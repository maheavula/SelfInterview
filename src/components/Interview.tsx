import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, UploadCloud, FileText, User, Briefcase, Building2, Layers, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sanitizeText, validateAndSanitize, useInputSanitization } from '../utils/sanitization';

const experienceOptions = [
  'Fresher',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'None'
];
const interviewTypes = ['Technical', 'HR', 'Managerial', 'None'];

export default function Interview() {
  const [form, setForm] = useState({
    name: '',
    jobRole: '',
    company: '',
    experience: '',
    interviewType: '',
    jobDescription: '',
    resumeText: '',
  });
  const [resumeName, setResumeName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { sanitizeInput, validateInput } = useInputSanitization();

  useEffect(() => {
    // Load form data from sessionStorage if available
    const saved = sessionStorage.getItem('interviewForm');
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Save form data to sessionStorage on change
    sessionStorage.setItem('interviewForm', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    // On unmount, clear form data only if not navigating to system-check
    return () => {
      const nextPath = window.location.pathname;
      if (!nextPath.includes('/system-check')) {
        sessionStorage.removeItem('interviewForm');
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input based on field type
    let sanitizedValue = value;
    
    switch (name) {
      case 'name':
      case 'jobRole':
      case 'company':
        // Sanitize text inputs
        sanitizedValue = sanitizeInput(value, 'text');
        break;
      case 'jobDescription':
      case 'resumeText':
        // Sanitize textarea inputs (remove HTML tags)
        sanitizedValue = sanitizeText(value);
        break;
      case 'experience':
      case 'interviewType':
        // For select fields, validate against allowed options
        const allowedOptions = name === 'experience' ? experienceOptions : interviewTypes;
        if (!allowedOptions.includes(value)) {
          sanitizedValue = '';
        }
        break;
      default:
        // Default sanitization for unknown fields
        sanitizedValue = sanitizeInput(value, 'text');
    }
    
    setForm(f => ({ ...f, [name]: sanitizedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and sanitize all form data before submission
    const validationResults = {
      name: validateInput(form.name, { type: 'text', required: true, maxLength: 100 }),
      jobRole: validateInput(form.jobRole, { type: 'text', required: true, maxLength: 100 }),
      company: validateInput(form.company, { type: 'text', required: false, maxLength: 100 }),
      jobDescription: validateInput(form.jobDescription, { type: 'textarea', required: false, maxLength: 8000 }),
      resumeText: validateInput(form.resumeText, { type: 'textarea', required: true, maxLength: 10000 })
    };
    
    // Check for validation errors
    const errors = Object.entries(validationResults)
      .filter(([_, result]) => !result.isValid)
      .map(([field, result]) => `${field}: ${result.error}`)
      .join(', ');
    
    if (errors) {
      setError(`Please fix the following errors: ${errors}`);
      return;
    }
    
    // Check if resume is uploaded
    if (!form.resumeText.trim()) {
      setError('Please paste your resume text before proceeding.');
      return;
    }
    
    // All validation passed, proceed to next step
    navigate('/system-check');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-x-hidden">
      {/* Futuristic mesh grid background */}
      <div className="mesh-grid absolute inset-0 opacity-20 pointer-events-none z-0"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-float z-0"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-float-slow z-0"></div>
      <header className="relative z-10 w-full py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-violet-500 animate-pulse-glow" />
          <span className="text-2xl font-bold">
            <span className="text-white">self</span>
            <span className="gradient-text">interview</span>
            <span className="text-xs align-top ml-1 text-violet-500">AI+</span>
          </span>
          <span className="ml-4 text-lg text-sky-300 font-semibold">Interview</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full">
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto glass-effect rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6 gradient-text drop-shadow-lg">Prepare for Your Interview</h1>
          
          {/* Error Display */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <div className="w-full flex flex-col gap-5">
            {/* Name */}
            <div className="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
              <User className="w-5 h-5 text-indigo-400" />
              <input
                type="text"
                name="name"
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            {/* Job Role */}
            <div className="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
              <Briefcase className="w-5 h-5 text-sky-400" />
              <input
                type="text"
                name="jobRole"
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg"
                placeholder="Any job role"
                value={form.jobRole}
                onChange={handleChange}
                required
              />
            </div>
            {/* Company (optional) */}
            <div className="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
              <Building2 className="w-5 h-5 text-purple-400" />
              <input
                type="text"
                name="company"
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-lg"
                placeholder="Company (optional)"
                value={form.company}
                onChange={handleChange}
              />
            </div>
            {/* Experience Level */}
            <div className="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
              <Layers className="w-5 h-5 text-violet-400" />
              <select
                name="experience"
                className="flex-1 bg-gray-900/80 outline-none text-white placeholder-gray-400 text-lg rounded-lg border-none focus:ring-2 focus:ring-sky-400"
                value={form.experience}
                onChange={handleChange}
                required
              >
                <option value="">Experience Level</option>
                {experienceOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {/* Type of Interview */}
            <div className="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
              <ClipboardList className="w-5 h-5 text-sky-300" />
              <select
                name="interviewType"
                className="flex-1 bg-gray-900/80 outline-none text-white placeholder-gray-400 text-lg rounded-lg border-none focus:ring-2 focus:ring-sky-400"
                value={form.interviewType}
                onChange={handleChange}
                required
              >
                <option value="">Type of Interview</option>
                {interviewTypes.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {/* Job Description (optional) */}
            <div className="flex items-start gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
              <FileText className="w-5 h-5 text-indigo-300 mt-1" />
              <div className="flex-1">
                <textarea
                  name="jobDescription"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-lg resize-none min-h-[80px] max-h-40"
                  placeholder="Paste Job Description (max 1000 words, optional)"
                  value={form.jobDescription}
                  onChange={handleChange}
                  maxLength={8000} // ~1000 words
                />
                <div className="text-xs text-gray-400 mt-1">
                  {form.jobDescription.length}/8000 characters
                </div>
              </div>
            </div>
            {/* Resume Textarea */}
            <div className="flex items-start gap-3 bg-black/30 rounded-xl px-4 py-3 border border-white/10">
              <FileText className="w-5 h-5 text-indigo-300 mt-1" />
              <div className="flex-1">
                <textarea
                  name="resumeText"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400 text-lg resize-none min-h-[80px] max-h-40"
                  placeholder="Paste your resume content including objective section here (required)"
                  value={form.resumeText}
                  onChange={handleChange}
                  required
                />
                <div className="text-xs text-gray-400 mt-1">
                  {form.resumeText.length}/10000 characters
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="mt-8 px-10 py-4 rounded-2xl font-bold text-white text-xl bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-xl transition-all duration-300 focus:outline-none ring-2 ring-purple-400/40 ring-offset-2 hover:scale-105 hover:shadow-purple-500/60 animate-pulse-glow"
          >
            Next
          </button>
          <button
            type="button"
            className="mt-4 text-sky-300 hover:underline text-base"
            onClick={() => {
              sessionStorage.removeItem('interviewForm');
              setForm({
                name: '',
                jobRole: '',
                company: '',
                experience: '',
                interviewType: '',
                jobDescription: '',
                resumeText: '',
              });
              setResumeName('');
              setError('');
              navigate('/dashboard');
            }}
          >
            ← Back to Dashboard
          </button>
        </form>
      </main>
    </div>
  );
} 