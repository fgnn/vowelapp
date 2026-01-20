/**
 * AudioEngine - Main audio orchestrator
 * 
 * Manages the source-filter signal chain:
 * Source -> Gain -> F1 -> F2 -> F3 -> AnalyserNode -> destination
 */

import { FormantFilter } from './FormantFilter';
import { SawtoothSource } from './SawtoothSource';
import { RosenbergSource } from './RosenbergWorklet';
import { LFSource } from './LFWorklet';
import type { SourceType } from '../state/synthStore';

export interface GlottalSource {
  output: AudioNode;
  isRunning: boolean;
  setFrequency(f0: number): void;
  setJitter?(jitter: number): void;
  start(f0: number): void;
  stop(): void;
  connect(destination: AudioNode): void;
  disconnect(): void;
}

class AudioEngineImpl {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private formantFilter: FormantFilter | null = null;
  private currentSource: GlottalSource | null = null;
  private currentSourceType: SourceType = 'sawtooth';
  private currentF0 = 120;
  private isInitialized = false;
  private workletsLoaded = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    this.ctx = new AudioContext();
    
    // Create master gain for volume control
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.ctx.destination);
    
    // Create analyser for visualizations
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0.7;
    this.analyser.connect(this.masterGain);

    // Create formant filter bank
    this.formantFilter = new FormantFilter(this.ctx);
    this.formantFilter.setFormantsImmediate(500, 1500, 2500);
    this.formantFilter.connect(this.analyser);

    // Load worklets
    await this.loadWorklets();

    // Create initial source
    this.currentSource = new SawtoothSource(this.ctx);
    this.currentSource.connect(this.formantFilter.input);

    this.isInitialized = true;
  }

  private async loadWorklets(): Promise<void> {
    if (this.workletsLoaded || !this.ctx) return;

    await Promise.all([
      RosenbergSource.loadWorklet(this.ctx),
      LFSource.loadWorklet(this.ctx),
    ]);

    this.workletsLoaded = true;
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  getContext(): AudioContext | null {
    return this.ctx;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  setFormants(f1: number, f2: number, f3: number): void {
    this.formantFilter?.setFormants(f1, f2, f3);
  }

  setF1Bandwidth(bw: number): void {
    this.formantFilter?.setF1Bandwidth(bw);
  }

  setF2Bandwidth(bw: number): void {
    this.formantFilter?.setF2Bandwidth(bw);
  }

  setF1Gain(gain: number): void {
    this.formantFilter?.setF1Gain(gain);
  }

  setF2Gain(gain: number): void {
    this.formantFilter?.setF2Gain(gain);
  }

  setJitter(jitter: number): void {
    if (this.currentSource?.setJitter) {
      this.currentSource.setJitter(jitter);
    }
  }

  setF0(f0: number): void {
    this.currentF0 = f0;
    this.currentSource?.setFrequency(f0);
  }

  setVolume(volume: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.02);
    }
  }

  setSourceType(type: SourceType): void {
    if (!this.ctx || !this.formantFilter || type === this.currentSourceType) return;

    const wasPlaying = this.currentSource?.isRunning ?? false;

    // Stop and disconnect old source
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource.disconnect();
    }

    // Create new source
    switch (type) {
      case 'sawtooth':
        this.currentSource = new SawtoothSource(this.ctx);
        break;
      case 'rosenberg':
        this.currentSource = new RosenbergSource(this.ctx);
        break;
      case 'lf':
        this.currentSource = new LFSource(this.ctx);
        break;
    }

    // Connect new source
    this.currentSource.connect(this.formantFilter.input);
    this.currentSourceType = type;

    // Resume if was playing
    if (wasPlaying) {
      this.currentSource.start(this.currentF0);
    }
  }

  start(): void {
    if (!this.currentSource?.isRunning) {
      this.currentSource?.start(this.currentF0);
    }
  }

  stop(): void {
    if (this.currentSource?.isRunning) {
      this.currentSource?.stop();
    }
  }

  isPlaying(): boolean {
    return this.currentSource?.isRunning ?? false;
  }
}

// Singleton instance
export const AudioEngine = new AudioEngineImpl();
