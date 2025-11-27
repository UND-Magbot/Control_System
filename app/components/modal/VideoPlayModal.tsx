'use client';

import styles from './Modal.module.css';
import React, { useState, useEffect, useRef } from 'react';
import type { RobotRowData, Video, Camera, VideoItem } from '@/app/type';


type VideoPlayModalProps = {
    isOpen: boolean;
    onClose: () => void;
    playedVideoId: number | null;
    playedVideo: VideoItem | null;
};

export default function VideoPlayModal({
    isOpen,
    onClose,
    playedVideoId,
    playedVideo
}: VideoPlayModalProps) {


    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const controlsRef = useRef<HTMLDivElement | null>(null);
    const progressBarRef = useRef<HTMLInputElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);        // 총 길이 (초)
    const [currentTime, setCurrentTime] = useState(0);  // 현재 재생 위치 (초)
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);            // 0 ~ 1

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true); // hover 감지

    const [showPlayButton, setShowPlayButton] = useState(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 메타데이터 로딩 완료 시 길이 설정
    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (video) {
        setDuration(video.duration || 0);
        }
    };

    // 재생 시 위치 업데이트
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video) {
        setCurrentTime(video.currentTime);
        }
    };

    // 재생 / 일시정지 토글
    const handlePlayPause = () => {

        clearHideTimer();
        const video = videoRef.current;
        
        if (!video) return;

        if (video.paused || video.ended) {
        video.play();
        setIsPlaying(true);
        } else {
        video.pause();
        setIsPlaying(false);
        }
    };

    // progress bar 드래그 → 재생 위치 변경
    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const value = Number(e.target.value); // 0 ~ 100 (%)
        const newTime = (value / 100) * duration;
        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // 볼륨 슬라이더 변경
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const value = Number(e.target.value); // 0 ~ 1
        video.volume = value;
        setVolume(value);

        if (value === 0) {
        setIsMuted(true);
        video.muted = true;
        } else {
        setIsMuted(false);
        video.muted = false;
        }
    };

    // 음소거 토글
    const handleMuteToggle = () => {
        const video = videoRef.current;
        if (!video) return;

        const nextMuted = !isMuted;
        video.muted = nextMuted;
        setIsMuted(nextMuted);

        // 음소거 해제 시 볼륨 0이면 약간 살려주기
        if (!nextMuted && volume === 0) {
        video.volume = 0.5;
        setVolume(0.5);
        }
    };

    // 재생 끝났을 때 상태 초기화
    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    // 시간이 바뀔 때마다 progress bar 퍼센트 계산
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const volumePercent = volume * 100;  // volume: 0 ~ 1

    // 시간 표시 포맷 (mm:ss)
    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds).padStart(2, "0");
        return `${mm}:${ss}`;
    };

    const clearHideTimer = () => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    const handleMouseMove = () => {
        if (!isPlaying) {
            setShowPlayButton(true);
            clearHideTimer();
            return;
        }

        setShowPlayButton(true);
        clearHideTimer();

        hideTimeoutRef.current = setTimeout(() => {
            setShowPlayButton(false);
        }, 2000);
    };

    const handleMouseLeave = () => {
        if (!isPlaying) {
            setShowPlayButton(true);
            clearHideTimer();
            return;
        }

        clearHideTimer();
        setShowPlayButton(false);
    };

    const handleAutoPlayStart = () => {
        // 재생 상태 업데이트
        setIsPlaying(true);
        
        // 아이콘 먼저 보였다가 (재생중이니)
        setShowPlayButton(true);

        // 1초뒤 자동으로 사라지도록
        setTimeout(() => {
            setShowPlayButton(false);
        }, 2000);
    };

    const resetVideoState = () => {
        // 1) 비디오 플레이어 자체 초기화
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // ⬅ 실제 영상 위치 0초로
        }

        // 2) 상태 초기화
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(prev => prev); // duration은 그대로 두거나, 원하면 0으로

    };


    // 전체화면 기능
    // ============================================================
    const handleFullscreenToggle = async () => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        if (!document.fullscreenElement) {
            await wrapperRef.current?.requestFullscreen();   // ✅ div 전체를 전체화면
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const onFSChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", onFSChange);
        return () => document.removeEventListener("fullscreenchange", onFSChange);
    }, []);

    // 컨트롤바 자동 숨김 (유튜브 방식)
    useEffect(() => {
        // 전체화면이 아니면 항상 보임
        if (!isFullscreen) {
            setShowControls(true);
            return;
        }

        // ⭐ 정지 상태면 항상 보임
        if (!isPlaying) {
            setShowControls(true);
            return;
        }

        let timeout: NodeJS.Timeout;

        const handleMove = () => {
            setShowControls(true);

            clearTimeout(timeout);
            timeout = setTimeout(() => setShowControls(false), 2000);
        };

        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, [isFullscreen, isPlaying]);

    useEffect(() => {
        if (!progressBarRef.current) return;

        const percentage = progressPercent; // 0~100

        progressBarRef.current.style.background = `
            linear-gradient(
            to right,
            #8dd4f5 ${percentage}%,
            #4b5563 ${percentage}%
            )
        `;
    }, [progressPercent]);

    // ---------------------------
    // Close Modal
    // ---------------------------

    
    const handleClosePopup = () => {
        // 재생 정보 초기화
        resetVideoState();
        onClose();
    };


    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClosePopup();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        if (!isOpen) {
            // 모달이 닫히는 순간 싹 초기화
            resetVideoState();
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;


  return (
    <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.videoViewText}>
                <div className={styles.videoViewTopText}>
                    <div className={`${styles.nameBox} ${styles.RobotCamNameBox}`}>{playedVideo?.robotNo}</div>
                    <div className={`${styles.nameBox} ${styles.RobotCamNameBox}`}>{playedVideo?.cameraNo}</div>
                    <div className={`${styles.nameBox} ${styles.videoNameBox}`}>
                        <div className={styles.cameratypeIcon}></div>
                        <div>{playedVideo?.cameraType}</div>
                    </div>
                </div>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            <div className={styles.playerWrapper} ref={wrapperRef}>
                <div className={styles.videoViewBox}
                  onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    >
                    <video className={styles.videoView} 
                            ref={videoRef}
                            autoPlay
                            src={"/videos/control_system_sample.mp4"}
                            onLoadedMetadata={handleLoadedMetadata}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={handleEnded}
                            onPlay={handleAutoPlayStart}  />
                    {/* ▶ / ❚❚ 아이콘 */}
                    {showPlayButton && (
                        <div className={styles.videoViewIcon} onClick={handlePlayPause}>
                            <img
                                src={isPlaying ? "/icon/pause.png" : "/icon/play-btn.png"}
                                alt={isPlaying ? "Pause" : "Play"}
                            />
                        </div>
                    )}
                </div>


                {/* 컨트롤 바 */}
                <div ref={controlsRef} 
                    className={`${styles.controlBox} 
                    ${isFullscreen ? styles.fullscreenControls : ''}
                    ${isFullscreen && !showControls ? styles.hide : styles.show}`}>

                    {/* 재생 위치 슬라이더 */}
                    <input ref={progressBarRef} type="range" min={0} max={100} step={0.1} value={progressPercent} onChange={handleSeekChange} className={styles.progressBar} />

                    <div className={styles.playBarBox} >
                        <div className={styles.controls} >
                            {/* 재생 / 일시정지 버튼 */}
                            <button type="button" className={styles.iconBtn} onClick={handlePlayPause} >
                                <img src={isPlaying ? "/icon/pause.png" : "/icon/play-btn.png"} alt={isPlaying ? "Pause" : "Play"} />
                            </button>

                            {/* 음소거 버튼 */}
                            <button type="button" className={styles.iconBtn} onClick={handleMuteToggle} >
                                <img src={isMuted || volume === 0 ? "/icon/sound-btn-off.png" : "/icon/sound-btn.png"} alt={isMuted || volume === 0 ? "Muted" : "Volume"} />
                            </button>

                            {/* 볼륨 슬라이더 */}
                            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolumeChange} className={styles.volumeBar} style={{ "--volume-percent": `${volumePercent}%` } as React.CSSProperties} />

                            {/* 현재시간 / 전체시간 */}
                            <div className={styles.timeText}> <span>{formatTime(currentTime)}</span> / {formatTime(duration)} </div>
                        </div>

                        {/* 전체화면 버튼 */}
                        <button className={styles.iconBtn} onClick={handleFullscreenToggle}>
                            <img src={isFullscreen ? "/icon/exit-full-screen.png" : "/icon/full-screen.png"} alt={isFullscreen ? "Fullscreen" : "Exit Full screen"} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
}
