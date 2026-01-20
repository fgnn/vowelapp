import { useCallback } from 'react';
import { useSynth } from '../state/synthStore';

export function VolumeSlider() {
  const { state, dispatch } = useSynth();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100;
    dispatch({ type: 'SET_VOLUME', payload: value });
  }, [dispatch]);

  const volumePercent = Math.round(state.volume * 100);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg px-4 py-3 flex items-center gap-3">
      <label className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Vol
      </label>
      
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={volumePercent}
        onChange={handleChange}
        className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[var(--accent-f2)]
          [&::-webkit-slider-thumb]:cursor-pointer"
      />
      
      <span className="text-sm font-mono text-[var(--text-primary)] w-10 text-right">
        {volumePercent}%
      </span>
    </div>
  );
}
