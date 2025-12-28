import React, { useMemo } from 'react';

interface VirtualKeyboardProps {
  pressedKeys: Set<string>;
  nextChar: string;
}

interface KeyConfig {
  label: string;
  subLabel?: string; // For symbols like ! @ #
  width?: string;
  code?: string; // event.code
  match?: string[]; // Characters that map to this key
  align?: 'left' | 'right' | 'center';
}

const ROWS: KeyConfig[][] = [
  [
    { label: '`', subLabel: '~', match: ['`', '~'], code: 'Backquote' },
    { label: '1', subLabel: '!', match: ['1', '!'], code: 'Digit1' },
    { label: '2', subLabel: '@', match: ['2', '@'], code: 'Digit2' },
    { label: '3', subLabel: '#', match: ['3', '#'], code: 'Digit3' },
    { label: '4', subLabel: '$', match: ['4', '$'], code: 'Digit4' },
    { label: '5', subLabel: '%', match: ['5', '%'], code: 'Digit5' },
    { label: '6', subLabel: '^', match: ['6', '^'], code: 'Digit6' },
    { label: '7', subLabel: '&', match: ['7', '&'], code: 'Digit7' },
    { label: '8', subLabel: '*', match: ['8', '*'], code: 'Digit8' },
    { label: '9', subLabel: '(', match: ['9', '('], code: 'Digit9' },
    { label: '0', subLabel: ')', match: ['0', ')'], code: 'Digit0' },
    { label: '-', subLabel: '_', match: ['-', '_'], code: 'Minus' },
    { label: '=', subLabel: '+', match: ['=', '+'], code: 'Equal' },
    { label: 'Backspace', width: 'w-20', align: 'right', code: 'Backspace' },
  ],
  [
    { label: 'Tab', width: 'w-14', align: 'left', code: 'Tab' },
    { label: 'Q', match: ['q', 'Q'], code: 'KeyQ' },
    { label: 'W', match: ['w', 'W'], code: 'KeyW' },
    { label: 'E', match: ['e', 'E'], code: 'KeyE' },
    { label: 'R', match: ['r', 'R'], code: 'KeyR' },
    { label: 'T', match: ['t', 'T'], code: 'KeyT' },
    { label: 'Y', match: ['y', 'Y'], code: 'KeyY' },
    { label: 'U', match: ['u', 'U'], code: 'KeyU' },
    { label: 'I', match: ['i', 'I'], code: 'KeyI' },
    { label: 'O', match: ['o', 'O'], code: 'KeyO' },
    { label: 'P', match: ['p', 'P'], code: 'KeyP' },
    { label: '[', subLabel: '{', match: ['[', '{'], code: 'BracketLeft' },
    { label: ']', subLabel: '}', match: ['[', '}'], code: 'BracketRight' },
    { label: '\\', subLabel: '|', match: ['\\', '|'], width: 'w-14', code: 'Backslash' },
  ],
  [
    { label: 'Caps', width: 'w-16', align: 'left', code: 'CapsLock' },
    { label: 'A', match: ['a', 'A'], code: 'KeyA' },
    { label: 'S', match: ['s', 'S'], code: 'KeyS' },
    { label: 'D', match: ['d', 'D'], code: 'KeyD' },
    { label: 'F', match: ['f', 'F'], code: 'KeyF' },
    { label: 'G', match: ['g', 'G'], code: 'KeyG' },
    { label: 'H', match: ['h', 'H'], code: 'KeyH' },
    { label: 'J', match: ['j', 'J'], code: 'KeyJ' },
    { label: 'K', match: ['k', 'K'], code: 'KeyK' },
    { label: 'L', match: ['l', 'L'], code: 'KeyL' },
    { label: ';', subLabel: ':', match:[';', ':'], code: 'Semicolon' },
    { label: "'", subLabel: '"', match:["'", '"'], code: 'Quote' },
    { label: 'Enter', width: 'flex-1', align: 'right', code: 'Enter' },
  ],
  [
    { label: 'Shift', width: 'w-24', align: 'left', code: 'ShiftLeft' },
    { label: 'Z', match: ['z', 'Z'], code: 'KeyZ' },
    { label: 'X', match: ['x', 'X'], code: 'KeyX' },
    { label: 'C', match: ['c', 'C'], code: 'KeyC' },
    { label: 'V', match: ['v', 'V'], code: 'KeyV' },
    { label: 'B', match: ['b', 'B'], code: 'KeyB' },
    { label: 'N', match: ['n', 'N'], code: 'KeyN' },
    { label: 'M', match: ['m', 'M'], code: 'KeyM' },
    { label: ',', subLabel: '<', match: [',', '<'], code: 'Comma' },
    { label: '.', subLabel: '>', match: ['.', '>'], code: 'Period' },
    { label: '/', subLabel: '?', match: ['/', '?'], code: 'Slash' },
    { label: 'Shift', width: 'flex-1', align: 'right', code: 'ShiftRight' },
  ],
  [
    { label: 'Space', width: 'w-64', code: 'Space', match: [' '] },
  ]
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ pressedKeys, nextChar }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-slate-200 rounded-xl shadow-inner select-none hidden md:block">
      <div className="flex flex-col gap-2">
        {ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key, keyIndex) => (
              <Key 
                key={`${rowIndex}-${keyIndex}`} 
                config={key} 
                pressedKeys={pressedKeys}
                nextChar={nextChar}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Key: React.FC<{ 
  config: KeyConfig; 
  pressedKeys: Set<string>;
  nextChar: string;
}> = ({ config, pressedKeys, nextChar }) => {
  const isPressed = config.code && pressedKeys.has(config.code);
  const isTarget = useMemo(() => {
    // Check if this key matches the next character
    if (!nextChar) return false;
    return config.match?.includes(nextChar) || (config.label === 'Space' && nextChar === ' ');
  }, [config, nextChar]);

  let baseClasses = "relative h-12 flex flex-col items-center justify-center rounded-lg transition-all duration-75 shadow-sm border-b-4 border-slate-300 active:border-b-0 active:translate-y-[4px]";
  
  // Coloring
  if (isPressed) {
    baseClasses += " bg-slate-800 text-white border-slate-900 translate-y-[2px] border-b-2"; // Pressed state
  } else if (isTarget) {
    baseClasses += " bg-brand-500 text-white border-brand-700 animate-pulse ring-2 ring-brand-300 ring-offset-2 ring-offset-slate-200"; // Target hint
  } else {
    baseClasses += " bg-white text-slate-700 hover:bg-slate-50"; // Default
  }

  // Width handling
  const widthClass = config.width || "w-12";
  
  // Alignment for text (like Tab/Shift)
  const alignClass = config.align === 'left' ? 'items-start pl-2' : 
                     config.align === 'right' ? 'items-end pr-2' : 
                     'items-center';

  return (
    <div className={`${baseClasses} ${widthClass} ${alignClass}`}>
      {config.subLabel && (
        <span className="absolute top-1 left-2 text-[10px] font-bold opacity-60">
          {config.subLabel}
        </span>
      )}
      <span className={`font-semibold ${config.label.length > 1 ? 'text-xs uppercase' : 'text-base'}`}>
        {config.label}
      </span>
    </div>
  );
};
