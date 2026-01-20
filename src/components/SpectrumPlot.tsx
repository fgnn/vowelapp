import { useRef, useEffect, useCallback } from 'react';
import { AudioEngine } from '../audio/AudioEngine';
import { useSynth } from '../state/synthStore';

const WIDTH = 900;
const HEIGHT = 200;
const MIN_FREQ = 80;
const MAX_FREQ = 3000;
const PLOT_LEFT = 45;
const PLOT_RIGHT = WIDTH - 10;

// Formant bandwidths for Gaussian weighting (Hz)
const BW1 = 80;
const BW2 = 100;
const BW3 = 120;

// Log scale helpers
function freqToX(freq: number): number {
  const minLog = Math.log10(MIN_FREQ);
  const maxLog = Math.log10(MAX_FREQ);
  const logFreq = Math.log10(Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq)));
  return PLOT_LEFT + ((logFreq - minLog) / (maxLog - minLog)) * (PLOT_RIGHT - PLOT_LEFT);
}

function xToFreq(x: number): number {
  const minLog = Math.log10(MIN_FREQ);
  const maxLog = Math.log10(MAX_FREQ);
  const t = (x - PLOT_LEFT) / (PLOT_RIGHT - PLOT_LEFT);
  return Math.pow(10, minLog + t * (maxLog - minLog));
}

export function SpectrumPlot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const maxDbRef = useRef<number>(-30);
  const minDbRef = useRef<number>(-90);
  const { state } = useSynth();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = AudioEngine.getAnalyser();
    const ctx = AudioEngine.getContext();
    
    if (!canvas || !analyser || !ctx) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    // Clear canvas
    canvasCtx.fillStyle = '#0f0f12';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    // Get frequency data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatFrequencyData(dataArray);

    const nyquist = ctx.sampleRate / 2;
    const binWidth = nyquist / bufferLength;

    // Current formant and F0 values
    const f0 = state.f0;
    const f1 = state.f1;
    const f2 = state.f2;
    const f3 = state.f3;

    const plotHeight = HEIGHT - 35;
    const plotTop = 10;

    // Calculate dynamic range from current data
    let currentMax = -Infinity;
    let currentMin = Infinity;
    
    for (let freq = MIN_FREQ; freq <= MAX_FREQ; freq *= 1.05) {
      const bin = Math.floor(freq / binWidth);
      if (bin >= 0 && bin < bufferLength) {
        const db = dataArray[bin];
        if (db > -120 && db < 0) {
          currentMax = Math.max(currentMax, db);
          currentMin = Math.min(currentMin, db);
        }
      }
    }

    // Smooth the dynamic range tracking
    if (currentMax > -Infinity) {
      maxDbRef.current = maxDbRef.current * 0.92 + currentMax * 0.08;
      minDbRef.current = minDbRef.current * 0.92 + Math.max(currentMin, maxDbRef.current - 50) * 0.08;
    }

    const dynamicMax = Math.min(0, maxDbRef.current + 6);
    const dynamicMin = Math.max(-100, minDbRef.current - 6);
    const dynamicRange = dynamicMax - dynamicMin;

    // Helper: dB to Y position (log scale for magnitude)
    function dbToY(db: number): number {
      const normalized = (db - dynamicMin) / dynamicRange;
      return plotTop + plotHeight * (1 - normalized);
    }

    // Draw grid lines
    canvasCtx.strokeStyle = '#252530';
    canvasCtx.lineWidth = 1;
    
    // Horizontal grid (magnitude in dB)
    canvasCtx.fillStyle = '#555';
    canvasCtx.font = '9px monospace';
    const dbSteps = [-90, -70, -50, -30, -10];
    for (const db of dbSteps) {
      if (db >= dynamicMin && db <= dynamicMax) {
        const y = dbToY(db);
        canvasCtx.beginPath();
        canvasCtx.moveTo(PLOT_LEFT, y);
        canvasCtx.lineTo(PLOT_RIGHT, y);
        canvasCtx.stroke();
        canvasCtx.fillText(`${db}`, 5, y + 3);
      }
    }

    // Vertical grid (frequency - log scale)
    const freqGridLines = [100, 200, 300, 500, 700, 1000, 1500, 2000, 3000];
    for (const freq of freqGridLines) {
      if (freq >= MIN_FREQ && freq <= MAX_FREQ) {
        const x = freqToX(freq);
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, plotTop);
        canvasCtx.lineTo(x, plotTop + plotHeight);
        canvasCtx.stroke();
      }
    }

    // Draw frequency axis
    canvasCtx.strokeStyle = '#444';
    canvasCtx.beginPath();
    canvasCtx.moveTo(PLOT_LEFT, HEIGHT - 25);
    canvasCtx.lineTo(PLOT_RIGHT, HEIGHT - 25);
    canvasCtx.stroke();

    // Frequency labels (log scale)
    canvasCtx.fillStyle = '#666';
    canvasCtx.font = '10px monospace';
    const freqLabels = [100, 200, 500, 1000, 2000, 3000];
    for (const freq of freqLabels) {
      if (freq >= MIN_FREQ && freq <= MAX_FREQ) {
        const x = freqToX(freq);
        const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
        canvasCtx.fillText(label, x - 8, HEIGHT - 8);
        
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, HEIGHT - 25);
        canvasCtx.lineTo(x, HEIGHT - 20);
        canvasCtx.stroke();
      }
    }

    // Draw F0 marker
    if (f0 >= MIN_FREQ && f0 <= MAX_FREQ) {
      const x = freqToX(f0);
      canvasCtx.strokeStyle = '#888';
      canvasCtx.setLineDash([2, 2]);
      canvasCtx.beginPath();
      canvasCtx.moveTo(x, plotTop);
      canvasCtx.lineTo(x, plotTop + plotHeight);
      canvasCtx.stroke();
      canvasCtx.setLineDash([]);
      
      canvasCtx.fillStyle = '#888';
      canvasCtx.font = '10px monospace';
      canvasCtx.fillText('F0', x + 2, plotTop + 12);
    }

    // Draw formant markers
    const formantMarkers = [
      { f: f1, color: '#ff6b6b', label: 'F1' },
      { f: f2, color: '#4ecdc4', label: 'F2' },
      { f: f3, color: '#ffe66d', label: 'F3' },
    ];

    for (const marker of formantMarkers) {
      if (marker.f >= MIN_FREQ && marker.f <= MAX_FREQ) {
        const x = freqToX(marker.f);
        canvasCtx.strokeStyle = marker.color;
        canvasCtx.setLineDash([4, 4]);
        canvasCtx.beginPath();
        canvasCtx.moveTo(x, plotTop);
        canvasCtx.lineTo(x, plotTop + plotHeight);
        canvasCtx.stroke();
        canvasCtx.setLineDash([]);
        
        canvasCtx.fillStyle = marker.color;
        canvasCtx.font = '11px monospace';
        canvasCtx.fillText(marker.label, x + 3, plotTop + 12);
      }
    }

    // Draw filled spectrum with formant colors (log frequency scale)
    for (let x = PLOT_LEFT; x <= PLOT_RIGHT; x += 2) {
      const freq = xToFreq(x);
      const bin = Math.floor(freq / binWidth);
      
      if (bin >= 0 && bin < bufferLength) {
        const dbValue = dataArray[bin];
        const y = dbToY(dbValue);
        const barHeight = plotTop + plotHeight - y;
        
        if (barHeight > 0) {
          // Calculate Gaussian weights for each formant
          const w1 = Math.exp(-Math.pow(freq - f1, 2) / (2 * BW1 * BW1));
          const w2 = Math.exp(-Math.pow(freq - f2, 2) / (2 * BW2 * BW2));
          const w3 = Math.exp(-Math.pow(freq - f3, 2) / (2 * BW3 * BW3));
          
          const total = w1 + w2 + w3 + 0.1;
          
          // Blend colors: F1=red, F2=cyan, F3=yellow
          const r = Math.floor(255 * (w1 / total) + 255 * (w3 / total) * 0.5);
          const g = Math.floor(200 * (w2 / total) + 230 * (w3 / total));
          const b = Math.floor(180 * (w2 / total));
          
          const normalized = (dbValue - dynamicMin) / dynamicRange;
          const alpha = Math.min(0.9, normalized * 0.85 + 0.15);
          canvasCtx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          canvasCtx.fillRect(x, y, 2, barHeight);
        }
      }
    }

    // Draw spectrum line on top (log frequency scale)
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = '#fff';
    canvasCtx.lineWidth = 1.5;
    
    let firstPoint = true;
    for (let x = PLOT_LEFT; x <= PLOT_RIGHT; x += 2) {
      const freq = xToFreq(x);
      const bin = Math.floor(freq / binWidth);
      
      if (bin >= 0 && bin < bufferLength) {
        const dbValue = dataArray[bin];
        const y = dbToY(dbValue);
        
        if (firstPoint) {
          canvasCtx.moveTo(x, y);
          firstPoint = false;
        } else {
          canvasCtx.lineTo(x, y);
        }
      }
    }
    canvasCtx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  }, [state.f0, state.f1, state.f2, state.f3]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Frequency Spectrum (log scale)
        </h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[var(--accent-f1)]" />
            F1: {Math.round(state.f1)} Hz
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[var(--accent-f2)]" />
            F2: {Math.round(state.f2)} Hz
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[var(--accent-f3)]" />
            F3: {Math.round(state.f3)} Hz
          </span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="rounded w-full"
        style={{ maxWidth: WIDTH }}
      />
    </div>
  );
}
