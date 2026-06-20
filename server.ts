import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with telemetry header
const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// AI Insights endpoint
app.post("/api/insights", async (req, res) => {
  try {
    const { events, classes, expenses, monthName, grossIncome, totalHours, avgHourly } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: false,
        advice: "עלייך להגדיר מפתח GEMINI_API_KEY בתיבת ה-Secrets כדי להפעיל את מנוע ה-AI החכם. ברגע שתגדירי, ה-AI ינתח את נתוני הריקוד שלך ויעניק לך טיפים מעשיים של מאמן פיננסי אישי!"
      });
    }

    const prompt = `
אתה משמש כמאמן פיננסי אישי ויועץ עסקי חכם לרקדנית עצמאית (עוסק פטור בישראל) המסייע לה דרך אפליקציית DancerPay.
היא משתמשת באפליקציה למעקב אחר הכנסותיה מהופעות באירועים ומשיעורי ריקוד, לצד מעקב נפרד אחר הוצאות עסקיות.

להלן נתוני הפעילות לחודש הנוכחי (${monthName || "החודש הנוכחי"}):
- סך הכנסות ברוטו: ₪${grossIncome || 0}
- סך שעות עבודה: ${totalHours || 0} שעות
- ממוצע שכר שעתי: ₪${avgHourly || 0} לשעה
- מספר אירועים (הופעות): ${events?.length || 0}
- מספר שיעורים: ${classes?.length || 0}
- סך כל ההוצאות הרשומות לחודש זה (שנועדו להצהרה שנתית ולא מקוזזות מהברוטו): ₪${expenses?.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0) || 0}

רשימת האירועים החודש:
${JSON.stringify(events || [])}

רשימת שיעורי הריקוד החודש:
${JSON.stringify(classes || [])}

רשימת ההוצאות שנרשמו החודש:
${JSON.stringify(expenses || [])}

אנא נתח את הנתונים וספק לה טיפים וייעוץ חכם וממוקד בעברית רהוטה ומעצימה, תוך התייחסות לנקודות הבאות:
1. ניתוח יחס הכנסות: השוואה בין רווחיות מהופעות (אירועים) לעומת העברת שיעורי ריקוד (פרטיים, קבוצתיים או סדנאות). היכן השכר השעתי גבוה יותר?
2. טיפים להתייעלות פיננסית והגדלת הטיפים או השכר השעתי.
3. התייחסות לחוקי עוסק פטור בישראל (למשל תקרת ההכנסות השנתית לעוסק פטור, העומדת על כ-120,000 ש"ח והחשיבות של רישום הוצאות מסודר לדוח השנתי למניעת תשלומי מס מיותרים).
4. משוב חיובי ומילים מעצימות ומעודדות כרקדנית יוצרת עצמאית!

התשובה צריכה להיות מעוצבת בצורה יפה עם סימוני Markdown קלים (כגון כותרות קטנות, נקודות בולטות, טקסט מודגש), מנוסחת בנימה מקצועית, אדיבה ואישית שמתאימה לרקדניות.
תשמור על אורך ממוקד ומדויק אך מעמיק (כ-3-4 פסקאות קצרות או מבנה נקודות יפה).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      advice: response.text || "לא התקבל ניתוח. נסי שנית מאוחר יותר."
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "שגיאה בחיבור לשרת ה-AI"
    });
  }
});

// Serve static assets in production, or mount Vite dev server in non-production
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Server start failure:", err);
});
