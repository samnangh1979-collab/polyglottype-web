import React, { useRef, useEffect } from 'react';
import { GameState } from '../types';
import { playTypingSound } from '../utils/sound';

interface TypingAreaProps {
  originalText: string;
  typedText: string;
  onInputChange: (value: string) => void;
  gameState: GameState;
  onStart: () => void;
  soundEnabled: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onKeyUp: (e: React.KeyboardEvent) => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  originalText,
  typedText,
  onInputChange,
  gameState,
  onStart,
  soundEnabled,
  onKeyDown,
  onKeyUp,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when game starts or is playing
  useEffect(() => {
    if (gameState === GameState.Playing && inputRef.current) {
      inputRef.current.focus();
      // Force cursor to end to prevent caret movement via mouse clicks
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [gameState, typedText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (gameState === GameState.Idle || gameState === GameState.Finished) {
      // If user types while idle, auto-start
      if (gameState === GameState.Idle && newValue.length > 0) {
        onStart();
      } else {
        return; 
      }
    }
    
    // --- NO CORRECTION MODE ---
    // 1. Prevent Deletions: If new length is shorter, user deleted something.
    if (newValue.length < typedText.length) {
         // Revert the value
         e.target.value = typedText; 
         if (soundEnabled) playTypingSound('error');
         return;
    }
    
    // 2. Prevent Insertions/Modifications in the middle: New value must start with old value.
    if (!newValue.startsWith(typedText)) {
        e.target.value = typedText;
        if (soundEnabled) playTypingSound('error');
        return;
    }

    // Sound Logic
    if (soundEnabled) {
        if (newValue.length > typedText.length) {
            // Typing a new character
            const charIndex = newValue.length - 1;
            const char = newValue[charIndex];
            const expectedChar = originalText[charIndex];
            
            if (char === expectedChar) {
                playTypingSound('correct');
            } else {
                playTypingSound('error');
            }
        }
    }

    onInputChange(newValue);
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent) => {
    // Block navigation and deletion keys to strictly enforce "No Correction"
    const blockedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
    
    if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        // Provide auditory feedback that the action is denied
        if (soundEnabled && (e.key === 'Backspace' || e.key === 'Delete')) {
            playTypingSound('error');
        }
    }
    
    // Bubble up event for the Virtual Keyboard visualization
    onKeyDown(e);
  };

  // Render the text with colored spans based on correctness
  const renderText = () => {
    return originalText.split('').map((char, index) => {
      const typedChar = typedText[index];
      let className = "text-slate-400"; // Default untyped

      if (typedChar !== undefined) {
        if (typedChar === char) {
          className = "text-brand-600 bg-brand-50"; // Correct
        } else {
          className = "text-red-600 bg-red-100 underline decoration-red-400"; // Incorrect
        }
      } else if (index === typedText.length && gameState === GameState.Playing) {
         className = "text-slate-800 bg-slate-200 animate-pulse caret-flash relative before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-brand-500"; // Current cursor position
      }

      return (
        <span key={index} className={`font-mono text-xl md:text-2xl leading-relaxed transition-colors duration-75 ${className}`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto group mb-8">
      {/* The Visual Display */}
      <div 
        className="min-h-[200px] p-8 bg-white rounded-xl shadow-sm border border-slate-200 cursor-text relative overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >
        {gameState === GameState.Loading ? (
            <div className="flex items-center justify-center h-full space-x-2 animate-pulse text-brand-600">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms'}}></div>
                <span className="font-medium ml-2 text-slate-500">Generating Text...</span>
            </div>
        ) : (
            <div className="whitespace-pre-wrap break-words pointer-events-none select-none">
             {renderText()}
            </div>
        )}

        {/* Overlay instructions when Idle */}
        {gameState === GameState.Idle && !originalText && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10">
            <p className="text-slate-500 font-medium">Select options and click Start to begin</p>
          </div>
        )}
      </div>

      {/* Hidden Interactive Input */}
      <textarea
        ref={inputRef}
        value={typedText}
        onChange={handleChange}
        onKeyDown={handleKeyDownInternal}
        onKeyUp={onKeyUp}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-text resize-none -z-10"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        disabled={gameState === GameState.Loading || gameState === GameState.Finished}
      />
      
      {gameState === GameState.Playing && (
         <div className="absolute -bottom-6 right-2 text-xs text-slate-400 flex items-center gap-2">
             <span className="w-2 h-2 bg-red-400 rounded-full"></span>
             Strict Mode: Correction Disabled
         </div>
      )}
    </div>
  );
};