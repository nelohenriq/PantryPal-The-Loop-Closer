import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';
import { X, ArrowRight, ArrowLeft, CircleCheck, ChefHat, Mic, MicOff, Volume2, Timer, Play, Pause, RotateCcw } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
  onComplete: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Timer State
  const [activeTimers, setActiveTimers] = useState<Record<number, { remaining: number; isRunning: boolean; original: number }>>({});
  
  const recognitionRef = useRef<any>(null);
  // FIX: In a browser environment, setInterval returns a number, not a NodeJS.Timeout object.
  const timerIntervalRef = useRef<number | null>(null);

  const steps = recipe.instructions;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const lastResult = event.results[event.results.length - 1];
            const command = lastResult[0].transcript.trim().toLowerCase();
            setTranscript(command);
            
            setTimeout(() => setTranscript(''), 2000);

            if (command.includes('next') || command.includes('forward')) {
                setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
            } else if (command.includes('back') || command.includes('previous')) {
                setCurrentStep(prev => Math.max(0, prev - 1));
            } else if (command.includes('finish') || command.includes('done')) {
                 if (isLast) handleFinish();
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
             if (isListening) {
                 try {
                    recognitionRef.current.start();
                 } catch (e) {
                     setIsListening(false);
                 }
             }
        };
    }
  }, [steps.length, isLast]);

  // Timer Tick Logic
  useEffect(() => {
    timerIntervalRef.current = window.setInterval(() => {
        setActiveTimers(prev => {
            const next = { ...prev };
            let hasChanges = false;
            
            Object.keys(next).forEach(key => {
                const stepIdx = parseInt(key);
                if (next[stepIdx].isRunning && next[stepIdx].remaining > 0) {
                    next[stepIdx] = { ...next[stepIdx], remaining: next[stepIdx].remaining - 1 };
                    hasChanges = true;
                    
                    if (next[stepIdx].remaining === 0) {
                        next[stepIdx].isRunning = false;
                        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-kitchen-timer-bell-1793.mp3').play().catch(() => {});
                        alert(`Timer for Step ${stepIdx + 1} finished!`);
                    }
                }
            });
            
            return hasChanges ? next : prev;
        });
    }, 1000);

    return () => {
        if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    };
  }, []);

  const toggleListening = () => {
      if (!recognitionRef.current) {
          alert("Voice control is not supported in this browser.");
          return;
      }

      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch (e) {
            console.error(e);
          }
      }
  };

  useEffect(() => {
      return () => {
          if (recognitionRef.current) recognitionRef.current.stop();
      };
  }, []);

  const speakStep = (text: string) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
  };

  const handleFinish = () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      onComplete();
      onClose();
  };

  // Timer Helpers
  const extractTime = (text: string): number | null => {
      // Regex to find "X minutes", "X mins", "1 hour", etc.
      const match = text.match(/(\d+)\s*(minute|min|hour|hr|second|sec)/i);
      if (match) {
          const val = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          if (unit.startsWith('hour') || unit.startsWith('hr')) return val * 3600;
          if (unit.startsWith('min')) return val * 60;
          if (unit.startsWith('sec')) return val;
      }
      return null;
  };

  const detectedDuration = extractTime(steps[currentStep]);

  const toggleTimer = () => {
      if (!detectedDuration) return;
      
      setActiveTimers(prev => {
          const current = prev[currentStep];
          if (current) {
              return {
                  ...prev,
                  [currentStep]: { ...current, isRunning: !current.isRunning }
              };
          } else {
              return {
                  ...prev,
                  [currentStep]: { remaining: detectedDuration, isRunning: true, original: detectedDuration }
              };
          }
      });
  };

  const resetTimer = () => {
      setActiveTimers(prev => {
          const current = prev[currentStep];
          if (!current) return prev;
          return {
              ...prev,
              [currentStep]: { ...current, remaining: current.original, isRunning: false }
          };
      });
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerState = activeTimers[currentStep];

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div>
           <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">
             <ChefHat className="w-4 h-4" /> Chef Mode
           </div>
           <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{recipe.name}</h2>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
            >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {isListening ? 'Listening...' : 'Voice Off'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center max-w-4xl mx-auto w-full relative">
        
        {transcript && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md animate-in fade-in slide-in-from-top-4">
                "{transcript}"
            </div>
        )}

        <div className="mb-8 w-full">
           <span className="inline-block px-4 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-sm font-semibold mb-6">
              Step {currentStep + 1} of {steps.length}
           </span>
           <h3 className="text-2xl sm:text-4xl font-medium text-gray-900 dark:text-white leading-tight">
             {steps[currentStep]}
           </h3>
           
           <div className="flex justify-center gap-4 mt-8">
                <button 
                    onClick={() => speakStep(steps[currentStep])}
                    className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition shadow-sm"
                    title="Read aloud"
                >
                    <Volume2 className="w-6 h-6" />
                </button>

                {/* Smart Timer Button */}
                {detectedDuration && (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={toggleTimer}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg transition shadow-sm ${
                                timerState?.isRunning 
                                ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200'
                            }`}
                        >
                            {timerState?.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            {timerState ? formatTime(timerState.remaining) : formatTime(detectedDuration)}
                        </button>
                        {timerState && (
                            <button 
                                onClick={resetTimer}
                                className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
           </div>
        </div>

        <div className="w-full max-w-xs h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-8 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
        </div>
        
        {isListening && (
            <div className="mt-8 text-xs text-gray-400">
                Try saying: "Next", "Back", "Read", "Finish"
            </div>
        )}

      </div>

      {/* Controls */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={isFirst}
            className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Previous
          </button>
          
          {isLast ? (
            <button 
                onClick={handleFinish}
                className="flex-[2] py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
            >
                <CircleCheck className="w-6 h-6" /> Finish Cooking
            </button>
          ) : (
            <button 
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="flex-[2] py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
            >
                Next Step <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};