import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import EventDancing from "./components/EventDancing";
import ClassDancing from "./components/ClassDancing";
import Expenses from "./components/Expenses";
import {
  type DanceEvent,
  type DanceClass,
  type BusinessExpense,
  getMonthYearKey,
} from "./types";
import { LayoutDashboard, Flame, GraduationCap, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Mock Data pre-populated in Hebrew on first load to match the beautiful Hebrew dashboard representation
const initialEvents: DanceEvent[] = [
  {
    id: "e1",
    location: "אולמי טרויה, אשדוד",
    date: "2026-06-05",
    startTime: "21:00",
    endTime: "01:00", // crosses midnight!
    contactPerson: "רונית מפיקה",
    baseSalary: 1200,
    tips: 250,
    calculatedHours: 4,
    totalEarnings: 1450,
  },
  {
    id: "e2",
    location: "מועדון התיאטרון, יפו",
    date: "2026-06-15",
    startTime: "20:00",
    endTime: "23:00",
    contactPerson: "איתי יחצן",
    baseSalary: 1000,
    tips: 150,
    calculatedHours: 3,
    totalEarnings: 1150,
  },
  {
    id: "e3",
    location: "חוף הדקל, אילת",
    date: "2026-05-18",
    startTime: "22:00",
    endTime: "01:30", // crosses midnight!
    contactPerson: "לירון מלהקת",
    baseSalary: 1500,
    tips: 300,
    calculatedHours: 3.5,
    totalEarnings: 1800,
  }
];

const initialClasses: DanceClass[] = [
  {
    id: "c1",
    type: "קבוצה",
    date: "2026-06-03",
    startTime: "18:00",
    endTime: "19:30",
    studentCount: 16,
    payment: 180,
    calculatedHours: 1.5,
  },
  {
    id: "c2",
    type: "פרטי",
    date: "2026-06-10",
    startTime: "16:00",
    endTime: "17:00",
    payment: 250,
    calculatedHours: 1.0,
  },
  {
    id: "c3",
    type: "סדנא",
    date: "2026-06-17",
    startTime: "11:00",
    endTime: "13:00",
    studentCount: 22,
    payment: 500,
    calculatedHours: 2.0,
  },
  {
    id: "c4",
    type: "קבוצה",
    date: "2026-05-24",
    startTime: "18:00",
    endTime: "19:30",
    studentCount: 14,
    payment: 180,
    calculatedHours: 1.5,
  }
];

const initialExpenses: BusinessExpense[] = [
  {
    id: "ex1",
    category: "נסיעות ודלק",
    amount: 180,
    date: "2026-06-05",
    receiptName: "fuel_receipt.png",
  },
  {
    id: "ex2",
    category: "ביגוד והנעלה",
    amount: 320,
    date: "2026-06-08",
    receiptName: "dance_shoes.jpeg",
  },
  {
    id: "ex3",
    category: "איפור ושיער",
    amount: 450,
    date: "2026-05-18",
    receiptName: "hairspray_makeup.jpg",
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "events" | "classes" | "expenses">("dashboard");

  // Load state from localStorage or fallback to defaults
  const [events, setEvents] = useState<DanceEvent[]>(() => {
    const saved = localStorage.getItem("vdance_events");
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [classes, setClasses] = useState<DanceClass[]>(() => {
    const saved = localStorage.getItem("vdance_classes");
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [expenses, setExpenses] = useState<BusinessExpense[]>(() => {
    const saved = localStorage.getItem("vdance_expenses");
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  // Automatically save to local storage when items change
  useEffect(() => {
    localStorage.setItem("vdance_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("vdance_classes", JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem("vdance_expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Lifted filtering state across multiple tabs
  const [filterType, setFilterType] = useState<"month" | "range">("month");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

  const allMonthKeys = React.useMemo(() => {
    const keys = new Set<string>();
    
    // Add current month automatically as a default option
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    keys.add(currentKey);

    // Collect keys from activities
    events.forEach((e) => keys.add(getMonthYearKey(e.date)));
    classes.forEach((c) => keys.add(getMonthYearKey(c.date)));
    expenses.forEach((ex) => keys.add(getMonthYearKey(ex.date)));

    // Sort descending (latest months first)
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [events, classes, expenses]);

  // Ensure selectedMonthKey has a default value on load
  useEffect(() => {
    if (!selectedMonthKey && allMonthKeys.length > 0) {
      // Set to current month if in keys, otherwise show latest
      const now = new Date();
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      if (allMonthKeys.includes(currentKey)) {
        setSelectedMonthKey(currentKey);
      } else {
        setSelectedMonthKey(allMonthKeys[0]);
      }
    }
  }, [allMonthKeys, selectedMonthKey]);

  // Callbacks for data editing
  const handleAddEvent = (newEvent: Omit<DanceEvent, "id">) => {
    const eventWithId: DanceEvent = {
      ...newEvent,
      id: "ev_" + Date.now() + Math.random().toString(36).substr(2, 4),
    };
    setEvents((prev) => [eventWithId, ...prev]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddClass = (newClass: Omit<DanceClass, "id">) => {
    const classWithId: DanceClass = {
      ...newClass,
      id: "cl_" + Date.now() + Math.random().toString(36).substr(2, 4),
    };
    setClasses((prev) => [classWithId, ...prev]);
  };

  const handleDeleteClass = (id: string) => {
    setClasses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddExpense = (newExpense: Omit<BusinessExpense, "id">) => {
    const expenseWithId: BusinessExpense = {
      ...newExpense,
      id: "ex_" + Date.now() + Math.random().toString(36).substr(2, 4),
    };
    setExpenses((prev) => [expenseWithId, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-dreamy-gradient min-h-screen relative font-sans antialiased text-gray-800 pb-28 text-center" id="vdance-app-container">
      {/* Decorative Floating Blobs behind interface */}
      <div className="floating-circle-3 pointer-events-none" />

      {/* Main Container - Framed with spacious elegant margins */}
      <div className="w-full max-w-lg mx-auto px-4 pt-6" id="view-port">

        {/* View Switcher with smooth transition based on tabs routing */}
        <div className="min-h-[72vh] mb-12" id="tab-renderer">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "dashboard" && (
                <Dashboard
                  events={events}
                  classes={classes}
                  expenses={expenses}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  selectedMonthKey={selectedMonthKey}
                  setSelectedMonthKey={setSelectedMonthKey}
                  startDateFilter={startDateFilter}
                  setStartDateFilter={setStartDateFilter}
                  endDateFilter={endDateFilter}
                  setEndDateFilter={setEndDateFilter}
                  allMonthKeys={allMonthKeys}
                />
              )}

              {activeTab === "events" && (
                <EventDancing
                  events={events}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  selectedMonthFilter={selectedMonthKey}
                  setSelectedMonthFilter={setSelectedMonthKey}
                  startDateFilter={startDateFilter}
                  setStartDateFilter={setStartDateFilter}
                  endDateFilter={endDateFilter}
                  setEndDateFilter={setEndDateFilter}
                  allMonthKeys={allMonthKeys}
                />
              )}

              {activeTab === "classes" && (
                <ClassDancing
                  classes={classes}
                  onAddClass={handleAddClass}
                  onDeleteClass={handleDeleteClass}
                  filterType={filterType}
                  setFilterType={setFilterType}
                  selectedMonthFilter={selectedMonthKey}
                  setSelectedMonthFilter={setSelectedMonthKey}
                  startDateFilter={startDateFilter}
                  setStartDateFilter={setStartDateFilter}
                  endDateFilter={endDateFilter}
                  setEndDateFilter={setEndDateFilter}
                  allMonthKeys={allMonthKeys}
                />
              )}

              {activeTab === "expenses" && (
                <Expenses
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Bottom Glassmorphic Navigation Menu Bar */}
      <div className="fixed bottom-5 left-0 right-0 z-40 px-4 w-full flex justify-center" id="nav-wrapper">
        <div className="bg-white/45 backdrop-blur-2xl px-4 py-3.5 flex justify-around items-center w-full max-w-sm shadow-xl border border-white/60 rounded-[32px] min-h-[74px]" id="floating-menu" style={{ direction: "rtl" }}>
          {/* Dashboard Nav Button */}
          <button
            onClick={() => setActiveTab("dashboard")}
            id="nav-dash"
            className={`flex flex-col items-center gap-1 relative cursor-pointer text-xs font-bold select-none transition-all ${
              activeTab === "dashboard" ? "text-gray-900 scale-105 font-extrabold" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <LayoutDashboard size={20} />
            <span>דאשבורד</span>
            {activeTab === "dashboard" && (
              <motion.div layoutId="nav-dot" className="absolute -bottom-1.5 w-1 h-1 bg-pink-600 rounded-full" />
            )}
          </button>

          {/* Events Nav Button */}
          <button
            onClick={() => setActiveTab("events")}
            id="nav-events"
            className={`flex flex-col items-center gap-1 relative cursor-pointer text-xs font-bold select-none transition-all ${
              activeTab === "events" ? "text-gray-900 scale-105 font-extrabold" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Flame size={20} />
            <span>הופעות</span>
            {activeTab === "events" && (
              <motion.div layoutId="nav-dot" className="absolute -bottom-1.5 w-1 h-1 bg-pink-600 rounded-full" />
            )}
          </button>

          {/* Classes Nav Button */}
          <button
            onClick={() => setActiveTab("classes")}
            id="nav-classes"
            className={`flex flex-col items-center gap-1 relative cursor-pointer text-xs font-bold select-none transition-all ${
              activeTab === "classes" ? "text-gray-900 scale-105 font-extrabold" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <GraduationCap size={20} />
            <span>שיעורים</span>
            {activeTab === "classes" && (
              <motion.div layoutId="nav-dot" className="absolute -bottom-1.5 w-1 h-1 bg-amber-600 rounded-full" />
            )}
          </button>

          {/* Expenses Nav Button */}
          <button
            onClick={() => setActiveTab("expenses")}
            id="nav-expenses"
            className={`flex flex-col items-center gap-1 relative cursor-pointer text-xs font-bold select-none transition-all ${
              activeTab === "expenses" ? "text-gray-900 scale-105 font-extrabold" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Wallet size={20} />
            <span>הוצאות</span>
            {activeTab === "expenses" && (
              <motion.div layoutId="nav-dot" className="absolute -bottom-1.5 w-1 h-1 bg-rose-600 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
