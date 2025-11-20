"use client";

import React, { useState, useMemo } from 'react';
import styles from './RobotList.module.css';
import Pagination from "@/app/components/pagination";
import type { RobotRowData, BatteryItem, Camera, Floor, Video } from '@/app/type';
import { RobotCrudBtn, RemoteBtn, RobotPathBtn } from "@/app/components/button";
import BatterySelectBox from './BatterySelectBox';
import NetworkSelectBox from './NetworkSelectBox';
import CameraViews from './CameraView';
import MapView from './MapView';
import PowerSelectBox from './PowerSelectBox';
import LocationSelectBox from './LocationSelectBox';

const PAGE_SIZE = 10;

interface RobotStatusListProps {
  cameras: Camera[];
  robots: RobotRowData[];
  floors: Floor[];
  video: Video[];
}

export default function RobotStatusList({ cameras, robots, floors, video }:RobotStatusListProps) {

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
  const [batterySelectIndex, setBatterySelectIndex] = useState<BatteryItem | null>(null);
  const [batteryActiveIndex, setBatteryActiveIndex] = useState<number>(0);

  // 🔥 여기 추가: 선택된 로봇 id (또는 전체 데이터)
  const [selectedRobotId, setSelectedRobotId] = useState<number | null>(null);
  // 필요하면 전체 데이터도 같이 보관
  const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);

  
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = robots.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentItems = robots.slice(startIndex, startIndex + PAGE_SIZE);

  const robotInfoIcons = {
    info: (index: number) => {
      const robotIcons = [
        "/icon/robot_icon(1).png",
        "/icon/robot_icon(2).png",
        "/icon/robot_icon(3).png",
        "/icon/robot_icon(4).png",
        "/icon/robot_icon(5).png",
        "/icon/robot_icon(6).png",
        "/icon/robot_icon(7).png"
      ];
      return robotIcons[index] ?? "/icon/robot_icon(1).png";
    },
    battery: (battery: number, isCharging?: boolean) => {
      if (isCharging) return "/icon/battery_charging.png";
      if (battery >= 100) return "/icon/battery_full.png";
      if (battery > 75) return "/icon/battery_high.png";
      if (battery > 50) return "/icon/battery_half.png";
      if (battery > 25) return "/icon/battery_low.png";
      return "/icon/battery_empty.png";
    },
    network: (status: string) => {
      if (status === "Error") return "/icon/status(2).png";
      if (status === "Offline") return "/icon/status(3).png";
      return "/icon/status(1).png";
    },
    power: (power: string) => {
      return power === "On" ? "/icon/power_on.png" : "/icon/power_off.png";
    },
    mark: (index: number) => {
      const robotIcons = [
        "/icon/robot_location(1).png",
        "/icon/robot_location(2).png",
        "/icon/robot_location(3).png",
        "/icon/robot_location(4).png",
        "/icon/robot_location(5).png",
        "/icon/robot_location(6).png",
        "/icon/robot_location(7).png"
      ];
      return robotIcons[index] ?? "/icon/robot_location(1).png";
    }
  };

  // ✅ Location 클릭 시 실행되는 핸들러
  const handleLocationClick = (idx: number, robot: RobotRowData) => {
    setRobotActiveIndex(idx);       // row 하이라이트 줄 때 사용 가능
    setSelectedRobotId(robot.id);   // 카메라 / 맵에서 쓸 핵심 값
    setSelectedRobot(robot);        // 필요하면 전체 정보도 내려줌

    console.log("선택된 로봇 (Location 클릭):", robot.id, robot.no);
  };

  return (
    <>
    <div className={styles.RobotStatusList}>
      <div className={styles.RobotStatusTopPosition}>
          <h2>Robot List</h2>
          <div className={styles.RobotSearch}>
              <BatterySelectBox/>
              <NetworkSelectBox />
              <PowerSelectBox />
              <LocationSelectBox />
          </div>
      </div>
      <table className={styles.status}>
          <thead>
              <tr>
                  <th>Robot No</th>
                  <th>Robot Info</th>
                  <th>Battery</th>
                  <th>Network</th>
                  <th>Power</th>
                  <th>Mark</th>
                  <th>Location</th>
              </tr>
          </thead>
          <tbody>
          {currentItems.map((r, idx) => (
              <tr key={r.no}>
              <td>
                  <div>
                  {r.no}
                  </div>
              </td>
              <td>
                  <div className={`${styles.robot_status_icon_div}`}>
                    <img src={robotInfoIcons.info(idx)} alt={`robot_icon`} />
                    <div className={styles["info-box"]}>View Info</div>
                  </div>
              </td>
              <td>
                  <div className={styles["robot_status_icon_div"]}>
                  <img src={robotInfoIcons.battery(r.battery, r.isCharging)} alt="battery" />
                  {r.battery}%
                  </div>
              </td>
              <td>
                  <div className={styles["robot_status_icon_div"]}>
                  <img src={robotInfoIcons.network(r.network)} alt="network" />
                  {r.network}
                  </div>
              </td>
              <td>
                  <div className={styles["robot_status_icon_div"]}>
                  <img src={robotInfoIcons.power(r.power)} alt="power" />
                  {r.power}
                  </div>
              </td>
              <td>
                  <div className={styles["robot_status_icon_div"]}>
                  <img src={robotInfoIcons.mark(idx)} alt="mark" />
                  {r.mark}
                  </div>
              </td>
              <td>
                  <div className={`${styles["robot_status_icon_div"]} ${styles.viewMap}`} onClick={() => { handleLocationClick(idx, r) }}>
                    <div>View Map</div>
                    <div>→</div>
                  </div>
              </td>
            </tr>
          ))}
          </tbody>
          </table>
          <div className={styles.bottomPosition}>
            <div className={styles.RobotCrudBtnPosition}>
              <RobotCrudBtn />
            </div>
            <div className={styles.pagenationPosition}>
              <Pagination totalItems={totalItems} currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} blockSize={5} />
            </div>
          </div>
          <div></div>
    </div>

    <div className={styles.cameraMapView}>
        <h2>Location Map & Real-time Camera</h2>
        <MapView selectedRobotId={selectedRobotId} selectedRobot={selectedRobot} robots={robots} floors={floors} video={video} cameras={cameras} />
        <br />
        <CameraViews selectedRobotId={selectedRobotId} selectedRobot={selectedRobot} robots={robots} floors={floors} video={video} cameras={cameras} />
        <br />
        <div className={styles.modalOpenBox}>
            <RemoteBtn selectedRobots={selectedRobot} robots={robots} video={video} cameras={cameras} />
            <RobotPathBtn selectedRobots={selectedRobot} robots={robots} video={video} camera={cameras} />
        </div>        
    </div>
    </>
  );
}