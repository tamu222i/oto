/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioSettings, SensoryType } from '../../domain/schemas/index.ts';

export class AsmrAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private settings: AudioSettings;
  private noiseBuffer: AudioBuffer | null = null;

  constructor(settings: AudioSettings) {
    this.settings = settings;
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // マスターゲイン
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.settings.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // アンビエント用ゲイン
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.settings.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // ホワイト/ピンクノイズバッファの生成 (1秒分)
      this.generateNoiseBuffer();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    return this.ctx;
  }

  private generateNoiseBuffer(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // ピンクノイズ生成フィルター (Paul Kellet フィルター法)
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    this.noiseBuffer = buffer;
  }

  public updateSettings(settings: AudioSettings): void {
    this.settings = settings;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(settings.masterVolume, this.ctx.currentTime);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(settings.ambientVolume, this.ctx.currentTime);
    }
    this.updateAmbientSound(settings.ambientSound);
  }

  /**
   * パンノードの生成 (立体音響)
   */
  private createPanner(pan: number): StereoPannerNode | null {
    if (!this.ctx || !this.settings.stereoPanningEnabled || !this.ctx.createStereoPanner) {
      return null;
    }
    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-0.95, Math.min(0.95, pan)), this.ctx.currentTime);
    return panner;
  }

  /**
   * 1F: プチプチくん (Bubble Wrap Pop)
   */
  public playBubblePop(pan: number = 0, isGolden: boolean = false, intensity: number = 1.0): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const dest = this.masterGain!;

    const panner = this.createPanner(pan);
    const nodeTarget = panner || dest;
    if (panner) panner.connect(dest);

    // 1. メインの気泡破裂スウィープ音
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    const startFreq = isGolden ? 880 : 560 + (Math.random() * 160 - 80);
    const endFreq = isGolden ? 440 : 180 + (Math.random() * 60 - 30);

    osc.type = isGolden ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

    const popVol = (isGolden ? 0.9 : 0.65) * Math.min(1.5, intensity);
    oscGain.gain.setValueAtTime(popVol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isGolden ? 0.12 : 0.07));

    osc.connect(oscGain);
    oscGain.connect(nodeTarget);

    osc.start(now);
    osc.stop(now + 0.15);

    // 2. プラスチックフィルムの破裂スナップ (ノイズクリック)
    if (this.noiseBuffer) {
      const snapSrc = ctx.createBufferSource();
      snapSrc.buffer = this.noiseBuffer;
      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'highpass';
      snapFilter.frequency.setValueAtTime(isGolden ? 4500 : 3200, now);

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.35 * intensity, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      snapSrc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(nodeTarget);

      snapSrc.start(now);
      snapSrc.stop(now + 0.05);
    }
  }

  /**
   * 2F: バタースクイーズ (Creamy Butter Squeeze)
   */
  public playButterSquish(pan: number = 0, intensity: number = 1.0, isCut: boolean = false): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const dest = this.masterGain!;

    const panner = this.createPanner(pan);
    const nodeTarget = panner || dest;
    if (panner) panner.connect(dest);

    // バターのねっとり低域レゾナンス
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';

    const baseF = isCut ? 240 : 130 + Math.random() * 40;
    osc.frequency.setValueAtTime(baseF, now);
    osc.frequency.exponentialRampToValueAtTime(baseF * 0.7, now + 0.2);

    oscGain.gain.setValueAtTime(0.4 * intensity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(oscGain);
    oscGain.connect(nodeTarget);
    osc.start(now);
    osc.stop(now + 0.25);

    // クリーミーな摩擦音（ピンクノイズのローパス）
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);
      filter.Q.setValueAtTime(4, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime((isCut ? 0.5 : 0.35) * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(nodeTarget);

      noise.start(now);
      noise.stop(now + 0.22);
    }
  }

  /**
   * 3F: パキパキスクイーズ (Crunchy Crackle / Tape Ball)
   */
  public playCrunchyCrack(pan: number = 0, intensity: number = 1.0, fractureCount: number = 4): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const dest = this.masterGain!;

    const panner = this.createPanner(pan);
    const nodeTarget = panner || dest;
    if (panner) panner.connect(dest);

    // 多重亀裂マイクロ破裂 (パキパキッ!)
    const totalFractures = Math.min(8, Math.max(3, fractureCount));
    for (let i = 0; i < totalFractures; i++) {
      const offset = i * (0.012 + Math.random() * 0.016);
      const crackTime = now + offset;

      // 短い高域スナップ
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      const snapFreq = 1200 + Math.random() * 1800;
      snapOsc.frequency.setValueAtTime(snapFreq, crackTime);
      snapOsc.frequency.exponentialRampToValueAtTime(300, crackTime + 0.025);

      snapGain.gain.setValueAtTime(0.45 * intensity, crackTime);
      snapGain.gain.exponentialRampToValueAtTime(0.001, crackTime + 0.03);

      snapOsc.connect(snapGain);
      snapGain.connect(nodeTarget);
      snapOsc.start(crackTime);
      snapOsc.stop(crackTime + 0.04);

      // クラックルノイズ
      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3500 + Math.random() * 2000, crackTime);
        filter.Q.setValueAtTime(8, crackTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35 * intensity, crackTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, crackTime + 0.035);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(nodeTarget);

        noise.start(crackTime);
        noise.stop(crackTime + 0.04);
      }
    }
  }

  /**
   * 4F: スライムポーク＆ストレッチ (Slime Squelch & Poke)
   */
  public playSlimePoke(pan: number = 0, intensity: number = 1.0, isStretch: boolean = false): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const dest = this.masterGain!;

    const panner = this.createPanner(pan);
    const nodeTarget = panner || dest;
    if (panner) panner.connect(dest);

    // ジュポッという気泡キャビテーション音
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';

    const startF = isStretch ? 180 : 380 + Math.random() * 120;
    const endF = isStretch ? 280 : 120 + Math.random() * 40;

    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + (isStretch ? 0.25 : 0.09));

    oscGain.gain.setValueAtTime(0.55 * intensity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isStretch ? 0.28 : 0.1));

    osc.connect(oscGain);
    oscGain.connect(nodeTarget);
    osc.start(now);
    osc.stop(now + 0.3);

    // 水分感のあるチュパッというウェットノイズ
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      filter.Q.setValueAtTime(10, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4 * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(nodeTarget);

      noise.start(now);
      noise.stop(now + 0.12);
    }
  }

  /**
   * 5F: キネティックサンド (Kinetic Sand Slice)
   */
  public playKineticSlice(pan: number = 0, intensity: number = 1.0): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const dest = this.masterGain!;

    const panner = this.createPanner(pan);
    const nodeTarget = panner || dest;
    if (panner) panner.connect(dest);

    if (this.noiseBuffer) {
      // 砂粒の微小擦れ音
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800 + Math.random() * 800, now);
      filter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5 * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(nodeTarget);

      noise.start(now);
      noise.stop(now + 0.18);
    }
  }

  /**
   * 6F: ソープカービング (Soap Grid Carving)
   */
  public playSoapCarve(pan: number = 0, intensity: number = 1.0): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const dest = this.masterGain!;

    const panner = this.createPanner(pan);
    const nodeTarget = panner || dest;
    if (panner) panner.connect(dest);

    // 刃先がキューブを切り落とすサクッという硬質なクリスプ音
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(940 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);

    oscGain.gain.setValueAtTime(0.45 * intensity, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(oscGain);
    oscGain.connect(nodeTarget);
    osc.start(now);
    osc.stop(now + 0.06);

    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3800, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4 * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(nodeTarget);

      noise.start(now);
      noise.stop(now + 0.06);
    }
  }

  /**
   * 触感種別に応じたサウンド再生ディスパッチャ
   */
  public playSensorySound(type: SensoryType, pan: number, intensity: number = 1.0, meta?: { isGolden?: boolean; isCut?: boolean; isStretch?: boolean }): void {
    switch (type) {
      case 'bubble_wrap':
        this.playBubblePop(pan, meta?.isGolden, intensity);
        break;
      case 'butter_squeeze':
        this.playButterSquish(pan, intensity, meta?.isCut);
        break;
      case 'crunchy_squeeze':
        this.playCrunchyCrack(pan, intensity, 5);
        break;
      case 'slime_poke':
        this.playSlimePoke(pan, intensity, meta?.isStretch);
        break;
      case 'kinetic_sand':
        this.playKineticSlice(pan, intensity);
        break;
      case 'soap_carving':
        this.playSoapCarve(pan, intensity);
        break;
    }
  }

  /**
   * エレベーター昇降＆フロアクリア祝賀チャイム
   */
  public playAscendChime(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const dest = this.masterGain!;

    // 天使のような美しいメジャー和音アルペジオ (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.9);
    });
  }

  /**
   * ゾクゾク度100% ASMRフィーバー発動音
   */
  public playFeverTrigger(): void {
    const ctx = this.initContext();
    const now = ctx.currentTime;
    const dest = this.masterGain!;

    // シマーリング・グライド
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  /**
   * アンビエントBGM (雨音、テープヒスノイズなど)
   */
  private updateAmbientSound(type: string): void {
    if (!this.ctx || !this.ambientGain) return;

    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientSource = null;
    }

    if (type === 'none' || !this.noiseBuffer) return;

    // ループノイズソースの作成
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    if (type === 'gentle_rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    } else if (type === 'tape_hiss') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4500, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    }

    src.connect(filter);
    filter.connect(this.ambientGain);
    src.start();
    this.ambientSource = src;
  }
}
