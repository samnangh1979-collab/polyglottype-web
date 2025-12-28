export enum Language {
  English = 'English',
  French = 'French',
  German = 'German',
  Italian = 'Italian',
  Spanish = 'Spanish',
  Portuguese = 'Portuguese',
  Dutch = 'Dutch'
}

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard'
}

export enum GameState {
  Idle = 'idle',
  Loading = 'loading',
  Playing = 'playing',
  Finished = 'finished'
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number; // in seconds
  progress: number; // 0 to 100
}

export interface TextGenerationParams {
  language: Language;
  difficulty: Difficulty;
}