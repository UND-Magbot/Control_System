"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { RobotRowData, Camera, Floor, Video } from '@/app/type';
import styles from './RobotList.module.css';
import { useCustomScrollbar } from "@/app/hooks/useCustomScrollbar";

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
    const [selectedCam, setSelectedCam] = useState<Camera | null>(null);
    const [isOpenCam, setIsOpenCam] = useState(false);

    const camWrapperRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);

    const [cameraStream, setCameraStream] = useState("http://localhost:8000/Video/1");
    const handleCameraTab = (idx: number, cam: Camera) => {
        setSelectedCam(cam);
        setCameraTabActiveIndex(idx);

        const url = `http://localhost:8000/Video/${cam.id}`;

        console.log("카메라 변경 →", url);
        setCameraStream(url);
        setIsOpenCam(false);
      };
    
  
    const defaultRobotName = selectedRobot?.no || "Robot 1";

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (camWrapperRef.current && !camWrapperRef.current.contains(e.target as Node)) {
                setIsOpenCam(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const selectedCamIndex = useMemo(() => {
        if (selectedCam) {
            const idx = cameras.findIndex((c) => c.id === selectedCam.id);
            return idx >= 0 ? idx : 0;
        }
        return cameraTabActiveIndex;
    }, [selectedCam, cameras, cameraTabActiveIndex]);

    useCustomScrollbar({
        enabled: isOpenCam,
        scrollRef,
        trackRef,
        thumbRef,
        minThumbHeight: 30,
        deps: [cameras.length],
    });

    return (
        <div className={styles.commonBox}>
            <div className={styles.robotBox}>{defaultRobotName}</div>
            
            <div className={styles.cameraWrapper}>
                <img src={cameraStream} className={styles.cameraImg} />
            </div>

            <div ref={camWrapperRef} className={styles.camSelectWrapper}>
                <div className={styles.camSelectButton} onClick={() => setIsOpenCam((v) => !v)}>
                    <span>{selectedCam?.label ?? cameras[cameraTabActiveIndex]?.label ?? "CAM 1"}</span>
                    {isOpenCam ? (
                        <img src="/icon/arrow_up.png" alt="arrow_up" />
                    ) : (
                        <img src="/icon/arrow_down.png" alt="arrow_down" />
                    )}
                </div>
                {isOpenCam && (
                    <div className={styles.camSelectMenu}>
                        <div ref={scrollRef} className={styles.camSelectInner} role="listbox">
                            {cameras.map((cam, idx) => (
                                <div
                                    key={cam.id}
                                    className={`${styles.camOption} ${selectedCamIndex === idx ? styles.camOptionActive : ""}`}
                                    onClick={() => handleCameraTab(idx, cam)}
                                >
                                    {cam.label}
                                </div>
                            ))}
                        </div>
                        <div ref={trackRef} className={styles.camScrollTrack}>
                            <div ref={thumbRef} className={styles.camScrollThumb} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
