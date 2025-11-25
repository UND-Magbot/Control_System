"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Calendar.module.css";
import type { VideoItem, Period } from '@/app/type';

type ActiveField = "start" | "end" | null;

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type Props = {
  videoData: VideoItem[];
  selectedVideo: { label: string } | null;
  selectedRobot: { no: string } | null;
  onFilteredChange: (data: VideoItem[]) => void;
  selectedPeriod: Period;
  onChangePeriod: (period: Period | null) => void;
  externalStartDate?: string | null;
  externalEndDate?: string | null;
};

export default function VideoDateRange({
  videoData,
  selectedVideo,
  selectedRobot,
  onFilteredChange,
  selectedPeriod,
  onChangePeriod,
  externalStartDate,
  externalEndDate,
}: Props) {

  const today = new Date();

  // 초기값: 지난 1주 (oneWeekAgo ~ 오늘)
  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(today));


  const handleDateSelect = (selected: string) => {
    // 우선, 이번 선택으로 바뀔 값들을 계산
    let nextStart = startDate;
    let nextEnd = endDate;

    if (activeField === "start") {
      nextStart = selected;
      setStartDate(selected);
    } else if (activeField === "end") {
      nextEnd = selected;
      setEndDate(selected);
    }

    // 선택한 날짜 조합이 1주/1달/1년이 아닐 경우 period active 해제
    syncPeriodWithRange(nextStart, nextEnd, onChangePeriod);

    setIsCalendarOpen(false); // 모달 닫기
    setActiveField(null);
  };

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 달력에서 보고 있는 기준 월
  const [viewDate, setViewDate] = useState(new Date());
  // 달력에서 클릭한 임시 선택값
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const openCalendar = (field: ActiveField) => {
    setActiveField(field);
    setIsCalendarOpen(true);

    // 현재 필드 값 기준으로 그 달부터 보여주기
    const base =
      field === "start" ? startDate : field === "end" ? endDate : null;
    if (base) {
      const [y, m, d] = base.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      setViewDate(date);
      setTempDate(date);
    } else {
      const today = new Date();
      setViewDate(today);
      setTempDate(today);
    }
  };

  const handleConfirm = () => {
    if (!tempDate || !activeField) return;
    const value = formatDate(tempDate);

    if (activeField === "start") setStartDate(value);
    if (activeField === "end") setEndDate(value);

    setIsCalendarOpen(false);
    setActiveField(null);
  };

  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    setTempDate(today);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0~11
  const firstDay = new Date(year, month, 1).getDay(); // 0=일
  const lastDate = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  // 앞쪽 공백
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // 실제 날짜
  for (let d = 1; d <= lastDate; d++) {
    days.push(d);
  }

  const isSameDate = (a: Date | null, d: number) => {
    if (!a) return false;
    return (
      a.getFullYear() === year &&
      a.getMonth() === month &&
      a.getDate() === d
    );
  };

  // 🔹 현재 start/end 범위가 1주/1달/1년 중 무엇인지 확인
  function syncPeriodWithRange(
    startStr: string,
    endStr: string,
    onChangePeriod: (period: Period | null) => void
  ) {
    const today = new Date();
    const todayStr = formatDate(today);

    // 기준 날짜들 계산
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(today);
    monthStart.setMonth(monthStart.getMonth() - 1);

    const yearStart = new Date(today);
    yearStart.setFullYear(yearStart.getFullYear() - 1);

    const weekStartStr = formatDate(weekStart);
    const monthStartStr = formatDate(monthStart);
    const yearStartStr = formatDate(yearStart);

    let nextPeriod: Period | null = null;

    if (startStr === weekStartStr && endStr === todayStr) {
      nextPeriod = "1week";
    } else if (startStr === monthStartStr && endStr === todayStr) {
      nextPeriod = "1month";
    } else if (startStr === yearStartStr && endStr === todayStr) {
      nextPeriod = "1year";
    } else {
      nextPeriod = null;   // 🔥 1주/1달/1년에 정확히 안 맞으면 active 해제
    }

    onChangePeriod(nextPeriod);
  }


  // ✅ 비디오 타입 / 로봇 / 날짜 범위를 한 번에 필터링 (스왑 로직 포함)
  useEffect(() => {
    // 1) 비디오 타입 / 로봇 기준 1차 필터
    const baseFiltered = videoData.filter((item) => {
      const matchVideo = selectedVideo
        ? item.cameraType === selectedVideo.label
        : true;

      const matchRobot = selectedRobot
        ? item.robotNo === selectedRobot.no
        : true;

      console.log("item:", item, "matchVideo:", matchVideo, "matchRobot:", matchRobot);
      return matchVideo && matchRobot;
    });

    // 2) 날짜가 하나라도 비어 있으면 → 날짜 필터 없이 1차 결과만 사용
    if (!startDate || !endDate) {
      onFilteredChange(baseFiltered);
      return;
    }

    // 3) 날짜까지 포함해서 최종 필터
    const filtered = baseFiltered.filter((item) => {
      const itemDate = new Date(item.date);
      if (isNaN(itemDate.getTime())) return false;

      let start = new Date(startDate);
      let end = new Date(endDate);

      // 만약 시작일 > 종료일이면 자동으로 스왑
      if (start > end) {
        const tmp = start;
        start = end;
        end = tmp;
      }

      // 종료일 하루 전체 포함
      end.setHours(23, 59, 59, 999);

      return itemDate >= start && itemDate <= end;
    });

    onFilteredChange(filtered);
  }, [videoData, selectedVideo, selectedRobot, startDate, endDate, onFilteredChange]);


  // 🔥 기간 버튼(1주 / 1달 / 1년) 클릭 시 시작일/종료일 자동 변경
  useEffect(() => {
    if (!selectedPeriod) return;

    const today = new Date();
    const end = new Date(today);      // 종료일 = 오늘
    const start = new Date(today);    // 시작일 = 기간만큼 이전

    if (selectedPeriod === '1week') {
      start.setDate(start.getDate() - 7);
    } else if (selectedPeriod === '1month') {
      start.setMonth(start.getMonth() - 1);
    } else if (selectedPeriod === '1year') {
      start.setFullYear(start.getFullYear() - 1);
    }

    const startStr = formatDate(start);
    const endStr = formatDate(end);

    setStartDate(startStr);
    setEndDate(endStr);

    // 달력 열었을 때도 종료일 기준으로 보이도록
    setViewDate(end);
    setTempDate(end);
  }, [selectedPeriod]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsCalendarOpen(false); // 외부 클릭 → 닫기
        setActiveField(null);  // 🔥 어느 필드도 선택 안 함
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (externalStartDate) {
      setStartDate(externalStartDate);
    }
    if (externalEndDate) {
      setEndDate(externalEndDate);
    }
  }, [externalStartDate, externalEndDate]);

  return (
    <div className={styles.wrapper}>
      {/* 기존 날짜 입력 영역 */}
      <div className={styles.videoDate}>
        <div className={styles.startDate}>
          <div>{startDate}</div>
          <img
            src="/icon/search_calendar.png"
            alt="calendar" 
            onClick={() => openCalendar("start")}
          />
            
        </div>
        <div>~</div>
        <div className={styles.endDate}>
          <div>{endDate}</div>
          <img
            src="/icon/search_calendar.png"
            alt="calendar"
            onClick={() => openCalendar("end")}
          />
        </div>
      </div>

      {/* 달력 모달 */}
      {isCalendarOpen && (
        <div className={styles.calendarOverlay}>
          <div ref={wrapperRef} className={styles.calendarModal}>
            {/* 헤더 */}
            <div className={styles.header}>
              <button
                type="button"
                onClick={() =>
                  setViewDate(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
              >
                <img src="/icon/arrow-left.png" alt="left" />
              </button>
              <div className={styles.title}>
                {year}년 {month + 1}월
              </div>
              <button
                type="button"
                onClick={() =>
                  setViewDate(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
              >
                <img src="/icon/arrow-right.png" alt="next" />
              </button>
            </div>

            {/* 요일 */}
            <div className={styles.weekRow}>
              <span className={styles.sun}>일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span className={styles.sat}>토</span>
            </div>

            {/* 날짜 */}
            <div className={styles.daysGrid}>
              {days.map((d, idx) =>
                d === null ? (
                  <div key={idx} className={styles.emptyCell} />
                ) : (
                  <button
                    key={idx}
                    type="button"
                    className={
                      isSameDate(tempDate, d)
                        ? styles.daySelected
                        : styles.day
                    }
                    onClick={() => {
                      const selected = new Date(year, month, d);

                      // 1) 임시 선택(하이라이트용) 유지하고 싶으면
                      setTempDate(selected);

                      // 2) startDate / endDate 에 반영 예시: "YYYY-MM-DD"
                      const dateStr = formatDate(selected); 

                      // 여기서 시작/종료일 실제로 바뀜
                      handleDateSelect(dateStr);
                    }}
                  >
                    {d}
                  </button>
                )
              )}
            </div>

            {/* 하단 버튼 */}
            <div className={styles.footer}>
              <button type="button" className={styles.today} onClick={handleToday}> Today </button>
              <button type="button" className={styles.confirm} onClick={handleConfirm}> Confirm </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}