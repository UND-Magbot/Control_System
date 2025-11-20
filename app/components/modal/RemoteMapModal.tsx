'use client';

import styles from './Modal.module.css';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { RobotRowData, Video, Camera } from '@/app/type';
import { VideoStatus, RemotePad, ModalRobotSelect } from '@/app/components/button';

type PrimaryViewType = 'camera' | 'map';

type RobotViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedRobots: RobotRowData | null;
  robots: RobotRowData[];
  video: Video[];
  camera: Camera[];
  primaryView: PrimaryViewType; // 🔥 여기만 Remote / Path 에서 다르게
};

export default function RemoteModal({
  isOpen,
  onClose,
  selectedRobots,
  robots,
  video,
  camera,
  primaryView
}: RobotViewModalProps){

  // const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // 실시간 카메라
  const [webrtcUrl, setWebrtcUrl] = useState<string | undefined>(undefined);
  const [activeCam, setActiveCam] = useState<number>(1);
  const [retryCount, setRetryCount] = useState<number>(0); // 자동 재시도 카운터
  const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
  const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);
  const [isSwapped, setIsSwapped] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cameraTabActiveIndex, setCameraTabActiveIndex] = useState<number>(0);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const cameraSample = "/images/camera_sample.png" 
  const mapSample = "/images/map_sample.png" 

  // 🔥 props로 받은 primaryView 기준으로 primary/secondary 결정
  const primarySrc   = primaryView === 'camera' ? cameraSample : mapSample;
  const secondarySrc = primaryView === 'camera' ? mapSample    : cameraSample;

  // 메인 뷰
  const mainSrc = isSwapped ? secondarySrc : primarySrc;
  // 서브(PiP) 뷰
  const pipSrc  = isSwapped ? primarySrc   : secondarySrc;

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

  // 공통 닫기 + 초기화 함수
  const handleClose = () => {
    // 확대/이동 상태 초기화
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsPanning(false);

    // 스왑 / 탭 등 초기화
    setIsSwapped(false);
    setCameraTabActiveIndex(0);
    // setMapTabActiveIndex(null);
    // setFloorActiveIndex(0);

    // 로봇 선택값 초기화 (모달 오픈 시점 기준)
    setSelectedRobot(selectedRobots);
    

    onClose();
  };

  // ESC 키로 모달 닫기 + 상태 초기화
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose]);
  
  if (!isOpen) return null;


  const standHandle = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("standHandle 클릭됨!", event);
    fetch("http://localhost:8000/robot/stand", {
      method: "POST",
    }).then(() => {
      console.log("요청 완료");
    });
  };

  const sitHandle = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("sitHandle 클릭됨!", event);
    fetch("http://localhost:8000/robot/sit", {
      method: "POST",
    }).then(() => {
      console.log("요청 완료");
    });
  };

  const slowHandle = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("slowHandle 클릭됨!", event);
    fetch("http://localhost:8000/robot/slow", {
      method: "POST",
    }).then(() => {
      console.log("요청 완료");
    });
  };

  const normalHandle = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("normalHandle 클릭됨!", event);
    fetch("http://localhost:8000/robot/normal", {
      method: "POST",
    }).then(() => {
      console.log("요청 완료");
    });
  };

  const fastHandle = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("fastHandle 클릭됨!", event);
    fetch("http://localhost:8000/robot/fast", {
      method: "POST",
    }).then(() => {
      console.log("요청 완료");
    });
  };

  const defaultRobotName = selectedRobot?.no || "Robot 1";


  // ✅ 카메라 탭 클릭 핸들러
  const handleCameraTab = (idx: number, camId: number) => {
    setCameraTabActiveIndex(idx); // 탭 active 유지
    setActiveCam(camId);          // 현재 선택된 카메라 ID
    // selectCamera(camId);          // 실제 캠 호출
  };
  
  return (

    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalTopDiv}>
          <div className={styles.modalTitle}>
            <img src="/icon/robot_control_w.png" alt="robot_control" />
            <span>Remote Control (Real-time Camera & Location Map)</span>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
        </div>
        <div className={styles.cameraView}>
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
          <div className={styles["video-box"]} style={{ overflow: "hidden", width: "100%", aspectRatio: "16/9" }}>
            <div ref={wrapperRef} style={{ overflow: "hidden", userSelect: "none", touchAction: "none", cursor: scale > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={endPan} onMouseLeave={endPan} >
              <img
                ref={imgRef} src={mainSrc} draggable={false} style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: "center center",
                  transition: isPanning ? "none" : "transform 120ms ease", objectFit: "cover", width: "100%",}} />
            </div>
          </div>
          <div className={styles.middlePosition}>
            <div className={styles.floorFlex}>
              <div>1F</div>
              <div>2F</div>
              <div className={styles.active}>3F</div>
              <div>4F</div>
              <div>5F</div>
              <div>6F</div>
              <div>7F</div>
              <div>8F</div>
            </div>
          </div>
          <div className={styles.bottomPosition}>
            <div className={styles.bottomFlex}>
              <RemotePad/>
              <div className={`${styles.modeBox} ${styles.mt50}`}>
                <div className={styles.mb20}>MODE</div>
                <div className={`${styles.standSitBtn} ${styles.mb20}`}>
                  <div onClick={standHandle}>Stand</div>
                  <div onClick={sitHandle}>Sit</div>
                </div>
                <div className={styles.speedBtn}>
                  <div onClick={slowHandle}>Slow</div>
                  <div onClick={normalHandle}>Normal</div>
                  <div onClick={fastHandle}>Fast</div>
                </div>
              </div>
              
              <div className={`${styles.powerBtn} ${styles.mt50}`}>
                <div className={`${styles.mb20} ${styles.textCenter}`}>POWER</div>
                <div className={styles.powerImg}><img src="/icon/power-w.png" alt="power" /></div>
              </div>

              <div className={`${styles.viewBtn} ${styles.mt50}`}>
                <div className={styles.mb20}>CAMERA</div>
                <div className={`${styles.camBtn} ${styles.mb20}`}>
                  {camera.map((cam, idx) => (
                    <div
                      key={cam.id} className={ `${styles.camItem} ` + `${cameraTabActiveIndex === idx ? styles.active : ""}` }
                      onClick={() => handleCameraTab(idx, cam.id)}>
                      {cam.label}
                    </div>
                  ))}
                </div>
                <div className={styles.zoomBtn}>
                  <div onClick={ () => {handleZoomFromChild("in")} }>Zoom In</div>
                  <div onClick={ () => {handleZoomFromChild("out")} }>Zoom Out</div>
                </div>
              </div>

              <div className={styles.viewBox} style={{ overflow: "hidden"}}>
                <img src={pipSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div className={styles.viewExchangeBtn} onClick={() => setIsSwapped(prev => !prev)}><img src="/icon/view-change.png" alt="view-change" /></div>
              </div>
            </div>
          </div>
          
        </div>        
      </div>
    </div>
  );
}