'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// Export tipe data agar bisa dipakai di komponen UI
export type ScheduleData = {
  _id: string;
  scheduleDate: string;
  serviceName: string;
  quota: number;
  registrants: number;
  status: 'aktif' | 'penuh' | 'tidak aktif';
};

// Export tipe grid item
export type CalendarGridItem = {
  day: number;
  schedule: ScheduleData | null;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export const useCalendar = (data: ScheduleData[]) => {
  const router = useRouter();

  // Default ke bulan sekarang
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Fungsi Navigasi ke Halaman Register
  const navigateToRegister = (schedule_id: string) => {
    router.push(`/schedule/${schedule_id}/register`);
  };

  // Fungsi Ganti Bulan
  const changeMonth = (offset: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  // Logika Pembuatan Grid Kalender
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Minggu

    const grid: CalendarGridItem[] = [];

    // Filler hari kosong di awal bulan
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push({
        day: 0,
        schedule: null,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Isi tanggal
    for (let day = 1; day <= daysInMonth; day++) {
      const dateCheck = new Date(year, month, day);

      // Cari jadwal yang cocok tanggalnya
      const schedule = data.find((s) => {
        const sDate = new Date(s.scheduleDate);
        return (
          sDate.getDate() === day &&
          sDate.getMonth() === month &&
          sDate.getFullYear() === year
        );
      });

      grid.push({
        day,
        schedule: schedule || null,
        isCurrentMonth: true,
        isToday: dateCheck.getTime() === today.getTime(),
      });
    }

    return grid;
  }, [currentDate, data]);

  return {
    currentDate,
    calendarGrid,
    changeMonth,
    navigateToRegister,
  };
};
