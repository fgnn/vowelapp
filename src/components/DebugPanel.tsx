import { useEffect, useRef, useState } from 'react';
import { useSynth } from '../state/synthStore';
import { AudioEngine } from '../audio/AudioEngine';

export function DebugPanel() {
  const { state } = useSynth();
  const [peakDb, setPeakDb] = useState<number>(-Infinity);
  const [rmsDb, setRmsDb] = useState<number>(-Infinity);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const measure = () => {
      const analyser = AudioEngine.getAnalyser();
      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        analyser.getFloatFrequencyData(dataArray);

        // Find peak dB
        let maxDb = -Infinity;
        for (let i = 0; i < bufferLength; i++) {
          if (dataArray[i] > maxDb) {
            maxDb = dataArray[i];
          }
        }
        setPeakDb(maxDb);

        // Also get time-domain data for RMS
        const timeData = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(timeData);
        
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          sum += timeData[i] * timeData[i];
        }
        const rms = Math.sqrt(sum / timeData.length);
        const rmsDbVal = 20 * Math.log10(rms + 1e-10);
        setRmsDb(rmsDbVal);
      }

      animationRef.current = requestAnimationFrame(measure);
    };

    animationRef.current = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-xs">
      <div className="text-yellow-400 font-bold mb-2">DEBUG</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="text-gray-400">Model:</div>
        <div className="text-white">{state.sourceType}</div>
        
        <div className="text-gray-400">F0:</div>
        <div className="text-white">{state.f0.toFixed(1)} Hz</div>
        
        <div className="text-gray-400">F1:</div>
        <div className="text-red-400">{state.f1.toFixed(0)} Hz (BW:{state.f1Bw}, G:{state.f1Gain}dB)</div>
        
        <div className="text-gray-400">F2:</div>
        <div className="text-cyan-400">{state.f2.toFixed(0)} Hz (BW:{state.f2Bw}, G:{state.f2Gain}dB)</div>
        
        <div className="text-gray-400">F3:</div>
        <div className="text-yellow-300">{state.f3.toFixed(0)} Hz</div>
        
        <div className="text-gray-400">Volume:</div>
        <div className="text-white">{(state.volume * 100).toFixed(0)}%</div>
        
        <div className="text-gray-400">Peak dB:</div>
        <div className={peakDb > -10 ? 'text-red-500' : peakDb > -20 ? 'text-yellow-400' : 'text-green-400'}>
          {peakDb > -Infinity ? peakDb.toFixed(1) : '--'} dB
        </div>
        
        <div className="text-gray-400">RMS dB:</div>
        <div className="text-white">
          {rmsDb > -Infinity ? rmsDb.toFixed(1) : '--'} dB
        </div>
        
        <div className="text-gray-400">Playing:</div>
        <div className={state.isPlaying ? 'text-green-400' : 'text-gray-500'}>
          {state.isPlaying ? 'YES' : 'NO'}
        </div>
      </div>
    </div>
  );
}
