'use client';

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CalendarGridItem } from '@/hooks/useCalendar';

type CalendarCardProps = {
  currentDate: Date;
  grid: CalendarGridItem[];
  onChangeMonth: (offset: number) => void;
  onSelectSchedule: (scheduleId: string) => void;
  className?: string;
};

const CELL_HEIGHT = 'h-20';

export function Calendar({
  currentDate,
  grid,
  onChangeMonth,
  onSelectSchedule,
  className = '',
}: CalendarCardProps) {
  return (
    <div
      className={`shadow-neo border-secondary bg-bg-light w-full max-w-3xl rounded-2xl border p-6 ${className}`}
    >
      {/* --- NAVIGASI BULAN --- */}
      <div className="mb-4 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="text-text-muted hover:bg-bg hover:text-text rounded-full p-1.5 transition-colors"
        >
          <FiChevronLeft size={20} />
        </button>

        {/* Judul Bulan: Menggunakan Primary agar senada dengan aksen di dalam */}
        <h2 className="text-primary text-lg font-bold">
          {currentDate.toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>

        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="text-text-muted hover:bg-bg hover:text-text rounded-full p-1.5 transition-colors"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* --- HEADER HARI --- */}
      <div className="text-text-muted mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* --- GRID TANGGAL --- */}
      <div className="grid grid-cols-7 gap-2">
        {grid.map((item, index) => {
          if (!item.isCurrentMonth) {
            return (
              <div
                key={`empty-${index}`}
                className={`${CELL_HEIGHT} border border-transparent`}
              />
            );
          }

          const hasSchedule = !!item.schedule;
          const quota = item.schedule?.quota ?? 0;
          const registrants = item.schedule?.registrants ?? 0;
          const isActive = item.schedule?.status === 'aktif';
          const isFull =
            hasSchedule && quota > 0 ? registrants >= quota : false;
          const isInteractive = hasSchedule && isActive && !isFull;

          const baseStyles = `relative ${CELL_HEIGHT} rounded-lg flex flex-col items-center justify-start pt-1.5 px-1 text-sm border transition-all duration-200`;

          let stateStyles = '';

          if (isInteractive) {
            // 1. AVAILABLE
            // Border default: secondary/30 (Orange tipis)
            // Hover: border-primary (Biru tegas)
            stateStyles = `
              cursor-pointer 
              bg-bg-light 
              border-secondary/30 
              hover:border-primary 
              hover:shadow-md 
              hover:-translate-y-0.5
            `;
          } else if (hasSchedule && (!isActive || isFull)) {
            stateStyles = `
              cursor-not-allowed 
              ${isActive ? 'bg-danger/10 border-danger/30' : 'bg-bg border-border/40'}
            `;
          } else {
            // 3. EMPTY
            stateStyles = `
              cursor-default 
              bg-bg 
              border-transparent 
              text-text-muted
            `;
          }

          // TODAY HIGHLIGHT
          // Ring tetap Primary agar fokus
          const todayStyles = item.isToday
            ? 'ring-1 ring-primary ring-offset-1'
            : '';

          return (
            <div
              key={`${item.day}-${index}`}
              className={`${baseStyles} ${stateStyles} ${todayStyles}`}
              onClick={() =>
                isInteractive &&
                item.schedule &&
                onSelectSchedule(item.schedule._id)
              }
            >
              <span
                className={`mb-0.5 text-sm font-semibold ${
                  item.isToday ? 'text-primary' : 'text-text'
                }`}
              >
                {item.day}
              </span>

              {item.schedule && (
                <div className="flex w-full flex-col items-center">
                  {!isActive ? (
                    <span className="bg-warning/20 text-warning rounded-md px-1.5 py-0.5 text-[9px] font-bold">
                      TIDAK AKTIF
                    </span>
                  ) : isFull ? (
                    <span className="bg-danger text-highlight rounded-md px-1.5 py-0.5 text-[9px] font-bold">
                      PENUH
                    </span>
                  ) : (
                    <>
                      <span className="text-secondary text-xs font-bold">
                        {registrants}
                        {quota ? `/${quota}` : ''}
                      </span>
                      <span className="text-text-muted text-[9px] leading-none">
                        Terisi
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
