/**
 * Rosenberg Glottal Source using AudioWorklet
 * 
 * Wrapper class for the Rosenberg AudioWorklet processor.
 */

import type { GlottalSource } from './AudioEngine';

const SMOOTHING_TIME = 0.02;

export class RosenbergSource implements GlottalSource {
  private ctx: AudioContext;
  private workletNode: AudioWorkletNode | null = null;
  private gainNode: GainNode;
  private _isRunning = false;
  private static workletLoaded = false;
  private static loadPromise: Promise<void> | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0.8; // Source gain (Rosenberg has lower raw amplitude)
  }

  static async loadWorklet(ctx: AudioContext): Promise<void> {
    if (RosenbergSource.workletLoaded) return;
    
    if (RosenbergSource.loadPromise) {
      return RosenbergSource.loadPromise;
    }

    RosenbergSource.loadPromise = (async () => {
      const workletUrl = new URL('../worklets/rosenberg-processor.js', import.meta.url).href;
      await ctx.audioWorklet.addModule(workletUrl);
      RosenbergSource.workletLoaded = true;
    })();

    return RosenbergSource.loadPromise;
  }

  get output(): AudioNode {
    return this.gainNode;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  setFrequency(f0: number): void {
    if (this.workletNode) {
      const param = this.workletNode.parameters.get('f0');
      if (param) {
        param.setTargetAtTime(f0, this.ctx.currentTime, SMOOTHING_TIME);
      }
    }
  }

  private currentJitter = 1.0;

  start(f0: number): void {
    if (this._isRunning) return;
    
    this.workletNode = new AudioWorkletNode(this.ctx, 'rosenberg-processor', {
      parameterData: {
        f0,
        openQuotient: 0.6,
        speedQuotient: 2.0,
        amplitude: 0.5,
        jitter: this.currentJitter,
      },
    });
    
    this.workletNode.connect(this.gainNode);
    this._isRunning = true;
  }

  setJitter(jitter: number): void {
    this.currentJitter = jitter;
    if (this.workletNode) {
      const param = this.workletNode.parameters.get('jitter');
      if (param) {
        param.setTargetAtTime(jitter, this.ctx.currentTime, SMOOTHING_TIME);
      }
    }
  }

  stop(): void {
    if (!this._isRunning || !this.workletNode) return;
    
    this.workletNode.disconnect();
    this.workletNode = null;
    this._isRunning = false;
  }

  connect(destination: AudioNode): void {
    this.gainNode.connect(destination);
  }

  disconnect(): void {
    this.gainNode.disconnect();
  }
}
