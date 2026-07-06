import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";
import { ChevronLeft, ChevronRight, Scale } from "lucide-react";

interface WeightChartProps {
  weightHistory: { date: string; weight: number }[];
  targetWeight: number;
}

const GRAPH_MONTHS = [
  { name: "December 2026", year: 2026, monthIndex: 11 },
  { name: "November 2026", year: 2026, monthIndex: 10 },
  { name: "October 2026", year: 2026, monthIndex: 9 },
  { name: "September 2026", year: 2026, monthIndex: 8 },
  { name: "August 2026", year: 2026, monthIndex: 7 },
  { name: "July 2026", year: 2026, monthIndex: 6 },
  { name: "June 2026", year: 2026, monthIndex: 5 },
  { name: "May 2026", year: 2026, monthIndex: 4 },
  { name: "April 2026", year: 2026, monthIndex: 3 },
  { name: "March 2026", year: 2026, monthIndex: 2 },
  { name: "February 2026", year: 2026, monthIndex: 1 },
  { name: "January 2026", year: 2026, monthIndex: 0 },
  { name: "December 2025", year: 2025, monthIndex: 11 },
  { name: "November 2025", year: 2025, monthIndex: 10 },
  { name: "October 2025", year: 2025, monthIndex: 9 },
  { name: "September 2025", year: 2025, monthIndex: 8 },
  { name: "August 2025", year: 2025, monthIndex: 7 },
  { name: "June 2025", year: 2025, monthIndex: 5 }
];

export default function WeightChart({ weightHistory = [], targetWeight }: WeightChartProps) {
  // Default to July 2026 (index 5 of GRAPH_MONTHS) as the current timeframe in 2026
  const [currentMonthIdx, setCurrentMonthIdx] = useState(5);

  const activeMonth = GRAPH_MONTHS[currentMonthIdx];
  const { year, monthIndex, name: monthName } = activeMonth;

  // Swipe gesture hooks
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const handlePrevMonth = () => {
    if (currentMonthIdx < GRAPH_MONTHS.length - 1) {
      setCurrentMonthIdx(prev => prev + 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx > 0) {
      setCurrentMonthIdx(prev => prev - 1);
    }
  };

  // Touch handlers
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
      handleNextMonth();
    } else if (diff < -50) {
      handlePrevMonth();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Mouse drag handlers
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

  // Parse a historical date string to resolve its month and year
  const parseEntryMonthYear = (dateStr: string) => {
    const lower = dateStr.toLowerCase();
    let m = 6; // default July
    let y = 2026; // default 2026

    if (lower.includes("jan")) m = 0;
    else if (lower.includes("feb")) m = 1;
    else if (lower.includes("mar")) m = 2;
    else if (lower.includes("apr")) m = 3;
    else if (lower.includes("may")) m = 4;
    else if (lower.includes("jun")) m = 5;
    else if (lower.includes("jul")) m = 6;
    else if (lower.includes("aug")) m = 7;
    else if (lower.includes("sep")) m = 8;
    else if (lower.includes("oct")) m = 9;
    else if (lower.includes("nov")) m = 10;
    else if (lower.includes("dec")) m = 11;

    // Check ISO format YYYY-MM-DD
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      y = parseInt(isoMatch[1]);
      m = parseInt(isoMatch[2]) - 1;
    } else {
      const dObj = new Date(dateStr);
      if (!isNaN(dObj.getTime())) {
        m = dObj.getMonth();
        y = dObj.getFullYear();
      }
    }
    return { month: m, year: y };
  };

  // Filter weight entries that match the selected year and monthIndex
  const filteredData = weightHistory.filter(entry => {
    const parsed = parseEntryMonthYear(entry.date);
    return parsed.month === monthIndex && parsed.year === year;
  });

  // Find min and max weights for better graph scaling
  const weights = filteredData.map(d => d.weight);
  const minWeight = weights.length > 0 ? Math.min(...weights, targetWeight) - 2 : targetWeight - 5;
  const maxWeight = weights.length > 0 ? Math.max(...weights, targetWeight) + 2 : targetWeight + 10;

  return (
    <div 
      className="w-full bg-neutral-950/40 border border-white/[0.06] rounded-3xl p-5 shadow-inner select-none cursor-grab active:cursor-grabbing transition-all hover:border-white/10"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {/* Chart Swipe Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-xs font-black uppercase text-white/50 tracking-wider">Monthly Weight Curve</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] font-mono text-yellow-400 font-bold uppercase">
              {monthName} • Goal: {targetWeight} kg
            </span>
            <span className="text-[8px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase font-mono">
              Swipe ↔
            </span>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={currentMonthIdx === GRAPH_MONTHS.length - 1}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={currentMonthIdx === 0}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="Next Month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Render Line Chart or Empty State */}
      <div className="w-full h-52 flex items-center justify-center relative">
        {filteredData.length === 0 ? (
          <div className="text-center space-y-2 p-6">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/30 border border-white/5">
              <Scale size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-white/50">No Weight Records</p>
              <p className="text-[10px] text-white/30 uppercase mt-0.5 font-mono">None logged in {monthName}</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[Math.floor(minWeight), Math.ceil(maxWeight)]} 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#0a0a0a", 
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "11px",
                  fontFamily: "monospace"
                }}
                labelClassName="text-white/40 font-bold mb-1 block"
              />
              
              {/* Target Weight Goal Reference Line */}
              <ReferenceLine 
                y={targetWeight} 
                stroke="#4ade80" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: `${targetWeight} kg`, 
                  position: "insideBottomRight", 
                  fill: "#4ade80", 
                  fontSize: 8,
                  fontWeight: "black",
                  offset: 8
                }} 
              />

              {/* Weight Progression Line */}
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#facc15" 
                strokeWidth={3}
                activeDot={{ r: 5, stroke: "#000", strokeWidth: 2 }}
                dot={{ r: 3, fill: "#facc15", stroke: "#020202", strokeWidth: 1 }}
                name="Weight"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
