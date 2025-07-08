import React, { useEffect, useRef, useState } from 'react';
import { BrainCircuit, Mic, Video, CheckCircle, XCircle, Info, Lightbulb, Globe, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InterviewSystemCheck() {
  const [micAllowed, setMicAllowed] = useState<null | boolean>(null);
  const [camAllowed, setCamAllowed] = useState<null | boolean>(null);
  const [micError, setMicError] = useState('');
  const [camError, setCamError] = useState('');
  const [isChrome, setIsChrome] = useState<null | boolean>(null);
  const [browserError, setBrowserError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyValid, setApiKeyValid] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  // Check browser type
  const checkBrowser = () => {
    const userAgent = navigator.userAgent;
    const isChromeBrowser = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
    
    if (isChromeBrowser) {
      setIsChrome(true);
    } else {
      setIsChrome(false);
      setBrowserError('Please use Google Chrome browser for the best experience.');
    }
  };

  useEffect(() => {
    // Check browser first
    checkBrowser();
    
    // Check microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setMicAllowed(true))
      .catch(() => {
        setMicAllowed(false);
        setMicError('Microphone access denied or not found.');
      });
    // Check webcam
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        setCamAllowed(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        setCamAllowed(false);
        setCamError('Webcam access denied or not found.');
      });
    // Cleanup video stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let audioStream: MediaStream | null = null;
    if (micAllowed === null) return;
    if (micAllowed === false) return;
    // Start audio waveform
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      audioStream = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      function draw() {
        analyser.getByteTimeDomainData(dataArray);
        setAudioData(new Uint8Array(dataArray));
        animationRef.current = requestAnimationFrame(draw);
      }
      draw();
    });
    return () => {
      if (audioStream) audioStream.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [micAllowed]);

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#38bdf8'; // sky-400
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Heartbeat style: use amplitude to create sharp peaks
    const sliceWidth = canvas.width / audioData.length;
    let x = 0;
    for (let i = 0; i < audioData.length; i++) {
      // Normalize and exaggerate for heart pulse effect
      const v = (audioData[i] - 128) / 128;
      // Heartbeat: sharp peak at center, smooth elsewhere
      let y = canvas.height / 2;
      if (Math.abs(v) > 0.2) {
        // Create a sharp peak for strong audio
        y -= v * canvas.height * 0.45 * (Math.abs(v) > 0.7 ? 1.5 : 1);
      } else {
        // Smooth baseline
        y -= v * canvas.height * 0.15;
      }
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
  }, [audioData]);

  useEffect(() => {
    // Restore API key from sessionStorage if present
    const stored = sessionStorage.getItem('geminiApiKey');
    if (stored) {
      setApiKey(stored);
      setApiKeyValid(true);
    }
  }, []);

  const validateApiKey = async () => {
    setApiKeyError('');
    setApiKeyValid(false);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'hello' }]
            }
          ]
        })
      });
      if (res.ok) {
        setApiKeyValid(true);
        sessionStorage.setItem('geminiApiKey', apiKey);
      } else {
        let errMsg = 'Invalid Gemini API key. Please enter a valid key.';
        try {
          const err = await res.json();
          if (err.error && err.error.message) {
            errMsg = err.error.message;
          }
        } catch {}
        setApiKeyError(errMsg);
      }
    } catch (e) {
      setApiKeyError('Network or CORS error. If this persists, your browser may not be allowed to call Gemini API directly.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-x-hidden">
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
          <span className="ml-4 text-lg text-sky-300 font-semibold">System Check</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 glass-effect rounded-3xl p-10 shadow-2xl animate-fade-in">
          {/* Left: Video & Mic Check */}
          <div className="flex flex-col items-center gap-8 justify-center">
            <div className="w-full flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <Video className="w-7 h-7 text-sky-400 animate-pulse-glow" />
                <span className="text-lg font-bold text-white">Webcam Check</span>
                {camAllowed === true && <CheckCircle className="w-5 h-5 text-green-400 animate-fade-in" />}
                {camAllowed === false && <XCircle className="w-5 h-5 text-red-400 animate-fade-in" />}
              </div>
              <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg bg-black/40 w-64 h-40 flex items-center justify-center">
                {camAllowed === true ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="text-sky-200 text-center px-4">{camError || 'Checking webcam...'}</div>
                )}
              </div>
            </div>
            <div className="w-full flex flex-col items-center gap-4 mt-8">
              <div className="flex items-center gap-3">
                <Mic className="w-7 h-7 text-violet-400 animate-pulse-glow" />
                <span className="text-lg font-bold text-white">Microphone Check</span>
                {micAllowed === true && <CheckCircle className="w-5 h-5 text-green-400 animate-fade-in" />}
                {micAllowed === false && <XCircle className="w-5 h-5 text-red-400 animate-fade-in" />}
              </div>
              <div className="rounded-2xl border-2 border-white/10 bg-black/40 w-64 h-14 flex flex-col items-center justify-center relative">
                {micAllowed === true ? (
                  <>
                    <span className="text-green-400 font-semibold">Microphone is working!</span>
                    <canvas ref={canvasRef} width={220} height={30} className="absolute left-0 bottom-0 w-full h-7" style={{ pointerEvents: 'none' }} />
                  </>
                ) : (
                  <span className="text-sky-200">{micError || 'Checking microphone...'}</span>
                )}
              </div>
            </div>
            {/* Browser Check */}
            <div className="w-full flex flex-col items-center gap-4 mt-8">
              <div className="flex items-center gap-3">
                <Globe className="w-7 h-7 text-orange-400 animate-pulse-glow" />
                <span className="text-lg font-bold text-white">Browser Check</span>
                {isChrome === true && <CheckCircle className="w-5 h-5 text-green-400 animate-fade-in" />}
                {isChrome === false && <XCircle className="w-5 h-5 text-red-400 animate-fade-in" />}
              </div>
              <div className="rounded-2xl border-2 border-white/10 bg-black/40 w-64 h-14 flex flex-col items-center justify-center">
                {isChrome === true ? (
                  <span className="text-green-400 font-semibold">Chrome browser detected!</span>
                ) : isChrome === false ? (
                  <span className="text-red-400 text-center px-2">{browserError}</span>
                ) : (
                  <span className="text-sky-200">Checking browser...</span>
                )}
              </div>
            </div>
          </div>
          {/* Right: Instructions & Tips */}
          <div className="flex flex-col gap-8 justify-between h-full">
            <div className="rounded-2xl bg-black/40 border border-white/10 p-6 mb-2 shadow-lg animate-fade-in flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-6 h-6 text-sky-400 animate-pulse-glow" />
                <span className="text-xl font-bold gradient-text">Instructions</span>
              </div>
              <ul className="text-sky-100 text-left list-disc list-inside space-y-1">
                <li>Ensure your face is clearly visible in the webcam preview.</li>
                <li>Speak into your microphone and check for the green status.</li>
                <li>Use Google Chrome browser only for optimal compatibility.</li>
                <li>Allow browser permissions for both camera and microphone.</li>
                <li>Use a quiet, well-lit environment for best results.</li>
                <li>Speak clearly and slowly for better voice recognition.</li>
                <li>Generate your own Gemini API Key</li> 
                
                <li>Click "Start Live Session" when all checks are successful.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-black/40 border border-white/10 p-6 shadow-lg animate-fade-in flex flex-col gap-3 mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-6 h-6 text-amber-400 animate-pulse-glow" />
                <span className="text-xl font-bold gradient-text">Tips</span>
              </div>
              <ul className="text-amber-100 text-left list-disc list-inside space-y-1">
                <li>Use headphones to reduce echo and background noise.</li>
                <li>Position your camera at eye level for a natural look.</li>
                <li>Test your setup before starting the interview.</li>
                <li>Close unnecessary apps to improve performance.</li>
                <li>Stay calm and confident—you're ready!</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Gemini API Key Input - moved here above the Start Live Session button */}
        <div className="w-full max-w-md mx-auto mt-8 bg-black/40 rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2 w-full">
            <label className="text-white font-semibold" htmlFor="gemini-api-key">Gemini API Key</label>
            <button
              onClick={() => setShowApiKeyHelp(true)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              title="How to get Gemini API Key"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
            </button>
          </div>
          <input
            id="gemini-api-key"
            type="password"
            className="w-full px-4 py-2 rounded-lg bg-gray-900/80 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400 mb-2"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setApiKeyValid(false); setApiKeyError(''); }}
            autoComplete="off"
          />
          <button
            className="w-full mt-2 px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-md transition-all duration-300 focus:outline-none hover:scale-105 hover:shadow-purple-500/40"
            onClick={validateApiKey}
            type="button"
            disabled={!apiKey}
          >
            Validate Key
          </button>
          {apiKey && !apiKeyValid && !apiKeyError && (
            <div className="text-yellow-300 text-sm mt-2 text-left w-full">
              Please wait up to 10 seconds after clicking "Validate Key" for the result.
            </div>
          )}
          {apiKeyError && <div className="text-red-400 text-sm mt-2 text-left w-full">{apiKeyError}</div>}
          {apiKeyValid && <div className="text-green-400 text-sm mt-2 text-left w-full">Key validated!</div>}
        </div>
        <button
          type="button"
          className="mt-8 px-10 py-4 rounded-2xl font-bold text-white text-xl bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-xl transition-all duration-300 focus:outline-none ring-2 ring-purple-400/40 ring-offset-2 hover:scale-105 hover:shadow-purple-500/60 animate-pulse-glow"
          onClick={() => navigate('/livesession')}
          disabled={!apiKeyValid || isChrome === false || camAllowed !== true || micAllowed !== true}
        >
          Start Live Session
        </button>
      </main>
      {/* API Key Help Modal */}
      {showApiKeyHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900/90 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-sky-500/20 rounded-full">
                <HelpCircle className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">How to Get Your Gemini API Key</h2>
            </div>
            <div className="text-white space-y-6">
              <div className="bg-gradient-to-r from-sky-900/30 to-blue-900/30 rounded-xl p-6 border border-sky-500/30">
                <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center gap-2">
                  <span className="bg-sky-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  Go to Google AI Studio
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-300">Visit: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline">https://aistudio.google.com/apikey</a></p>
                  <p className="text-gray-300">Sign in with your Google account</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-900/30 to-violet-900/30 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  Create API Key
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-300">Click "Create API key"</p>
                  <p className="text-gray-300">Then click "Create API key for new project"</p>
                  <p className="text-gray-300">Your API key will be displayed (starts with "AIza...")</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  Copy the Key
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-300">Click the copy button next to your API key</p>
                  <p className="text-gray-300">Paste it in the input field above</p>
                  <p className="text-gray-300">Click "Validate Key" to test it</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-xl p-6 border border-amber-500/30">
                <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Important Notes
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li>• The API key is free and includes 15 requests per minute</li>
                  <li>• No credit card required for the free tier</li>
                  <li>• Keep your API key secure and don't share it</li>
                  <li>• The key is stored locally in your browser for convenience</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all duration-300 focus:outline-none"
                onClick={() => setShowApiKeyHelp(false)}
              >
                Got it!
              </button>
            </div>
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" 
              onClick={() => setShowApiKeyHelp(false)} 
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 