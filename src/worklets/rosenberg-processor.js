/**
 * Rosenberg Glottal Pulse Model AudioWorklet Processor
 * 
 * Generates a glottal flow derivative waveform using the Rosenberg model.
 * The model uses polynomial functions for opening and closing phases.
 * 
 * Includes:
 * - Per-cycle OQ jitter for natural variation (user-controlled)
 * - Gentle spectral tilt via one-pole lowpass
 * 
 * Parameters:
 * - f0: Fundamental frequency (Hz)
 * - openQuotient: Ratio of open phase to total period (0.4-0.7 typical)
 * - speedQuotient: Ratio of opening to closing time (1.0-4.0 typical)
 * - amplitude: Output amplitude
 * - jitter: Amount of per-cycle variation (0-5%)
 */

class RosenbergProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'f0', defaultValue: 120, minValue: 50, maxValue: 1000, automationRate: 'k-rate' },
      { name: 'openQuotient', defaultValue: 0.6, minValue: 0.3, maxValue: 0.8, automationRate: 'k-rate' },
      { name: 'speedQuotient', defaultValue: 2.0, minValue: 0.5, maxValue: 5.0, automationRate: 'k-rate' },
      { name: 'amplitude', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' },
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
    const sq = parameters.speedQuotient[0];
    const amp = parameters.amplitude[0];
    const jitterPercent = parameters.jitter[0] / 100; // Convert to 0-0.05 range
    
    const phaseIncrement = f0 / sampleRate;
    
    // Gentle lowpass - cutoff at 3000 Hz for mild spectral tilt
    const cutoffFreq = 3000;
    const lpCoeff = Math.exp(-2 * Math.PI * cutoffFreq / sampleRate);

    for (let i = 0; i < channel.length; i++) {
      // Apply jittered OQ for this cycle
      const oq = baseOq * (1 + this.currentOqJitter);
      
      // Calculate opening and closing phase boundaries
      const openingEnd = (oq * sq) / (1 + sq);
      const closingEnd = oq;

      let sample = 0;

      if (this.phase < openingEnd) {
        const t = this.phase / openingEnd;
        sample = 6 * t * (1 - t);
      } else if (this.phase < closingEnd) {
        const t = (this.phase - openingEnd) / (closingEnd - openingEnd);
        sample = -2 * (1 - t);
      } else {
        sample = 0;
      }

      sample *= amp;
      
      // Apply gentle spectral tilt
      this.lpState = lpCoeff * this.lpState + (1 - lpCoeff) * sample;
      channel[i] = this.lpState;

      // Advance phase
      this.phase += phaseIncrement;
      
      // New cycle - update jitter with smoothed random
      if (this.phase >= 1) {
        this.phase -= 1;
        
        if (jitterPercent > 0) {
          // Smooth the random to reduce noise
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

registerProcessor('rosenberg-processor', RosenbergProcessor);
