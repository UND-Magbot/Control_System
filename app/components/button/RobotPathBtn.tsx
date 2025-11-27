"use client";

import React from 'react';
import { useState } from 'react';
import styles from './Button.module.css';
import type { RobotRowData, Video, Camera } from '@/app/type';
import RemoteMapModal from "../modal/RemoteMapModal";

type RobotPathBtnProps = {
  robots: RobotRowData[];
  selectedRobots: RobotRowData | null;
  video: Video[];
  camera: Camera[];
  className?: string;
}

export default function RobotPathBtn({ selectedRobots, robots, video, camera, className } : RobotPathBtnProps) {

  const [robotPathModalOpen, setRobotPathModalOpen] = useState(false);

  const openRemoteModal = () => {
    if (!selectedRobots) {
      alert("로봇을 먼저 선택하세요.");
      return;
    }
    setRobotPathModalOpen(true);
  };

  return (
    <>
      <button type='button' className={`${styles["path-div"]} ${className ?? ""}`} onClick={() => setRobotPathModalOpen(true)}>
        <div className={styles["path-icon"]}>
          <img src="/icon/path_w.png" alt="robot path" />
        </div>
        <div>Robot Path</div>
      </button>
      <RemoteMapModal isOpen={robotPathModalOpen} onClose={() => setRobotPathModalOpen(false)} selectedRobots={selectedRobots} robots={robots} video={video} camera={camera} primaryView="map"/>
    </>
  );
}