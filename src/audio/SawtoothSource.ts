/**
 * Sawtooth Glottal Source
 * 
 * Uses native OscillatorNode with sawtooth waveform.
 * A sawtooth approximates the derivative of glottal flow.
 */

import type { GlottalSource } from './AudioEngine';

const SMOOTHING_TIME = 0.02;

export class SawtoothSource implements GlottalSource {
  private ctx: AudioContext;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private _isRunning = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0.5; // Source gain
  }

  get output(): AudioNode {
    return this.gainNode;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  setFrequency(f0: number): void {
    if (this.oscillator) {
      this.oscillator.frequency.setTargetAtTime(f0, this.ctx.currentTime, SMOOTHING_TIME);
    }
  }

  start(f0: number): void {
    if (this._isRunning) return;
    
    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = 'sawtooth';
    this.oscillator.frequency.value = f0;
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
    this._isRunning = true;
  }

  stop(): void {
    if (!this._isRunning || !this.oscillator) return;
    
    this.oscillator.stop();
    this.oscillator.disconnect();
    this.oscillator = null;
    this._isRunning = false;
  }

  connect(destination: AudioNode): void {
    this.gainNode.connect(destination);
  }

  disconnect(): void {
    this.gainNode.disconnect();
  }
}
