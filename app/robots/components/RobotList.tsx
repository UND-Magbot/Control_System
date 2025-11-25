"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './RobotList.module.css';
import Pagination from "@/app/components/pagination";
import type { RobotRowData, BatteryItem, Camera, Floor, Video, NetworkItem, PowerItem, LocationItem } from '@/app/type';
import { RobotCrudBtn, RemoteBtn, RobotPathBtn } from "@/app/components/button";
import CameraViews from './CameraView';
import MapView from './MapView';
import RobotDetailModal from "@/app/components/modal/RobotDetailModal";

const PAGE_SIZE = 10;

interface RobotStatusListProps {
  cameras: Camera[];
  robots: RobotRowData[];
  floors: Floor[];
  video: Video[];
  batteryStatus: BatteryItem[];
  networkStatus: NetworkItem[];
  powerStatus: PowerItem[];
  locationStatus: LocationItem[];
}

export default function RobotStatusList({ 
  cameras,
  robots,
  floors,
  video,
  batteryStatus,
  networkStatus,
  powerStatus,
  locationStatus
}:RobotStatusListProps) {

  console.log("RobotStatusList robots:", robots);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);

  const [batteryActiveIndex, setBatteryActiveIndex] = useState<number>(0);
  const [networkActiveIndex, setNetworkActiveIndex] = useState<number>(0);
  const [powerActiveIndex, setPowerActiveIndex] = useState<number>(0);
  const [locationActiveIndex, setLocationActiveIndex] = useState<number>(0);


  const [selectedBattery, setSelectedBattery] = useState<BatteryItem | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkItem | null>(null);
  const [selectedPower, setSelectedPower] = useState<PowerItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);


  const [robotDetailModalOpen, setRobotDetailModalOpen] = useState(false);

  const [batteryIsOpen, setBatteryIsOpen] = useState(false);
  const batteryWrapperRef = useRef<HTMLDivElement>(null);

  const [networkIsOpen, setNetworkIsOpen] = useState(false);
  const networkWrapperRef = useRef<HTMLDivElement>(null);

  const [powerIsOpen, setPowerIsOpen] = useState(false);
  const powerWrapperRef = useRef<HTMLDivElement>(null);

  const [locationIsOpen, setLocationIsOpen] = useState(false);
  const locationWrapperRef = useRef<HTMLDivElement>(null);
  
  // 🔥 여기 추가: 선택된 로봇 id (또는 전체 데이터)
  const [selectedRobotId, setSelectedRobotId] = useState<number | null>(null);

  // 필요하면 전체 데이터도 같이 보관
  const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);

  
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 기본 robots 대신, 필터가 적용된 robots 배열을 만듦
  const filteredRobots = robots.filter((robot) => {
    // --- 배터리 필터 ---
    let matchBattery = true;
    if (batteryActiveIndex !== null) {
      const option = batteryStatus[batteryActiveIndex];

      // 예시: label 기준으로 분기 (실제 label에 맞게 수정)
      if (option.label === "Total") {
        matchBattery = true;
      } else if (option.label === "76% 이상 100%") {
        matchBattery = robot.battery >= 76 && robot.battery <= 100;
      } else if (option.label === "51% 이상 75%") {
        matchBattery = robot.battery >= 51 && robot.battery < 76;
      } else if (option.label === "26% 이상 50%") {
        matchBattery = robot.battery >= 26 && robot.battery < 51;
      } else if (option.label === "1% 이상 25%") {
        matchBattery = robot.battery >= 1 && robot.battery < 26;
      } else if (option.label === "0%") {
        matchBattery = robot.battery === 0;
      } else if (option.label === "Charging") {
        matchBattery = robot.isCharging;
      }
    }

    // --- 네트워크 / 전원 / 위치 필터는 예시 ---
    let matchNetwork = true;
    if (networkActiveIndex !== null) {
      const option = networkStatus[networkActiveIndex];
      if (option.label !== "Total") {
        // robot.network: "Online" | "Offline" | "Error" 이런 구조라고 가정
        matchNetwork = robot.network === option.label;
      }
    }

    let matchPower = true;
    if (powerActiveIndex !== null) {
      const option = powerStatus[powerActiveIndex];
      if (option.label !== "Total") {
        // robot.power: "On" | "Off" 라고 가정
        matchPower = robot.power === option.label;
      }
    }

    let matchLocation = true;
    if (locationActiveIndex !== null) {
      const option = locationStatus[locationActiveIndex];
      if (option.label !== "Total") {
        // robot.mark: "Yes" | "No" 같은 값이라고 가정
        matchLocation = robot.mark === option.label;
      }
    }

    return matchBattery && matchNetwork && matchPower && matchLocation;
  });

  const totalItems = filteredRobots.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentItems = filteredRobots.slice(startIndex, startIndex + PAGE_SIZE);

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

  // Location 클릭 시 실행되는 핸들러
  const handleLocationClick = (idx: number, robot: RobotRowData) => {
    setRobotActiveIndex(idx);       // row 하이라이트 줄 때 사용 가능
    setSelectedRobotId(robot.id);   // 카메라 / 맵에서 쓸 핵심 값
    setSelectedRobot(robot);        // 필요하면 전체 정보도 내려줌

    console.log("선택된 로봇 (Location 클릭):", robot.id, robot.no);
  };

  // viewInfo 클릭 시 실행되는 핸들러
  const ViewInfoClick = (idx: number, robot: RobotRowData) => {
    setRobotActiveIndex(idx);       // row 하이라이트 줄 때 사용 가능
    setSelectedRobotId(robot.id);   // 카메라 / 맵에서 쓸 핵심 값
    setSelectedRobot(robot);        // 필요하면 전체 정보도 내려줌
    setRobotDetailModalOpen(true)

    console.log("선택된 로봇 (Location 클릭):", robot.id, robot.no);
  };

  const batteryStatusClick = (idx: number, option: BatteryItem) => {
    setBatteryActiveIndex(idx);     // 선택된 배터리 옵션 저장
    setSelectedBattery(option);  
    setBatteryIsOpen(false);       // 드롭다운 닫기
    setCurrentPage(1);             // 필터 바뀔 때마다 1페이지로
  };

  const networkStatusClick = (idx: number, option: NetworkItem) => {
    setNetworkActiveIndex(idx);
    setSelectedNetwork(option);  
    setNetworkIsOpen(false);
    setCurrentPage(1);
  };
  const powerStatusClick = (idx: number, option: PowerItem) => {
    setPowerActiveIndex(idx);     // 선택된 전원 옵션 저장
    setSelectedPower(option);  
    setPowerIsOpen(false);       // 드롭다운 닫기
    setCurrentPage(1);             // 필터 바뀔 때마다 1페이지로
  };
  const locationStatusClick = (idx: number, option: LocationItem) => {
    setLocationActiveIndex(idx);     // 선택된 위치 옵션 저장
    setSelectedLocation(option);  
    setLocationIsOpen(false);       // 드롭다운 닫기
    setCurrentPage(1);             // 필터 바뀔 때마다 1페이지로
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        batteryWrapperRef.current &&
        !batteryWrapperRef.current.contains(e.target as Node)
      ) {
        setBatteryIsOpen(false); // 외부 클릭 → 닫기
      }

      if (
        networkWrapperRef.current &&
        !networkWrapperRef.current.contains(e.target as Node)
      ) {
        setNetworkIsOpen(false); // 외부 클릭 → 닫기
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  

  return (
    <>
    <div className={styles.RobotStatusList}>
      <div className={styles.RobotStatusTopPosition}>
          <h2>Robot List</h2>
          <div className={styles.RobotSearch}>
            {/* 배터리 검색 필터 */}
            <div ref={batteryWrapperRef} className={`${styles.selecteWrapper}`} >
                <div className={styles.selecte} onClick={() => setBatteryIsOpen(!batteryIsOpen)}>
                  <span>{selectedBattery?.label ?? "배터리 상태"}</span>
                  {batteryIsOpen ? (
                    <img src="/icon/arrow_up.png" alt="arrow_up" />
                  ) : (
                    <img src="/icon/arrow_down.png" alt="arrow_down" />
                  )}
                </div> 
                {batteryIsOpen && (
                  <div className={styles.selectebox}>
                      {batteryStatus.map((item, idx) => (
                          <div key={item.id} 
                                className={batteryActiveIndex === idx ? styles["active"] : ""}
                                onClick={() => {
                                  batteryStatusClick(idx, item);
                                }}
                          >
                          {item.label}
                      </div>
                      ))}
                  </div>
                )}
            </div>

            {/* 네트워크 검색 필터 */}
            <div ref={networkWrapperRef} className={styles.selecteWrapper}>
                  <div className={styles.selecte} 
                    onClick={() => setNetworkIsOpen(!networkIsOpen)}>
                    <span>{selectedNetwork?.label ?? "네트워크 상태"}</span>
                    {networkIsOpen ? (
                      <img src="/icon/arrow_up.png" alt="arrow_up" />
                    ) : (
                      <img src="/icon/arrow_down.png" alt="arrow_down" />
                    )}
                  </div> 
                  {networkIsOpen && (
                    <div className={styles.selectebox}>
                        {networkStatus.map((item, idx) => (
                            <div
                                key={item.id}
                                className={networkActiveIndex === idx ? styles["active"] : ""}
                                onClick={() => {
                                  networkStatusClick(idx, item);
                                }}
                            >
                            {item.label}
                        </div>
                        ))}
                    </div>
                  )}
            </div>
            
            <div ref={powerWrapperRef} className={styles.selecteWrapper}>
                <div className={styles.selecte} 
                  onClick={() => setPowerIsOpen(!powerIsOpen)}>
                  <span>{selectedPower?.label ?? "전원 온/오프 상태"}</span>
                  {powerIsOpen ? (
                    <img src="/icon/arrow_up.png" alt="arrow_up" />
                  ) : (
                    <img src="/icon/arrow_down.png" alt="arrow_down" />
                  )}
                </div> 
                {powerIsOpen && (
                  <div className={styles.selectebox}>
                      {powerStatus.map((item, idx) => (
                          <div
                              key={item.id}
                              className={powerActiveIndex === idx ? styles["active"] : ""}
                              onClick={() => {
                                powerStatusClick(idx, item);
                              }}
                          >
                          {item.label}
                      </div>
                      ))}
                  </div>
                )}
            </div>

            <div ref={locationWrapperRef} className={styles.selecteWrapper}>
              <div className={styles.selecte} 
                onClick={() => setLocationIsOpen(!locationIsOpen)}>
                <span>{selectedLocation?.label ?? "위치표시 상태"}</span>
                {locationIsOpen ? (
                  <img src="/icon/arrow_up.png" alt="arrow_up" />
                ) : (
                  <img src="/icon/arrow_down.png" alt="arrow_down" />
                )}
              </div> 
              {locationIsOpen && (
                <div className={styles.selectebox}>
                    {locationStatus.map((item, idx) => (
                        <div
                            key={item.id}
                            className={locationActiveIndex === idx ? styles["active"] : ""}
                            onClick={() => {
                              locationStatusClick(idx, item);
                            }}
                        >
                        {item.label}
                    </div>
                    ))}
                </div>
              )}
            </div>
          </div>
      </div>
      <div className={styles.statusListBox}>
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
                    <div className={styles["info-box"]} onClick={() => ViewInfoClick(idx, r)}>View Info</div>
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
      </div>
      <RobotDetailModal isOpen={robotDetailModalOpen} onClose={() => setRobotDetailModalOpen(false)}  selectedRobotId={selectedRobotId} selectedRobot={selectedRobot}/>
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