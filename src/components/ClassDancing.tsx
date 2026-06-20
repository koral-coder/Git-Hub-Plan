import React, { useState, useEffect, useMemo } from "react";
import { type DanceClass, calculateDurationHours, getMonthYearKey, formatMonthKeyToHebrew } from "../types";
import { Plus, X, Calendar, Clock, Sparkles, Users, Trash2, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ClassDancingProps {
  classes: DanceClass[];
  onAddClass: (newClass: Omit<DanceClass, "id">) => void;
  onDeleteClass: (id: string) => void;
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

export default function ClassDancing({
  classes,
  onAddClass,
  onDeleteClass,
  filterType,
  setFilterType,
  selectedMonthFilter,
  setSelectedMonthFilter,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  allMonthKeys,
}: ClassDancingProps) {

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [type, setType] = useState<"קבוצה" | "פרטי" | "סדנא">("קבוצה");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [studentCount, setStudentCount] = useState<number>(10);
  const [payment, setPayment] = useState<number>(150);

  // Real-time calculation states
  const [calculatedHours, setCalculatedHours] = useState(1.5);

  useEffect(() => {
    const hours = calculateDurationHours(startTime, endTime);
    setCalculatedHours(hours);
  }, [startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddClass({
      type,
      date,
      startTime,
      endTime,
      studentCount: type !== "פרטי" ? Number(studentCount) || 1 : undefined,
      payment: Number(payment) || 0,
      calculatedHours,
    });

    // Reset Form
    setType("קבוצה");
    setDate(new Date().toISOString().split("T")[0]);
    setStartTime("18:00");
    setEndTime("19:30");
    setStudentCount(10);
    setPayment(150);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, classType: string) => {
    if (window.confirm(`האם את בטוחה שברצונך למחוק את שיעור ה-${classType}?`)) {
      onDeleteClass(id);
    }
  };

  // Filter classes based on selected filter option
  const filteredClasses = useMemo(() => {
    if (filterType === "month") {
      if (selectedMonthFilter === "all") {
        return classes;
      }
      return classes.filter((c) => getMonthYearKey(c.date) === selectedMonthFilter);
    } else {
      return classes.filter((c) => {
        if (startDateFilter && c.date < startDateFilter) return false;
        if (endDateFilter && c.date > endDateFilter) return false;
        return true;
      });
    }
  }, [classes, filterType, selectedMonthFilter, startDateFilter, endDateFilter]);

  // Compute metrics for filtered classes
  const filteredEarnings = useMemo(() => {
    return filteredClasses.reduce((sum, c) => sum + c.payment, 0);
  }, [filteredClasses]);

  const filteredHours = useMemo(() => {
    return filteredClasses.reduce((sum, c) => sum + c.calculatedHours, 0);
  }, [filteredClasses]);

  return (
    <div className="flex flex-col gap-6 text-center" id="classes-tab">
      {/* Header section with Add Button */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-full text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight" id="classes-title">שיעורים וסדנאות</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="add-class-btn"
          className="px-6 py-3 text-white font-bold bg-gray-900 hover:bg-gray-800 rounded-2xl text-sm cursor-pointer flex items-center gap-2 active:scale-95 transition-all w-full sm:w-auto justify-center shadow-lg"
        >
          <Plus size={18} />
          הוספת שיעור חדש
        </button>
      </div>

      {/* Visual Monthly Summary Header of Classes */}
      <div className="bg-white/50 backdrop-blur-md p-5 rounded-[24px] border border-white/60 shadow-xs flex flex-col gap-4" id="classes-summary-block">
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

        {/* Dynamic Inner Filtration Block */}
        <AnimatePresence mode="wait">
          {filterType === "month" ? (
            <motion.div
              key="month-class-filter"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full"
            >
              <span className="text-sm font-extrabold text-gray-700 bg-white/40 px-3 py-1 rounded-xl border border-white/30 text-center">
                בחרי חודש:
              </span>
              
              <div className="relative w-full sm:w-56">
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="glass-input px-3 py-1.5 text-xs text-gray-800 font-extrabold cursor-pointer w-full text-center bg-white/60 border-white/70 shadow-2xs"
                  id="class-month-dropdown"
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
              key="range-class-filter"
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

        {/* Bento style stats cards inside tab */}
        <div className="grid grid-cols-2 gap-3" id="classes-status-bento">
          <div className="bg-amber-55/65 border border-amber-200/50 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
            <span className="text-[10px] text-amber-705 font-bold mb-1">סה"כ הכנסות (שיעורים)</span>
            <span className="text-xl font-black text-gray-900 font-mono">₪{filteredEarnings.toLocaleString()}</span>
          </div>

          <div className="bg-orange-55/65 border border-orange-200/50 p-3 rounded-2xl flex flex-col justify-center items-center text-center">
            <span className="text-[10px] text-orange-705 font-bold mb-1">שעות הוראה שנצברו</span>
            <span className="text-xl font-black text-gray-900 font-mono">{filteredHours.toFixed(1)} שעות</span>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="flex flex-col gap-3 text-center" id="classes-list-container">
        <h2 className="text-lg font-extrabold text-white px-1 text-center font-sans tracking-wide">לוח שיעורים שנשמרו ({filteredClasses.length})</h2>
        {filteredClasses.length === 0 ? (
          <div className="text-center text-gray-100 text-xs py-12 bg-white/20 rounded-2xl border border-white/30 font-semibold mx-auto w-full shadow-inner" id="classes-empty-state">
            לא נמצאו שיעורים שהוזנו בטווח או בסינון שנבחר.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center" id="classes-grid">
            {filteredClasses.map((c) => (
              <motion.div
                key={c.id}
                id={`class-card-${c.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-5 relative flex flex-col justify-between hover:border-amber-400 bg-white/35 shadow-xs border-white/60 text-center items-center"
              >
                {/* Delete button absolutely positioned inside */}
                <button
                  onClick={() => handleDeleteClick(c.id, c.type)}
                  className="absolute left-4 top-4 text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-white/55 rounded-lg cursor-pointer"
                  title="מחיקת שיעור"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex flex-col items-center gap-2 mb-4 w-full">
                  <div className="flex items-center gap-2 text-[#a82323] font-extrabold text-base justify-center">
                    <GraduationCap size={18} className="text-[#a82323] shrink-0" />
                    <span>שיעור {c.type}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 text-gray-750 text-xs mt-2.5 font-bold">
                    <span className="flex items-center gap-1.5 bg-white/50 px-2.5 py-1 rounded-lg w-max border border-white/40 justify-center text-gray-800">
                      <Calendar size={13} className="text-amber-650" />
                      {c.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-150 font-bold justify-center">
                      <Clock size={13} className="text-amber-200" />
                      {c.startTime} - {c.endTime} ({c.calculatedHours.toFixed(1)} שעות)
                    </span>
                  </div>

                  {c.type !== "פרטי" && c.studentCount !== undefined && (
                    <div className="text-xs text-gray-800 flex items-center gap-1.5 mt-2 bg-white/60 px-3 py-1.5 rounded-xl w-max font-bold border border-white/45 justify-center">
                      <Users size={12} className="text-amber-700 shrink-0" />
                      <span>{c.studentCount} תלמידים רשומים</span>
                    </div>
                  )}
                </div>

                {/* Pricing Summary Row */}
                <div className="flex items-center justify-between border-t border-white/60 pt-3 mt-1 bg-white/40 p-3 rounded-xl w-full">
                  <span className="text-xs text-gray-600 font-bold">סוג: שיעור ריקוד</span>
                  <div className="flex flex-col items-end gap-0.5 font-bold">
                    <span className="text-[10px] text-amber-750 font-extrabold">שכר שהתקבל</span>
                    <span className="text-lg font-black text-gray-900">₪{c.payment}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Glassmorphic Add Class Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-md" id="class-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel-heavy w-full max-w-lg overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl p-6 bg-white/95 border-white text-gray-800 text-center"
              id="class-modal"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={18} className="text-amber-600" />
                  <h3 className="font-extrabold text-lg text-gray-800">הוספת שיעור חדש</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
                {/* Lesson Type Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">סוג השיעור</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="glass-input p-3 text-sm text-right cursor-pointer bg-white border-gray-300 text-gray-900"
                    id="class-type-select"
                  >
                    <option value="קבוצה" className="text-gray-900 font-sans">שיעור קבוצתי</option>
                    <option value="פרטי" className="text-gray-900 font-sans">שיעור פרטי</option>
                    <option value="סדנא" className="text-gray-900 font-sans">סדנה מיוחדת</option>
                  </select>
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">תאריך השיעור</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input p-3 text-sm cursor-pointer border-gray-300 text-gray-900 bg-white/70 text-right"
                    id="class-date-input"
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
                      id="class-start-time"
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
                      id="class-end-time"
                    />
                  </div>
                </div>

                {/* Number of Students - HIDDEN IF type == "פרטי" */}
                {type !== "פרטי" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-1.5 overflow-hidden text-right"
                    id="student-count-container"
                  >
                    <label className="text-xs font-extrabold text-gray-700">מספר תלמידים רשומים</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="לדוגמה: 15"
                      value={studentCount || ""}
                      onChange={(e) => setStudentCount(Number(e.target.value) || 0)}
                      className="glass-input p-3 text-sm text-center border-gray-300 text-gray-900 bg-white/70"
                      id="class-student-count"
                    />
                  </motion.div>
                )}

                {/* Payment Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">תשלום שהתקבל בפועל (₪)</label>
                  <input
                    type="number"
                    min="0"
                    value={payment || ""}
                    onChange={(e) => setPayment(Number(e.target.value) || 0)}
                    className="glass-input p-3 text-sm text-center border-gray-300 text-gray-900 bg-white/70"
                    id="class-payment-input"
                  />
                </div>

                {/* Duration view feedback inside forms */}
                <div className="glass-card bg-amber-500/5 p-3.5 border-amber-200 rounded-2xl flex flex-col gap-1.5 mt-1 text-center" id="class-live-calc-panel">
                  <div className="flex items-center justify-between text-xs text-gray-650 font-bold">
                    <span>משך השיעור מחושב:</span>
                    <span className="font-mono text-gray-800 text-sm font-extrabold" id="class-duration-val">
                      {calculatedHours.toFixed(1)} שעות ({Math.round(calculatedHours * 60)} דקות)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 rounded-2xl text-gray-600 font-medium hover:bg-gray-100 cursor-pointer text-sm border border-gray-200"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-white font-extrabold bg-gray-900 hover:bg-gray-800 rounded-2xl cursor-pointer text-sm shadow-md"
                    id="save-class-btn"
                  >
                    שמירת שיעור
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
