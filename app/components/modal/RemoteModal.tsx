'use client';

import styles from './Modal.module.css';
import React from 'react';
import { useState, useEffect } from 'react';
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
}: ModalProps) {

  // const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // 실시간 카메라
  const [webrtcUrl, setWebrtcUrl] = useState<string | undefined>(undefined);
  const [activeCam, setActiveCam] = useState<string>('my_camera01');
  const [retryCount, setRetryCount] = useState<number>(0); // 자동 재시도 카운터
  const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
  const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);
  const [isSwapped, setIsSwapped] = useState(false);

  const cameraSample = "/images/camera_sample.png"
  const mapSample = "/images/map_sample.png"


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
            {/* <ModalRobotSelect selectedLabel={defaultRobotName} robots={robots} activeIndex={robotActiveIndex} onSelect={handleRobotSelect} /> */}


            <div className={styles.topRightPostion}>
              <div className={styles.topRightIcon}>

                {/* <VideoStatus className={styles.videoStatusCustom} video={video} /> */}

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
            <iframe src={cameraSample} allow="autoplay; fullscreen" className={styles["video-box"]} />
          ) : (
            <iframe src={mapSample} allow="autoplay; fullscreen" className={styles["video-box"]} />
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
              {/* <RemotePad /> */}
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
                  <div>Cam1</div>
                  <div>Cam2</div>
                </div>
                <div className={styles.zoomBtn}>
                  <div>Zoom In</div>
                  <div>Zoom Out</div>
                </div>
              </div>

              <div className={styles.viewBox}>
                {!isSwapped ? (
                  // 서브(기본 PiP)
                  // <iframe src={webrtcUrl} allow="autoplay; fullscreen" />
                  <iframe src={mapSample} allow="autoplay; fullscreen" />
                ) : (
                  // 메인이 서브 위치로 이동
                  <iframe src={cameraSample} allow="autoplay; fullscreen" />
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