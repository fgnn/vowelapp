/**
 * Formant Filter Bank - Peaking Resonator Model
 * 
 * Uses peaking (parametric EQ) filters for formants, plus:
 * - LFO modulation for natural time variation (2-4 Hz, ±3%)
 * - Proper lip radiation via differentiator (+6dB/octave)
 * - Spectral tilt moved to glottal source (more physically accurate)
 */

const SMOOTHING_TIME = 0.02;

export class FormantFilter {
  private ctx: AudioContext;
  private inputGain: GainNode;
  
  // Formant resonators (peaking filters)
  private f1Resonator: BiquadFilterNode;
  private f2Resonator: BiquadFilterNode;
  private f3Resonator: BiquadFilterNode;
  
  // LFO modulation for time-varying formants
  private f1Lfo: OscillatorNode;
  private f2Lfo: OscillatorNode;
  private f3Lfo: OscillatorNode;
  private f1LfoGain: GainNode;
  private f2LfoGain: GainNode;
  private f3LfoGain: GainNode;
  
  // Lip radiation (highpass + boost for +6dB/octave effect)
  private lipRadiation: BiquadFilterNode;
  
  // Output gain
  private outputGain: GainNode;
  
  // Store center frequencies for LFO depth calculation
  private f1Center = 500;
  private f2Center = 1500;
  private f3Center = 2500;
  
  // Default F3 parameters (not user-adjustable for now)
  private static readonly F3_Q = 15;
  private static readonly F3_GAIN = 12;
  
  // LFO modulation depth (±3% of center frequency)
  private static readonly LFO_DEPTH_RATIO = 0.03;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    
    // Input gain
    this.inputGain = ctx.createGain();
    this.inputGain.gain.value = 1;
    
    // F1 Resonator (peaking filter)
    this.f1Resonator = ctx.createBiquadFilter();
    this.f1Resonator.type = 'peaking';
    this.f1Resonator.frequency.value = this.f1Center;
    this.f1Resonator.Q.value = 8;
    this.f1Resonator.gain.value = 18;
    
    // F2 Resonator (peaking filter)
    this.f2Resonator = ctx.createBiquadFilter();
    this.f2Resonator.type = 'peaking';
    this.f2Resonator.frequency.value = this.f2Center;
    this.f2Resonator.Q.value = 12;
    this.f2Resonator.gain.value = 15;
    
    // F3 Resonator (peaking filter)
    this.f3Resonator = ctx.createBiquadFilter();
    this.f3Resonator.type = 'peaking';
    this.f3Resonator.frequency.value = this.f3Center;
    this.f3Resonator.Q.value = FormantFilter.F3_Q;
    this.f3Resonator.gain.value = FormantFilter.F3_GAIN;
    
    // Create LFOs for time-varying formants
    // Each LFO has slightly different rate to avoid correlation
    this.f1Lfo = ctx.createOscillator();
    this.f1Lfo.type = 'sine';
    this.f1Lfo.frequency.value = 2.3; // Hz
    
    this.f2Lfo = ctx.createOscillator();
    this.f2Lfo.type = 'sine';
    this.f2Lfo.frequency.value = 3.1; // Hz
    
    this.f3Lfo = ctx.createOscillator();
    this.f3Lfo.type = 'sine';
    this.f3Lfo.frequency.value = 2.7; // Hz
    
    // LFO gain controls modulation depth (±3% of center freq)
    this.f1LfoGain = ctx.createGain();
    this.f1LfoGain.gain.value = this.f1Center * FormantFilter.LFO_DEPTH_RATIO;
    
    this.f2LfoGain = ctx.createGain();
    this.f2LfoGain.gain.value = this.f2Center * FormantFilter.LFO_DEPTH_RATIO;
    
    this.f3LfoGain = ctx.createGain();
    this.f3LfoGain.gain.value = this.f3Center * FormantFilter.LFO_DEPTH_RATIO;
    
    // Connect LFOs to formant frequencies
    this.f1Lfo.connect(this.f1LfoGain);
    this.f1LfoGain.connect(this.f1Resonator.frequency);
    
    this.f2Lfo.connect(this.f2LfoGain);
    this.f2LfoGain.connect(this.f2Resonator.frequency);
    
    this.f3Lfo.connect(this.f3LfoGain);
    this.f3LfoGain.connect(this.f3Resonator.frequency);
    
    // Start LFOs with random phase offset
    const now = ctx.currentTime;
    this.f1Lfo.start(now);
    this.f2Lfo.start(now + Math.random() * 0.3);
    this.f3Lfo.start(now + Math.random() * 0.3);
    
    // Lip radiation filter (highshelf boost for +6dB/octave effect)
    // This simulates acoustic radiation from lips without killing low frequencies
    this.lipRadiation = ctx.createBiquadFilter();
    this.lipRadiation.type = 'highshelf';
    this.lipRadiation.frequency.value = 1000;
    this.lipRadiation.gain.value = 6; // +6dB above 1kHz
    
    // Output gain
    this.outputGain = ctx.createGain();
    this.outputGain.gain.value = 1.0;
    
    // Connect: input -> F1 -> F2 -> F3 -> lip radiation -> output
    // Note: spectral tilt removed - now applied in glottal source
    this.inputGain.connect(this.f1Resonator);
    this.f1Resonator.connect(this.f2Resonator);
    this.f2Resonator.connect(this.f3Resonator);
    this.f3Resonator.connect(this.lipRadiation);
    this.lipRadiation.connect(this.outputGain);
  }

  get input(): AudioNode {
    return this.inputGain;
  }

  get output(): AudioNode {
    return this.outputGain;
  }

  setFormants(f1: number, f2: number, f3: number): void {
    const now = this.ctx.currentTime;
    
    // Update center frequencies
    this.f1Center = f1;
    this.f2Center = f2;
    this.f3Center = f3;
    
    // Update resonator frequencies
    this.f1Resonator.frequency.setTargetAtTime(f1, now, SMOOTHING_TIME);
    this.f2Resonator.frequency.setTargetAtTime(f2, now, SMOOTHING_TIME);
    this.f3Resonator.frequency.setTargetAtTime(f3, now, SMOOTHING_TIME);
    
    // Update LFO modulation depths (±3% of new center freq)
    this.f1LfoGain.gain.setTargetAtTime(f1 * FormantFilter.LFO_DEPTH_RATIO, now, SMOOTHING_TIME);
    this.f2LfoGain.gain.setTargetAtTime(f2 * FormantFilter.LFO_DEPTH_RATIO, now, SMOOTHING_TIME);
    this.f3LfoGain.gain.setTargetAtTime(f3 * FormantFilter.LFO_DEPTH_RATIO, now, SMOOTHING_TIME);
  }

  setFormantsImmediate(f1: number, f2: number, f3: number): void {
    this.f1Center = f1;
    this.f2Center = f2;
    this.f3Center = f3;
    
    this.f1Resonator.frequency.value = f1;
    this.f2Resonator.frequency.value = f2;
    this.f3Resonator.frequency.value = f3;
    
    this.f1LfoGain.gain.value = f1 * FormantFilter.LFO_DEPTH_RATIO;
    this.f2LfoGain.gain.value = f2 * FormantFilter.LFO_DEPTH_RATIO;
    this.f3LfoGain.gain.value = f3 * FormantFilter.LFO_DEPTH_RATIO;
  }

  /**
   * Set F1 bandwidth (converts to Q: Q = freq / bandwidth)
   */
  setF1Bandwidth(bw: number): void {
    const q = this.f1Center / bw;
    this.f1Resonator.Q.setTargetAtTime(q, this.ctx.currentTime, SMOOTHING_TIME);
  }

  /**
   * Set F2 bandwidth (converts to Q: Q = freq / bandwidth)
   */
  setF2Bandwidth(bw: number): void {
    const q = this.f2Center / bw;
    this.f2Resonator.Q.setTargetAtTime(q, this.ctx.currentTime, SMOOTHING_TIME);
  }

  /**
   * Set F1 gain in dB
   */
  setF1Gain(gain: number): void {
    this.f1Resonator.gain.setTargetAtTime(gain, this.ctx.currentTime, SMOOTHING_TIME);
  }

  /**
   * Set F2 gain in dB
   */
  setF2Gain(gain: number): void {
    this.f2Resonator.gain.setTargetAtTime(gain, this.ctx.currentTime, SMOOTHING_TIME);
  }

  connect(destination: AudioNode): void {
    this.outputGain.connect(destination);
  }

  disconnect(): void {
    this.outputGain.disconnect();
  }
}
