"use client";

import styles from './WorkSchedule.module.css';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useCustomScrollbar } from "@/app/hooks/useCustomScrollbar";
import MiniCalendar from './MiniCalendar';
import ScheduleInsert from './ScheduleInsert';
import ScheduleDetail from './ScheduleDetail';
import type { RobotRowData } from '@/app/type';


// 주간
type WeekEvent = {
  id: string;
  title: string;

  robotNo: string;     // 예: "Robot 3"
  robotType: string;   // 예: "순찰/보안"

  dayIndex: number;   // 0=일 ... 6=토
  startMin: number;   // 0~1439
  endMin: number;     // 1~1440
  color?: "green" | "yellow" | "blue" | "red";
};

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function hourLabel(h: number) {
  const ampm = h < 12 ? "오전" : "오후";
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${display}시`;
}

// 월간
type MonthDayCell = {
  date: Date;
  day: number;
  inMonth: boolean;
  key: string; // YYYY-MM-DD
};

function ymd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type MonthEvent = {
  id: string;
  title: string;
  date: string; // "2025-01-09"
  color?: "green" | "yellow" | "blue" | "red";
};


const monthEvents: MonthEvent[] = [
  { id: "m1", title: "[완] Robot 3, 1층 순찰", date: "2025-01-09", color: "green" },
  { id: "m2", title: "[진] Robot 4, 103호 환자", date: "2025-01-09", color: "red" },
  { id: "m3", title: "[완] Robot 1, 303호", date: "2025-01-12", color: "yellow" },
];

function buildMonthCells(viewDate: Date) {

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0~11

  const firstDow = new Date(year, month, 1).getDay();      // 0=일
  const lastDate = new Date(year, month + 1, 0).getDate(); // 이번달 마지막 일
  const prevLast = new Date(year, month, 0).getDate();     // 전달 마지막 일


  // 이번 달이 달력 그리드에 차지하는 실제 칸 수
  const usedCells = firstDow + lastDate;
  const weeks = Math.ceil(usedCells / 7); // 5 또는 6(드물게 4도 가능하지만 보통 5/6)

  const totalCells = weeks * 7;

  const cells: MonthDayCell[] = [];

  // 1) 앞쪽(이전달)
  for (let i = 0; i < firstDow; i++) {
    const day = prevLast - (firstDow - 1 - i);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    cells.push({ date, day, inMonth: false, key: ymd(date) });
  }

  // 2) 이번달
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);
    cells.push({ date, day: d, inMonth: true, key: ymd(date) });
  }

  // 3) 뒤쪽(다음달) - totalCells 맞춰 채우기 (5주면 35칸, 6주면 42칸)
  let nextDay = 1;
  while (cells.length < totalCells) {
    const date = new Date(year, month + 1, nextDay++);
    date.setHours(0, 0, 0, 0);
    cells.push({ date, day: date.getDate(), inMonth: false, key: ymd(date) });
  }

  return { cells, weeks };
}

const monthColorClass: Record<NonNullable<MonthEvent["color"]>, string> = {
  green: styles.evGreen,
  yellow: styles.evYellow,
  blue: styles.evBlue,
  red: styles.evRed,
};

interface RobotScheduleProps {
  robots: RobotRowData[];
}

function monthEventsForDay(dateKey: string) {
  return monthEvents.filter(ev => ev.date === dateKey);
}

export default function Page({ robots }: RobotScheduleProps) {
    
    // 필터 항목 드롭다운 구현
    const [isRobotTypeSelected, setIsRobotTypeSelected] = useState(true);
    const [isRobotNameSelected, setIsRobotNameSelected] = useState(true);
    
    // 필터 항목 다중 선택
    const [selectedRobotTypes, setSelectedRobotTypes] = useState<string[]>([]);
    const [selectedRobotNames, setSelectedRobotNames] = useState<string[]>([]);
    const robotTypes = ["환자 모니터링", "순찰/보안", "물품/약품 운반"];

    const toggleRobotType = (label: string) => {
        setSelectedRobotTypes((prev) =>
            prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
        );
    };
    const toggleRobotName = (name: string) => {
        setSelectedRobotNames((prev) =>
            prev.includes(name)
            ? prev.filter((x) => x !== name)
            : [...prev, name]
        );
    };

    const isTypeFilterOn = selectedRobotTypes.length > 0;
    const isNameFilterOn = selectedRobotNames.length > 0;

    const mockEvents: WeekEvent[] = useMemo(() => {
        return [
            {
            id: "e1",
            title: "[완] Robot 3, 1층 순찰...",
            robotNo: "Robot 3",
            robotType: "순찰/보안",
            dayIndex: 2,
            startMin: 4 * 60 + 10,
            endMin: 4 * 60 + 40,
            color: "green",
            },
        ];
    }, []);

    /** ✅ 조건 1/2/3 실시간 반영 필터 */
    const filteredWeekEvents = useMemo(() => {
        // 필터가 하나도 없으면 전체 표시
        if (!isTypeFilterOn && !isNameFilterOn) return mockEvents;

        return mockEvents.filter((ev) => {
            const typeOk = !isTypeFilterOn || selectedRobotTypes.includes(ev.robotType);
            const nameOk = !isNameFilterOn || selectedRobotNames.includes(ev.robotNo);

            // ✅ 조건3: 둘 다 선택된 경우 교집합(type AND name)
            return typeOk && nameOk;
        });
    }, [mockEvents, isTypeFilterOn, isNameFilterOn, selectedRobotTypes, selectedRobotNames]);

    const robotNameOptions = robots;

    // 필터 조건 스크롤 뷰
    const filterScrollRef = useRef<HTMLDivElement>(null);
    const filterTrackRef = useRef<HTMLDivElement>(null);
    const filterThumbRef = useRef<HTMLDivElement>(null);

    useCustomScrollbar({
        enabled: true,            // 기존 로직 유지 (원하면 필터 영역 조건으로 바꿔도 됨)
        scrollRef: filterScrollRef,    // ✅ 키 이름만 훅 규격에 맞춤
        trackRef: filterTrackRef,
        thumbRef: filterThumbRef,
        minThumbHeight: 50,
        deps: [
            selectedRobotTypes.length,
            selectedRobotNames.length,
            robotNameOptions.length,
            isRobotTypeSelected,
            isRobotNameSelected,
        ],
    });
    
    type ScheduleView = "week" | "month";
    const [viewType, setViewType] = useState<ScheduleView>("week");
    
    // 달력에서 보고 있는 기준 월
    const [viewDate, setViewDate] = useState(new Date());

    const startOfWeek = (d: Date) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        x.setDate(x.getDate() - x.getDay()); // 일요일 시작
        return x;
    };

    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    });
    const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));

    const [todayResetKey, setTodayResetKey] = useState(0);

    const displayDate = viewType === "week" ? weekStart : viewDate;
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth(); // 0~11

    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const dt = new Date(weekStart);
            dt.setDate(weekStart.getDate() + i);
            return dt;
        });
    }, [weekStart]);

    // Header의 이전/다음 버튼 처리
    const addDays = (base: Date, days: number) => {
        const d = new Date(base);
        d.setDate(d.getDate() + days);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const handlePrev = () => {
        if (viewType === "week") {
            setWeekStart((prev) => addDays(prev, -7));
        } else {
            setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
    };

    const handleNext = () => {
        if (viewType === "week") {
            setWeekStart((prev) => addDays(prev, +7));
        } else {
            setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        }
    };

    // 기존 dates 목업을 대체
    const dates = useMemo(() => weekDates.map((d) => String(d.getDate())), [weekDates]);

    const handlePickDate = (d: Date) => {
    setSelectedDate(d);
    setWeekStart(startOfWeek(d));

    // 상단 "년/월" 표시도 선택월로 동기화
    setViewDate(d);

    // 조건4: 선택일 기준 주간 스케줄을 보여줘야 한다면 주간 탭으로 전환
    setViewType("week");
    };

    /** 1) 화면 옵션(페이지 안에서 고정값으로 관리) */
    const heightPx = 630;     // 전체 박스 고정 높이
    const hourRowPx = 38;     // 1시간 칸 높이
    const totalMinutes = 24 * 60;
    const gridHeight = 24 * hourRowPx;

    // 월간 헤더 높이
    const MONTH_HEADER_H = 40;

    const scrollRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);


    /** 4) 시간 라벨 (24개) */
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

    const colorClass = (c?: WeekEvent["color"]) => {
        switch (c) {
        case "green":
            return styles.evGreen;
        case "yellow":
            return styles.evYellow;
        case "blue":
            return styles.evBlue;
        case "red":
            return styles.evRed;
        default:
            return styles.evGreen;
        }
    };

    const { cells: monthCells, weeks } = useMemo(() => {
        return buildMonthCells(viewDate);
    }, [viewDate]);

    const handleToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 선택 날짜 = 오늘
        setSelectedDate(today);

        // 주간 기준일 = 오늘이 포함된 주 시작
        setWeekStart(startOfWeek(today));

        // 상단 년/월 표시 + 월간 기준 월 동기화
        setViewDate(today);

        // MiniCalendar를 오늘로 "초기화"시키는 신호
        setTodayResetKey((k) => k + 1);
    };

    const isSameYmd = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

        const today0 = useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);


    //  스크롤
    useEffect(() => {
    // ✅ 주간이 아닐 때는 커스텀 스크롤 attach 하지 않음
    if (viewType !== "week") return;

    const el = scrollRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!el || !track || !thumb) return;

    const MIN_THUMB = 10;

    const syncThumb = () => {
        const clientHeight = el.clientHeight;
        const scrollHeight = el.scrollHeight;
        const trackHeight = track.clientHeight;

        // 스크롤 필요 없으면 숨김
        if (scrollHeight <= clientHeight || trackHeight <= 0) {
        thumb.style.opacity = "0";
        thumb.style.height = `${trackHeight}px`;
        thumb.style.top = `0px`;
        return;
        }

        thumb.style.opacity = "1";

        const FIXED_THUMB_RATIO = 0.3; // 30%
        const thumbH = Math.max(MIN_THUMB, Math.floor(trackHeight * FIXED_THUMB_RATIO));
        thumb.style.height = `${thumbH}px`;

        const maxScrollTop = scrollHeight - clientHeight;
        const maxThumbTop = trackHeight - thumbH;

        const ratio = maxScrollTop > 0 ? el.scrollTop / maxScrollTop : 0;
        const top = Math.max(0, Math.min(maxThumbTop, ratio * maxThumbTop));
        thumb.style.top = `${top}px`;
    };

    syncThumb();
    requestAnimationFrame(syncThumb);
    setTimeout(syncThumb, 0);

    const onScroll = () => syncThumb();
    el.addEventListener("scroll", onScroll, { passive: true });

    let dragging = false;
    let startY = 0;
    let startThumbTop = 0;

    const getThumbTop = () => {
        const v = parseFloat(thumb.style.top || "0");
        return Number.isFinite(v) ? v : 0;
    };

    const onPointerDown = (e: PointerEvent) => {
        dragging = true;
        startY = e.clientY;
        startThumbTop = getThumbTop();
        document.body.style.userSelect = "none";
        thumb.setPointerCapture?.(e.pointerId);
        thumb.classList.add(styles.thumbDragging);
        e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return;

        const clientHeight = el.clientHeight;
        const scrollHeight = el.scrollHeight;
        const trackHeight = track.clientHeight;

        if (scrollHeight <= clientHeight || trackHeight <= 0) return;

        const thumbH = thumb.getBoundingClientRect().height;
        const maxThumbTop = trackHeight - thumbH;

        const dy = e.clientY - startY;
        const nextThumbTop = Math.max(0, Math.min(maxThumbTop, startThumbTop + dy));

        const maxScrollTop = scrollHeight - clientHeight;
        const ratio = maxThumbTop > 0 ? nextThumbTop / maxThumbTop : 0;
        el.scrollTop = ratio * maxScrollTop;
    };

    const onPointerUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;

        document.body.style.userSelect = "";
        thumb.classList.remove(styles.thumbDragging);

        try {
        thumb.releasePointerCapture?.(e.pointerId);
        } catch {}
    };

    thumb.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const ro = new ResizeObserver(syncThumb);
    ro.observe(el);
    ro.observe(track);
    window.addEventListener("resize", syncThumb);

    return () => {
        el.removeEventListener("scroll", onScroll);
        thumb.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("resize", syncThumb);
        ro.disconnect();
        document.body.style.userSelect = "";
        thumb.classList.remove(styles.thumbDragging);
    };
    }, [viewType, hourRowPx, gridHeight, heightPx]);


    // 작업등록 모달 open/close 상태
    const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);

    // 작업상세 모달 open/close 상태
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // ✅ 클릭된 주간 이벤트 저장
    const [selectedWeekEvent, setSelectedWeekEvent] = useState<WeekEvent | null>(null);

    const handleClickWeekEvent = (event: WeekEvent) => {
        setSelectedWeekEvent(event);
        setIsDetailModalOpen(true);
    };

    return (
      <>
        <div className={styles.ScheduleContainer}>
            <div>

                <h2>작업일정 관리</h2>
                <div>
                    <MiniCalendar value={selectedDate} onPickDate={handlePickDate} todayResetKey={todayResetKey} />
                </div>
                <div className={styles.whiteLine}></div>
                <div className={styles.selectBoxContainer}>
                    <div ref={filterScrollRef} className={styles.filterInner}>
                        <div className={styles.selectBoxGap}>
                            <div className={styles.selecteBoxCommon} onClick={() => setIsRobotTypeSelected(prev => !prev)}>
                                <div>로봇 종류 선택</div>
                                <img src={isRobotTypeSelected ? "/icon/arrow_up.png" : "/icon/arrow_down.png"} alt="" />
                            </div>
                            {isRobotTypeSelected && (
                                <div>
                                    {robotTypes.map((label) => {
                                        const isSelected = selectedRobotTypes.includes(label);

                                        return (
                                            <div
                                            key={label}
                                            className={`${styles.robotSelecteItem} ${isSelected ? styles.active : ""}`}
                                            onClick={() => toggleRobotType(label)}
                                            >
                                            <img
                                                src={isSelected ? "/icon/robot_chk.png" : "/icon/robot_none_chk.png"}
                                                alt=""
                                            />
                                            <span>{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className={styles.selecteBoxCommon} onClick={() => setIsRobotNameSelected(prev => !prev)}>
                                <div>로봇명 선택</div>
                                <img src={isRobotNameSelected ? "/icon/arrow_up.png" : "/icon/arrow_down.png"} alt="" />
                            </div>
                            {isRobotNameSelected && (
                            <div>
                                {robotNameOptions.map((robot) => {
                                const active = selectedRobotNames.includes(robot.no);

                                return (
                                    <div
                                    key={robot.id}
                                    className={`${styles.robotSelecteItem} ${
                                        active ? styles.active : ""
                                    }`}
                                    onClick={() => toggleRobotName(robot.no)}
                                    >
                                    <img
                                        src={
                                        active
                                            ? "/icon/robot_chk.png"
                                            : "/icon/robot_none_chk.png"
                                        }
                                        alt=""
                                    />
                                    <span>{robot.no}</span>
                                    </div>
                                );
                                })}
                            </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.selectBoxGutter}>
                        <div ref={filterTrackRef} className={styles.filterScrollTrack}>
                            <div ref={filterThumbRef} className={styles.filterScrollThumb} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 스케줄 */}
            <div className={styles.scheduleRight}>

                <div className={styles.scheduleRightHeader}>
                    <div className={styles.rightHeaderTopL}>
                        <div className={styles.todayBtn} onClick={handleToday}>오늘</div>
                        <div className={styles.calendarHeader}>
                            <button type="button" onClick={handlePrev}>
                                <img src="/icon/arrow-left-g.png" alt="left" />
                            </button>
                            <div className={styles.calendarHeaderTitle}>{year}년 {month + 1}월</div>
                            <button type="button" onClick={handleNext}>
                                <img src="/icon/arrow-right-g.png" alt="next" />
                            </button>
                        </div>
                        <div className={styles.statusUpdate}>
                            <img src="/icon/data_update.png" alt="" />
                        </div>
                    </div>

                    <div className={styles.scheduleControl}>
                        <button type='button' className={styles.scheduleAddButton} onClick={() => setIsInsertModalOpen(true)}>
                            <span>+</span>
                            <span>작업등록</span>
                        </button>
                        <div className={styles.scheduleViewButtons}>
                            <button type='button' 
                                    className={`${styles.scheduleWeek} ${viewType === "week" ? styles.active : ""}`} 
                                    onClick={() => setViewType("week")}>주간</button>
                            <button type='button' className={`${styles.scheduleMonth} ${viewType === "month" ? styles.active : ""}`}
                                    onClick={() => setViewType("month")}>월간</button>
                        </div>
                    </div>
                </div>
                {/* 작업등록 모달 */}

                {isInsertModalOpen && (
                    <ScheduleInsert
                        isOpen={isInsertModalOpen}
                        onClose={() => setIsInsertModalOpen(false)}
                        robots={robots}
                    />
                )}

                {viewType === "week" && (
                <section className={styles.weekendGrid}>
                    <div className={styles.scroller} style={{ height: heightPx }}>
                        <div ref={scrollRef} className={styles.inner} role="listbox">
                            {/* 헤더(요일/날짜) */}
                            <div className={styles.headerRow}>
                                <div className={styles.corner} />
                                    {DOW.map((d, i) => {
                                        const isToday = isSameYmd(weekDates[i], today0);

                                        return (
                                            <div key={d} className={styles.dayHeader}>
                                            <div className={i === 0 ? styles.sun : i === 6 ? styles.sat : undefined}>{d}</div>

                                            <div className={`${styles.dateChip} ${isToday ? styles.todayDateChip : ""}`}>
                                                {dates[i] ?? ""}
                                            </div>
                                            </div>
                                        );
                                    })}
                                <div className={styles.scrollSpacer} />
                            </div>

                            {/* 바디 */}
                            <div className={styles.body}>
                                {/* 시간 컬럼 */}
                                <div className={styles.timeCol}>
                                    <div className={styles.timeColInner} style={{ height: gridHeight }}>
                                    {hours.map((h) => (
                                        <div key={h} className={styles.timeCell} style={{ height: hourRowPx }}>
                                        {hourLabel(h)}
                                        </div>
                                    ))}
                                    </div>
                                </div>

                                {/* 7일 그리드 */}
                                <div className={styles.daysCol}>
                                    <div className={styles.daysGrid} style={{ height: gridHeight }}>
                                    {/* 가로 라인(시간) */}
                                    {hours.map((h) => (
                                        <div
                                        key={h}
                                        className={styles.hourRowLine}
                                        style={{ top: h * hourRowPx }}
                                        />
                                    ))}

                                    {/* 7일 컬럼 배경(오늘 강조) */}
                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const isToday = isSameYmd(weekDates[i], today0);

                                        return (
                                            <div
                                            key={`bg-${i}`}
                                            className={`${styles.dayColBg} ${isToday ? styles.todayColBg : ""}`}
                                            style={{
                                                left: `${(i / 7) * 100}%`,
                                                width: `${100 / 7}%`,
                                                height: gridHeight,
                                            }}
                                            />
                                        );
                                    })}

                                    {/* 이벤트 */}
                                    {filteredWeekEvents.map((ev) => {
                                        const start = Math.max(0, Math.min(totalMinutes, ev.startMin));
                                        const end = Math.max(0, Math.min(totalMinutes, ev.endMin));
                                        const dur = Math.max(10, end - start); // 최소 높이(가독성)

                                        const top = (start / 60) * hourRowPx;
                                        const height = (dur / 60) * hourRowPx;

                                        const leftPct = (ev.dayIndex / 7) * 100;
                                        const widthPct = 100 / 7;

                                        return (
                                        <div
                                            key={ev.id}
                                            className={`${styles.event} ${colorClass(ev.color)}`}
                                            style={{
                                            top,
                                            height,
                                            left: `calc(${leftPct}% + 6px)`,
                                            width: `calc(${widthPct}% - 12px)`,
                                            }}
                                            title={ev.title}
                                            onClick={() => handleClickWeekEvent(ev)}
                                        >
                                            {ev.title}
                                        </div>
                                        );
                                    })}
                                    </div>
                                </div>
                                {isDetailModalOpen && selectedWeekEvent && (
                                    <ScheduleDetail
                                        isOpen={isDetailModalOpen}
                                        onClose={() => {
                                        setIsDetailModalOpen(false);
                                        setSelectedWeekEvent(null);
                                        }}
                                        event={selectedWeekEvent}
                                    />
                                )}

                                <div className={styles.scrollGutter}>
                                    <div ref={trackRef} className={styles.scrollTrack}>
                                    <div ref={thumbRef} className={styles.scrollThumb} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                )}

                {viewType === "month" && (
                <section className={styles.monthContainer} style={{ height: heightPx }}>
                    {/* 요일 헤더 */}
                    <div className={styles.monthHeaderRow} style={{ height: MONTH_HEADER_H }}>
                    {DOW.map((d, i) => (
                        <div
                        key={d}
                        className={`${styles.monthWeekDay} ${
                            i === 0 ? styles.sun : i === 6 ? styles.sat : ""
                        }`}
                        >
                        {d}
                        </div>
                    ))}
                    </div>

                    {/* 바디: 컨테이너(630) - 헤더(40) */}
                    <div
                    className={styles.monthBody}
                    style={{ height: `calc(${heightPx}px - ${MONTH_HEADER_H}px)` }}
                    >
                        <div
                            className={styles.monthGrid}
                            style={{ gridTemplateRows: `repeat(${weeks}, 1fr)` }}
                        >
                            {monthCells.map((cell) => {
                                const events = monthEventsForDay(cell.key);
                                const maxVisible = weeks >= 6 ? 1 : 2;

                                const visible = events.slice(0, maxVisible);
                                const remain = events.length - visible.length;

                                const isToday = isSameYmd(cell.date, today0);

                                return (
                                    <div
                                    key={cell.key}
                                    className={`${styles.monthCell} ${isToday ? styles.monthToday : ""}`}
                                    >
                                        <div className={styles.dateNumber}>{cell.day}</div>

                                        <div className={styles.cellEvents}>
                                            {visible.map((ev) => (
                                            <div
                                                key={ev.id}
                                                className={`${styles.cellEvent} ${
                                                ev.color ? monthColorClass[ev.color] : styles.evGreen
                                                }`}
                                            >
                                                {ev.title}
                                            </div>
                                            ))}

                                            {remain > 0 && <div className={styles.more}>+{remain}개</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
                )}
            </div>
        </div>
      </>
    )
}