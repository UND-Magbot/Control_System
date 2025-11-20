"use client";

import React, { useState } from 'react';
import usePageRouter from "@/app/hooks/CommonRouter";
import type { RobotRowData, BatteryItem, Camera, Floor, Video } from '@/app/type';
import styles from './RobotList.module.css';

type CombinedProps = {
    selectedRobotId: number | null;
    selectedRobot:  RobotRowData | null;
    cameras: Camera[];
    robots: RobotRowData[];
    video: Video[];
    floors: Floor[];
  }

export default function CameraView({
    selectedRobotId,
    selectedRobot,
    cameras,
    robots,
    video,
    floors
}: CombinedProps) {

    const [cameraTabActiveIndex, setCameraTabActiveIndex] = useState<number>(0);
    const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
    // const apiBase = process.env.NEXT_PUBLIC_API_URL;
  
    // 실시간 카메라
    const [webrtcUrl, setWebrtcUrl] = useState<string | undefined>(undefined);
    const [activeCam, setActiveCam] = useState<number>(1);
    const [retryCount, setRetryCount] = useState<number>(0); // 자동 재시도 카운터
  
  
    const handleCameraTab = (idx: number, cam: Camera) => {
        setCameraTabActiveIndex(idx);
      
        // 🔥 선택된 카메라의 WebRTC URL 업데이트
        // setWebrtcUrl(cam.webrtcUrl);
      
        console.log("선택된 카메라:", cam.id, cam.webrtcUrl);
      };
    
  
    const defaultRobotName = selectedRobot?.no || "Robot 1";

    return (
        <div className={styles.commonBox}>
            <div className={styles.robotBox}>{defaultRobotName}</div>
            {/* <iframe src="" frameborder="0"></iframe> */}
            <div className={styles.cameraPosition}>
                <div className={styles.cameraFlex}>
                {cameras.map((cam, idx) => (
                    <div key={cam.id}
                        className={`${styles.camBox} ${cameraTabActiveIndex === idx ? styles["active"] : ""}`}
                        onClick={() => handleCameraTab(idx, cam)} aria-pressed={cameraTabActiveIndex === idx} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)} >
                        {cam.label}                            
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}