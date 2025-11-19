"use client";

import React from 'react';
import { useState } from 'react';
import styles from './Button.module.css';
import type { RobotRowData, Video } from '@/app/type';
import RobotPathModal from "../modal/RobotPathModal";

type RobotPathBtnProps = {
  robots: RobotRowData[];
  selectedRobots: RobotRowData | null;
  video: Video[]
}

export default function RobotPathBtn({ selectedRobots, robots, video } : RobotPathBtnProps) {

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
      <button type='button' className={styles["path-div"]} onClick={() => setRobotPathModalOpen(true)}>
        <div className={styles["path-icon"]}>
          <img src="/icon/path_w.png" alt="robot path" />
        </div>
        <div>Robot Path</div>
      </button>
      <RobotPathModal isOpen={robotPathModalOpen} onClose={() => setRobotPathModalOpen(false)} selectedRobots={selectedRobots} robots={robots} video={video}/>
    </>
  );
}