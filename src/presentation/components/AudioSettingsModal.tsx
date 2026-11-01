/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Volume2, Headphones, Smartphone, CloudRain, RotateCcw } from 'lucide-react';
import { AudioSettings } from '../../domain/schemas/index.ts';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (settings: Partial<AudioSettings>) => void;
  onResetProgress: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col space-y-5">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-black text-slate-100">音響 ＆ 触感カスタマイズ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* マスター音量 */}
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              マスター音量
            </span>
            <span className="text-sky-400">{Math.round(settings.masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.masterVolume}
            onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>

        {/* バイノーラル立体音響 (ステレオパン) */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
          <div className="flex items-center gap-2.5">
            <Headphones className="w-4 h-4 text-sky-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">バイノーラル立体音響</span>
              <span className="text-[10px] text-slate-400">タッチ位置に応じて左右の耳に音が定位</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.stereoPanningEnabled}
            onChange={(e) => onUpdateSettings({ stereoPanningEnabled: e.target.checked })}
            className="w-5 h-5 accent-sky-400 cursor-pointer rounded"
          />
        </div>

        {/* 触感フィードバック (ハプティクス) */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">触感バイブレーション</span>
              <span className="text-[10px] text-slate-400">端末の触覚フィードバックと連動</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.hapticEnabled}
            onChange={(e) => onUpdateSettings({ hapticEnabled: e.target.checked })}
            className="w-5 h-5 accent-emerald-400 cursor-pointer rounded"
          />
        </div>

        {/* 環境アンビエント音 */}
        <div className="flex flex-col space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            アンビエントBGM (Web Audio合成)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'なし' },
              { id: 'gentle_rain', label: 'やさしい雨音' },
              { id: 'tape_hiss', label: 'テープヒス' },
            ].map((amb) => (
              <button
                key={amb.id}
                onClick={() => onUpdateSettings({ ambientSound: amb.id as AudioSettings['ambientSound'] })}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                  settings.ambientSound === amb.id
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {amb.label}
              </button>
            ))}
          </div>
        </div>

        {/* リセット */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              if (window.confirm('タワーのぼり進行データを初期化しますか？')) {
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg hover:bg-rose-950/40 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>進行状況リセット</span>
          </button>
        </div>
      </div>
    </div>
  );
};
