/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, TestTube2, CheckCircle2, XCircle, Play, ShieldCheck } from 'lucide-react';
import { TOWER_BDD_FEATURES } from '../../tests/bdd/towerSpecs.ts';
import { BddRunner } from '../../tests/bdd/bddRunner.ts';
import { FeatureExecutionResult } from '../../tests/bdd/bddTypes.ts';

interface BddTestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BddTestRunnerModal: React.FC<BddTestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<FeatureExecutionResult[] | null>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const res = await BddRunner.runAll(TOWER_BDD_FEATURES);
      setResults(res);
    } catch (e) {
      console.error('BDD Test run error', e);
    } finally {
      setIsRunning(false);
    }
  };

  const totalScenarios = TOWER_BDD_FEATURES.reduce((acc, f) => acc + f.scenarios.length, 0);
  const passedScenarios = results
    ? results.reduce((acc, f) => acc + f.scenarios.filter((s) => s.passed).length, 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-black text-slate-100">
                BDD仕様書 ＆ ライブテストランナー
              </h2>
              <p className="text-xs text-slate-400">
                Given - When - Then 振る舞い駆動開発テストスイート
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コントロールパネル */}
        <div className="my-3 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-indigo-200">
                {results ? `テスト完了: ${passedScenarios}/${totalScenarios} 合格` : `${totalScenarios} 件のBDDシナリオ`}
              </span>
              <span className="text-[11px] text-slate-400">
                スキーマ駆動＆DDD集約の振る舞いをブラウザ上で即時検証
              </span>
            </div>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md active:scale-95 transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? '実行中...' : 'テスト全実行'}</span>
          </button>
        </div>

        {/* テスト結果一覧 */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {(!results ? TOWER_BDD_FEATURES : results).map((feature, fIdx) => {
            const isFeatureResult = results !== null;
            const featResult = isFeatureResult ? (feature as FeatureExecutionResult) : null;
            const featDef = TOWER_BDD_FEATURES[fIdx];

            return (
              <div
                key={featDef.id}
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-200 text-sm">
                    {featDef.title}
                  </span>
                  {featResult && (
                    <span
                      className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        featResult.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {featResult.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {featResult.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  &ldquo;{featDef.userStory}&rdquo;
                </p>

                {/* シナリオ一覧 */}
                <div className="space-y-2 mt-2">
                  {featDef.scenarios.map((sc, sIdx) => {
                    const scResult = featResult?.scenarios[sIdx];
                    return (
                      <div
                        key={sc.id}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-300">
                            シナリオ: {sc.name}
                          </span>
                          {scResult && (
                            <span className="text-[10px] text-slate-500">
                              {scResult.durationMs}ms
                            </span>
                          )}
                        </div>

                        {/* GIVEN - WHEN - THEN ステップ */}
                        <div className="space-y-1 pl-1">
                          {sc.steps.map((step, stIdx) => {
                            const stepRes = scResult?.steps[stIdx];
                            return (
                              <div
                                key={stIdx}
                                className="flex items-start gap-1.5 text-[11px]"
                              >
                                <span className="font-mono font-black text-indigo-400 shrink-0">
                                  {step.type}:
                                </span>
                                <span className="text-slate-300 flex-1">
                                  {step.description}
                                </span>
                                {stepRes && (
                                  <span className="shrink-0">
                                    {stepRes.passed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                    )}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
