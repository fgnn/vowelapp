import { useMemo, useCallback } from 'react';
import { useSynth } from '../state/synthStore';

const MIN_F0 = 80;
const MAX_F0 = 1000;

// Note names for chromatic scale
const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

/**
 * Convert frequency to musical note name and octave
 * A4 = 440Hz is the reference
 */
function frequencyToNote(freq: number): { note: string; octave: number; cents: number } {
  // Number of semitones from A4 (440Hz)
  const semitonesFromA4 = 12 * Math.log2(freq / 440);
  const roundedSemitones = Math.round(semitonesFromA4);
  const cents = Math.round((semitonesFromA4 - roundedSemitones) * 100);
  
  // A4 is the 9th note (index 9) in octave 4
  // So note index = (9 + semitones) mod 12
  // Octave = 4 + floor((9 + semitones) / 12)
  const noteIndex = ((9 + roundedSemitones) % 12 + 12) % 12;
  const octave = 4 + Math.floor((9 + roundedSemitones) / 12);
  
  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    cents,
  };
}

// Log scale: slider position 0-100 maps to 80-1000 Hz logarithmically
function sliderToF0(value: number): number {
  const minLog = Math.log(MIN_F0);
  const maxLog = Math.log(MAX_F0);
  return Math.exp(minLog + (value / 100) * (maxLog - minLog));
}

function f0ToSlider(f0: number): number {
  const minLog = Math.log(MIN_F0);
  const maxLog = Math.log(MAX_F0);
  return ((Math.log(f0) - minLog) / (maxLog - minLog)) * 100;
}

export function F0Slider() {
  const { state, dispatch } = useSynth();

  const sliderValue = useMemo(() => f0ToSlider(state.f0), [state.f0]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const f0 = sliderToF0(value);
    dispatch({ type: 'SET_F0', payload: f0 });
  }, [dispatch]);

  const noteInfo = useMemo(() => frequencyToNote(state.f0), [state.f0]);

  const pitchLabel = useMemo(() => {
    if (state.f0 < 150) return 'Bass';
    if (state.f0 < 250) return 'Tenor';
    if (state.f0 < 350) return 'Alto';
    if (state.f0 < 500) return 'Soprano';
    return 'High';
  }, [state.f0]);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          F0 Pitch
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
            {Math.round(state.f0)} Hz
          </span>
          <div className="bg-[var(--bg-tertiary)] rounded px-2 py-1 text-center">
            <span className="text-lg font-bold text-[var(--accent-f3)]">
              {noteInfo.note}{noteInfo.octave}
            </span>
          </div>
        </div>
      </div>
      
      <input
        type="range"
        min="0"
        max="100"
        step="0.5"
        value={sliderValue}
        onChange={handleChange}
        className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[var(--accent-active)]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-lg"
      />
      
      <div className="flex justify-between mt-1">
        <span className="text-xs text-[var(--text-secondary)]">80 Hz</span>
        <span className="text-xs text-[var(--accent-f2)]">{pitchLabel}</span>
        <span className="text-xs text-[var(--text-secondary)]">1000 Hz</span>
      </div>
    </div>
  );
}
