"use client";

import { useState, ReactNode } from "react";
import React from 'react';
import './style.css';

type Props = {
  main: ReactNode;   // 메인에 보일 콘텐츠
  pip: ReactNode;    // 우하단 썸네일에 보일 콘텐츠
  pipWidth?: number;
  pipHeight?: number;
  offset?: number;   // 모서리 여백
};

export default function SwapPiP({
  main,
  pip,
  pipWidth = 260,
  pipHeight = 160,
  offset = 24,
}: Props) {
  const [swapped, setSwapped] = useState(false);
  const toggle = () => setSwapped(v => !v);

  // swapped=false -> main=main, pip=pip
  // swapped=true  -> main=pip,  pip=main
  const Main = swapped ? pip : main;
  const Pip  = swapped ? main : pip;

  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden">
      {/* 메인 영역 */}
      <div
        className="h-[70vh] w-full rounded-xl bg-black/5 ring-1 ring-black/10 overflow-hidden transition-all duration-500"
        onClick={toggle}
        role="button"
        aria-label="메인/썸네일 전환"
      >
        <div className="h-full w-full">{Main}</div>
      </div>

      {/* 우하단 썸네일 (항상 떠 있음) */}
      <button
        type="button"
        onClick={toggle}
        aria-label="메인/썸네일 전환"
        className="fixed z-50 rounded-xl overflow-hidden shadow-xl ring-1 ring-black/10 hover:ring-black/20 transition-all duration-300"
        style={{
          width: pipWidth,
          height: pipHeight,
          right: offset,
          bottom: offset,
        }}
      >
        <div className="h-full w-full">{Pip}</div>
      </button>
    </div>
  );
}
