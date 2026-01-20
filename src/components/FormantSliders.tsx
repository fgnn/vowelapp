import { useSynth } from '../state/synthStore';

export function FormantSliders() {
  const { state, dispatch } = useSynth();

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Formant Parameters
      </h3>
      
      {/* F1 Controls */}
      <div className="space-y-2">
        <div className="text-xs text-red-400 font-semibold">F1 ({state.f1.toFixed(0)} Hz)</div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12">BW:</span>
          <input
            type="range"
            min="30"
            max="200"
            step="5"
            value={state.f1Bw}
            onChange={(e) => dispatch({ type: 'SET_F1_BW', payload: parseFloat(e.target.value) })}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-xs text-gray-300 w-14 text-right">{state.f1Bw} Hz</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12">Gain:</span>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={state.f1Gain}
            onChange={(e) => dispatch({ type: 'SET_F1_GAIN', payload: parseFloat(e.target.value) })}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-xs text-gray-300 w-14 text-right">{state.f1Gain} dB</span>
        </div>
      </div>
      
      {/* F2 Controls */}
      <div className="space-y-2">
        <div className="text-xs text-cyan-400 font-semibold">F2 ({state.f2.toFixed(0)} Hz)</div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12">BW:</span>
          <input
            type="range"
            min="30"
            max="200"
            step="5"
            value={state.f2Bw}
            onChange={(e) => dispatch({ type: 'SET_F2_BW', payload: parseFloat(e.target.value) })}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="text-xs text-gray-300 w-14 text-right">{state.f2Bw} Hz</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12">Gain:</span>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={state.f2Gain}
            onChange={(e) => dispatch({ type: 'SET_F2_GAIN', payload: parseFloat(e.target.value) })}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="text-xs text-gray-300 w-14 text-right">{state.f2Gain} dB</span>
        </div>
      </div>

      {/* Jitter Control */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <div className="text-xs text-yellow-400 font-semibold">Voice Jitter</div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-12">Amount:</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={state.jitter}
            onChange={(e) => dispatch({ type: 'SET_JITTER', payload: parseFloat(e.target.value) })}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <span className="text-xs text-gray-300 w-14 text-right">{state.jitter.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
