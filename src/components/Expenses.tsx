import React, { useState, useRef } from "react";
import { type BusinessExpense } from "../types";
import { Plus, X, Calendar, FileText, AlertCircle, Camera, Trash2, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExpensesProps {
  expenses: BusinessExpense[];
  onAddExpense: (newExpense: Omit<BusinessExpense, "id">) => void;
  onDeleteExpense: (id: string) => void;
}

export default function Expenses({ expenses, onAddExpense, onDeleteExpense }: ExpensesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [category, setCategory] = useState<BusinessExpense["category"]>("נסיעות ודלק");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptName, setReceiptName] = useState<string>("");
  const [receiptData, setReceiptData] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      
      // Read the file as DataURL for preview
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        // Limit string length to 150KB to protect LocalStorage quota limits
        if (resultStr.length < 200000) {
          setReceiptData(resultStr);
        } else {
          setReceiptData("EXCEEDS_STORAGE_BUT_SAVED_LOCAL");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("אנא הזיני סכום הוצאה תקין");
      return;
    }

    onAddExpense({
      category,
      amount,
      date,
      receiptName: receiptName || undefined,
      receiptData: receiptData || undefined,
    });

    // Reset Form
    setCategory("נסיעות ודלק");
    setAmount(0);
    setDate(new Date().toISOString().split("T")[0]);
    setReceiptName("");
    setReceiptData("");
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, cat: string, sum: number) => {
    if (window.confirm(`האם את בטוחה שברצונך למחוק הוצאה זו על סך ₪${sum} עבור קטגוריית "${cat}"?`)) {
      onDeleteExpense(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-center" id="expenses-tab">
      {/* Header section with Add Button */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-full text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight" id="expenses-title">הוצאות וקבלות</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          id="add-expense-btn"
          className="px-6 py-3 text-white font-bold bg-gray-900 hover:bg-gray-800 rounded-2xl text-sm cursor-pointer flex items-center gap-2 active:scale-95 transition-all w-full sm:w-auto justify-center shadow-lg"
        >
          <Plus size={18} />
          רישום הוצאה חדשה
        </button>
      </div>

      {/* Visual Instruction Banner */}
      <div className="rounded-[24px] p-5 border border-orange-200 bg-orange-50/70 flex gap-3 text-right shadow-xs items-start" id="expenses-notice-banner">
        <div className="p-1 text-orange-600 shrink-0">
          <AlertCircle size={22} />
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="font-extrabold text-sm text-orange-950">הערה חשובה לצורכי מס ודוח שנתי</h4>
          <p className="text-xs text-orange-850 leading-relaxed font-semibold">
            הוצאות אלו מתועדות עבור דיווחי מס ואינן מופחתות מההכנסה הגולמית המוצגת במסך הראשי (הדאשבורד) – דבר המסייע למעקב מדויק אחר מחזור עסקאותייך השנתי כעצמאית.
          </p>
        </div>
      </div>

      {/* Expenses list */}
      <div className="flex flex-col gap-3 text-center" id="expenses-list-container">
        <h2 className="text-lg font-extrabold text-white px-1 text-center">כל ההוצאות שנרשמו ({expenses.length})</h2>
        {expenses.length === 0 ? (
          <div className="text-center text-gray-100 text-xs py-12 bg-white/20 rounded-2xl border border-white/30 font-semibold mx-auto w-full" id="expenses-empty-state">
            לא נמצאו הוצאות מתועדות. לחצי על "+ רישום הוצאה חדשה" על מנת להתחיל לתעד קבלות ולשמור עליהן לצורכי מס!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center" id="expenses-grid">
            {expenses.map((ex) => (
              <motion.div
                key={ex.id}
                id={`expense-card-${ex.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-5 relative flex flex-col justify-between hover:border-rose-400 bg-white/35 shadow-xs border-white/60 text-center items-center"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(ex.id, ex.category, ex.amount)}
                  className="absolute left-4 top-4 text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-white/55 rounded-lg cursor-pointer"
                  title="מחיקת הוצאה"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex flex-col items-center gap-2 mb-4 w-full">
                  <div className="flex items-center gap-2 text-[#a82323] font-extrabold text-base justify-center">
                    <FileText size={16} className="text-[#a82323] shrink-0" />
                    <span>{ex.category}</span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-650 text-xs mt-1 font-semibold justify-center">
                    <span className="flex items-center gap-1 justify-center">
                      <Calendar size={13} className="text-gray-450" />
                      {ex.date}
                    </span>
                  </div>

                  {/* Attachment indicator with camera/image icon */}
                  {ex.receiptName ? (
                    <div className="text-[11px] text-green-800 flex items-center gap-1.5 mt-2 bg-green-55/60 px-3 py-1.5 rounded-xl w-max max-w-full font-bold border border-green-200/50 shadow-2xs justify-center">
                      <Check size={12} className="text-green-700 font-black" />
                      <ImageIcon size={12} className="text-green-700" />
                      <span className="truncate max-w-[150px] font-mono">{ex.receiptName}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-2 bg-white/40 px-3 py-1.5 rounded-xl w-max border border-white/40 font-semibold justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span>לא צורפה קבלה</span>
                    </div>
                  )}
                </div>

                {/* Amount segment */}
                <div className="flex items-center justify-between border-t border-white/60 pt-3 mt-1 bg-white/40 p-3 rounded-xl w-full">
                  <span className="text-xs text-gray-500 font-bold">סוג: הוצאה מוכרת למס</span>
                  <div className="flex flex-col items-end gap-0.5 font-bold">
                    <span className="text-[10px] text-rose-700 font-extrabold">סכום ההוצאה</span>
                    <span className="text-lg font-black text-rose-800">₪{ex.amount}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Glassmorphic Add Expense Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-md" id="expense-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel-heavy w-full max-w-lg overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl p-6 bg-white/95 border-white text-gray-800 text-center"
              id="expense-modal"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={18} className="text-rose-600" />
                  <h3 className="font-extrabold text-lg text-gray-800">רישום הוצאה עסקית</h3>
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
                {/* Category selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">קטגוריית הוצאה</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="glass-input p-3 text-sm text-right cursor-pointer bg-white border-gray-300 text-gray-900"
                    id="expense-category-select"
                  >
                    <option value="נסיעות ודלק" className="text-gray-900 font-sans">נסיעות ודלק</option>
                    <option value="ביגוד והנעלה" className="text-gray-900 font-sans">ביגוד והנעלה</option>
                    <option value="איפור ושיער" className="text-gray-900 font-sans">איפור ושיער</option>
                    <option value="שיווק" className="text-gray-900 font-sans">שיווק ופרסום</option>
                    <option value="אחר" className="text-gray-900 font-sans">הוצאה אחרת / כללי</option>
                  </select>
                </div>

                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">סכום ההוצאה בפועל (₪)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="glass-input p-3 text-sm text-center border-gray-300 text-gray-900 bg-white/70"
                    placeholder="הזיני סכום בשקלים"
                    id="expense-amount-input"
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-extrabold text-gray-700">תאריך ההוצאה</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input p-3 text-sm cursor-pointer border-gray-300 text-gray-900 bg-white/70 text-right"
                    id="expense-date-input"
                  />
                </div>

                {/* Camera & Receipt Capture with capture="environment" */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-xs font-extrabold text-gray-700">צירוף קבלה / צילום בפועל</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    id="expense-receipt-file"
                  />

                  <div
                    onClick={triggerFileInput}
                    className="p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-rose-400 hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                    id="receipt-dropzone"
                  >
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors">
                      <Camera size={20} />
                    </div>
                    {receiptName ? (
                      <div className="flex flex-col items-center gap-1 justify-center">
                        <span className="text-xs text-green-700 font-bold flex items-center gap-1 justify-center">
                          <Check size={14} /> הקבלה צורפה בהצלחה!
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                          {receiptName}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 justify-center">
                        <span className="text-sm text-gray-700 font-bold">לחצי כאן לצילום או בחירת קובץ קבלה</span>
                        <span className="text-xs text-gray-500 font-semibold">תוכלי לצלם קבלות פיזיות ישירות במצלמה של המכשיר</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
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
                    id="save-expense-btn"
                  >
                    תיעוד הוצאה
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
