'use client';

import styles from './Modal.module.css';
import React from 'react';
import { useState,  useRef, useEffect } from 'react';
import type { RobotRowData, Video } from '@/app/type';
import { VideoStatus, RemotePad, ModalRobotSelect } from '@/app/components/button';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedRobots: RobotRowData | null;
  robots: RobotRowData[];
  video: Video[];
}

export default function RemoteModal({
  isOpen,
  onClose,
  selectedRobots,
  robots,
  video
}: ModalProps){

    // 실시간 카메라
    const [webrtcUrl, setWebrtcUrl] = useState<string | undefined>(undefined);
    const [activeCam, setActiveCam] = useState<string>('my_camera01');
    const [retryCount, setRetryCount] = useState<number>(0); // 자동 재시도 카운터
    const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
    const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);
    const [isSwapped, setIsSwapped] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const [scale, setScale] = useState(1);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const cameraSample = "/images/camera_sample.png" 
    const mapSample = "/images/map_sample.png" 
    
    // const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // props(selectedRobots)가 바뀌면 모달 내부 selectedRobot도 갱신
  useEffect(() => {
    setSelectedRobot(selectedRobots);
    if (selectedRobots) {
      const idx = robots.findIndex(r => r.id === selectedRobots.id);
      if (idx !== -1) {
        setRobotActiveIndex(idx);
      }
    }
  }, [selectedRobots, robots]);

  const handleRobotSelect = (idx: number, robot: RobotRowData) => {
    setRobotActiveIndex(idx);
    setSelectedRobot(robot);
    // setRobotCurrentImage( ... ); // 나중에 로봇별 카메라 이미지 연동 시 여기서 처리
    console.log("선택된 로봇:", robot.id, robot.no);
  };
      // 래퍼 크기와 이미지(비변환) 크기를 이용해 허용 범위 계산
      const clampTranslate = (nx: number, ny: number) => {
        const wrap = wrapperRef.current;
        const img = imgRef.current;
        if (!wrap || !img) return { x: nx, y: ny };
  
        const wrapW = wrap.clientWidth;
        const wrapH = wrap.clientHeight;
  
        // transform 적용 전의 레이아웃 크기(이미지 스타일 width:100% 가정)
        const baseW = img.clientWidth;
        const baseH = img.clientHeight;
  
        // 실제 화면에 보이는 크기(스케일 반영)
        const scaledW = baseW * scale;
        const scaledH = baseH * scale;
  
        // 중앙 기준(transformOrigin: center)에서 허용 가능한 최대 오프셋
        const maxOffsetX = Math.max(0, (scaledW - wrapW) / 2);
        const maxOffsetY = Math.max(0, (scaledH - wrapH) / 2);
  
        const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  
        return {
          x: clamp(nx, -maxOffsetX, maxOffsetX),
          y: clamp(ny, -maxOffsetY, maxOffsetY),
        };
      };
  
      // 🔴 확대 상태이며, 클릭 지점이 "이미지 표시 영역" 안일 때만 팬 시작
      const onMouseDown = (e: React.MouseEvent) => {
        if (scale <= 1) return;
  
        const img = imgRef.current;
        if (!img) return;
  
        // 현재 화면에 보이는 이미지 경계(스케일 포함)
        const rect = img.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top  && e.clientY <= rect.bottom;
  
        if (!inside) return; // 이미지 밖이면 드래그 시작 금지
  
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          tx: translate.x,
          ty: translate.y,
        };
      };
  
      const handleZoomFromChild = (action: string) => {
        setScale(prev => {
          if (action === "in") return Math.min(prev + 0.2, 3);
          if (action === "out") return Math.max(prev - 0.2, 1);
          return 1;
        });
      };
  
      const onMouseMove = (e: React.MouseEvent) => {
        if (!isPanning || !panStartRef.current) return;
        const { x, y, tx, ty } = panStartRef.current;
        const dx = e.clientX - x;
        const dy = e.clientY - y;
  
        const next = clampTranslate(tx + dx, ty + dy);
        setTranslate(next);
      };
  
      const endPan = () => {
        setIsPanning(false);
        panStartRef.current = null;
      };
  
      // 스케일이 변할 때 현재 translate가 허용 범위를 벗어나지 않도록 보정
      useEffect(() => {
        setTranslate(prev => clampTranslate(prev.x, prev.y));
      }, [scale]);
  

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

    const standHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("standHandle 클릭됨!", event);
    };

    const sitHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("sitHandle 클릭됨!", event);
    };

    const slowHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("slowHandle 클릭됨!", event);
    };

    const normalHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("normalHandle 클릭됨!", event);
    };

    const fastHandle = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log("fastHandle 클릭됨!", event);
    };

    const defaultRobotName = selectedRobot?.no || "Robot 1";

  return (

    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalTopDiv}>
          <div className={styles.modalTitle}>
            <img src="/icon/robot_control_w.png" alt="robot_control" />
            <span>Remote Control (Real-time Camera & Location Map)</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.CameraView}>
          <div className={styles.topPosition}>
          <ModalRobotSelect selectedLabel={defaultRobotName} robots={robots} activeIndex={robotActiveIndex} onSelect={handleRobotSelect}/>
            
            
            <div className={styles.topRightPostion}>
              <div className={styles.topRightIcon}>
                
              <VideoStatus className={styles.videoStatusCustom} video={video} />
                
                <div className={styles.robotStatus}>
                  <img src="/icon/status_w.png" alt="network" />
                  <div>Online</div>
                </div>
                
                <div className={styles.robotStatus}>
                  <img src="/icon/battery_full_w.png" alt="battery_full" />
                  <div>89%</div>
                </div>

              </div>
            </div>
          </div>
          {!isSwapped ? (
            <iframe src={mapSample} allow="autoplay; fullscreen" className={styles["video-box"]} /> 
            ) : ( 
            <iframe src={cameraSample} allow="autoplay; fullscreen" className={styles["video-box"]} />
          )}
          <div className={styles.middlePosition}>
            <div className={styles.floorFlex}>
              <div>7F</div>
              <div>6F</div>
              <div>5F</div>
              <div>4F</div>
              <div>3F</div>
              <div>2F</div>
              <div>1F</div>
              <div>B1</div>
            </div>
          </div>
          <div className={styles.bottomPosition}>
            <div className={styles.bottomFlex}>
              <RemotePad/>
              <div className={`${styles.modeBox} ${styles.mt50}`}>
                <div className={styles.mb20}>MODE</div>
                <div className={`${styles.standSitBtn} ${styles.mb20}`}>
                  <div>Stand</div>
                  <div>Sit</div>
                </div>
                <div className={styles.speedBtn}>
                  <div>Slow</div>
                  <div>Normal</div>
                  <div>Fast</div>
                </div>
              </div>
              
              <div className={`${styles.powerBtn} ${styles.mt50}`}>
                <div className={`${styles.mb20} ${styles.textCenter}`}>POWER</div>
                <div className={styles.powerImg}><img src="/icon/power-w.png" alt="power" /></div>
              </div>

              <div className={`${styles.viewBtn} ${styles.mt50}`}>
                <div className={styles.mb20}>CAMERA</div>
                <div className={`${styles.camBtn} ${styles.mb20}`}>
                  <div>Cam1</div>
                  <div>Cam2</div>
                </div>
                <div className={styles.zoomBtn}>
                  <div onClick={() => handleZoomFromChild("in")} >Zoom In</div>
                  <div onClick={() => handleZoomFromChild("out")}>Zoom Out</div>
                </div>
              </div>

              <div className={styles.viewBox}>
                {!isSwapped ? (
                    // 서브(기본 PiP)
                    // <iframe src={webrtcUrl} allow="autoplay; fullscreen" />
                    <iframe src={cameraSample} allow="autoplay; fullscreen" />
                  ) : (
                    // 메인이 서브 위치로 이동
                    <iframe src={mapSample} allow="autoplay; fullscreen" />
                  )}
                <div className={styles.viewExchangeBtn} onClick={() => setIsSwapped(prev => !prev)}><img src="/icon/view-change.png" alt="view-change" /></div>
              </div>
            </div>
          </div>
          
        </div>        
      </div>
    </div>
  );
}