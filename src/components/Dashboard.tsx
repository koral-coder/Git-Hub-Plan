import React, { useState } from "react";
import { type DanceEvent, type DanceClass, type BusinessExpense, formatMonthKeyToHebrew, getMonthYearKey } from "../types";
import { Sparkles, Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  events: DanceEvent[];
  classes: DanceClass[];
  expenses: BusinessExpense[];
  filterType: "month" | "range";
  setFilterType: (type: "month" | "range") => void;
  selectedMonthKey: string;
  setSelectedMonthKey: (key: string) => void;
  startDateFilter: string;
  setStartDateFilter: (date: string) => void;
  endDateFilter: string;
  setEndDateFilter: (date: string) => void;
  allMonthKeys: string[];
}

export default function Dashboard({
  events,
  classes,
  expenses,
  filterType,
  setFilterType,
  selectedMonthKey,
  setSelectedMonthKey,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  allMonthKeys,
}: DashboardProps) {
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Filter items for selected filter
  const filteredEvents = events.filter((e) => {
    if (filterType === "month") {
      if (selectedMonthKey === "all" || !selectedMonthKey) return true;
      return getMonthYearKey(e.date) === selectedMonthKey;
    } else {
      if (startDateFilter && e.date < startDateFilter) return false;
      if (endDateFilter && e.date > endDateFilter) return false;
      return true;
    }
  });

  const filteredClasses = classes.filter((c) => {
    if (filterType === "month") {
      if (selectedMonthKey === "all" || !selectedMonthKey) return true;
      return getMonthYearKey(c.date) === selectedMonthKey;
    } else {
      if (startDateFilter && c.date < startDateFilter) return false;
      if (endDateFilter && c.date > endDateFilter) return false;
      return true;
    }
  });

  const filteredExpenses = expenses.filter((ex) => {
    if (filterType === "month") {
      if (selectedMonthKey === "all" || !selectedMonthKey) return true;
      return getMonthYearKey(ex.date) === selectedMonthKey;
    } else {
      if (startDateFilter && ex.date < startDateFilter) return false;
      if (endDateFilter && ex.date > endDateFilter) return false;
      return true;
    }
  });

  // Math counts: GROSS income only (never subtract expenses!)
  const grossEventsIncome = filteredEvents.reduce((sum, e) => sum + e.totalEarnings, 0);
  const grossClassesIncome = filteredClasses.reduce((sum, c) => sum + c.payment, 0);
  const totalGrossIncome = grossEventsIncome + grossClassesIncome;

  const totalEventsHours = filteredEvents.reduce((sum, e) => sum + e.calculatedHours, 0);
  const totalClassesHours = filteredClasses.reduce((sum, c) => sum + c.calculatedHours, 0);
  const totalHours = totalEventsHours + totalClassesHours;

  const avgHourlyWage = totalHours > 0 ? Math.round(totalGrossIncome / totalHours) : 0;

  // Monthly summary for history list
  const getMonthlyStats = (monthKey: string) => {
    const keyEvents = events.filter((e) => getMonthYearKey(e.date) === monthKey);
    const keyClasses = classes.filter((c) => getMonthYearKey(c.date) === monthKey);
    const grossIncome = keyEvents.reduce((sum, e) => sum + e.totalEarnings, 0) + keyClasses.reduce((sum, c) => sum + c.payment, 0);
    const hours = keyEvents.reduce((sum, e) => sum + e.calculatedHours, 0) + keyClasses.reduce((sum, c) => sum + c.calculatedHours, 0);
    return { grossIncome, hours };
  };

  const handleFetchAiAdvice = async () => {
    setIsLoadingAi(true);
    setAiAdvice("");
    const monthName = filterType === "month" 
      ? (selectedMonthKey === "all" ? "כל התקופות" : formatMonthKeyToHebrew(selectedMonthKey))
      : `טווח מותאם תאריכים (${startDateFilter} עד ${endDateFilter})`;

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: filteredEvents,
          classes: filteredClasses,
          expenses: filteredExpenses,
          monthName,
          grossIncome: totalGrossIncome,
          totalHours: totalHours.toFixed(1),
          avgHourly: avgHourlyWage,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiAdvice(data.advice);
      } else {
        setAiAdvice(data.advice || "אופס, אירעה שגיאה בטעינת התובנות העסקיות.");
      }
    } catch (error) {
      console.error(error);
      setAiAdvice("משהו השתבש. ודאי שמפתח ה-API מוגדר והשרת פועל כראוי.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getFilterBadgeLabel = () => {
    if (filterType === "month") {
      if (selectedMonthKey === "all" || !selectedMonthKey) return "כל ההיסטוריה";
      return formatMonthKeyToHebrew(selectedMonthKey);
    } else {
      const startFmt = startDateFilter ? startDateFilter.split("-").reverse().join("/") : "התחלה";
      const endFmt = endDateFilter ? endDateFilter.split("-").reverse().join("/") : "סוף";
      return `טווח: ${startFmt} ↔ ${endFmt}`;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-center" id="dashboard-tab">
      {/* Title & Selection */}
      <div className="flex flex-col items-center justify-center text-center gap-4 bg-white/30 p-5 rounded-[28px] border border-white/40 shadow-sm" id="dash-header-row">
        <div className="text-center flex flex-col gap-1 w-full items-center justify-center">
          <h1 className="text-3xl font-black tracking-tight text-white leading-none" id="dash-title">DancerPay</h1>
        </div>
        
        {/* Unified Selector Control */}
        <div className="flex flex-col gap-3 w-full max-w-xs" id="dashboard-filter-control">
          {/* Segmented Control */}
          <div className="flex bg-black/10 p-1 rounded-xl w-full" id="filter-segmented-tabs">
            <button
              onClick={() => setFilterType("month")}
              className={`flex-1 text-xs py-1.5 font-bold rounded-lg transition-all ${
                filterType === "month"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              סינון לפי חודש
            </button>
            <button
              onClick={() => setFilterType("range")}
              className={`flex-1 text-xs py-1.5 font-bold rounded-lg transition-all ${
                filterType === "range"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              טווח תאריכים מותאם
            </button>
          </div>

          {filterType === "month" ? (
            <div className="relative w-full flex justify-center">
              <select
                id="month-selector"
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="glass-input px-4.5 py-2.5 text-gray-800 text-sm font-extrabold cursor-pointer w-full text-center border-white/60 bg-white/60 shadow-sm"
                style={{ direction: "rtl", textAlign: "center" }}
              >
                <option value="all" className="bg-white text-gray-800 font-bold font-sans">
                  הכל (כל התקופות)
                </option>
                {allMonthKeys.map((key) => (
                  <option key={key} value={key} className="bg-white text-gray-800 font-sans">
                    {formatMonthKeyToHebrew(key)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs w-full" id="date-range-pickers">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-white font-bold mb-1 text-[10px]">ממתי</span>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="glass-input p-1.5 w-full text-center text-xs text-gray-800 font-bold bg-white/60 border-white/60"
                />
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-white font-bold mb-1 text-[10px]">עד מתי</span>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="glass-input p-1.5 w-full text-center text-xs text-gray-800 font-bold bg-white/60 border-white/60"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Elegant Large Elliptical Glass Pill - Central Art piece mimicking ref image */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
        className="glass-panel-heavy p-6 min-h-[380px] flex flex-col items-center justify-between text-center relative overflow-hidden"
        id="central-glass-pill"
      >
        {/* Glow behind stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center gap-1.5 z-10 w-full">
          <span className="text-xs font-bold tracking-wide text-[#a82323] bg-white/60 px-4 py-1.5 rounded-full border border-[#a82323]/40 shadow-xs animate-none" id="current-month-badge">
            {getFilterBadgeLabel()}
          </span>

          {/* Interactive Breakdown of Earnings - Separates Events & Classes */}
          <div className="grid grid-cols-2 gap-3.5 w-full max-w-sm mt-5" id="separated-earnings-container">
            <div className="flex flex-col items-center p-3.5 glass-card rounded-2xl bg-white/45 border-white/60 shadow-xs" id="earnings-events-block">
              <span className="text-[10px] text-gray-700 font-extrabold mb-1">הכנסות מהופעות 💃</span>
              <span className="text-xl font-black text-black font-mono">
                ₪{grossEventsIncome.toLocaleString()}
              </span>
            </div>
            
            <div className="flex flex-col items-center p-3.5 glass-card rounded-2xl bg-white/45 border-white/60 shadow-xs" id="earnings-classes-block">
              <span className="text-[10px] text-gray-700 font-extrabold mb-1">הכנסות משיעורים 🏫</span>
              <span className="text-xl font-black text-black font-mono">
                ₪{grossClassesIncome.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Total Overall Gross Summary Underneath */}
          <div className="flex flex-col items-center w-full max-w-sm mt-4 p-4.5 bg-white/60 backdrop-blur-md rounded-[24px] border border-white/70 shadow-sm" id="overall-gross-box">
            <span className="text-gray-700 text-[11px] font-extrabold tracking-wide mb-1">מחזור הכנסה ברוטו (סה"כ)</span>
            <span className="text-4xl md:text-5xl font-black text-gray-900 drop-shadow-[0_2px_8px_rgba(236,72,153,0.1)]" id="gross-income-val">
              ₪{totalGrossIncome.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stats Grid inside Pill */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-5 pt-5 border-t border-white/40 z-10" id="stats-grid">
          <div className="flex flex-col items-center p-4 glass-card rounded-2xl bg-white/45 shadow-sm border-white/60">
            <div className="flex items-center gap-1.5 text-[#a82323] mb-1">
              <Clock size={16} />
              <span className="text-xs font-bold text-[#6a7282]">שעות פעילות</span>
            </div>
            <span className="text-2xl font-black text-gray-800" id="total-hours-val">
              {totalHours.toFixed(1)}
            </span>
          </div>

          <div className="flex flex-col items-center p-4 glass-card rounded-2xl bg-white/45 shadow-sm border-white/60">
            <div className="flex items-center gap-1.5 text-amber-600 mb-1">
              <TrendingUp size={16} />
              <span className="text-xs font-bold text-[#6a7282]">ממוצע לשעה</span>
            </div>
            <span className="text-2xl font-black text-gray-800" id="avg-hourly-val">
              ₪{avgHourlyWage}
            </span>
          </div>
        </div>

        <div className="mt-5 text-[10px] text-[#000000] font-bold z-10" id="gross-reminder-text">
          * ההכנסות פה מייצגות מחזורי עסקאות ברוטו – ללא קיזוז הוצאות (צרכי מס והצהרת עצמאית)
        </div>
      </motion.div>

      {/* AI Financial Coach / Wisdom Helper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 border-white/50 relative overflow-hidden text-right"
        id="ai-insights-panel"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-100/40 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-4 relative z-10 text-right w-full">
          <div className="flex items-start gap-2.5">
            <div className="p-2.5 bg-gray-900 text-white rounded-2xl shadow-md border border-gray-800">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="text-right">
              <h3 className="font-extrabold text-[#000000] text-base">היועץ הפיננסי החכם שלך</h3>
              <p className="text-xs text-[#000000] font-semibold mt-0.5">ניתוח כדאיות הופעות לעומת שיעורים, יעדי שכר וניצול שעות אופטימלי</p>
            </div>
          </div>

          <button
            onClick={handleFetchAiAdvice}
            disabled={isLoadingAi}
            id="ai-coach-btn"
            className="glass-pill px-4.5 py-2 text-xs font-bold text-gray-850 bg-white/90 hover:bg-white active:scale-95 transition-all border-pink-300/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start xs:self-auto shrink-0 shadow-sm"
          >
            {isLoadingAi ? "מנתח נתונים..." : "קבלי ייעוץ חכם 🪄"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLoadingAi ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-gray-100 font-medium text-xs gap-3 text-center"
            >
              <div className="w-8 h-8 rounded-full border-2 border-pink-600 border-t-transparent animate-spin" />
              <span>מנתח שעות, מחזורים ויעדי שכר מתוך מאגר המידע שלך...</span>
            </motion.div>
          ) : aiAdvice ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card bg-white/50 p-5 border-white/60 rounded-2xl text-sm leading-relaxed text-gray-850 whitespace-pre-wrap text-right text-xs shadow-xs"
              id="ai-coach-response-content"
            >
              <div className="prose prose-xs text-gray-850 font-sans max-w-none text-right" style={{ direction: "rtl" }}>
                {aiAdvice}
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-xs text-[#000000] py-4 font-bold bg-white/20 rounded-xl" id="ai-no-data-placeholder">
              לחצי על הכפתור למעלה כדי לקבל תובנות עסקיות מותאמות אישית וניתוח כדאיות מבוסס AI.
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Monthly History Cards List */}
      <div className="flex flex-col gap-3 text-right" id="history-section">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2 px-1 text-right justify-start">
          <Calendar size={18} className="text-pink-300" />
          היסטוריית הכנסות חודשית
        </h2>

        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto no-scrollbar pr-1" id="history-list">
          {allMonthKeys.length === 0 ? (
            <div className="text-center text-gray-500 text-xs py-8 bg-white/20 rounded-2xl border border-white/30 font-medium w-full">
              לא נמצאו שיעורים או הופעות מתועדים במערכת.
            </div>
          ) : (
            allMonthKeys.map((key) => {
              const stats = getMonthlyStats(key);
              return (
                <div
                  key={key}
                  onClick={() => setSelectedMonthKey(key)}
                  id={`history-${key}`}
                  className={`glass-panel p-4 flex items-center justify-between hover:bg-white/40 active:scale-[0.99] transition-all cursor-pointer ${
                    key === selectedMonthKey ? "border-pink-400 bg-white/70 shadow-md scale-[1.01]" : "border-white/40 bg-white/10"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="font-extrabold text-sm text-gray-800">{formatMonthKeyToHebrew(key)}</span>
                    <span className="text-[11px] text-gray-500 font-semibold text-right">
                      {stats.hours.toFixed(1)} שעות פעילות
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-base font-black text-gray-800">₪{stats.grossIncome.toLocaleString()}</span>
                      <span className="text-[9px] uppercase tracking-wider text-pink-700 font-extrabold">ברוטו</span>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 rotate-180" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
