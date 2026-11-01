/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Grid, RefreshCw } from 'lucide-react';
import { FloorStage } from '../../domain/schemas/index.ts';

interface SoapCarvingStageProps {
  floor: FloorStage;
  onInteract: (
    type: 'soap_carving',
    actionType: 'carve',
    x: number,
    y: number,
    intensity: number
  ) => void;
}

interface SoapCube {
  id: number;
  carved: boolean;
}

export const SoapCarvingStage: React.FC<SoapCarvingStageProps> = ({ floor, onInteract }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cubes, setCubes] = useState<SoapCube[]>([]);

  const initSoap = () => {
    const list: SoapCube[] = [];
    for (let i = 0; i < 49; i++) {
      list.push({ id: i, carved: false });
    }
    setCubes(list);
  };

  useEffect(() => {
    initSoap();
  }, []);

  const carveCube = (idx: number, clientX: number, clientY: number) => {
    const cube = cubes[idx];
    if (!cube || cube.carved) return;

    setCubes((prev) => {
      const next = [...prev];
      next[idx] = { ...cube, carved: true };
      return next;
    });

    let normX = 0.5;
    let normY = 0.5;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    }

    onInteract('soap_carving', 'carve', normX, normY, 1.25);
  };

  // タッチスワイプで連続カービング
  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const cubeEl = target?.closest('[data-soap-index]');
      if (cubeEl) {
        const idx = Number(cubeEl.getAttribute('data-soap-index'));
        if (!isNaN(idx)) {
          carveCube(idx, touch.clientX, touch.clientY);
        }
      }
    }
  };

  const carvedCount = cubes.filter((c) => c.carved).length;

  return (
    <div className="relative flex flex-col items-center w-full max-w-2xl mx-auto p-4 select-none touch-none">
      {/* 操作ガイド */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2 text-xs md:text-sm text-cyan-300 font-semibold bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-800/60">
          <Grid className="w-4 h-4 text-cyan-400" />
          <span>スワイプして石鹸グリッドをサクサク削り落とす！</span>
        </div>

        <button
          onClick={initSoap}
          className="flex items-center gap-1.5 text-xs md:text-sm bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>石鹸補充 ({carvedCount}/{cubes.length})</span>
        </button>
      </div>

      {/* 石鹸グリッドバー */}
      <div
        ref={containerRef}
        onTouchMove={handleTouchMove}
        className="w-full bg-gradient-to-b from-cyan-950/30 to-slate-900/80 rounded-3xl border-2 border-cyan-500/30 p-6 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.15)]"
      >
        <div className="grid grid-cols-7 gap-1.5 p-3 bg-gradient-to-br from-cyan-300 via-sky-400 to-teal-500 rounded-2xl border-4 border-cyan-200 shadow-[0_15px_35px_rgba(6,182,212,0.3)]">
          {cubes.map((c, idx) => (
            <div
              key={c.id}
              data-soap-index={idx}
              onMouseEnter={(e) => {
                if (e.buttons === 1) carveCube(idx, e.clientX, e.clientY);
              }}
              onClick={(e) => carveCube(idx, e.clientX, e.clientY)}
              className={`
                w-9 h-9 sm:w-12 sm:h-12 rounded-md transition-all duration-150 transform cursor-pointer flex items-center justify-center
                ${
                  c.carved
                    ? 'bg-slate-900/60 border border-slate-700/30 shadow-inner scale-75 opacity-20 pointer-events-none'
                    : 'bg-gradient-to-tr from-cyan-100 to-white border border-cyan-300 shadow-[0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:scale-105 active:scale-90'
                }
              `}
            >
              {!c.carved && (
                <div className="w-2 h-2 rounded-sm bg-cyan-200/60 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
