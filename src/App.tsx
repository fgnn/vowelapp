import { useEffect, useCallback } from 'react';
import { SynthProvider, useSynth } from './state/synthStore';
import { AudioEngine } from './audio/AudioEngine';
import { VowelMap } from './components/VowelMap';
import { F0Slider } from './components/F0Slider';
import { VolumeSlider } from './components/VolumeSlider';
import { SourceToggle } from './components/SourceToggle';
import { SpectrumPlot } from './components/SpectrumPlot';
import { DebugPanel } from './components/DebugPanel';
import { FormantSliders } from './components/FormantSliders';

function PlayButton() {
  const { state, dispatch } = useSynth();

  const handleClick = useCallback(async () => {
    await AudioEngine.init();
    await AudioEngine.resume();
    
    if (state.isPlaying) {
      AudioEngine.stop();
      dispatch({ type: 'SET_PLAYING', payload: false });
    } else {
      AudioEngine.start();
      dispatch({ type: 'SET_PLAYING', payload: true });
    }
  }, [state.isPlaying, dispatch]);

  return (
    <button
      onClick={handleClick}
      className={`
        w-full px-6 py-4 rounded-lg font-bold text-xl transition-all duration-150
        ${state.isPlaying
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }
        shadow-lg hover:shadow-xl active:scale-95
      `}
    >
      {state.isPlaying ? '■ Stop' : '▶ Play'}
    </button>
  );
}

function SynthController() {
  const { state } = useSynth();

  // Sync state changes to audio engine
  useEffect(() => {
    AudioEngine.setF0(state.f0);
  }, [state.f0]);

  useEffect(() => {
    AudioEngine.setFormants(state.f1, state.f2, state.f3);
  }, [state.f1, state.f2, state.f3]);

  useEffect(() => {
    AudioEngine.setF1Bandwidth(state.f1Bw);
  }, [state.f1Bw]);

  useEffect(() => {
    AudioEngine.setF2Bandwidth(state.f2Bw);
  }, [state.f2Bw]);

  useEffect(() => {
    AudioEngine.setF1Gain(state.f1Gain);
  }, [state.f1Gain]);

  useEffect(() => {
    AudioEngine.setF2Gain(state.f2Gain);
  }, [state.f2Gain]);

  useEffect(() => {
    AudioEngine.setJitter(state.jitter);
  }, [state.jitter]);

  useEffect(() => {
    AudioEngine.setVolume(state.volume);
  }, [state.volume]);

  useEffect(() => {
    AudioEngine.setSourceType(state.sourceType);
  }, [state.sourceType]);

  return null;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <SynthController />
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Vowel Synthesizer
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Source–filter model with interactive formant control
        </p>
      </header>

      {/* Main layout: Controls left, Vowel map right */}
      <main className="max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left column: Controls */}
          <div className="space-y-3">
            <PlayButton />
            <VolumeSlider />
            <SourceToggle />
            <F0Slider />
            <FormantSliders />
            <DebugPanel />
          </div>

          {/* Right column: Vowel map */}
          <VowelMap />
        </div>

        {/* Bottom: Spectrum plot */}
        <SpectrumPlot />

        {/* How to use - at very bottom */}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
          <h4 className="font-semibold text-[var(--text-primary)] mb-2">How to use</h4>
          <p>
            Click <strong>Play</strong> to start synthesis. 
            Click on vowel symbols or drag the red cursor to change formants. 
            Adjust F0 slider for pitch. Use formant sliders to fine-tune bandwidth and gain.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-8 text-center text-xs text-[var(--text-secondary)]">
        Pure client-side vowel synthesis using Web Audio API
      </footer>
    </div>
  );
}

function App() {
  return (
    <SynthProvider>
      <AppContent />
    </SynthProvider>
  );
}

export default App;
