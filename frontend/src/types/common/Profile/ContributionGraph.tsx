import React, { useState, useMemo } from 'react';

interface ContributionGraphProps {
  data: { [key: string]: number };
  totalContributions: number;
  currentYear: number;
  joinedYear: number;
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({
  data,
  totalContributions,
  currentYear,
  joinedYear,
}) => {
  const getColor = (count: number) => {
    if (!count || count === 0) return 'bg-[#161b22]';
    if (count <= 2) return 'bg-[#0e4429]';
    if (count <= 5) return 'bg-[#006d32]';
    if (count <= 8) return 'bg-[#26a641]';
    return 'bg-[#39d353]';
  };

  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const formatDateTooltip = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Creates date in local time
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleMouseEnter = (
    e: React.MouseEvent,
    day: { date: string; count: number; isFuture: boolean },
  ) => {
    // Get mouse position relative to the graph container for positioning
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay({
      date: day.date,
      count: day.count,
      x: rect.left + rect.width / 2, // Center of the square
      y: rect.top - 10, // Slightly above the square
    });
  };

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const isCurrentYear = selectedYear === today.getFullYear();

    let endDate: Date;
    if (isCurrentYear) {
      endDate = new Date(today);
    } else {
      endDate = new Date(selectedYear, 11, 31);
    }

    // Align the end of the graph to the end of the current week (Saturday)
    while (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const weeksGrid = [];
    const labels: { index: number; name: string }[] = [];

    const walkingDate = new Date(endDate);
    walkingDate.setDate(endDate.getDate() - 53 * 7 + 1);

    while (walkingDate.getDay() !== 0) {
      walkingDate.setDate(walkingDate.getDate() - 1);
    }

    for (let w = 0; w < 53; w++) {
      const week = [];
      let labelThisWeek = '';

      for (let d = 0; d < 7; d++) {
        const dateStr = walkingDate.toISOString().split('T')[0];
        const count = data[dateStr] || 0;

        // FIXED LOGIC: Only label the month if the 1st of the month has actually occurred
        if (walkingDate.getDate() === 1 && walkingDate <= today) {
          labelThisWeek = walkingDate.toLocaleString('default', { month: 'short' });
        }

        // Always label the first week of the window
        if (w === 0 && d === 0 && !labelThisWeek) {
          labelThisWeek = walkingDate.toLocaleString('default', { month: 'short' });
        }

        week.push({
          date: dateStr,
          count,
          isFuture: walkingDate > today, // Track if the day is in the future
        });
        walkingDate.setDate(walkingDate.getDate() + 1);
      }

      if (labelThisWeek) {
        const lastLabel = labels[labels.length - 1];
        if (!lastLabel || lastLabel.index < w - 2) {
          labels.push({ index: w, name: labelThisWeek });
        }
      }
      weeksGrid.push(week);
    }

    return { weeks: weeksGrid, monthLabels: labels };
  }, [selectedYear, data]);

  const availableYears = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= joinedYear; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear, joinedYear]);
  return (
    <div className="flex flex-col gap-3 mb-12 relative">
      {/* 1. Custom Floating Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-900 text-white px-3 py-1.5 rounded text-[11px] font-medium shadow-2xl border border-gray-700 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          style={{ left: hoveredDay.x, top: hoveredDay.y }}
        >
          <span className="font-bold">
            {hoveredDay.count === 0 ? 'No' : hoveredDay.count} contributions
          </span>{' '}
          on {formatDateTooltip(hoveredDay.date)}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-gray-900" />
        </div>
      )}
      <div className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 xs:p-4 sm:p-6 overflow-hidden flex flex-col shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-300 text-xs xs:text-sm font-medium">
            {totalContributions.toLocaleString()} contributions
          </h3>
          <div className="flex gap-1.5 xs:gap-2 flex-wrap">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`text-[10px] px-2 py-0.5 rounded transition ${
                  selectedYear === year
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {/* Day Labels - Add pointer-events-none to avoid hit-box issues */}
            <div className="flex flex-col gap-[5px] xs:gap-[7px] pt-7 pr-1.5 xs:pr-2 shrink-0 text-gray-500 text-[9px] xs:text-[10px] font-medium pointer-events-none">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, i) => (
                <span key={i} className="h-[10px] xs:h-[11px] leading-[10px] xs:leading-[11px]">
                  {day}
                </span>
              ))}
            </div>
            <div className="relative">
              {/* Month Labels - Add pointer-events-none to ensure grid is clickable */}
              <div className="relative mb-2 text-[10px] text-gray-400 font-medium h-4 w-full pointer-events-none">
                {monthLabels.map((label, idx) => (
                  <span
                    key={idx}
                    className="absolute whitespace-nowrap"
                    style={{ left: `${label.index * 14.3}px` }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              {/* Grid columns for 53 weeks */}
              <div className="grid grid-flow-col auto-cols-max gap-[2.5px] xs:gap-[3.3px] mt-1">
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-[2.5px] xs:gap-[3.3px]">
                    {week.map((day) => (
                      <div
                        key={day.date}
                        className={`w-[9px] h-[9px] xs:w-[11px] xs:h-[11px] rounded-[2px] ${day.isFuture ? 'bg-[#161b22]' : getColor(day.count)} hover:ring-1 hover:ring-white/50 cursor-pointer transition-all duration-150`}
                        // Add events for the custom tooltip
                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 xs:mt-6 sm:mt-8 w-full flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 text-[10px] xs:text-[11px] pt-3 xs:pt-4 border-t border-gray-800/60">
          <button className="text-gray-500 hover:text-blue-400 transition-colors shrink-0">
            Learn how we count contributions
          </button>
          <div className="flex items-center gap-1.5 text-gray-500">
            <span className="mr-1">Less</span>
            {[0, 1, 3, 6, 9].map((lvl) => (
              <div key={lvl} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(lvl)}`} />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
