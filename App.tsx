import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, GameState, Language, TypingStats } from './types';
import { generatePracticeText } from './services/geminiService';
import { TypingArea } from './components/TypingArea';
import { StatsBoard } from './components/StatsBoard';
import { ResultsModal } from './components/ResultsModal';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { Keyboard, ChevronDown, Play, Loader2, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [language, setLanguage] = useState<Language>(Language.English);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  const [originalText, setOriginalText] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  // Keyboard visual state
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // --- Refs ---
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Helpers to calculate Stats ---
  const calculateStats = useCallback((): TypingStats => {
    const wordsTyped = userInput.length / 5;
    const minutes = timeElapsed / 60;
    const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;

    let errors = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== originalText[i]) {
        errors++;
      }
    }

    const accuracy = userInput.length > 0 
      ? Math.max(0, Math.round(((userInput.length - errors) / userInput.length) * 100))
      : 100;
    
    const progress = originalText.length > 0 
        ? (userInput.length / originalText.length) * 100 
        : 0;

    return {
      wpm,
      accuracy,
      errors,
      timeElapsed,
      progress
    };
  }, [userInput, timeElapsed, originalText]);

  const stats = calculateStats();

  // --- Game Loop ---

  // Timer logic
  useEffect(() => {
    if (gameState === GameState.Playing) {
      if (!startTime) setStartTime(Date.now());
      
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime]);

  // Check for finish
  useEffect(() => {
    if (gameState === GameState.Playing && userInput.length === originalText.length && originalText.length > 0) {
      setGameState(GameState.Finished);
    }
  }, [userInput, originalText, gameState]);

  // --- Handlers ---

  const handleStart = async () => {
    if (gameState === GameState.Loading) return;
    
    // If we don't have text yet, or we want new text (implicit restart logic usually handled by "Next Text")
    // But "Start" on initial load needs text.
    if (!originalText) {
      await loadNewText();
    } else {
        // Just start the timer if text is already there (e.g. Retry)
        setGameState(GameState.Playing);
        setStartTime(Date.now());
    }
  };

  const loadNewText = async () => {
    setGameState(GameState.Loading);
    setUserInput("");
    setTimeElapsed(0);
    setStartTime(null);
    
    const text = await generatePracticeText(language, difficulty);
    setOriginalText(text);
    setGameState(GameState.Idle); // Ready to start typing
    // Optional: Auto start after load? The prompt says "When user clicks Start". 
    // So we go to Idle state with text loaded.
  };

  const handleInputChange = (value: string) => {
    // Prevent typing beyond text length
    if (value.length <= originalText.length) {
       setUserInput(value);
       // Auto-start if typing from Idle state
       if (gameState === GameState.Idle) {
         setGameState(GameState.Playing);
         setStartTime(Date.now());
       }
    }
  };

  const handleRestart = () => {
    setUserInput("");
    setTimeElapsed(0);
    setStartTime(null);
    setGameState(GameState.Idle);
    // Focus happens in TypingArea automatically
  };

  const handleNextText = () => {
    loadNewText();
  };

  // Keyboard Event Handlers for Visuals
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Add code to set (e.g., "KeyA")
    setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.add(e.code);
        return newSet;
    });
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.code);
        return newSet;
    });
  };

  // Initial load
  useEffect(() => {
    loadNewText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-brand-600">
            <Keyboard className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Polyglot<span className="text-brand-600">Type</span></h1>
          </div>
          <div className="flex items-center space-x-4">
             {/* Sound Toggle */}
             <button 
               onClick={() => setSoundEnabled(!soundEnabled)}
               className="p-2 text-slate-400 hover:text-brand-600 transition-colors rounded-full hover:bg-slate-100"
               title={soundEnabled ? "Mute sound" : "Enable sound"}
             >
               {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
             </button>

             {/* Tiny status indicator */}
             <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                 gameState === GameState.Playing ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
             }`}>
                 {gameState === GameState.Playing ? "LIVE" : "READY"}
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 flex flex-col items-center max-w-6xl mx-auto w-full">
        
        {/* Controls */}
        <div className="w-full max-w-4xl bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
             {/* Language Select */}
             <div className="relative group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Language</label>
                <div className="relative">
                    <select 
                        value={language}
                        onChange={(e) => {
                            setLanguage(e.target.value as Language);
                        }}
                        disabled={gameState === GameState.Playing}
                        className="appearance-none w-full md:w-48 bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium disabled:opacity-50 transition-shadow"
                    >
                        {Object.values(Language).map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
             </div>

             {/* Difficulty Select */}
             <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Difficulty</label>
                <div className="relative">
                    <select 
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        disabled={gameState === GameState.Playing}
                        className="appearance-none w-full md:w-40 bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium disabled:opacity-50 transition-shadow"
                    >
                        {Object.values(Difficulty).map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
             {gameState === GameState.Playing ? (
                 <button 
                    onClick={() => setGameState(GameState.Finished)} // Manual finish
                    className="w-full md:w-auto px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
                 >
                    Finish Early
                 </button>
             ) : (
                 <>
                     <button 
                        onClick={handleNextText}
                        disabled={gameState === GameState.Loading}
                        className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-lg hover:border-brand-300 hover:text-brand-600 transition-colors disabled:opacity-50"
                     >
                         {gameState === GameState.Loading ? <Loader2 className="animate-spin w-5 h-5"/> : "New Text"}
                     </button>
                     
                     <button 
                        onClick={handleStart}
                        disabled={gameState === GameState.Loading}
                        className="flex-1 md:flex-none flex items-center justify-center px-8 py-2.5 bg-brand-600 text-white font-bold rounded-lg shadow-lg shadow-brand-200 hover:bg-brand-700 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                     >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Start
                     </button>
                 </>
             )}
          </div>
        </div>

        {/* Stats */}
        <StatsBoard stats={stats} />

        {/* Typing Area */}
        <TypingArea 
            originalText={originalText}
            typedText={userInput}
            onInputChange={handleInputChange}
            gameState={gameState}
            onStart={() => {
                setGameState(GameState.Playing);
                setStartTime(Date.now());
            }}
            soundEnabled={soundEnabled}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
        />

        {/* Virtual Keyboard */}
        <VirtualKeyboard 
            pressedKeys={pressedKeys} 
            nextChar={originalText[userInput.length]}
        />

        {/* Results Modal */}
        {gameState === GameState.Finished && (
            <ResultsModal 
                stats={stats}
                language={language}
                difficulty={difficulty}
                onRestart={handleRestart}
                onNext={handleNextText}
            />
        )}
      </main>
      
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© 2024 Polyglot Type. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
