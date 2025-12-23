"use client";

import React, { useState } from 'react';
import type { RobotRowData, Camera, Floor, Video } from '@/app/type';
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
    selectedRobot,
    cameras
}: CombinedProps) {

    const [cameraTabActiveIndex, setCameraTabActiveIndex] = useState<number>(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
    const [cameraStream, setCameraStream] = useState("http://localhost:8000/Video/1");
    const handleCameraTab = (idx: number, cam: Camera) => {
        setCameraTabActiveIndex(idx);

        const url = `http://localhost:8000/Video/${cam.id}`;

        console.log("카메라 변경 →", url);
        setCameraStream(url);
      };
    
  
    const defaultRobotName = selectedRobot?.no || "Robot 1";

    return (
        <div className={styles.commonBox}>
            <div className={styles.robotBox}>{defaultRobotName}</div>
            
            <div className={styles.cameraWrapper}>
                <img src={cameraStream} className={styles.cameraImg} />
            </div>

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