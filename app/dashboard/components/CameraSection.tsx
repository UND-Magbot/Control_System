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
  const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);

  const [cameraStream, setCameraStream] = useState("http://localhost:8000/Video/1");
  
  const handleCameraTab = (idx: number, cam: Camera) => {
    setCameraTabActiveIndex(idx);
  
    // 🔥 선택된 카메라의 WebRTC URL 업데이트
    // setWebrtcUrl(cam.webrtcUrl);
  
    console.log("선택된 카메라:", cam.id, cam.webrtcUrl);

    const url = `http://localhost:8000/Video/${cam.id}`;

    console.log("카메라 변경 →", url);
    setCameraStream(url);
  };

  // 로봇 선택 핸들러
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
          <PlusBtn type="camera"  selectedRobots={selectedRobot} robots={robots} video={video} camera={cameras}/>
      </div>
      <div className={styles["middle-div"]}>
        <div className={styles["view-div"]}>
          <div className={styles.robotName}>{defaultRobotName}</div>
          <div className={styles.cameraWrapper}>
            <img src={cameraStream} className={styles.cameraImg} />
          </div>
          {/* 카메라 선택 탭 */}
          <CameraSelector cameras={cameras} activeIndex={cameraTabActiveIndex} onSelect={handleCameraTab} />
        </div>
      </div>
      <div className={styles["bottom-div"]}>
        <RobotSelectBox robots={robots} activeIndex={robotActiveIndex} onSelect={handleRobotSelect} className={styles.customSelectBox} />
        <RemoteBtn selectedRobots={selectedRobot} robots={robots} video={video} cameras={cameras} />
      </div>
    </>
  );
}
