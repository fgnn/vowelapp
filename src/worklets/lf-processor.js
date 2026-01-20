/**
 * LF (Liljencrants-Fant) Glottal Pulse Model AudioWorklet Processor
 * 
 * Simplified but stable implementation of the LF model.
 * Generates glottal flow derivative waveform.
 * 
 * Includes:
 * - Per-cycle OQ jitter for natural variation (user-controlled)
 * - Gentle spectral tilt via one-pole lowpass
 * 
 * Parameters:
 * - f0: Fundamental frequency (Hz)
 * - openQuotient: Ratio of open phase to total period (0.4-0.7 typical)
 * - jitter: Amount of per-cycle variation (0-5%)
 */

class LFProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'f0', defaultValue: 120, minValue: 50, maxValue: 1000, automationRate: 'k-rate' },
      { name: 'openQuotient', defaultValue: 0.6, minValue: 0.3, maxValue: 0.8, automationRate: 'k-rate' },
      { name: 'jitter', defaultValue: 1.0, minValue: 0, maxValue: 5, automationRate: 'k-rate' },
    ];
  }

  constructor() {
    super();
    this.phase = 0;
    this.currentOqJitter = 0;
    
    // Smoothed random for less noisy jitter
    this.smoothedRandom = 0;
    
    // One-pole lowpass for gentle spectral tilt
    this.lpState = 0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const channel = output[0];
    
    if (!channel) return true;

    const f0 = parameters.f0[0];
    const baseOq = parameters.openQuotient[0];
    const jitterPercent = parameters.jitter[0] / 100;
    
    const phaseIncrement = f0 / sampleRate;
    
    // Gentle lowpass - cutoff at 3000 Hz for mild spectral tilt
    const cutoffFreq = 3000;
    const lpCoeff = Math.exp(-2 * Math.PI * cutoffFreq / sampleRate);
    
    for (let i = 0; i < channel.length; i++) {
      const oq = baseOq * (1 + this.currentOqJitter);
      
      const Tp = oq * 0.4;
      const Te = oq * 0.8;
      const Tc = oq;
      
      let sample = 0;
      const t = this.phase;

      if (t < Tp) {
        const omega = Math.PI / (2 * Tp);
        sample = Math.sin(omega * t);
      } else if (t < Te) {
        const tNorm = (t - Tp) / (Te - Tp);
        sample = Math.cos(tNorm * Math.PI);
      } else if (t < Tc) {
        const tNorm = (t - Te) / (Tc - Te);
        const returnValue = -1 + tNorm;
        sample = returnValue * Math.exp(-3 * tNorm);
      } else {
        sample = 0;
      }

      sample *= 0.8;
      
      // Apply gentle spectral tilt
      this.lpState = lpCoeff * this.lpState + (1 - lpCoeff) * sample;
      channel[i] = this.lpState;

      this.phase += phaseIncrement;
      
      if (this.phase >= 1) {
        this.phase -= 1;
        
        if (jitterPercent > 0) {
          const targetRandom = (Math.random() - 0.5) * 2 * jitterPercent;
          this.smoothedRandom = this.smoothedRandom * 0.7 + targetRandom * 0.3;
          this.currentOqJitter = this.smoothedRandom;
        } else {
          this.currentOqJitter = 0;
        }
      }
    }

    for (let ch = 1; ch < output.length; ch++) {
      output[ch].set(channel);
    }

    return true;
  }
}

registerProcessor('lf-processor', LFProcessor);
