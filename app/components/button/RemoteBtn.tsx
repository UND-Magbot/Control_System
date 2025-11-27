"use client";

import React from 'react';
import { useState } from 'react';
import styles from './Button.module.css';
import type { RobotRowData, Video, Camera } from '@/app/type';
import RemoteMapModal from "../modal/RemoteMapModal";

type RemoteBtnProps = {
  robots: RobotRowData[];
  selectedRobots: RobotRowData | null;
  video: Video[]
  cameras: Camera[]
  className?: string;
}

export default function RemoteBtn({selectedRobots, robots, video, cameras, className } : RemoteBtnProps) {

  const [remoteModalOpen, setRemoteModalOpen] = useState(false);

  const openRemoteModal = () => {
    if (!selectedRobots) {
      alert("로봇을 먼저 선택하세요.");
      return;
    }
    setRemoteModalOpen(true);
  };

  return (
    <>
      <button type='button' className={`${styles["remote-div"]} ${className ?? ""}`} onClick={() => setRemoteModalOpen(true)}>
          <div className={styles["remote-icon"]}>
              <img src="/icon/robot_control_w.png" alt="robot path" />
          </div>
          <div>Remote Control</div>
      </button>
      <RemoteMapModal isOpen={remoteModalOpen} onClose={() => setRemoteModalOpen(false)} selectedRobots={selectedRobots} robots={robots} video={video} camera={cameras} primaryView="camera"/>
    </>
  )
} 