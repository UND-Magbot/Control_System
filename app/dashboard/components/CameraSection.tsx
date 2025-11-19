// CameraSection.tsx
"use client";

import styles from './CameraSection.module.css';
import type { Camera, RobotRowData, Video } from '@/app/type'
import React, { useState } from 'react';
import CameraSelector from '@/app/components/button/CameraSelector';
import {RemoteBtn, RobotSelectBox, PlusBtn} from '@/app/components/button';

type CombinedProps = {
  cameras: Camera[];
  robots: RobotRowData[];
  video: Video[];
}

export default function CameraSection({cameras, robots, video}:CombinedProps) {
  const [cameraTabActiveIndex, setCameraTabActiveIndex] = useState<number>(0);
  const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
  const [robotCurrentImage, setRobotCurrentImage] = useState<string>("0");
  const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);

  // const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // 실시간 카메라
  const [webrtcUrl, setWebrtcUrl] = useState<string | undefined>(undefined);
  const [activeCam, setActiveCam] = useState<number>(1);
  const [retryCount, setRetryCount] = useState<number>(0); // 자동 재시도 카운터


  // ✅ 카메라 리스트
  const cameraInfo = cameras;

  // ✅ 카메라 탭 클릭 핸들러
  const handleCameraTab = (idx: number, camId: number) => {
    setCameraTabActiveIndex(idx);
    setActiveCam(camId);
    // selectCamera(camId); // 나중에 axios 연결 다시 살릴 때 여기서 호출
  };

  // ✅ 로봇 선택 핸들러
  const handleRobotSelect = (idx: number, robots: RobotRowData) => {
    setRobotActiveIndex(idx);
    setSelectedRobot(robots);
    // setRobotCurrentImage( ... ); // 나중에 로봇별 카메라 이미지 연동 시 여기서 처리
    console.log("선택된 로봇:", robots.id, robots.no);
  };

  const defaultRobotName = selectedRobot?.no || "Robot 1";

  return (
    <>
      <div className={styles["top-div"]}>
          <div className={styles["title-div"]}>
            <div>
                <img src="/icon/camera_w.png" alt="camera" />
            </div>
            <p>Robot Real-time Camera</p>
          </div>
          <PlusBtn type="camera"  selectedRobots={selectedRobot} robots={robots} video={video}/>
      </div>
      <div className={styles["middle-div"]}>
        <div className={styles["view-div"]}>
          <div className={styles.robotName}>{defaultRobotName}</div>
          <iframe src={webrtcUrl} allow="autoplay; fullscreen" className={styles["video-box"]} />

          {/* 카메라 선택 탭 */}
          <CameraSelector cameras={cameras} activeIndex={cameraTabActiveIndex} onSelect={handleCameraTab} />
        </div>
      </div>
      <div className={styles["bottom-div"]}>
        <RobotSelectBox robots={robots} activeIndex={robotActiveIndex} onSelect={handleRobotSelect} className={styles.customSelectBox} />
        <RemoteBtn selectedRobots={selectedRobot} robots={robots} video={video} />
      </div>
    </>
  );
}
