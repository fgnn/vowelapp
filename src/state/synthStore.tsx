import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

export type SourceType = 'sawtooth' | 'rosenberg' | 'lf';

export interface SynthState {
  f0: number;        // 80-1000 Hz (fundamental frequency)
  f1: number;        // ~200-900 Hz (first formant)
  f2: number;        // ~500-2500 Hz (second formant)
  f3: number;        // ~2400-3000 Hz (third formant)
  f1Bw: number;      // F1 bandwidth in Hz (50-200 typical)
  f2Bw: number;      // F2 bandwidth in Hz (50-200 typical)
  f1Gain: number;    // F1 gain in dB (0-30)
  f2Gain: number;    // F2 gain in dB (0-30)
  jitter: number;    // 0-5 % jitter amount
  volume: number;    // 0-1 (linear gain)
  sourceType: SourceType;
  isPlaying: boolean;
}

export type SynthAction =
  | { type: 'SET_F0'; payload: number }
  | { type: 'SET_FORMANTS'; payload: { f1: number; f2: number; f3: number } }
  | { type: 'SET_F1_BW'; payload: number }
  | { type: 'SET_F2_BW'; payload: number }
  | { type: 'SET_F1_GAIN'; payload: number }
  | { type: 'SET_F2_GAIN'; payload: number }
  | { type: 'SET_JITTER'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_SOURCE'; payload: SourceType }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PLAYING'; payload: boolean };

const initialState: SynthState = {
  f0: 120,           // Default male fundamental frequency
  f1: 500,           // Neutral schwa-ish position
  f2: 1500,
  f3: 2500,
  f1Bw: 80,          // Default F1 bandwidth
  f2Bw: 100,         // Default F2 bandwidth
  f1Gain: 18,        // Default F1 gain in dB
  f2Gain: 15,        // Default F2 gain in dB
  jitter: 1.0,       // Default 1% jitter
  volume: 0.5,       // 50% volume
  sourceType: 'sawtooth',
  isPlaying: false,
};

function synthReducer(state: SynthState, action: SynthAction): SynthState {
  switch (action.type) {
    case 'SET_F0':
      return { ...state, f0: action.payload };
    case 'SET_FORMANTS':
      return {
        ...state,
        f1: action.payload.f1,
        f2: action.payload.f2,
        f3: action.payload.f3,
      };
    case 'SET_F1_BW':
      return { ...state, f1Bw: action.payload };
    case 'SET_F2_BW':
      return { ...state, f2Bw: action.payload };
    case 'SET_F1_GAIN':
      return { ...state, f1Gain: action.payload };
    case 'SET_F2_GAIN':
      return { ...state, f2Gain: action.payload };
    case 'SET_JITTER':
      return { ...state, jitter: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_SOURCE':
      return { ...state, sourceType: action.payload };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    default:
      return state;
  }
}

interface SynthContextValue {
  state: SynthState;
  dispatch: Dispatch<SynthAction>;
}

const SynthContext = createContext<SynthContextValue | null>(null);

export function SynthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(synthReducer, initialState);
  return (
    <SynthContext.Provider value={{ state, dispatch }}>
      {children}
    </SynthContext.Provider>
  );
}

export function useSynth(): SynthContextValue {
  const context = useContext(SynthContext);
  if (!context) {
    throw new Error('useSynth must be used within a SynthProvider');
  }
  return context;
}

export { initialState };
