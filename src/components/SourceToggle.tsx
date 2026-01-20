import { useCallback } from 'react';
import { useSynth, type SourceType } from '../state/synthStore';

export function SourceToggle() {
  const { state, dispatch } = useSynth();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_SOURCE', payload: e.target.value as SourceType });
  }, [dispatch]);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg px-4 py-3 flex items-center gap-3">
      <label className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Source
      </label>
      
      <select
        value={state.sourceType}
        onChange={handleChange}
        className="flex-1 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md px-3 py-2 
          border border-[var(--bg-tertiary)] focus:border-[var(--accent-active)] focus:outline-none
          cursor-pointer font-medium"
      >
        <option value="sawtooth">Sawtooth (simple)</option>
        <option value="rosenberg">Rosenberg (natural)</option>
        <option value="lf">LF (realistic)</option>
      </select>
    </div>
  );
}
