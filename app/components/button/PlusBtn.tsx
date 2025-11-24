// app/components/PlusActionButton.tsx
"use client";

import { useState } from "react";
import styles from './Button.module.css';
import RemoteModal from "../modal/RemoteMapModal";
import type { RobotRowData, Video, Camera } from '@/app/type';
import RobotPath from "../modal/RemoteMapModal";

type ButtonType = "camera" | "map";

type RemoteBtnProps = {
  type: ButtonType;
  robots: RobotRowData[];
  selectedRobots: RobotRowData | null;
  video: Video[];
  camera: Camera[];
}

export default function PlusActionButton({ type, robots, selectedRobots, video, camera }: RemoteBtnProps) {

  // 필요한 모달들
  const [remoteModalOpen, setRemoteModalOpen] = useState(false);
  const [robotPathModalOpen, setRobotPathModalOpen] = useState(false);
  

  const handleClick = () => {
    switch (type) {
      case "camera":
        // 카메라 모달 열기
        setRemoteModalOpen(true);
        break;

      case "map":
        setRobotPathModalOpen(true);
        break;

      default:
        break;
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.plusBtn}
        onClick={handleClick}
      >
        +
      </button>

      {/* 타입별 모달 */}
      {remoteModalOpen && (
        <RemoteModal isOpen={remoteModalOpen} onClose={() => setRemoteModalOpen(false)} selectedRobots={selectedRobots} robots={robots} video={video} camera={camera} primaryView={type}/>
      )}

      {robotPathModalOpen && (
        <RobotPath isOpen={robotPathModalOpen} onClose={() => setRobotPathModalOpen(false)} selectedRobots={selectedRobots} robots={robots} video={video} camera={camera} primaryView={type}/>
      )}
    </>
  );
}