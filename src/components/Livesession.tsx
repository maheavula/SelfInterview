import React, { useEffect, useState, useRef } from 'react';
import { BrainCircuit, Code2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";
import robotAnimation from "../assets/robot.json";
import meninterviewAnimation from "../assets/meninterview.json";
import childboyAnimation from "../assets/childboy.json";
import interviewerAnimation from "../assets/interviewer.json";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../hooks/useAuth';
import { API_ENDPOINTS } from '../config/api';

export default function Livesession() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string | null>(null);
  // Fetch interview type from sessionStorage (set in previous form)
  const [interviewType, setInterviewType] = useState('');
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [answerTimerStarted, setAnswerTimerStarted] = useState(false);
  const [answerTimeLeft, setAnswerTimeLeft] = useState(2 * 60); // 2 minutes in seconds
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camAllowed, setCamAllowed] = useState<null | boolean>(null);
  const [camError, setCamError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<any>(robotAnimation);

  // Session state: questions, answers, timer
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Add at the top with other useState imports
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Fullscreen functionality
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.log('Fullscreen request failed:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.log('Exit fullscreen failed:', error);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Auto-enter fullscreen when component mounts
  useEffect(() => {
    // Small delay to ensure component is fully loaded
    const timer = setTimeout(() => {
      enterFullscreen();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Randomly select animation for this session
  useEffect(() => {
    const animations = [
      robotAnimation,
      meninterviewAnimation,
      childboyAnimation,
      interviewerAnimation
    ];
    
    // Check if we already have a selected animation for this session
    const sessionAnimation = sessionStorage.getItem('sessionAnimation');
    
    if (sessionAnimation) {
      // Use the existing animation for this session
      const animationIndex = parseInt(sessionAnimation);
      setSelectedAnimation(animations[animationIndex]);
    } else {
      // Select a new random animation for this session
      const randomIndex = Math.floor(Math.random() * animations.length);
      sessionStorage.setItem('sessionAnimation', randomIndex.toString());
      setSelectedAnimation(animations[randomIndex]);
    }
  }, []);

  // Restore session state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('liveSessionState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.questions) setQuestions(parsed.questions);
        if (parsed.answers) setAnswers(parsed.answers);
        if (typeof parsed.currentQuestionIdx === 'number') setCurrentQuestionIdx(parsed.currentQuestionIdx);
      } catch (e: any) {}
    }
  }, []);

  // Persist session state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('liveSessionState', JSON.stringify({
      questions,
      answers,
      currentQuestionIdx
    }));
  }, [questions, answers, currentQuestionIdx]);

  const currentQuestion = questions[currentQuestionIdx] || '';

  const handleNextQuestion = () => {
    if (isAnswering) stopSTT();
    setCurrentQuestionIdx((prev) => (prev + 1) % questions.length);
    // Reset answer timer for next question
    setAnswerTimeLeft(2 * 60);
    setAnswerTimerStarted(false);
  };

  // Function to end session and clear all session data
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isProcessingFeedback, setIsProcessingFeedback] = useState(false);

  const handleEndSession = async () => {
    // Prevent duplicate submissions
    if (isProcessingFeedback || isSessionEnded) {
      console.log('Session already ended or feedback processing in progress');
      return;
    }

    setIsProcessingFeedback(true); // Set processing flag
    setIsSessionEnded(true);
    setIsFeedbackLoading(true);
    setTimerStarted(false); // stop timer
    setAnswerTimerStarted(false); // stop answer timer
    if (window.speechSynthesis) window.speechSynthesis.cancel(); // stop TTS
    sessionStorage.removeItem('liveSessionState');
    sessionStorage.removeItem('liveSessionTimeLeft');
    sessionStorage.removeItem('sessionAnimation'); // Clear animation for next session
    // Only include answered questions
    const answeredPairs = questions
      .map((q, i) => ({ question: q, answer: answers[i] }))
      .filter(pair => pair.answer && pair.answer.trim().length > 0);
    try {
      const feedback = await generateInterviewFeedback(
        answeredPairs.map(p => p.question),
        answeredPairs.map(p => p.answer)
      );
      setFeedbackData(feedback);
      setShowFeedback(true);
      setIsFeedbackLoading(false);
      // Save to Firestore
      await addDoc(collection(db, "interviewFeedbacks"), {
        feedback,
        interviewType: interviewType,
        // Get all user input data from sessionStorage
        userInputs: (() => {
          try {
            const formData = sessionStorage.getItem('interviewForm');
            return formData ? JSON.parse(formData) : {};
          } catch (e) {
            return {};
          }
        })(),
        timestamp: new Date().toISOString(),
        user: sessionStorage.getItem('userEmail') || user?.email || null // Ensure user email is set
      });
      console.log('Feedback saved successfully to Firestore');
    } catch (e: any) {
      console.error('Error generating or saving feedback:', e);
      setFeedbackData({ error: e.message || 'Failed to generate feedback.' });
      setShowFeedback(true);
      setIsFeedbackLoading(false);
    } finally {
      setIsProcessingFeedback(false); // Reset processing flag
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('interviewForm');
    if (saved) {
      try {
        const form = JSON.parse(saved);
        setInterviewType(form.interviewType || '');
      } catch (e: any) {}
    }
  }, []);

  // On mount, check for Gemini API key in sessionStorage
  useEffect(() => {
    const key = sessionStorage.getItem('geminiApiKey');
    if (!key) {
      navigate('/system-check', { replace: true });
    } else {
      setApiKey(key);
    }
  }, [navigate]);

  // On mount, restore timeLeft from sessionStorage if available
  useEffect(() => {
    const savedTime = sessionStorage.getItem('liveSessionTimeLeft');
    if (savedTime && !isNaN(Number(savedTime))) {
      setTimeLeft(Number(savedTime));
    }
  }, []);

  // Timer interval effect: decrement timeLeft every second
  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, timeLeft]);

  // Persist timeLeft to sessionStorage
  useEffect(() => {
    if (timerStarted) {
      sessionStorage.setItem('liveSessionTimeLeft', String(timeLeft));
    }
  }, [timerStarted, timeLeft]);

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Start timer only when the first question is displayed
  useEffect(() => {
    if (questions.length > 0 && currentQuestion && !timerStarted) {
      setTimerStarted(true);
    }
  }, [questions.length, currentQuestion, timerStarted]);

  // Answer timer effect - 2 minutes per question
  useEffect(() => {
    if (!answerTimerStarted) return;
    if (answerTimeLeft <= 0) {
      // Auto move to next question when timer expires
      handleNextQuestion();
      return;
    }
    const interval = setInterval(() => {
      setAnswerTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [answerTimerStarted, answerTimeLeft]);

  useEffect(() => {
    // Request webcam access
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
    // Cleanup video stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // On mount, check for Gemini API key in sessionStorage
  useEffect(() => {
    const key = sessionStorage.getItem('geminiApiKey');
    if (!key) {
      navigate('/system-check', { replace: true });
    } else {
      setApiKey(key);
    }
  }, [navigate]);

  // Helper to build the Gemini prompt
  interface InterviewUserData {
    interviewType: string;
    company: string;
    name: string;
    graduation: string;
    role: string;
    experience: string;
    jobDescription: string;
    resumeText: string;
    extraNote?: string;
  }

  function buildGeminiPrompt({ interviewType, company, name, graduation, role, experience, jobDescription, resumeText, extraNote }: InterviewUserData & { extraNote?: string }) {
    return `You are acting as a mock interviewer for a candidate preparing for an interview. The candidate's name is ${name}, and they are a ${graduation} graduate with ${experience} experience. They are applying for the role of ${role} at ${company}. The type of interview you are conducting is: ${interviewType}.

Please tailor your questions based on the interview type:

- If the interview type is Technical, greet the candidate by name and try to use their name at least four times throughout the session. Carefully analyze the resume content and job description provided. Ask the candidate a structured set of questions in the following order:
  1. One introductory question
  2. Two or three questions about experience (if experience is available)
  3. Three project-related questions: one simple, one moderately technical, and one that requires deeper thinking
  4. Up to seven questions based on the candidate's skills from their resume (medium difficulty)
  5. One or two situational or scenario-based questions
  6. Two questions related to the job description
  Resume Content: ${resumeText}
  Job Description: ${jobDescription}

- If the interview type is HR, do not refer to the resume or job description. Ask a total of around ten questions focusing on general HR topics such as self-introduction, strengths and weaknesses, teamwork, time management, handling pressure, conflict resolution, adaptability, career goals, and company fit.

- If the interview type is Behavioral, also ignore the resume and job description. Ask around ten situational or behavioral questions designed to evaluate soft skills and past experiences. Focus on real-world situations where the candidate demonstrated leadership, problem solving, adaptability, initiative, teamwork, or decision-making.

Important Instructions:
- Keep all questions within basic to medium difficulty only.
- Avoid complex case studies, algorithms, deep system design, or highly technical puzzles.
- Focus on real-world, resume-based, and role-relevant questions that freshers or junior professionals can reasonably answer.
- Make the questions sound like a calm, helpful, and curious human interviewer would ask — avoid robotic or scripted tone.
- Don't label the questions with difficulty or type.
- At the end, return only the list of interview questions, one per line, and nothing else. Do not include any extra explanation, headings, or notes.${extraNote ? '\n' + extraNote : ''}`;
  }

  // Function to build continuation questions prompt (no introductory questions)
  function buildContinuationPrompt({ interviewType, company, name, graduation, role, experience, jobDescription, resumeText }: InterviewUserData) {
    return `You are continuing a mock interview session. The candidate's name is ${name}, and they are a ${graduation} graduate with ${experience} experience. They are applying for the role of ${role} at ${company}. The type of interview is: ${interviewType}.

The candidate has already answered several questions and we need to continue with fresh questions. Please generate NEW questions that are different from typical introductory questions.

Please tailor your questions based on the interview type:

- If the interview type is Technical, focus on:
  * Advanced technical questions based on the candidate's skills from their resume
  * Project-specific questions that require deeper technical understanding
  * Scenario-based technical problems
  * Questions about specific technologies mentioned in their resume
  * Problem-solving questions related to their field
  Resume Content: ${resumeText}
  Job Description: ${jobDescription}

- If the interview type is HR, focus on:
  * Advanced behavioral scenarios
  * Leadership and management situations
  * Conflict resolution in complex scenarios
  * Career development and growth questions
  * Company culture and values alignment

- If the interview type is Behavioral, focus on:
  * Complex situational questions
  * Leadership challenges
  * Crisis management scenarios
  * Team dynamics in difficult situations
  * Innovation and creativity examples

Important Instructions:
- DO NOT include any introductory questions like "Hi", "Tell me about yourself", or basic introduction questions
- Focus on medium to advanced difficulty questions
- Make questions specific to the candidate's background and role
- Avoid repetition of common basic questions
- Keep questions relevant to the interview type
- Return only the list of questions, one per line, no explanations or formatting`;
  }

  // Function to call Gemini API and generate questions
  async function generateInterviewQuestions(userData: InterviewUserData) {
    const prompt = buildGeminiPrompt(userData);
    const userApiKey = sessionStorage.getItem('geminiApiKey');
    if (!userApiKey) {
      throw new Error('API key not found. Please configure your API key first.');
    }
    
    const res = await fetch(API_ENDPOINTS.GEMINI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        model: 'gemini-2.5-pro',
        userApiKey: userApiKey
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate questions');
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini API response:', text);
    // Try to extract questions from numbered/bulleted/dashed list
    let questions = text.split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => /^(\d+\.|[-•])\s?.+\?$/.test(l));
    console.log('Extracted numbered/bulleted questions:', questions);
    // Fallback: lines that end with a question mark and are not too short
    if (questions.length === 0) {
      questions = text.split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 10 && /\?$/.test(l));
      console.log('Fallback extracted questions:', questions);
    }
    // Final fallback: show the whole text
    return questions.length > 0 ? questions : [text];
  }

  // State for loading and error
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState('');

  // On mount, if no questions, call Gemini API to generate them
  useEffect(() => {
    if (!apiKey) return;
    if (questions.length > 0) return;
    // Gather user data from sessionStorage/interviewForm
    const formRaw = sessionStorage.getItem('interviewForm');
    if (!formRaw) return;
    let form;
    try { form = JSON.parse(formRaw); } catch (e: any) { return; }
    setLoadingQuestions(true);
    setQuestionError('');
    generateInterviewQuestions({
      interviewType: form.interviewType,
      company: form.company,
      name: form.name,
      graduation: form.graduation || '',
      role: form.jobRole,
      experience: form.experience,
      jobDescription: form.jobDescription,
      resumeText: form.resumeText || ''
    })
      .then(qs => setQuestions(qs))
      .catch(err => setQuestionError(err.message))
      .finally(() => setLoadingQuestions(false));
  }, [apiKey, questions.length]);

  // TTS: Speech-to-Text logic
  const [isAnswering, setIsAnswering] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Start STT
  const startSTT = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };
    recognition.onerror = (event: any) => {
      // Optionally handle errors
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsAnswering(true);
    // Start the 2-minute answer timer
    setAnswerTimerStarted(true);
  };

  // Stop STT
  const stopSTT = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsAnswering(false);
    // Stop the answer timer
    setAnswerTimerStarted(false);
    // Save transcript as answer
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentQuestionIdx] = transcript;
      return updated;
    });
    setTranscript('');
  };

  // Stop STT when question changes or on Next
  useEffect(() => {
    if (isAnswering) {
      stopSTT();
    }
    // Reset answer timer when question changes
    setAnswerTimeLeft(2 * 60);
    setAnswerTimerStarted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIdx]);

  useEffect(() => {
    if (timerStarted && timeLeft === 0) {
      handleEndSession();
    }
  }, [timerStarted, timeLeft]);

  // 1. Add state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 2. Update speakQuestion
  function speakQuestion(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = 'en-US';
    setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }

  useEffect(() => {
    if (currentQuestion) {
      speakQuestion(currentQuestion);
    }
    return () => window.speechSynthesis && window.speechSynthesis.cancel();
  }, [currentQuestion]);

  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (isSpeaking) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.stop();
    }
  }, [isSpeaking]);

  // Function to generate continuation questions (no introductory questions)
  async function generateContinuationQuestions(userData: InterviewUserData) {
    const prompt = buildContinuationPrompt(userData);
    const userApiKey = sessionStorage.getItem('geminiApiKey');
    if (!userApiKey) {
      throw new Error('API key not found. Please configure your API key first.');
    }
    
    const res = await fetch(API_ENDPOINTS.GEMINI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        model: 'gemini-2.5-pro',
        userApiKey: userApiKey
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate continuation questions');
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Continuation questions API response:', text);
    // Try to extract questions from numbered/bulleted/dashed list
    let questions = text.split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => /^(\d+\.|[-•])\s?.+\?$/.test(l));
    console.log('Extracted continuation questions:', questions);
    // Fallback: lines that end with a question mark and are not too short
    if (questions.length === 0) {
      questions = text.split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 10 && /\?$/.test(l));
      console.log('Fallback extracted continuation questions:', questions);
    }
    // Final fallback: show the whole text
    return questions.length > 0 ? questions : [text];
  }

  const handleGenerateMoreQuestions = async () => {
    setLoadingQuestions(true);
    setQuestionError('');
    const formRaw = sessionStorage.getItem('interviewForm');
    if (!formRaw || !apiKey) return;
    let form;
    try { form = JSON.parse(formRaw); } catch (e: any) { setLoadingQuestions(false); return; }
    
    try {
      const newQuestions = await generateContinuationQuestions({
        interviewType: form.interviewType,
        company: form.company,
        name: form.name,
        graduation: form.graduation || '',
        role: form.jobRole,
        experience: form.experience,
        jobDescription: form.jobDescription,
        resumeText: form.resumeText || ''
      });
      setQuestions(prev => [...prev, ...newQuestions]);
      console.log('Added continuation questions:', newQuestions);
    } catch (err: any) {
      setQuestionError(err.message || 'Failed to generate more questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  async function generateInterviewFeedback(questions: string[], answers: string[]) {
    const prompt = `
You are acting as an AI interview evaluator. The user has completed a mock interview session. During the session, the following data was collected:

- A series of interview questions presented to the candidate
- Transcribed answers spoken by the candidate in response to each question

Now, your task is to analyze and evaluate the interview session in detail. For each question-answer pair, provide a structured and clear evaluation based on the following metrics:

1. Individual Communication Score: (Scale of 1 to 10)
2. Individual Technical Score: (Scale of 1 to 10)
3. Fluency & Grammar Comments:
4. Technical Relevance Comment:

Do this for each individual question and response.

After you finish evaluating all question-answer pairs, also provide a final overall interview summary, including:

- Overall Score (Scale of 1 to 100)
- Overall Communication Score (0–100)
- Overall Technical Score (0–100)
- General feedback or suggestions to improve their overall performance (list all suggestions at the end, not per question).

Here is the data:
${questions.map((q, i) => `Q${i+1}: ${q}\nA${i+1}: ${answers[i] || ""}`).join('\n\n')}

Please return the full output as a valid JSON object structured like this:

{
  "overallScore": 85,
  "communicationScore": 88,
  "technicalScore": 82,
  "interviewSummary": "Short paragraph summary...",
  "overallSuggestions": ["...", "..."],
  "questions": [
    {
      "question": "Tell me about a project you worked on.",
      "answer": "User's full transcribed answer...",
      "communicationScore": 8,
      "technicalScore": 7,
      "fluencyComment": "Spoke fluently with a few hesitations.",
      "techComment": "Answered with basic understanding, could go deeper."
    }
  ]
}

IMPORTANT: Return ONLY the JSON object above. Do NOT add any extra text, explanation, markdown, or formatting. Do NOT use triple backticks. Do NOT add any text before or after the JSON. The response must be a valid JSON object only.`;
    
    const userApiKey = sessionStorage.getItem('geminiApiKey');
    if (!userApiKey) {
      throw new Error('API key not found. Please configure your API key first.');
    }
    
    const res = await fetch(API_ENDPOINTS.GEMINI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        model: 'gemini-2.5-pro',
        userApiKey: userApiKey
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate feedback');
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let feedbackJson = null;
    try {
      feedbackJson = JSON.parse(text);
    } catch (e: any) {
      // Try to extract JSON object from the text (even if there's extra text/markdown)
      const match = text.match(/{[\s\S]*}/);
      if (match) {
        try {
          feedbackJson = JSON.parse(match[0]);
        } catch (e: any) {
          throw new Error('Failed to parse feedback JSON');
        }
      } else {
        throw new Error('Failed to parse feedback JSON');
      }
    }
    return feedbackJson;
  }

  // Cleanup effect to reset processing flags on unmount
  useEffect(() => {
    return () => {
      setIsProcessingFeedback(false);
      setIsSessionEnded(false);
      setIsFeedbackLoading(false);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative overflow-x-hidden">
      <div className="mesh-grid absolute inset-0 opacity-20 pointer-events-none z-0"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl animate-float z-0"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-float-slow z-0"></div>
      <header className="relative z-10 w-full py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-violet-500 animate-pulse-glow" />
            <span className="text-2xl font-bold">
              <span className="text-white">self</span>
              <span className="gradient-text">interview</span>
              <span className="text-xs align-top ml-1 text-violet-500">AI+</span>
            </span>
          </div>
          <span className="ml-4 text-lg text-sky-300 font-semibold flex items-center gap-2">
            <div className="flex items-center gap-2">
              <svg className="w-3 h-3 animate-pulse" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="6" fill="#ef4444" />
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" opacity="0.3" className="animate-ping" />
              </svg>
              <span>Live Session</span>
            </div>
          </span>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-semibold shadow focus:outline-none ${
              isProcessingFeedback || isSessionEnded
                ? 'bg-gray-600/30 text-gray-400 cursor-not-allowed'
                : 'bg-red-100/20 hover:bg-red-200/30 text-red-400'
            }`}
            onClick={handleEndSession}
            disabled={isProcessingFeedback || isSessionEnded}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
            </svg>
            {isProcessingFeedback ? 'Processing...' : isSessionEnded ? 'Session Ended' : 'End Session'}
          </button>
        </div>
      </header>
      {/* Top Section: Interview Type & Timer */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center mt-2">
        <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 px-4">
          <div className="flex-1 flex items-center justify-center md:justify-start">
            <span className="text-base md:text-lg font-medium text-white bg-black/30 rounded-lg px-4 py-2 border border-white/10 shadow min-w-[160px] text-center">
              Interview Type: <span className="gradient-text font-semibold ml-1">{interviewType || 'N/A'}</span>
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center md:justify-end mt-2 md:mt-0">
            <span className="text-base md:text-lg font-semibold text-white bg-black/30 rounded-lg px-4 py-2 border border-white/10 shadow min-w-[100px] text-center">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </section>
      {/* Main Interview Layout */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center mt-6">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center justify-center px-4">
          {/* AI Animation Box */}
          <div className="flex-1 max-w-[390px] min-w-[280px] min-h-[287px] bg-white/90 rounded-3xl shadow-xl flex flex-col items-center justify-center p-0 relative overflow-hidden">
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="flex items-center justify-center mb-4" style={{ width: 800, height: 200 }}>
                <Lottie
                  lottieRef={lottieRef}
                  animationData={selectedAnimation}
                  loop={true}
                  autoplay={false}
                  style={{ width: 800, height: 347 }}
                />
              </div>
              
            </div>
          </div>
          {/* User Webcam Box */}
          <div className="flex-1 max-w-[380px] min-w-[280px] min-h-[260px] bg-white/90 rounded-3xl shadow-xl flex items-center justify-center p-0 relative overflow-hidden">
            {camAllowed === true ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-3xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-center px-4">
                {camError || 'Requesting camera access...'}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Question Box */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center mt-6">
        <div className="w-full max-w-4xl mx-auto bg-white/90 rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center justify-center">
          {loadingQuestions && <div className="text-lg text-gray-500 mb-4">Generating interview questions...</div>}
          {questionError && <div className="text-lg text-red-500 mb-4">{questionError}</div>}
          <div className="text-xl md:text-2xl font-semibold text-gray-800 text-center break-words whitespace-pre-line w-full">
            {currentQuestion}
          </div>
          <div className="w-full flex justify-center">
            <button
              className={`px-3 py-1 rounded-lg text-base font-semibold shadow-md transition-all duration-300 focus:outline-none ${
                isSessionEnded
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'text-white bg-gray-900/80 border border-white/10 hover:scale-105 hover:shadow-lg hover:bg-gray-800/90'
              }`}
              onClick={() => speakQuestion(currentQuestion)}
              type="button"
              disabled={isSessionEnded}
              style={{ marginTop: '15px' }}
            >
              Repeat Question
            </button>
          </div>
          {isAnswering && (
            <div className="w-full mt-4 p-4 bg-gray-100 rounded-xl text-gray-800 text-lg min-h-[48px]">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-500">Your Answer (live): </span>
                {answerTimerStarted && (
                  <span className={`text-lg font-bold ${answerTimeLeft <= 30 ? 'text-red-600' : 'text-blue-600'}`}>
                    Answer Time: {formatTime(answerTimeLeft)}
                  </span>
                )}
              </div>
              <div>{transcript}</div>
            </div>
          )}
        </div>
        {/* Action Buttons below the question box */}
        <div className="w-full max-w-4xl mx-auto flex flex-row justify-end gap-4 mt-2">
          {!isAnswering ? (
            <button
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 shadow-md transition-all duration-300 focus:outline-none hover:scale-105 hover:shadow-purple-500/40"
              onClick={startSTT}
              type="button"
              disabled={isSessionEnded}
            >
              Start Answering
            </button>
          ) : (
            <button
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 via-pink-400 to-purple-500 shadow-md transition-all duration-300 focus:outline-none hover:scale-105 hover:shadow-red-500/40"
              onClick={stopSTT}
              type="button"
              disabled={isSessionEnded}
            >
              Stop Answering
            </button>
          )}
          <button
            className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all duration-300 focus:outline-none ${
              isSessionEnded || loadingQuestions || (currentQuestionIdx >= questions.length - 1 && timeLeft > 0 && !loadingQuestions)
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'text-white bg-gray-900/80 border border-white/10 hover:scale-105 hover:shadow-lg hover:bg-gray-800/90'
            }`}
            onClick={handleNextQuestion}
            type="button"
            disabled={isSessionEnded || loadingQuestions || (currentQuestionIdx >= questions.length - 1 && timeLeft > 0 && !loadingQuestions)}
          >
            Next Question
          </button>
          {/* Generate More Questions button */}
          {currentQuestionIdx >= questions.length - 1 && timeLeft > 0 && !loadingQuestions && (
            <button
              onClick={handleGenerateMoreQuestions}
              className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all duration-300 focus:outline-none ${
                isSessionEnded
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:scale-105 hover:bg-blue-700'
              }`}
              disabled={isSessionEnded}
            >
              Generate More
            </button>
          )}
          {/* Loading state for Generate More */}
          {loadingQuestions && (
            <button
              className="px-6 py-3 rounded-xl font-bold bg-blue-600/50 text-blue-200 cursor-not-allowed shadow-md transition-all duration-300"
              disabled
            >
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating...
              </div>
            </button>
          )}
        </div>
      </section>
      {showFeedback && feedbackData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full overflow-y-auto max-h-[95vh] border border-blue-100">
            {isFeedbackLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                <div className="text-lg font-semibold text-blue-700">Generating your feedback summary...</div>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-8">
                {/* AI Disclaimer */}
                <div className="w-full mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">AI-Generated Analysis Disclaimer</h4>
                      <p className="text-amber-700 text-sm leading-relaxed">
                        This feedback and analysis are generated by artificial intelligence and should be used for practice purposes only. 
                        The scores, evaluations, and suggestions are AI-generated estimates and may not reflect actual interview performance. 
                        Please use this as a learning tool.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" fill="currentColor"/></svg>
                  <h2 className="text-3xl font-extrabold text-blue-700">Interview Feedback</h2>
                </div>
                <div className="text-gray-600 text-center max-w-xl">{feedbackData.interviewSummary}</div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center shadow">
                <span className="text-lg font-semibold text-gray-700 mb-1">Overall Score</span>
                <span className="text-3xl font-bold text-blue-700">{feedbackData.overallScore}</span>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center shadow">
                <span className="text-lg font-semibold text-gray-700 mb-1">Communication</span>
                <span className="text-3xl font-bold text-blue-700">{feedbackData.communicationScore}</span>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center shadow">
                <span className="text-lg font-semibold text-gray-700 mb-1">Technical</span>
                <span className="text-3xl font-bold text-blue-700">{feedbackData.technicalScore}</span>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" fill="currentColor"/></svg>
                Question-by-Question Feedback
              </h3>
              <div className="space-y-6">
                {feedbackData.questions && feedbackData.questions.map((qf: any, idx: number) => (
                  <div key={idx} className="bg-white border border-blue-100 rounded-xl shadow p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-base font-semibold text-blue-700">Q{idx+1}:</span>
                      <span className="text-base font-medium text-gray-800">{qf.question}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-gray-600">Your Answer:</span>
                      <span className="ml-2 text-gray-800">{qf.answer}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Communication</span>
                        <span className="inline-block bg-blue-100 text-blue-700 font-bold rounded-full px-3 py-1 text-sm">{qf.communicationScore}/10</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">Technical</span>
                        <span className="inline-block bg-blue-100 text-blue-700 font-bold rounded-full px-3 py-1 text-sm">{qf.technicalScore}/10</span>
                      </div>
                    </div>
                    <div className="mb-1 text-gray-700">
                      <span className="font-semibold">Fluency & Grammar:</span> {qf.fluencyComment}
                    </div>
                    <div className="mb-1 text-gray-700">
                      <span className="font-semibold">Technical Relevance:</span> {qf.techComment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {feedbackData.overallSuggestions && feedbackData.overallSuggestions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" fill="currentColor"/></svg>
                  Overall Suggestions to Improve
                </h3>
                <ul className="list-disc ml-8 text-gray-700">
                  {feedbackData.overallSuggestions.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-center mt-4">
              <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => { 
                // Clear all session state so next session is fresh
                setShowFeedback(false);
                setQuestions([]);
                setAnswers([]);
                setCurrentQuestionIdx(0);
                setTimeLeft(20 * 60);
                setTimerStarted(false);
                setAnswerTimeLeft(2 * 60);
                setAnswerTimerStarted(false);
                setIsSessionEnded(false);
                setTranscript("");
                setFeedbackData(null);
                sessionStorage.removeItem('liveSessionState');
                sessionStorage.removeItem('liveSessionTimeLeft');
                navigate('/dashboard');
              }}>
                Close & Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 