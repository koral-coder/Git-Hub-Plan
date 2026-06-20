export interface DanceEvent {
  id: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  contactPerson?: string;
  baseSalary: number;
  tips: number;
  calculatedHours: number;
  totalEarnings: number;
}

export interface DanceClass {
  id: string;
  type: "קבוצה" | "פרטי" | "סדנא";
  date: string;
  startTime: string;
  endTime: string;
  studentCount?: number;
  payment: number;
  calculatedHours: number;
}

export interface BusinessExpense {
  id: string;
  category: "נסיעות ודלק" | "ביגוד והנעלה" | "איפור ושיער" | "שיווק" | "אחר";
  amount: number;
  date: string;
  receiptName?: string;
  receiptData?: string; // Stored base64 string optional
}

export function calculateDurationHours(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0;
  const [startH, startM] = startStr.split(":").map(Number);
  const [endH, endM] = endStr.split(":").map(Number);
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
  
  let totalStartMinutes = startH * 60 + startM;
  let totalEndMinutes = endH * 60 + endM;
  
  // Crosses midnight
  if (totalEndMinutes < totalStartMinutes) {
    totalEndMinutes += 24 * 60;
  }
  
  return Number((totalEndMinutes - totalStartMinutes) / 60);
}

// Convert date (YYYY-MM-DD) to Month and Year in Hebrew, e.g. "יולי 2026"
export const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
];

export function getHebrewMonthYear(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    const parts = dateString.split("-");
    if (parts.length >= 2) {
      const monthIndex = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${HEBREW_MONTHS[monthIndex]} ${year}`;
      }
    }
    return "";
  }
  return `${HEBREW_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function getMonthYearKey(dateString: string): string {
  if (!dateString) return "unknown";
  const parts = dateString.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`; // e.g. "2026-06"
  }
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${d.getFullYear()}-${m}`;
    }
  } catch (e) {}
  return "unknown";
}

export function formatMonthKeyToHebrew(key: string): string {
  if (!key || key === "unknown") return "כללי";
  const parts = key.split("-");
  if (parts.length === 2) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${HEBREW_MONTHS[monthIdx]} ${year}`;
    }
  }
  return key;
}

