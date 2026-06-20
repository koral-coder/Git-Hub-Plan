import React, { useState, useEffect, useMemo } from "react";
import { type DanceEvent, calculateDurationHours, getMonthYearKey, formatMonthKeyToHebrew } from "../types";
import { Plus, X, Calendar, Clock, MapPin, Sparkles, Trash2, Check, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EventDancingProps {
  events: DanceEvent[];
  onAddEvent: (newEvent: Omit<DanceEvent, "id">) => void;
  onDeleteEvent: (id: string) => void;
  filterType: "month" | "range";
  setFilterType: (type: "month" | "range") => void;
  selectedMonthFilter: string;
  setSelectedMonthFilter: (key: string) => void;
  startDateFilter: string;
  setStartDateFilter: (date: string) => void;
  endDateFilter: string;
  setEndDateFilter: (date: string) => void;
  allMonthKeys: string[];
}

export default function EventDancing({
  events,
  onAddEvent,
  onDeleteEvent,
  filterType,
  setFilterType,
  selectedMonthFilter,
  setSelectedMonthFilter,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  allMonthKeys,
}: EventDancingProps) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("20:00");
  const [endTime, setEndTime] = useState("23:00");
  const [contactPerson, setContactPerson] = useState(""); // mapped to Notes/Comments
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [tips, setTips] = useState<number>(0);

  // Real-time calculated properties
  const [calculatedHours, setCalculatedHours] = useState(3);
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Recalculate duration and sum in real-time when times change
  useEffect(() => {
    const hours = calculateDurationHours(startTime, endTime);
    setCalculatedHours(hours);
  }, [startTime, endTime]);

  useEffect(() => {
    setTotalEarnings(Number(baseSalary || 0) + Number(tips || 0));
  }, [baseSalary, tips]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert("אנא הזיני את מיקום האירוע");
      return;
    }

    onAddEvent({
      location,
      date,
      startTime,
      endTime,
      contactPerson: contactPerson.trim() || undefined,
      baseSalary: Number(baseSalary) || 0,
      tips: Number(tips) || 0,
      calculatedHours,
      totalEarnings,
    });

    // Reset Form
    setLocation("");
    setDate(new Date().toISOString().split("T")[0]);
    setStartTime("20:00");
    setEndTime("23:00");
    setContactPerson("");
    setBaseSalary(0);
    setTips(0);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, loc: string) => {
    if (window.confirm(`האם את בטוחה שברצונך למחוק את האירוע ב-${loc}?`)) {
      onDeleteEvent(id);
    }
  };

  // Filter events based on selected filter (month or date range)
  const filteredEvents = useMemo(() => {
    if (filterType === "month") {
      if (selectedMonthFilter === "all") {
        return events;
      }
      return events.filter((e) => getMonthYearKey(e.date) === selectedMonthFilter);
    } else {
      return events.filter((e) => {
        if (startDateFilter && e.date < startDateFilter) return false;
        if (endDateFilter && e.date > endDateFilter) return false;
        return true;
      });
    }
  }, [events, filterType, selectedMonthFilter, startDateFilter, endDateFilter]);

  // Compute stats for filtered list
  const filteredEarnings = useMemo(() => {
    return filteredEvents.reduce((sum, e) => sum + e.totalEarnings, 0);
  }, [filteredEvents]);

  const filteredHours = useMemo(() => {
    return filteredEvents.reduce((sum, e) => sum + e.calculatedHours, 0);
  }, [filteredEvents]);

  return (
    <div className="flex flex-col gap-6 text-center" id="events-tab">
      {/* Tab Header with main CTA button */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-full text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight" id="events-title">הופעות ואירועים</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="add-event-btn"
          className="px-6 py-3 text-white font-bold bg-gray-900 hover:bg-gray-800 rounded-2xl text-sm cursor-pointer flex items-center gap-2 active:scale-95 transition-all w-full sm:w-auto justify-center shadow-lg"
        >
          <Plus size={18} />
          הוספת הופעה חדשה
        </button>
      </div>

      {/* Visual Filter Container */}
      <div className="bg-white/50 backdrop-blur-md p-5 rounded-[24px] border border-white/60 shadow-xs flex flex-col gap-4" id="events-summary-block">
        {/* Toggle Mode Segmented Control */}
        <div className="flex bg-white/40 p-1.5 rounded-2xl justify-center w-full max-w-sm mx-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setFilterType("month")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === "month"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-700 hover:text-gray-950 hover:bg-white/20"
            }`}
          >
            סינון לפי חודש
          </button>
          <button
            type="button"
            onClick={() => setFilterType("range")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === "range"
                ? "bg-gray-900 text-white shadow-xs"
                : "text-gray-700 hover:text-gray-950 hover:bg-white/20"
            }`}
          >
            טווח תאריכים מותאם
          </button>
        </div>

        {/* Dynamic Filters Form field depending on selected mode */}
        <AnimatePresence mode="wait">
          {filterType === "month" ? (
            <motion.div
              key="month-filter-view"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full"
            >
              <span className="text-xs font-extrabold text-gray-700 bg-white/40 px-3 py-1 rounded-xl border border-white/30 text-center">
                בחרי חודש:
              </span>
              
              <div className="relative w-full sm:w-56">
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="glass-input px-3 py-1.5 text-xs text-gray-800 font-extrabold cursor-pointer w-full text-center bg-white/60 border-white/70 shadow-2xs"
                  id="event-month-dropdown"
                >
                  <option value="all" className="bg-white text-gray-800 font-semibold text-center">כל החודשים (הצג הכל)</option>
                  {allMonthKeys.map((key) => (
                    <option key={key} value={key} className="bg-white text-gray-800 font-semibold text-center">
                      {formatMonthKeyToHebrew(key)}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="range-filter-view"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto"
            >
              <div className="flex flex-col gap-1 text-right">
                <label className="text-[10px] font-extrabold text-gray-700 pr-1">מתאריך</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="glass-input p-2 text-xs text-center border-white/75 bg-white/60 text-gray-800 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1 text-right">
                <label className="text-[10px] font-extrabold text-gray-700 pr-1">עד תאריך</label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="glass-input p-2 text-xs text-center border-white/75 bg-white/60 text-gray-800 cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small bento-style cards inside the tab for detailed view */}
        <div className="grid grid-cols-2 gap-3" id="events-status-bento">
          <div className="bg-pink-55/65 border border-pink-200/50 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
            <span className="text-[10px] text-pink-705 font-bold mb-1">סה"כ הכנסות (הופעות)</span>
            <span className="text-xl font-black text-gray-900 font-mono">₪{filteredEarnings.toLocaleString()}</span>
          </div>

          <div className="bg-indigo-55/65 border border-indigo-200/50 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
            <span className="text-[10px] text-indigo-705 font-bold mb-1">שעות הופעה שנצברו</span>
            <span className="text-xl font-black text-gray-900 font-mono">{filteredHours.toFixed(1)} שעות</span>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-3 text-center" id="events-list-container">
        <h2 className="text-lg font-extrabold text-white px-1 text-center font-sans tracking-wide">כל ההופעות שנשמרו ({filteredEvents.length})</h2>
        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-100 text-xs py-12 bg-white/20 rounded-2xl border border-white/30 font-semibold mx-auto w-full shadow-inner" id="events-empty-state">
            לא נמצאו הופעות בטווח או בסינון שנבחר.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center" id="events-grid">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                id={`event-card-${event.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-5 relative flex flex-col justify-between hover:border-pink-300 bg-white/35 shadow-xs border-white/60 group text-center items-center"
              >
                {/* Delete button absolutely positioned inside */}
                <button
                  onClick={() => handleDeleteClick(event.id, event.location)}
                  className="absolute left-4 top-4 text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-white/55 rounded-lg cursor-pointer"
                  title="מחיקת הופעה"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex flex-col items-center gap-2 mb-4 w-full">
                  <div className="flex items-center gap-2 text-[#a82323] font-extrabold text-base justify-center">
                    <MapPin size={16} className="text-[#a82323] shrink-0" />
                    <span className="truncate max-w-[200px]">{event.location}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 text-gray-700 text-xs mt-2.5 font-bold">
                    <span className="flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-lg w-max border border-white/40 justify-center text-gray-800">
                      <Calendar size={13} className="text-pink-650" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-150 font-bold justify-center">
                      <Clock size={13} className="text-pink-200" />
                      {event.startTime} - {event.endTime} ({event.calculatedHours.toFixed(1)} שעות)
                    </span>
                  </div>

                  {event.contactPerson && (
                    <div className="text-xs text-gray-800 flex items-center gap-1.5 mt-2 bg-white/60 px-3 py-1.5 rounded-xl w-max max-w-full font-bold border border-white/45 justify-center">
                      <FileText size={12} className="text-pink-700 shrink-0" />
                      <span className="truncate">הערות: {event.contactPerson}</span>
                    </div>
                  )}
                </div>

                {/* Earnings Summary Row with Artistic Flair Palette */}
                <div className="flex items-center justify-between border-t border-white/60 pt-3 mt-1 bg-white/40 p-3 rounded-xl w-full">
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-[10px] text-gray-600 font-extrabold">שכר בסיס + טיפים</span>
                    <span className="text-xs text-gray-800 font-extrabold font-mono text-right">
                      ₪{event.baseSalary} + ₪{event.tips}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 font-bold">
                    <span className="text-[10px] text-pink-700 font-extrabold">סה"כ הכנסה</span>
                    <span className="text-lg font-black text-gray-900">₪{event.totalEarnings}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Glassmorphic Add Event Modal overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-md" id="event-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel-heavy w-full max-w-lg overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl p-6 bg-white/95 border-white text-gray-800 text-center"
              id="event-modal"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={18} className="text-pink-600" />
                  <h3 className="font-extrabold text-lg text-gray-800">הוספת הופעה ואירוע</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">מיקום האירוע *</label>
                  <input
                    type="text"
                    required
                    placeholder="לדוגמה: אולם המלכים, ראשון לציון"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="glass-input p-3 text-sm border-gray-300 text-gray-900 placeholder-gray-400 bg-white/70 text-right"
                    id="event-loc-input"
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">תאריך האירוע</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input p-3 text-sm cursor-pointer border-gray-300 text-gray-900 bg-white/70 text-right"
                    id="event-date-input"
                  />
                </div>

                {/* Start & End Times */}
                <div className="grid grid-cols-2 gap-3 text-right">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-gray-700">שעת התחלה</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="glass-input p-3 text-sm cursor-pointer border-gray-300 text-gray-900 bg-white/70 text-center"
                      id="event-start-time"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-gray-700">שעת סיום</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="glass-input p-3 text-sm cursor-pointer border-gray-300 text-gray-900 bg-white/70 text-center"
                      id="event-end-time"
                    />
                  </div>
                </div>

                {/* Notes instead of Contact Person */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">הערות לתיעוד (אופציונלי)</label>
                  <input
                    type="text"
                    placeholder="לדוגמה: הערות לגבי סגנון ההופעה, סגירת תשלום או לבוש ואיפור מיוחד"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="glass-input p-3 text-sm border-gray-300 text-gray-900 placeholder-gray-400 bg-white/70 text-right"
                    id="event-notes-input"
                  />
                </div>

                {/* Salary Details */}
                <div className="grid grid-cols-2 gap-3 text-right">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-gray-700">שכר בסיס (₪)</label>
                    <input
                      type="number"
                      min="0"
                      value={baseSalary || ""}
                      onChange={(e) => setBaseSalary(Number(e.target.value) || 0)}
                      className="glass-input p-3 text-sm text-center border-gray-300 text-gray-900 bg-white/70"
                      id="event-base-salary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-gray-700">טיפים בשטח (₪)</label>
                    <input
                      type="number"
                      min="0"
                      value={tips || ""}
                      onChange={(e) => setTips(Number(e.target.value) || 0)}
                      className="glass-input p-3 text-sm text-center border-gray-300 text-gray-900 bg-white/70"
                      id="event-tips"
                    />
                  </div>
                </div>

                {/* Real-Time Calculation Feedback panel inside light form */}
                <div className="glass-card bg-pink-500/5 p-4 border-pink-200 rounded-2xl flex flex-col gap-2 mt-2 text-center" id="event-live-calc-panel">
                  <div className="flex items-center justify-between text-xs text-gray-650 font-bold">
                    <span>חישוב שעות:</span>
                    <span className="font-mono text-gray-800 text-sm font-extrabold shadow-2xs" id="live-hours-val">
                      {calculatedHours.toFixed(1)} שעות
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-650 pb-1 border-b border-gray-105 font-bold">
                    <span>חציית חצות:</span>
                    <span className="font-extrabold text-[11px] text-pink-700">
                      {startTime > endTime ? "כן (מחושב בהתאם!)" : "לא"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-700 pt-1 font-bold">
                    <span className="font-extrabold text-gray-800">סך הכל הכנסה משוערת:</span>
                    <span className="font-black text-pink-700 text-base" id="live-total-val">
                      ₪{totalEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-2xl text-gray-600 font-bold hover:bg-gray-100 cursor-pointer text-sm border border-gray-200"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-white font-extrabold bg-gray-900 hover:bg-gray-800 rounded-2xl cursor-pointer text-sm shadow-md"
                    id="save-event-btn"
                  >
                    שמירת אירוע הופעה
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
