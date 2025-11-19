"use client";

import React, { useState, useMemo } from 'react';
import styles from './RobotList.module.css';
import Pagination from "@/app/components/pagination";
import type { RobotRowData, BatteryItem } from '@/app/type';
import { RobotCrudBtn } from "@/app/components/button";
import BatterySelectBox from './BatterySelectBox';
import NetworkSelectBox from './NetworkSelectBox';
import PowerSelectBox from './PowerSelectBox';
import LocationSelectBox from './LocationSelectBox';

const PAGE_SIZE = 10;

interface RobotStatusListProps {
  robotRows: RobotRowData[];
}

export default function RobotStatusList({ robotRows }:RobotStatusListProps) {

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
  const [batterySelectIndex, setBatterySelectIndex] = useState<BatteryItem | null>(null);
  const [batteryActiveIndex, setBatteryActiveIndex] = useState<number>(0);

  const BatteryData: BatteryItem[] = [
    { id: 1, label: "76% ~ 100%" },
    { id: 2, label: "51% ~ 75%" },
    { id: 3, label: "26% ~ 50%" },
    { id: 4, label: "1% ~ 25%" },
    { id: 5, label: "0%" },
    { id: 6, label: "Charging" }
];

const selectedBattery = batterySelectIndex;

  const handleBatterySelect = (idx: number, battery: BatteryItem) => {
    setBatteryActiveIndex(idx);  // 강조 표시
    setBatterySelectIndex(battery);   // 필터 기준 + 라벨 표시용
    setCurrentPage(1);
    console.log("선택된 배터리:", battery.id, battery.label);
  };
  
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (!batterySelectIndex) return robotRows;
  
    const label = batterySelectIndex.label;
  
    if (label === "76% ~ 100%") {
      return robotRows.filter(r => r.battery >= 76 && r.battery <= 100);
    }
    if (label === "51% ~ 75%") {
      return robotRows.filter(r => r.battery >= 51 && r.battery <= 75);
    }
    if (label === "26% ~ 50%") {
      return robotRows.filter(r => r.battery >= 26 && r.battery <= 50);
    }
    if (label === "1% ~ 25%") {
      return robotRows.filter(r => r.battery >= 1 && r.battery <= 25);
    }
    if (label === "0%") {
      return robotRows.filter(r => r.battery === 0);
    }
    if (label === "Charging") {
      return robotRows.filter(r => r.isCharging);
    }
  
    return robotRows;
  }, [robotRows, batterySelectIndex]);

  const totalItems = robotRows.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentItems = robotRows.slice(startIndex, startIndex + PAGE_SIZE);

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

  return (
    <>
    <div className={styles.RobotStatusTopPosition}>
        <h2>Robot List</h2>
        <div className={styles.RobotSearch}>
            <BatterySelectBox battery={BatteryData} activeIndex={batteryActiveIndex} selectBattery={selectedBattery} onSelect={handleBatterySelect}/>
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
                <div className={`${styles["robot_status_icon_div"]} ${styles.viewMap}`}>
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
    </>
  );
}