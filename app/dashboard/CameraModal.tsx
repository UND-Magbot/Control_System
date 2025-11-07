'use client';

import './style.css';
import React from 'react';
import { useEffect } from 'react';


export default function CameraModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }){

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // 스크롤 방지
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const handleDirection = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log(`Moving ${direction}`);
    // 여기에 로봇 제어 API 호출
  };
  
  const handleStop = () => {
    console.log('Stop');
    // 정지 명령
  };
  
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button className="closeBtn" onClick={onClose}>✕</button>
        
        {/* 카메라 화면 (80%) */}
        <div className="cameraSection">
            {/* 실제 카메라 스트림을 여기에 */}
            <img src="/images/camera_sample.png" alt="Robot Camera" className="cameraImage"/>
        </div>
        
        {/* 방향키 제어 (20%) */}
        <div className="controlSection">

          {/* 모서리 보조 버튼 */}
          <button className="camera-remote-btn menu"  aria-label="menu">≡</button>
          <button className="camera-remote-btn power" aria-label="power">⏻</button>
          <button className="camera-remote-btn stand" aria-label="stand/sit">Stand/<br/>sit</button>
          <button className="camera-remote-btn exit"  aria-label="exit">⎋</button>

          {/* D-pad */}
          <div className="directionPad">
            <div className="pad-empty"></div>
            <button className="directionBtn up"    onClick={() => handleDirection('up')}    aria-label="up">▲</button>
            <div className="pad-empty"></div>

            <button className="directionBtn left"  onClick={() => handleDirection('left')}  aria-label="left">◀</button>
            <button className="directionBtn stop"  onClick={handleStop} aria-label="ok">OK</button>
            <button className="directionBtn right" onClick={() => handleDirection('right')} aria-label="right">▶</button>

            <div className="pad-empty"></div>
            <button className="directionBtn down"  onClick={() => handleDirection('down')}  aria-label="down">▼</button>
            <div className="pad-empty"></div>
          </div>
        </div>
      </div>
    </div>
  );
}