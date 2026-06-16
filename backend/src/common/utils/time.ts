import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

type OptionsType = {
  date: string;
  hour: string;
  timezone?: string; // e.g., "Asia/Makassar", "Asia/Jakarta"
};

const time = {
  // Parse tanggal (YYYY-MM-DD) dengan asumsi awal 00:00 di timezone tertentu, lalu convert ke Date (UTC)
  parseDate: (date: string, tz: string = "Asia/Makassar"): Date => {
    return dayjs.tz(date, tz).toDate();
  },
  // Menggabungkan date + hour di timezone tertentu, lalu convert ke Date (UTC)
  applyTime: (options: OptionsType) => {
    const timeString = `${options.date} ${options.hour}`;
    const tz = options.timezone || "Asia/Makassar"; // Default WITA
    return dayjs.tz(timeString, tz).toDate();
  },
  minDate: (number: number): Date => {
    return dayjs()
      .tz("Asia/Makassar")
      .add(number, "day")
      .startOf("day")
      .toDate();
  },
};

export default time;
