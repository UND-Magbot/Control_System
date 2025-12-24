"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './RobotList.module.css';
import Pagination from "@/app/components/pagination";
import type { RobotRowData, BatteryItem, Camera, Floor, Video, NetworkItem, PowerItem, LocationItem } from '@/app/type';
import { RobotCrudBtn, RemoteBtn, RobotPathBtn } from "@/app/components/button";
import CameraViews from './CameraView';
import MapView from './MapView';
import RobotDetailModal from "@/app/components/modal/RobotDetailModal";
import RobotWorkScheduleModal from "@/app/components/modal/WorkScheduleModal";
import type { WorkScheduleCase } from "@/app/components/modal/WorkScheduleModal";
import PlacePathModal from "@/app/components/modal/PlacePathModal";
import BatteryPathModal from "@/app/components/modal/BatteryChargeModal";

const PAGE_SIZE = 8;

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

export type RobotDraft = {
  operator: string;
  serialNumber: string;
  model: string;
  group: string;
  softwareVersion: string;
  site: string;
  registrationDateTime: string;
  returnBattery: number;
};

export type PlaceItem = {
    id: number;
    robotNo: string;
    cameraNo: string;
}

export type PathItem = {
    id: number;
    robotNo: string;
    cameraNo: string;
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

  const [robotActiveIndex, setRobotActiveIndex] = useState<number>(0);
  
  const [isSelected, setIsSelected] = useState<number>(0);

  const [robotsActiveIndex, setRobotsActiveIndex] = useState<number>(0);
  const [batteryActiveIndex, setBatteryActiveIndex] = useState<number>(0);
  const [networkActiveIndex, setNetworkActiveIndex] = useState<number>(0);
  const [powerActiveIndex, setPowerActiveIndex] = useState<number>(0);
  const [locationActiveIndex, setLocationActiveIndex] = useState<number>(0);

  //체크된 로봇 id 리스트
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkedRobotIds, setCheckedRobotIds] = useState<number[]>([]);
  const checkedCount = checkedRobotIds.length;

  // 정책 계산
  const isCrudDisabled = checkedCount >= 1;       // (요구1) 1개라도 체크되면 CRUD 비활성
  const isSingleChecked = checkedCount === 1;     // (요구2) 정확히 1개일 때만 활성
  const isAnyChecked = checkedCount >= 1;         // (요구3) 1개 이상이면 활성

  const isWorkScheduleDisabled = !isSingleChecked; // 0개 or 2개 이상 비활성
  const isPlaceMoveDisabled = !isSingleChecked;    // 0개 or 2개 이상 비활성
  const isChargeMoveDisabled = !isAnyChecked;      // 0개만 비활성


  const [selectedRobots, setSelectedRobots] = useState<RobotRowData | null>(null);
  const [selectedBattery, setSelectedBattery] = useState<BatteryItem | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkItem | null>(null);
  const [selectedPower, setSelectedPower] = useState<PowerItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);


  const [robotDetailModalOpen, setRobotDetailModalOpen] = useState(false);
  const [robotWorkScheduleModalOpen, setRobotWorkScheduleModalOpen] = useState(false);
  const [placePathModalOpen, setPlacePathModalOpen] = useState(false);

  const [workScheduleCase, setWorkScheduleCase] = useState<WorkScheduleCase>('none');
  const [completedPathText, setCompletedPathText] = useState<string>('');

  const [robotsIsOpen, setRobotsIsOpen] = useState(false);
  const robotsWrapperRef = useRef<HTMLDivElement>(null);

  const [batteryIsOpen, setBatteryIsOpen] = useState(false);
  const batteryWrapperRef = useRef<HTMLDivElement>(null);

  const [networkIsOpen, setNetworkIsOpen] = useState(false);
  const networkWrapperRef = useRef<HTMLDivElement>(null);

  const [powerIsOpen, setPowerIsOpen] = useState(false);
  const powerWrapperRef = useRef<HTMLDivElement>(null);

  const [locationIsOpen, setLocationIsOpen] = useState(false);
  const locationWrapperRef = useRef<HTMLDivElement>(null);
  
  // 여기 추가: 선택된 로봇 id (또는 전체 데이터)
  const [selectedRobotId, setSelectedRobotId] = useState<number | null>(null);

  // 필요하면 전체 데이터도 같이 보관
  const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);


  // 필터가 적용된 robots 배열
  const filteredRobots = robots.filter((robot) => {

    // 로봇명
    let matchRobots = true;
    if (selectedRobots) {
      matchRobots = robot.no === selectedRobots.no;
    }

    // 배터리 필터
    let matchBattery = true;

    const option = selectedBattery;

    if (!option) {
      matchBattery = true;
    } else if (option.charging) {
      matchBattery = robot.isCharging;
    } else if (option.min !== undefined && option.max !== undefined) {
      matchBattery =
        robot.battery >= option.min && robot.battery <= option.max;
    }

    // 네트워크
    let matchNetwork = true;
    if (selectedNetwork) {
      matchNetwork = robot.network === selectedNetwork.label;
    }

    // 전원
    let matchPower = true;
    if (selectedPower) {
      matchPower = robot.power === selectedPower.label;
    }

    // 위치 (mark: 'Yes' | 'No')
    let matchLocation = true;
    if (selectedLocation) {
      matchLocation = robot.mark === selectedLocation.label;
    }

    return matchRobots && matchBattery && matchNetwork && matchPower && matchLocation;
  });

  // 탭메뉴
  const [activeTab, setActiveTab] = useState<"robots" | "place" | "path">("robots");
  
  // 탭별 페이지 상태
  const [robotsPage, setRobotsPage] = useState(1);
  const [placePage, setPlacePage] = useState(1);
  const [pathPage, setPathPage] = useState(1);

  const placeData:PlaceItem[] = [];
  const pathData:PathItem[] = [];

  let currentPage: number;
  let currentData: any[]; // 필요하면 타입 좁혀도 됨

  switch (activeTab) {
    case "robots":
      currentPage = robotsPage;
      currentData = filteredRobots; // ✅ filteredRobots는 항상 배열
      break;
    case "place":
      currentPage = placePage;
      currentData = placeData;
      break;
    case "path":
      currentPage = pathPage;
      currentData = pathData;
      break;
  }

  const totalItems = currentData.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentItems = currentData.slice(startIndex, startIndex + PAGE_SIZE);

  const handleTabClick = (tab: "robots" | "place" | "path") => {
    setActiveTab(tab);

    if (tab === "robots" && activeTab !== "robots") {
        setRobotsPage(1);

    } else if (tab === "place" && activeTab !== "place") {
        setPlacePage(1);

    } else if (tab === "path") {
        setPathPage(1);
    }
};

const getPageSetter = () => {
    switch (activeTab) {
        case "robots":
            return setRobotsPage;
        case "place":
            return setPlacePage;
        case "path":
            return setPathPage;
    }
};

const resetCurrentPage = () => {
  const setPage = getPageSetter();
  setPage?.(1);
};

  // 로봇 아이콘 개수
  const ROBOT_ICON_COUNT = 7;

  const robotColors = [
    "#ed1c24", "#059fd7", "#92d050", "#f7941d",
    "#d65bdb", "#0fc6cc", "#51b77c"
  ];

  function getRobotIndexFromNo(robotNo: string): number {
    const match = robotNo.match(/\d+/); // "Robot 1" → ["1"]
    const num = match ? Number(match[0]) : 1; // 못 찾으면 1번 로봇으로 가정
    const idx = num - 1;

    // 순환시키려면 이렇게:
    return ((idx % robotColors.length) + robotColors.length) % robotColors.length;
  }

  function buildRobotIconPath(robotNo: string, kind: "icon" | "location"): string {
    const idx = getRobotIndexFromNo(robotNo);
    const iconNo = idx + 1;

    if (kind === "icon") {
      return `/icon/robot_icon(${iconNo}).png`;
    }
    return `/icon/robot_location(${iconNo}).png`;
  }

  const robotInfoIcons = {
    
    info: (robotNo: string) => buildRobotIconPath(robotNo, "icon"),

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

    mark: (robotNo: string) => buildRobotIconPath(robotNo, "location"),
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

  const robotsClick = (idx: number, option: RobotRowData) => {
    setRobotsActiveIndex(idx);     // 선택된 로봇명 옵션 저장
    setSelectedRobots(option);  
    setRobotsIsOpen(false);       // 드롭다운 닫기
    resetCurrentPage();
  };

  const batteryStatusClick = (idx: number, option: BatteryItem) => {
    setBatteryActiveIndex(idx);     // 선택된 배터리 옵션 저장
    setSelectedBattery(option);  
    setBatteryIsOpen(false);       // 드롭다운 닫기
    resetCurrentPage();
  };

  const networkStatusClick = (idx: number, option: NetworkItem) => {
    setNetworkActiveIndex(idx);
    setSelectedNetwork(option);  
    setNetworkIsOpen(false);
    resetCurrentPage();
  };
  const powerStatusClick = (idx: number, option: PowerItem) => {
    setPowerActiveIndex(idx);     // 선택된 전원 옵션 저장
    setSelectedPower(option);  
    setPowerIsOpen(false);       // 드롭다운 닫기
    resetCurrentPage();
  };
  const locationStatusClick = (idx: number, option: LocationItem) => {
    setLocationActiveIndex(idx);     // 선택된 위치 옵션 저장
    setSelectedLocation(option);  
    setLocationIsOpen(false);       // 드롭다운 닫기
    resetCurrentPage();
  };

  const toggleRobotChecked = (robotId: number, checked: boolean) => {
    setCheckedRobotIds((prev) => {
      const next = checked
        ? Array.from(new Set([...prev, robotId]))
        : prev.filter((id) => id !== robotId);

      // ✅ 체크 1개면 그 로봇을 "선택 로봇"으로 저장
      setSelectedRobotId(next.length === 1 ? next[0] : null);

      return next;
    });
  };

  const toggleAllCurrentItems = (checked: boolean) => {
    const currentPageIds = currentItems.map((r) => r.id); // 현재 페이지 로봇 id들

    setCheckedRobotIds((prev) => {
      const next = checked
        ? Array.from(new Set([...prev, ...currentPageIds]))
        : prev.filter((id) => !currentPageIds.includes(id));

      setSelectedRobotId(next.length === 1 ? next[0] : null);

      return next;
    });
  };

  const isAllCurrentItemsChecked = currentItems.length > 0 && currentItems.every((r) => checkedRobotIds.includes(r.id));

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        robotsWrapperRef.current &&
        !robotsWrapperRef.current.contains(e.target as Node)
      ) {
        setRobotsIsOpen(false); // 외부 클릭 → 닫기
      }

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

      if (
        powerWrapperRef.current &&
        !powerWrapperRef.current.contains(e.target as Node)
      ) {
        setPowerIsOpen(false); // 외부 클릭 → 닫기
      }

      if (
        locationWrapperRef.current &&
        !locationWrapperRef.current.contains(e.target as Node)
      ) {
        setLocationIsOpen(false); // 외부 클릭 → 닫기
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // 작업일정 복귀 시 조건에 따라 분기 처리
  const openWorkScheduleModal = () => {

    // 예시(임시): selectedRobotId가 없으면 none
    if (selectedRobotId == null) {
      setWorkScheduleCase('none');
      setCompletedPathText('');
      setRobotWorkScheduleModalOpen(true);
      return;
    }

    // 예시(임시 목업): 짝수 id는 ongoing, 홀수 id는 recent
    if (selectedRobotId % 2 === 0) {
      setWorkScheduleCase('ongoing');
      setCompletedPathText('데스크 - 커피로봇 - 맥봇제품 - 교육용로봇 - 부스입구 - 교육용로봇 - 맥봇제품 - 커피로봇 - 데스크 - 부스입구 - 교육용로봇 - 맥봇제품 - 커피로봇 - 데스크 - 부스입구 - 교육용로봇 - 맥봇제품 - 커피로봇 - 데스크 - 부스입구 - 교육용로봇 - 맥봇제품 - 커피로봇 - 데스크');
    } else {
      setWorkScheduleCase('recent');
      setCompletedPathText('데스크 - 안내데스크 - 민원창구 - 부스입구');
    }

    setRobotWorkScheduleModalOpen(true);
  };

  const handleSendLogOk = () => {
    // ✅ 여기서 checkedRobotIds를 사용해서 전송
    console.log("충전소 이동 robots:", checkedRobotIds);

    // TODO: API/WS 호출 (checkedRobotIds 전체 대상)

    setShowConfirm(false);

    // 선택을 유지할지/초기화할지 정책 결정:
    // setCheckedRobotIds([]); // 필요 시 초기화
  };

  const handleSendLogCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>

    <div className={styles.robotListTab}>
        <div className={`${activeTab === "robots" ? styles.active : ""}`} onClick={() => handleTabClick("robots")}>로봇 관리</div>
        <div className={`${activeTab === "place" ? styles.active : ""}`} onClick={() => handleTabClick("place")}>장소 관리</div>
        <div className={`${activeTab === "path" ? styles.active : ""}`} onClick={() => handleTabClick("path")}>경로 관리</div>
    </div>

    {activeTab === "robots" && (
    <div className={styles.RobotListTab}>
      <div className={styles.RobotStatusList}>
        <div className={styles.RobotStatusTopPosition}>
            <h2>로봇 목록</h2>
            <div className={styles.RobotSearch}>
              {/* 로봇 검색 필터 */}
              <div ref={robotsWrapperRef} className={`${styles.selecteWrapper}`} >
                  <div className={styles.selecte} onClick={() => setRobotsIsOpen(!robotsIsOpen)}>
                    <span>{robotsActiveIndex === -1 ? "Total" : selectedRobots?.no ?? "로봇명 선택"}</span>
                    {robotsIsOpen ? (
                      <img src="/icon/arrow_up.png" alt="arrow_up" />
                    ) : (
                      <img src="/icon/arrow_down.png" alt="arrow_down" />
                    )}
                  </div> 
                  {robotsIsOpen && (
                    <div className={styles.selectebox}>
                      {/* Total을 맨 위에 직접 추가 */}
                      <div
                        className={robotsActiveIndex === -1 ? styles.active : ""}
                        onClick={() => {
                          setRobotsActiveIndex(-1);
                          setSelectedRobots(null);   // null → 전체 조건 의미
                          setRobotsIsOpen(false);
                        }}
                      >
                        Total
                      </div>

                      {/* 실제 옵션들 */}
                      {robots.map((item, idx) => (
                        <div
                          key={item.id}
                          className={robotsActiveIndex === idx ? styles.active : ""}
                          onClick={ () => { robotsClick(idx, item); } }
                        >
                          {item.no}
                        </div>
                      ))}
                  </div>
                  )}
              </div>

              {/* 배터리 검색 필터 */}
              <div ref={batteryWrapperRef} className={`${styles.selecteWrapper}`} >
                  <div className={styles.selecte} onClick={() => setBatteryIsOpen(!batteryIsOpen)}>
                    <span>{batteryActiveIndex === -1 ? "Total" : selectedBattery?.label ?? "배터리 상태"}</span>
                    {batteryIsOpen ? (
                      <img src="/icon/arrow_up.png" alt="arrow_up" />
                    ) : (
                      <img src="/icon/arrow_down.png" alt="arrow_down" />
                    )}
                  </div> 
                  {batteryIsOpen && (
                    <div className={styles.selectebox}>
                      {/* Total을 맨 위에 직접 추가 */}
                      <div
                        className={batteryActiveIndex === -1 ? styles.active : ""}
                        onClick={() => {
                          setBatteryActiveIndex(-1);
                          setSelectedBattery(null);   // null → 전체 조건 의미
                          setBatteryIsOpen(false);
                        }}
                      >
                        Total
                      </div>

                      {/* 실제 옵션들 */}
                      {batteryStatus.map((item, idx) => (
                        <div
                          key={item.id}
                          className={batteryActiveIndex === idx ? styles.active : ""}
                          onClick={ () => { batteryStatusClick(idx, item); } }
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
                      <span>{networkActiveIndex === -1 ? "Total" : selectedNetwork?.label ?? "네트워크 상태"}</span>
                      {networkIsOpen ? (
                        <img src="/icon/arrow_up.png" alt="arrow_up" />
                      ) : (
                        <img src="/icon/arrow_down.png" alt="arrow_down" />
                      )}
                    </div> 
                    {networkIsOpen && (
                      <div className={styles.selectebox}>
                        {/* Total */}
                        <div
                          className={networkActiveIndex === -1 ? styles.active : ""}
                          onClick={() => {
                            setNetworkActiveIndex(-1);
                            setSelectedNetwork(null); // 전체
                            setNetworkIsOpen(false);
                            resetCurrentPage();
                          }}
                        >
                          Total
                        </div>

                        {/* 실제 네트워크 옵션들 */}
                        {networkStatus.map((item, idx) => (
                          <div
                            key={item.id}
                            className={networkActiveIndex === idx ? styles.active : ""}
                            onClick={ () => { networkStatusClick(idx, item); } }
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
                    <span>{powerActiveIndex === -1 ? "Total" : selectedPower?.label ?? "전원 상태"}</span>
                    {powerIsOpen ? (
                      <img src="/icon/arrow_up.png" alt="arrow_up" />
                    ) : (
                      <img src="/icon/arrow_down.png" alt="arrow_down" />
                    )}
                  </div> 
                  {powerIsOpen && (
                    <div className={styles.selectebox}>
                      {/* Total */}
                      <div
                        className={powerActiveIndex === -1 ? styles.active : ""}
                        onClick={() => {
                          setPowerActiveIndex(-1);
                          setSelectedPower(null);
                          setPowerIsOpen(false);
                          resetCurrentPage();
                        }}
                      >
                        Total
                      </div>

                      {/* 실제 전원 옵션들 */}
                      {powerStatus.map((item, idx) => (
                        <div
                          key={item.id}
                          className={powerActiveIndex === idx ? styles.active : ""}
                          onClick={ () => { powerStatusClick(idx, item); } }
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
                  <span>{locationActiveIndex === -1 ? "Total" : selectedLocation?.label ?? "위치 상태"}</span>
                  {locationIsOpen ? (
                    <img src="/icon/arrow_up.png" alt="arrow_up" />
                  ) : (
                    <img src="/icon/arrow_down.png" alt="arrow_down" />
                  )}
                </div> 
                {locationIsOpen && (
                  <div className={styles.selectebox}>
                    {/* Total */}
                    <div
                      className={locationActiveIndex === -1 ? styles.active : ""}
                      onClick={() => {
                        setLocationActiveIndex(-1);
                        setSelectedLocation(null);
                        setLocationIsOpen(false);
                        resetCurrentPage();
                      }}
                    >
                      Total
                    </div>

                    {/* 실제 위치 옵션들 */}
                    {locationStatus.map((item, idx) => (
                      <div
                        key={item.id}
                        className={locationActiveIndex === idx ? styles.active : ""}
                        onClick={ () => { locationStatusClick(idx, item);} }
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
                    <th>
                        <img
                          src={
                            isAllCurrentItemsChecked
                              ? "/icon/robot_chk.png"
                              : "/icon/robot_none_chk.png"
                          }
                          alt="현재 페이지 로봇 전체 선택"
                          role="button"
                          tabIndex={0}
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleAllCurrentItems(!isAllCurrentItemsChecked)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              toggleAllCurrentItems(!isAllCurrentItemsChecked);
                            }
                          }}
                        />
                    </th>
                    <th>Robot No</th>
                    <th>Robot Info</th>
                    <th>Battery (Return)</th>
                    <th>Network</th>
                    <th>Power</th>
                    <th>Mark</th>
                    <th>Location</th>
                </tr>
            </thead>
            <tbody>
            {currentItems.map((r, idx) => {
              const robotIndex = getRobotIndexFromNo(r.no);
              const robotColor = robotColors[robotIndex];

              return (
                <tr
                  key={r.no}
                  className={
                    checkedRobotIds.includes(r.id)
                      ? styles.selectedRow
                      : undefined
                  }
                  style={
                    {
                      "--robot-color": robotColor,
                    } as React.CSSProperties
                  }
                >
                  <td>
                      <img
                        src={
                          checkedRobotIds.includes(r.id)
                            ? "/icon/robot_chk.png"
                            : "/icon/robot_none_chk.png"
                        }
                        alt={`${r.no} 선택`}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          toggleRobotChecked(r.id, !checkedRobotIds.includes(r.id))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            toggleRobotChecked(r.id, !checkedRobotIds.includes(r.id));
                          }
                        }}
                      />
                  </td>
                  <td>
                    <div>{r.no}</div>
                  </td>
                  <td>
                    <div className={styles.robot_status_icon_div}>
                      <img src={robotInfoIcons.info(r.no)} alt="robot_icon" />
                      <div
                        className={styles["info-box"]}
                        onClick={() => ViewInfoClick(idx, r)}
                      >
                        View Info
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.robot_status_icon_div}>
                      <img
                        src={robotInfoIcons.battery(r.battery, r.isCharging)}
                        alt="battery"
                      />
                      {r.battery}% ({r.return}%)
                    </div>
                  </td>
                  <td>
                    <div className={styles.robot_status_icon_div}>
                      <img src={robotInfoIcons.network(r.network)} alt="network" />
                      {r.network}
                    </div>
                  </td>
                  <td>
                    <div className={styles.robot_status_icon_div}>
                      <img src={robotInfoIcons.power(r.power)} alt="power" />
                      {r.power}
                    </div>
                  </td>
                  <td>
                    <div className={styles.robot_status_icon_div}>
                      <img src={robotInfoIcons.mark(r.no)} alt="mark" />
                      {r.mark}
                    </div>
                  </td>
                  <td>
                    <div
                      className={`${styles.robot_status_icon_div} ${styles.viewMap}`}
                      onClick={() => {
                        handleLocationClick(idx, r);
                      }}
                    >
                      <div>View Map</div>
                      <div>→</div>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
        <RobotDetailModal isOpen={robotDetailModalOpen} onClose={() => setRobotDetailModalOpen(false)}  selectedRobotId={selectedRobotId} selectedRobot={selectedRobot} robots={robots} />
        <div className={styles.pagePosition}>
          <Pagination totalItems={totalItems} currentPage={currentPage} onPageChange={getPageSetter()} pageSize={PAGE_SIZE} blockSize={5} />
        </div>
        <div className={styles.bottomPosition}>
            <div style={{pointerEvents: isCrudDisabled ? "none" : "auto", opacity: isCrudDisabled ? 0.4 : 1, cursor:"pointer" }}
                  aria-disabled={isCrudDisabled}>
              <RobotCrudBtn />
            </div>
            <div className={styles.robotWorkBox}>
              <div className={styles.robotWorkCommonBtn}
                onClick={() => {
                  if (isWorkScheduleDisabled) return;
                  openWorkScheduleModal();
                }}
                aria-disabled={isWorkScheduleDisabled}
                style={{
                  pointerEvents: isWorkScheduleDisabled ? "none" : "auto",
                  opacity: isWorkScheduleDisabled ? 0.4 : 1,
                }}>
                <img src="/icon/robot_schedule_w.png" alt="" />
                작업일정 복귀
              </div>
              <div className={styles.robotWorkCommonBtn}
                onClick={() => {
                  if (isPlaceMoveDisabled) return;
                  setPlacePathModalOpen(true);
                }}
                aria-disabled={isPlaceMoveDisabled}
                style={{
                  pointerEvents: isPlaceMoveDisabled ? "none" : "auto",
                  opacity: isPlaceMoveDisabled ? 0.4 : 1,
                }}>
                <img src="/icon/robot_place_w.png" alt="" />
                장소 이동
              </div>
              <div className={styles.robotWorkCommonBtn}
                onClick={() => {
                  if (isChargeMoveDisabled) return;
                  setShowConfirm(true);
                  console.log("충전소 이동 robots:", checkedRobotIds);
                }}
                aria-disabled={isChargeMoveDisabled}
                style={{
                  pointerEvents: isChargeMoveDisabled ? "none" : "auto",
                  opacity: isChargeMoveDisabled ? 0.4 : 1,
                }}>
                <img src="/icon/robot_battery_place_w.png" alt="" />
                충전소 이동
              </div>
            </div>
        </div>
        <div></div>
      </div>
      <RobotWorkScheduleModal
  isOpen={robotWorkScheduleModalOpen}
  onClose={() => setRobotWorkScheduleModalOpen(false)}
  selectedRobotIds={checkedRobotIds}
  scheduleCase={workScheduleCase}
  completedPathText={completedPathText}
  onConfirmReturn={() => {
    // TODO: 실제 “작업스케줄 복귀” 명령 API/WS 호출
    console.log("작업스케줄 복귀 실행:", selectedRobotId);
  }}
  onConfirmWhenNone={() => {
    // TODO: 작업일정 등록 페이지 이동 등
    console.log("등록된 작업일정 없음 확인");
  }}
/>
      <PlacePathModal isOpen={placePathModalOpen} onClose={() => setPlacePathModalOpen(false)} selectedRobotIds={checkedRobotIds}/>
      {showConfirm && (
        <BatteryPathModal
          isOpen={showConfirm}
          message="배터리 충전소로 이동하시겠습니까?"
          onConfirm={handleSendLogOk}
          onCancel={handleSendLogCancel}
        />
      )}
        

      <div className={styles.cameraMapView}>
          <h2>위치 맵 & 실시간 카메라</h2>
          <MapView selectedRobotId={selectedRobotId} selectedRobot={selectedRobot} robots={robots} floors={floors} video={video} cameras={cameras}/>
          <br />
          <CameraViews selectedRobotId={selectedRobotId} selectedRobot={selectedRobot} robots={robots} floors={floors} video={video} cameras={cameras}/>
          <br />
          <div className={styles.modalOpenBox}>
              <RemoteBtn className={styles.customRemoteDiv} selectedRobots={selectedRobot} robots={robots} video={video} cameras={cameras}/>
              <RobotPathBtn  className={styles.customPathDiv} selectedRobots={selectedRobot} robots={robots} video={video} camera={cameras}/>
          </div>        
      </div>
    </div>
  )}

  {activeTab === "place" && (
    <div className={styles.place}>
        <div className={styles.container}>
            <img src="/icon/coming-soon.png" alt="Coming Soon" />
            <div className={styles.topTitle}>COMING SOON</div>
            <div className={styles.contentText}>We Are Preparing This Service</div>
        </div>
        <div className={styles.pagenationPosition}>
            {/* <Pagination totalItems={totalItems} currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} blockSize={5} /> */}
        </div>
    </div>
  )}

  {activeTab === "path" && (
    <div className={styles.path}>
        <div className={styles.container}>
            <img src="/icon/coming-soon.png" alt="Coming Soon" />
            <div className={styles.topTitle}>COMING SOON</div>
            <div className={styles.contentText}>We Are Preparing This Service</div>
        </div>
        <div className={styles.pagenationPosition}>
            {/* <Pagination totalItems={totalItems} currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} blockSize={5} /> */}
        </div>
    </div>
  )}
    </>
  );
}