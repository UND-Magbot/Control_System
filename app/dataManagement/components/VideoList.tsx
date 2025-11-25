"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './VideoList.module.css';
import Pagination from "@/app/components/pagination";
import Calendar from "@/app/components/Calendar";
import type { RobotRowData, Camera, Video, VideoItem, Period, LogItem, RobotType } from '@/app/type';
import VideoPlayModal from '@/app/components/modal/VideoPlayModal';
import { convertMinutesToText } from "@/app/utils/convertMinutesToText";
import TotalDonutChart from "./TotalDonutChart";
import ItemDonutChart from "./ItemDonutChart";
import { buildRobotTypeDonut, buildTaskCountDonut, buildTimeDonut, buildErrorDonut } from '../../utils/Charts';

const PAGE_SIZE = 8;

type VideoListProps = {
  cameras: Camera[];
  robots: RobotRowData[];
  video: Video[];
  videoData: VideoItem[];
  robotTypeData: RobotType[];
}


export default function VideoList({ 
    videoData, 
    robots, 
    video, 
    robotTypeData, 
}:VideoListProps) {

    const [videoActiveIndex, setVideoActiveIndex] = useState<number | null>(null);
    const [robotActiveIndex, setRobotActiveIndex] = useState<number | null>(null);
    
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [selectedRobot, setSelectedRobot] = useState<RobotRowData | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
    
    const [externalStartDate, setExternalStartDate] = useState<string | null>(null);
    const [externalEndDate, setExternalEndDate] = useState<string | null>(null);
    
    // 로봇 타입 선택 인덱스 (-1 = Total Robots)
    const [robotTypeActiveIndex, setRobotTypeActiveIndex] = useState<number>(-1);

    // 선택된 로봇 타입 (Total Robots = null)
    const [selectedRobotType, setSelectedRobotType] = useState<RobotType | null>(null);

    const [searchFilterData, setSearchFilterData] = useState<VideoItem[] | null>(null);

    const [videoPlayModalOpen, setVideoPlayModalOpen] = useState(false);
    const [playedVideoId, setPlayedVideoId] = useState<number | null>(null);
    const [playedVideo, setPlayedVideo] = useState<VideoItem | null>(null);
    const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"video" | "dt" | "log">("video");

    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isRobotOpen, setIsRobotOpen] = useState(false);
    const [isRobotTypeOpen, setIsRobotTypeOpen] = useState(false);
    const videoWrapperRef = useRef<HTMLDivElement>(null);
    const robotWrapperRef = useRef<HTMLDivElement>(null);
    const robotTypeWrapperRef = useRef<HTMLDivElement>(null);

    
    // 탭별 페이지 상태
    const [videoPage, setVideoPage] = useState(1);
    const [dtPage, setDtPage] = useState(1);
    const [logPage, setLogPage] = useState(1);

    const logData:LogItem[] = [];

    // 현재 탭에 따라 참조할 데이터/페이지 선택

    let currentPage;
    let currentData;

    switch (activeTab) {
    case "video":
        currentPage = videoPage;
        currentData = searchFilterData === null ? videoData : searchFilterData; // 전체보기
        break;
    case "dt":
        currentPage = dtPage;
        currentData = robots;
        break;
    case "log":
        currentPage = logPage;
        currentData = logData;
        break;
    }

    // 현재 탭 기준으로 totalItems 계산
    const totalItems = currentData.length;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentItems = currentData.slice(startIndex, startIndex + PAGE_SIZE);

    const handleTabClick = (tab: "video" | "dt" | "log") => {
        setActiveTab(tab);
    
        if (tab === "video" && activeTab !== "video") {
            setVideoPage(1);

            setSelectedVideo(null);
            setSelectedRobot(null);
            setSearchFilterData(null);
            
            setSelectedPeriod("today");
            setExternalStartDate(periodFormatDate(new Date()));
            setExternalEndDate(periodFormatDate(new Date()));

            setVideoActiveIndex(-1);
            setRobotActiveIndex(-1);

        } else if (tab === "dt") {
            setDtPage(1);
        } else if (tab === "log") {
            setLogPage(1);
        }
    };

    const getPageSetter = () => {
        switch (activeTab) {
            case "video":
                return setVideoPage;
            case "dt":
                return setDtPage;
            case "log":
                return setLogPage;
        }
    };

    const handlePeriodClick = (period: Period) => {
        setSelectedPeriod(period);
    };

    // 그 위쪽 state 선언은 그대로 두고, 핸들러만 수정
    const videoStatusClick = (idx: number, option: Video) => {
        setVideoActiveIndex(idx);
        if (option.label === "Total") {
            setSelectedVideo(null);
        } else {
            setSelectedVideo(option);
        }
        setIsVideoOpen(false);
    };

    const robotStatusClick = (idx: number) => {
        setRobotActiveIndex(idx);

        if (idx === 0) {
            // Total 선택
            setSelectedRobot(null);
        } else {
            // 실제 로봇 데이터는 idx - 1
            setSelectedRobot(robots[idx - 1]);
        }

        setIsRobotOpen(false);
    };
  
    const formatVideoTime = (time: string) => {
        const [hh, mm, ss] = time.split(":").map(Number);
    
        let result = "";
    
        if (hh > 0) result += `${hh}h `;
        if (mm > 0 || hh > 0) result += `${mm}m `;
        result += `${ss}s`;
    
        return result.trim();
    };

    const videoFormatDate = (datetime: string) => {
        const date = new Date(datetime);
    
        const yyyy = date.getFullYear();
        const MM = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
    
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");
    
        return `${yyyy}.${MM}.${dd} ${hh}:${mm}.${ss}`;
    };

    const periodFormatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    // Video 클릭 시 실행되는 핸들러
    const VideoPlayClick = (idx: number, videoData: VideoItem) => {
        setVideoActiveIndex(idx);
        setPlayedVideoId(videoData.id);
        setPlayedVideo(videoData);
        setVideoPlayModalOpen(true)

        console.log("선택된 로봇 (Location 클릭):", videoData.id, videoData.filename);
    };

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
          const target = e.target as Node;
      
          // 비디오 셀렉트 외부 클릭 → 닫기
          if (
            isVideoOpen &&
            videoWrapperRef.current &&
            !videoWrapperRef.current.contains(target)
          ) {
            setIsVideoOpen(false);
          }
      
          // 로봇 셀렉트 외부 클릭 → 닫기
          if (
            isRobotOpen &&
            robotWrapperRef.current &&
            !robotWrapperRef.current.contains(target)
          ) {
            setIsRobotOpen(false);
          }
        };
      
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isVideoOpen, isRobotOpen]);


    // videoData가 새로 들어오면 초기화
    useEffect(() => {
        setSearchFilterData(videoData);
    }, [videoData]);

    
    useEffect(() => {
        // 비디오 타입/로봇 선택이 바뀔 때마다 1페이지로 이동
        setVideoPage(1);
    }, [selectedVideo, selectedRobot]);


    // 썸네일 생성
    useEffect(() => {
        const video = document.createElement("video");
        video.src = "/videos/NoWordsCanSay.mp4"; // 여기에 실제 비디오 URL 사용
        video.crossOrigin = "anonymous";
        video.muted = true;

        video.addEventListener("loadeddata", () => {
        video.currentTime = 0.1; // 첫 프레임보다 조금 뒤가 더 잘 보임
        });

        video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const url = canvas.toDataURL("image/png");
        setVideoThumbnail(url);
        });
    }, []);

    
    const robotTypeIconMap: Record<string, { src: string; alt: string }> = {
        QUADRUPED: { src: "/icon/quadruped-cg.png", alt: "QUADRUPED" },
        COBOT: { src: "/icon/cobot-cg.png", alt: "COBOT" },
        AMR: { src: "/icon/amr-cg.png", alt: "AMR" },
        HUMANOID: { src: "/icon/humanoid-cg.png", alt: "HUMANOID" },
    };

    const robotTypeColorMap: Record<string, string> = {
        QUADRUPED: "#fa0203",
        COBOT: "#03abf3",
        AMR: "#97ce4f",
        HUMANOID: "#f79418",
    };

    const filteredRobots = robots.filter((r) => {
    // 타입 선택됨 → 필터 적용
    if (selectedRobotType) {
        if (r.type !== selectedRobotType.label) return false;
    }

    // 로봇 선택됨 → 필터 적용
    if (selectedRobot) {
        if (r.id !== selectedRobot.id) return false;
    }

    return true;
    });

 
    const hasAnyFilter = !!selectedRobotType || !!selectedRobot;
    const baseRobots = hasAnyFilter ? filteredRobots : robots;

    const robotTypeDonut = buildRobotTypeDonut({ robots: baseRobots  });
    const taskDonut = buildTaskCountDonut({ robots: baseRobots  });
    const timeDonut = buildTimeDonut({ robots: baseRobots  });
    const errorDonut = buildErrorDonut({ robots: baseRobots  });

    const totalRobots = robots.length;

    const totalTasks  = taskDonut.reduce((s, i) => s + i.value, 0);
    const totalTimeMinutes = timeDonut.reduce((s, i) => s + i.value, 0);
    const totalTimeStr = convertMinutesToText(totalTimeMinutes); // 예: "498h 3m"
    const [hText, mText] = totalTimeStr.split(" "); // ["498h", "3m"]
    const totalErrors = errorDonut.reduce((s, i) => s + i.value, 0);

    const isRobotSelected = !!selectedRobot;


    // 로봇 이름 선택 (dt 탭)
    const dtRobotClick = (idx: number) => {
        setRobotActiveIndex(idx);

        const robot = robots[idx] ?? null;
        setSelectedRobot(robot);        // 선택된 로봇 저장

        setIsRobotOpen(false);          // 드롭다운 닫기
    };

    // 🔥 Robot Type = Total Robots 선택 시
    const handleRobotTypeTotalClick = () => {
        setRobotTypeActiveIndex(-1);      // ✅ Total 선택 표시
        setSelectedRobotType(null);       // ✅ 타입 필터 제거 (Total 의미)
        setIsRobotTypeOpen(false);        // ✅ 드롭다운 닫기
    };

    // 🔥 특정 로봇 타입 선택 시
    const dtRobotTypeClick = (idx: number, type: RobotType) => {
        setRobotTypeActiveIndex(idx);     // ✅ 인덱스 저장
        setSelectedRobotType(type);       // ✅ 타입 필터 설정
        setIsRobotTypeOpen(false);        // ✅ 드롭다운 닫기
    };


  return (
    <>
    <div className={styles.videoListTab}>
        <div className={`${activeTab === "video" ? styles.active : ""}`} onClick={() => handleTabClick("video")}>Recording Video</div>
        <div className={`${activeTab === "dt" ? styles.active : ""}`} onClick={() => handleTabClick("dt")}>Statistical Info</div>
        <div className={`${activeTab === "log" ? styles.active : ""}`} onClick={() => handleTabClick("log")}>Log History</div>
    </div>

    {/* Recording Video 화면 */}
    {activeTab === "video" && (
        <div className={styles.videoList}>
            <div>    
                <div className={styles.videoListTopPosition}>
                    <h2>Video List</h2>
                    <div className={styles.videoSearch}>
                        <div className={styles.videoSelect}>
                            <div ref={videoWrapperRef}>
                                <div className={styles.selete} 
                                    onClick={() => setIsVideoOpen(!isVideoOpen)}>
                                    <span>{selectedVideo?.label ?? "녹화 선택"}</span>
                                    {isVideoOpen ? (
                                    <img src="/icon/arrow_up.png" alt="arrow_up" />
                                    ) : (
                                    <img src="/icon/arrow_down.png" alt="arrow_down" />
                                    )}
                                </div> 
                                {isVideoOpen && (
                                    <div className={`${styles.seletboxCommon} ${styles.videoSeletbox}`}>
                                    {video.map((video, idx) => (
                                        <div key={video.id} className={`${ videoActiveIndex === idx ? styles["active"] : "" }`.trim()}
                                            onClick={() => videoStatusClick(idx, video)}>{video.label}
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                            <div ref={robotWrapperRef} >
                                <div className={styles.selete} 
                                    onClick={() => setIsRobotOpen(!isRobotOpen)}>
                                    <span>  {selectedRobot ? selectedRobot.no : robotActiveIndex === 0  ? "Total" : "로봇 선택"}</span>
                                    {isRobotOpen ? (
                                    <img src="/icon/arrow_up.png" alt="arrow_up" />
                                    ) : (
                                    <img src="/icon/arrow_down.png" alt="arrow_down" />
                                    )}
                                </div> 
                                {isRobotOpen && (
                                    <div className={`${styles.seletboxCommon} ${styles.robotSeletbox}`}>

                                        {/* ⬇️ Total 항목 추가 */}
                                        <div
                                            className={`${robotActiveIndex === 0 ? styles["active"] : ""}`.trim()}
                                            onClick={() => robotStatusClick(0)}
                                        >
                                            Total
                                        </div>

                                        {/* ⬇️ 실제 robots 데이터는 index + 1 로 오프셋 처리 */}
                                        {robots.map((robot, idx) => (
                                            <div
                                                key={robot.id}
                                                className={`${robotActiveIndex === idx + 1 ? styles["active"] : ""}`.trim()}
                                                onClick={() => robotStatusClick(idx + 1)}
                                            >
                                                {robot.no}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.videoPeriod}>
                            <div className={`${styles.PeriodItemL} ${selectedPeriod === '1week' ? styles.active : ''}`}
                                onClick={() => handlePeriodClick('1week')}>
                                1주
                            </div>
                            <div className={`${styles.PeriodItemM} ${selectedPeriod === '1month' ? styles.active : ''}`}
                                onClick={() => handlePeriodClick('1month')}>
                                1달
                            </div>
                            <div className={`${styles.PeriodItemR} ${selectedPeriod === '1year' ? styles.active : ''}`}
                                onClick={() => handlePeriodClick('1year')}>
                                1년
                            </div>
                        </div>
                        <Calendar videoData={videoData} 
                                  selectedVideo={selectedVideo}
                                  selectedRobot={selectedRobot} 
                                  onFilteredChange={setSearchFilterData} 
                                  selectedPeriod={selectedPeriod} 
                                  onChangePeriod={setSelectedPeriod}
                                  externalStartDate={externalStartDate}
                                  externalEndDate={externalEndDate}
                                   />
                    </div>
                </div>
                <div className={styles.videoViewContainer}>
                    {currentItems.map((r, idx) => (
                        <div key={r.id} className={styles.videoViewItem}>
                            {videoThumbnail && (
                                <div className={styles.videoViewBox} onClick={() => { VideoPlayClick(idx, r) }}>
                                    <div className={styles.videoView}>
                                        <img src={videoThumbnail} alt="thumbnail" />
                                    </div>
                                    <div className={styles.videoViewIcon} onMouseEnter={() => setHoveredIndex(idx)} onMouseLeave={() => setHoveredIndex(null)}>
                                        <img src={ hoveredIndex === idx ? `/icon/video_hover_icon.png` : `/icon/video_icon.png`} alt="play" />
                                    </div>
                                </div>
                            )}
                            <div >
                                <div className={styles.videoViewText}>
                                    <div className={styles.videoViewTopText}>
                                        <div className={`${styles.nameBox} ${styles.RobotCamNameBox}`}>{r.robotNo}</div>
                                        <div className={`${styles.nameBox} ${styles.RobotCamNameBox}`}>{r.cameraNo}</div>
                                        <div className={`${styles.nameBox} ${styles.videoNameBox}`}>
                                            <div className={styles.cameratypeIcon}></div>
                                            <div>{r.cameraType}</div>
                                        </div>
                                    </div>
                                    <div className={styles.videoExport}>
                                        <img src="/icon/download.png" alt="download" />
                                        <div>Download</div>
                                    </div>
                                </div>
                                <div className={styles.videoViewBottomText}>
                                    <div>{videoFormatDate(r.date)}</div>
                                    <div className={styles.videoTextColor}>{formatVideoTime(r.videoTime)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>      
            <div className={styles.pagenationPosition}>
                <Pagination   totalItems={totalItems}
                currentPage={currentPage}
                onPageChange={getPageSetter()}
                pageSize={PAGE_SIZE}
                blockSize={5} />
            </div>
            <VideoPlayModal  isOpen={videoPlayModalOpen} onClose={() => setVideoPlayModalOpen(false)} playedVideoId={playedVideoId} playedVideo={playedVideo} />
        </div>
    )}

    {/* Statistical Info 화면 */}
    {activeTab === "dt" && (
        <div className={styles.DT}>
            <div className={styles.videoListTopPosition}>
                <h2>Robot Status</h2>
                <div className={styles.dtSearch}>
                    <div ref={robotTypeWrapperRef}>
                    <div
                        className={styles.selete}
                        onClick={() => setIsRobotTypeOpen(!isRobotTypeOpen)}
                    >
                        {/* 🔥 선택된 타입이 없으면 Total Robots 로 표시 */}
                        <span>{selectedRobotType?.label ?? "로봇 종류 선택"}</span>
                        {isRobotTypeOpen ? (
                        <img src="/icon/arrow_up.png" alt="arrow_up" />
                        ) : (
                        <img src="/icon/arrow_down.png" alt="arrow_down" />
                        )}
                    </div>

                    {isRobotTypeOpen && (
                        <div className={`${styles.seletboxCommon} ${styles.robotTypeSeletbox}`}>
                        {/* 🔥 맨 위에 Total Robots 추가 */}
                        <div
                            className={`${robotTypeActiveIndex === -1 ? styles["active"] : ""}`.trim()}
                            onClick={handleRobotTypeTotalClick}
                        >
                            Total Robots
                        </div>

                        {/* 기존 타입들 */}
                        {robotTypeData.map((item, idx) => (
                            <div
                            key={item.id}
                            className={`${robotTypeActiveIndex === idx ? styles["active"] : ""}`.trim()}
                            onClick={() => dtRobotTypeClick(idx, item)}
                            >
                            {item.label}
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                    <div ref={robotWrapperRef} >
                        <div className={styles.selete} 
                            onClick={() => setIsRobotOpen(!isRobotOpen)}>
                            <span>{selectedRobot?.no ?? "로봇 이름 선택"}</span>
                            {isRobotOpen ? (
                            <img src="/icon/arrow_up.png" alt="arrow_up" />
                            ) : (
                            <img src="/icon/arrow_down.png" alt="arrow_down" />
                            )}
                        </div> 
                        {isRobotOpen && (
                            <div className={`${styles.seletboxCommon} ${styles.robotSeletbox}`}>
                            {robots.map((robot, idx) => (
                                <div key={robot.id} className={`${ robotActiveIndex === idx ? styles["active"] : "" }`.trim()}
                                onClick={() => { dtRobotClick(idx) }}>{robot.no}</div>
                            ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.donutContainerFlex}>
                <div className={styles.dtDonutLeftBox}>
                    <div className={styles.totalDonutCount}>
                        <div>Total Robots</div>
                        <div className={styles.totalCount}>{totalRobots} <span>units</span></div>
                    </div>
                    <div className={styles.leftChart}>
                        {/* 왼쪽 큰 도넛 - Total Robots */}
                        <TotalDonutChart
                            title="Total Robots"
                            data={robotTypeDonut}
                            selectedRobotTypeLabel={selectedRobotType?.label ?? null}   // 로봇 종류 필터명
                            selectedRobotName={selectedRobot?.no ?? null}               // 로봇 이름 (Robot 5 등)
                            selectedRobotIconIndex={selectedRobot ? robots.findIndex(r => r.id === selectedRobot.id) : null} 
                        />
                    </div>
                    <div className={styles.robotTypeTotal}>
                    {robotTypeDonut.map((item) => {

                        const icon = robotTypeIconMap[item.label];
                        const percentText = item.percent.toFixed(1);

                        const isRobotSelected = !!selectedRobot;
                        const isMatchedType = !selectedRobot || selectedRobot.type === item.label;

                        // 라벨 색상
                        const labelStyle =
                            isRobotSelected && !isMatchedType ? { color: "#464a5d" } : undefined;

                        let iconSrc = icon.src;

                        if (isRobotSelected) {
                        const lower = item.label.toLowerCase();
                        iconSrc = `/icon/${lower}-cg-w.png`;   // 로봇 선택되면 전부 -cg-w 아이콘
                        }

                        return (
                        <div key={item.id} className={styles.robotTypeOne}>
                            <div className={styles.robotTypeName}>
                            {/* 아이콘 래퍼 div 추가 + 배경색 */}
                            <div className={styles.robotTypeIconBox}>
                                <img src={iconSrc} alt={item.label} />
                            </div>

                            {/* 타입명: 필요한 경우에만 흐리게 */}
                            <div className={styles.oneContentFs20} style={labelStyle}>
                                {item.label}
                            </div>
                            </div>

                            {/* 로봇 이름 선택되면 count 박스 숨김 */}
                            {!isRobotSelected && (
                            <div className={styles.oneContentCountBox}>
                                <div
                                className={styles.oneContentFs25}
                                style={{ color: robotTypeColorMap[item.label] }}
                                >
                                {percentText}
                                <span>%</span>
                                </div>
                                <div className={styles.oneContentBar}>|</div>
                                <div className={styles.oneContentFs25}>
                                {item.value}{" "}
                                <span className={styles.oneSpanColor}>units</span>
                                </div>
                            </div>
                            )}
                        </div>
                        );
                    })}
                    </div>
                </div>
                <div className={styles.dtDonutRightBox}>
                    <div className={styles.itemBoxBg}>
                        <div className={styles.itemTitleBox}>
                            <h2>Task Stats</h2>
                            <div className={styles.itemDataTotal}>
                                <div className={styles.leftText}>Total</div>
                                <div className={`${styles.middleText} ${styles.taskTextColor}`}>{totalTasks}</div>
                                <div className={styles.rightText}>cases</div>
                            </div>
                        </div>
                        <div className={styles.useItemDonutBox}>
                            <ItemDonutChart title={<>Patient<br/>Monitoring</>} data={[taskDonut[0]]} color="#77a251" />
                            <ItemDonutChart title={<>Security<br/>Patrol</>} data={[taskDonut[1]]} color="#77a251" />
                            <ItemDonutChart title={<>Medi/Supply<br/>Delivery</>} data={[taskDonut[2]]} color="#77a251" />
                        </div>
                    </div>
                    <div className={styles.itemBoxBg}>
                        <div className={`${styles.itemTitleBox} ${styles.time}`}>
                            <h2>Time Stats</h2>
                            <div className={styles.itemDataTotal}>
                                <div className={styles.leftText}>Total</div>
                                <div className={`${styles.middleText} ${styles.timeTextColor}`}>{hText.replace("h", "")}<span>h</span></div>
                                <div className={`${styles.rightText} ${styles.timeTextColor}`}>{mText.replace("m", "")}<span>m</span></div>
                            </div>
                        </div>
                        <div className={styles.useItemDonutBox}>
                            <ItemDonutChart isTime title={<>Operating<br/>Time</>} data={[timeDonut[0]]} color="#0e8ebf" />
                            <ItemDonutChart isTime title={<>Standby<br/>Time</>} data={[timeDonut[1]]} color="#0e8ebf" />
                            <ItemDonutChart isTime title={<>Charging<br/>Time</>} data={[timeDonut[2]]} color="#0e8ebf" />
                        </div>
                    </div>
                    <div className={styles.itemBoxBg}>
                        <div className={styles.itemTitleBox}>
                            <h2>Error Stats</h2>
                            <div className={styles.itemDataTotal}>
                                <div className={styles.leftText}>Total</div>
                                <div className={`${styles.middleText} ${styles.errorTextColor}`}>{totalErrors}</div>
                                <div className={styles.rightText}>cases</div>
                            </div>
                        </div>
                        <div className={styles.useItemDonutBox}>
                            <ItemDonutChart title={<>Network<br/>Error</>} data={[errorDonut[0]]} color="#c2434c" />
                            <ItemDonutChart title={<>Failure<br/>Error</>} data={[errorDonut[1]]} color="#c2434c" />
                            <ItemDonutChart title={<>Others<br/>Error</>} data={[errorDonut[2]]} color="#c2434c" />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.pagenationPosition}>
                {/* <Pagination totalItems={totalItems} currentPage={currentPage} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} blockSize={5} /> */}
            </div>
        </div>
    )}


    {/* Log History 화면 */}
    {activeTab === "log" && (
        <div className={styles.DT}>
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