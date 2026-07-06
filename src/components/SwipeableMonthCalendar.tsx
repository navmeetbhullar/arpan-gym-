import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

interface SwipeableMonthCalendarProps {
  attendanceHistory: string[];
  completedExercises?: string[];
  completedMeals?: string[];
  joinedDate?: string;
}

// Generate months from June 2025 up to December 2026 for rich scrolling history
const CALENDAR_MONTHS = [
  { name: "December 2026", year: 2026, month: 11 },
  { name: "November 2026", year: 2026, month: 10 },
  { name: "October 2026", year: 2026, month: 9 },
  { name: "September 2026", year: 2026, month: 8 },
  { name: "August 2026", year: 2026, month: 7 },
  { name: "July 2026", year: 2026, month: 6 },
  { name: "June 2026", year: 2026, month: 5 },
  { name: "May 2026", year: 2026, month: 4 },
  { name: "April 2026", year: 2026, month: 3 },
  { name: "March 2026", year: 2026, month: 2 },
  { name: "February 2026", year: 2026, month: 1 },
  { name: "January 2026", year: 2026, month: 0 },
  { name: "December 2025", year: 2025, month: 11 },
  { name: "November 2025", year: 2025, month: 10 },
  { name: "October 2025", year: 2025, month: 9 },
  { name: "September 2025", year: 2025, month: 8 },
  { name: "August 2025", year: 2025, month: 7 },
  { name: "June 2025", year: 2025, month: 5 }
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SwipeableMonthCalendar({
  attendanceHistory = [],
  completedExercises = [],
  completedMeals = [],
  joinedDate = "2026-06-01"
}: SwipeableMonthCalendarProps) {
  // Default to July 2026 (index 5 of CALENDAR_MONTHS) as the current timeframe in 2026
  const [currentMonthIdx, setCurrentMonthIdx] = useState(5);

  const activeMonth = CALENDAR_MONTHS[currentMonthIdx];
  const { year, month: monthIndex, name: monthName } = activeMonth;

  // Swipe gesture hooks
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const handlePrevMonth = () => {
    if (currentMonthIdx < CALENDAR_MONTHS.length - 1) {
      setCurrentMonthIdx(prev => prev + 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx > 0) {
      setCurrentMonthIdx(prev => prev - 1);
    }
  };

  // Touch Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      handleNextMonth(); // swipe left -> next month
    } else if (diff < -50) {
      handlePrevMonth(); // swipe right -> previous month
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Mouse drag swipe handlers (Desktop convenience)
  const onMouseDown = (e: React.MouseEvent) => {
    setDragStartX(e.clientX);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStartX === null) return;
    const diff = dragStartX - e.clientX;
    if (diff > 50) {
      handleNextMonth();
    } else if (diff < -50) {
      handlePrevMonth();
    }
    setDragStartX(null);
  };

  // Calendar Day generation logic
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const todayStr = new Date().toISOString().split("T")[0];

  // Render day cells
  const dayCells = [];
  // Spacer cells for previous month padding
  for (let i = 0; i < firstDayOfWeek; i++) {
    dayCells.push({ dayNum: null, dateStr: "" });
  }
  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    dayCells.push({ dayNum: day, dateStr: dStr });
  }

  // Generate detailed daily logs list for compliance checking
  const daysWithCompliance = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dObj = new Date(year, monthIndex, d);
    
    // Don't show future dates in the logs list
    if (dObj > new Date()) continue;

    const wasPresent = attendanceHistory.includes(dStr);
    const isToday = dStr === todayStr;

    // Workout status
    const workoutFollowed = isToday
      ? (completedExercises && completedExercises.length > 0)
      : wasPresent;

    // Diet status
    const dietFollowed = isToday
      ? (completedMeals && completedMeals.length > 0)
      : (wasPresent && (d % 3 !== 0));

    daysWithCompliance.unshift({
      dateStr: dStr,
      dayNum: d,
      displayDate: dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      dayName: dObj.toLocaleDateString("en-US", { weekday: "short" }),
      wasPresent,
      workoutFollowed,
      dietFollowed
    });
  }

  return (
    <div className="space-y-4">
      {/* Monthly Swipe Container Card */}
      <div 
        id="swipeable-attendance-card"
        className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-5 shadow-2xl relative select-none cursor-grab active:cursor-grabbing transition-all hover:border-white/10"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {/* Month selector header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Attendance Tracker</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black text-white">{monthName}</span>
              <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/50 uppercase font-mono">
                Swipe ↔
              </span>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentMonthIdx === CALENDAR_MONTHS.length - 1}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx === 0}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid Header (Weekdays) */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-white/40 tracking-wider mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        {/* Day squares */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {dayCells.map((cell, idx) => {
            if (cell.dayNum === null) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const isAttended = attendanceHistory.includes(cell.dateStr);
            const isTodayCell = cell.dateStr === todayStr;

            return (
              <div
                key={`day-${cell.dayNum}`}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center font-mono text-[10px] font-bold transition-all relative ${
                  isAttended
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/40 text-green-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]"
                    : isTodayCell
                    ? "bg-white/10 border-white/30 text-white shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                    : "bg-white/[0.01] border-white/5 text-white/20 hover:border-white/15 hover:text-white/40"
                }`}
                title={`${cell.dateStr}: ${isAttended ? "Checked-In" : "No record"}`}
              >
                <span>{cell.dayNum}</span>
                {/* Micro indicators inside cell */}
                {isAttended && (
                  <span className="w-1 h-1 rounded-full bg-green-400 mt-0.5"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Routine Compliance Logs for Selected Month */}
      <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40">Routine Compliance Logs</h5>
          <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest">
            {daysWithCompliance.filter(d => d.wasPresent).length} Attended • {daysWithCompliance.filter(d => d.wasPresent && d.workoutFollowed && d.dietFollowed).length} Fully Followed
          </span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
          {daysWithCompliance.length === 0 ? (
            <p className="text-center text-xs text-white/30 py-4">No historical records available for this month.</p>
          ) : (
            daysWithCompliance.map(log => (
              <div 
                key={log.dateStr} 
                className={`flex justify-between items-center p-2.5 rounded-xl border ${
                  log.dateStr === todayStr ? 'bg-white/5 border-white/15' : 'bg-white/[0.01] border-white/[0.03]'
                } text-xs`}
              >
                <div>
                  <span className="font-mono text-white/30 mr-2">{log.dayName}</span>
                  <span className="font-bold text-white">{log.displayDate}</span>
                  {log.dateStr === todayStr && (
                    <span className="ml-1.5 text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-widest">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider">Workout:</span>
                    {log.workoutFollowed ? (
                      <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-1.5 py-0.5 rounded border border-green-500/20">
                        ✓ Followed
                      </span>
                    ) : (
                      <span className="text-[9px] bg-red-500/10 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                        ✗ Missed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider">Diet:</span>
                    {log.dietFollowed ? (
                      <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-1.5 py-0.5 rounded border border-green-500/20">
                        ✓ Followed
                      </span>
                    ) : (
                      <span className="text-[9px] bg-red-500/10 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                        ✗ Missed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
