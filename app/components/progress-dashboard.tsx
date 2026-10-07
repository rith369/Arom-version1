"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  ArrowRight,
  TrendingUp,
  X,
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  Wind,
  Compass,
  Smile,
  Lightbulb,
} from "lucide-react";
import { useLanguage } from "../_components/language-provider";

type DayMoodEntry = {
  dayEn: string;
  dayKm: string;
  shortEn: string;
  shortKm: string;
  emoji: string;
  moodNameEn: string;
  moodNameKm: string;
  score: number;
  time: string;
  noteEn: string;
  noteKm: string;
  isToday?: boolean;
  isFuture?: boolean;
};

type ChartPoint = {
  x: number;
  y: number;
  dayEn: string;
  dayKm: string;
  shortEn: string;
  shortKm: string;
  score: number;
  deltaEn: string;
  deltaKm: string;
  moodEn: string;
  moodKm: string;
  emoji: string;
  feelingEn: string;
  feelingKm: string;
  isToday?: boolean;
};

// Generates smooth cubic bezier SVG path
function getSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`;
  }
  return path;
}

function getAreaPath(points: { x: number; y: number }[], bottomY = 96): string {
  const linePath = getSvgPath(points);
  if (!linePath) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;
}

export function ProgressDashboard() {
  const { language } = useLanguage();
  const km = language === "km";

  const [isFullDashboardOpen, setIsFullDashboardOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3); // default Thu / today
  const [todayMood, setTodayMood] = useState<string>("Good");
  const [journalEntriesCount, setJournalEntriesCount] = useState<number>(6);

  // Real interactive chart states
  const [timeRange, setTimeRange] = useState<"thisWeek" | "lastWeek">("thisWeek");
  const [chartActiveIndex, setChartActiveIndex] = useState<number>(3); // Thu / today default

  useEffect(() => {
    try {
      const stored = localStorage.getItem("arom_today_mood");
      if (stored) setTodayMood(stored);

      const entries = localStorage.getItem("arom_journal_entries");
      if (entries) {
        const parsed = JSON.parse(entries);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJournalEntriesCount(parsed.length);
        }
      }
    } catch {
      // ignore
    }

    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem("arom_today_mood");
        if (stored) setTodayMood(stored);
      } catch {
        // ignore
      }
    };

    window.addEventListener("arom_today_mood_updated", handleUpdate);
    return () => window.removeEventListener("arom_today_mood_updated", handleUpdate);
  }, []);

  // 7-Day interactive chart datasets
  const thisWeekChart: ChartPoint[] = [
    {
      x: 25,
      y: 56,
      dayEn: "Mon",
      dayKm: "ច័ន្ទ",
      shortEn: "M",
      shortKm: "ច",
      score: 7.2,
      deltaEn: "+6% vs prev",
      deltaKm: "+៦% ធៀបសប្តាហ៍មុន",
      moodEn: "Good",
      moodKm: "ស្រួលចិត្ត (Good)",
      emoji: "😊",
      feelingEn: "Calm & refreshed morning",
      feelingKm: "ព្រឹកស្ងប់ស្ងាត់ និងស្រស់ស្រាយ",
    },
    {
      x: 75,
      y: 62,
      dayEn: "Tue",
      dayKm: "អង្គារ",
      shortEn: "T",
      shortKm: "អ",
      score: 6.8,
      deltaEn: "Steady pace",
      deltaKm: "ល្បឿនមានស្ថិរភាព",
      moodEn: "Peaceful",
      moodKm: "ស្ងប់ចិត្ត (Peaceful)",
      emoji: "🙂",
      feelingEn: "Gentle walk & steady balance",
      feelingKm: "ការដើរស្រូបខ្យល់បរិសុទ្ធ",
    },
    {
      x: 125,
      y: 58,
      dayEn: "Wed",
      dayKm: "ពុធ",
      shortEn: "W",
      shortKm: "ព",
      score: 7.0,
      deltaEn: "+8% vs prev",
      deltaKm: "+៨% ធៀបសប្តាហ៍មុន",
      moodEn: "Calm",
      moodKm: "ធូរស្រាល (Calm)",
      emoji: "😌",
      feelingEn: "Breathing released study stress",
      feelingKm: "លំហាត់ដកដង្ហើមបន្ធូរភាពតានតឹង (Stress)",
    },
    {
      x: 175,
      y: 46,
      dayEn: "Thu",
      dayKm: "ព្រហស្បតិ៍",
      shortEn: "T",
      shortKm: "ព្រ",
      score: 7.4,
      deltaEn: "+12% from last week",
      deltaKm: "+១២% ធៀបនឹងសប្តាហ៍មុន",
      moodEn: todayMood,
      moodKm: todayMood === "Great" ? "រីករាយ (Great)" : todayMood === "Okay" ? "ធម្មតា (Okay)" : "ស្រួលចិត្ត (Good)",
      emoji: todayMood === "Great" ? "😄" : todayMood === "Okay" ? "😐" : "😊",
      feelingEn: "Grounding check-in & journal",
      feelingKm: "ពិនិត្យ និងកត់ត្រាអារម្មណ៍ (Check-in & Journal)",
      isToday: true,
    },
    {
      x: 225,
      y: 38,
      dayEn: "Fri",
      dayKm: "សុក្រ",
      shortEn: "F",
      shortKm: "ស",
      score: 7.7,
      deltaEn: "+15% vs prev",
      deltaKm: "+១៥% ធៀបសប្តាហ៍មុន",
      moodEn: "Uplifted",
      moodKm: "ស្រស់ស្រាយ (Uplifted)",
      emoji: "😊",
      feelingEn: "Restful music evening",
      feelingKm: "តន្ត្រីសម្រាកអារម្មណ៍",
    },
    {
      x: 275,
      y: 28,
      dayEn: "Sat",
      dayKm: "សៅរ៍",
      shortEn: "S",
      shortKm: "សៅ",
      score: 8.2,
      deltaEn: "+18% vs prev",
      deltaKm: "+១៨% ធៀបសប្តាហ៍មុន",
      moodEn: "Great",
      moodKm: "រីករាយ (Great)",
      emoji: "😄",
      feelingEn: "Peer community shared joy",
      feelingKm: "ចែករំលែកជាមួយសហគមន៍ (Community)",
    },
    {
      x: 325,
      y: 20,
      dayEn: "Sun",
      dayKm: "អាទិត្យ",
      shortEn: "S",
      shortKm: "អា",
      score: 8.5,
      deltaEn: "+20% vs prev",
      deltaKm: "+២០% ធៀបសប្តាហ៍មុន",
      moodEn: "Harmony",
      moodKm: "សុខដុម (Harmony)",
      emoji: "✨",
      feelingEn: "Weekly recharge & reset",
      feelingKm: "បញ្ចូលថាមពល និងសម្រាកចិត្ត (Recharge & Reset)",
    },
  ];

  const lastWeekChart: ChartPoint[] = [
    {
      x: 25,
      y: 78,
      dayEn: "Mon",
      dayKm: "ច័ន្ទ",
      shortEn: "M",
      shortKm: "ច",
      score: 6.1,
      deltaEn: "Baseline start",
      deltaKm: "ការចាប់ផ្តើមដំបូង",
      moodEn: "Okay",
      moodKm: "ធម្មតា (Okay)",
      emoji: "😐",
      feelingEn: "Midterm workload stress",
      feelingKm: "សម្ពាធការងារ និងការរៀន (Stress)",
    },
    {
      x: 75,
      y: 72,
      dayEn: "Tue",
      dayKm: "អង្គារ",
      shortEn: "T",
      shortKm: "អ",
      score: 6.4,
      deltaEn: "+2%",
      deltaKm: "+២%",
      moodEn: "Reflective",
      moodKm: "គិតពិចារណា (Reflective)",
      emoji: "🙂",
      feelingEn: "Paced daily tasks slowly",
      feelingKm: "ការបន្ថយល្បឿន និងធ្វើចិត្តឱ្យស្ងប់",
    },
    {
      x: 125,
      y: 68,
      dayEn: "Wed",
      dayKm: "ពុធ",
      shortEn: "W",
      shortKm: "ព",
      score: 6.6,
      deltaEn: "+4%",
      deltaKm: "+៤%",
      moodEn: "Calm",
      moodKm: "ធូរស្រាល (Calm)",
      emoji: "😌",
      feelingEn: "Evening pause helped relax",
      feelingKm: "ការផ្អាកសម្រាកពេលល្ងាច",
    },
    {
      x: 175,
      y: 64,
      dayEn: "Thu",
      dayKm: "ព្រហស្បតិ៍",
      shortEn: "T",
      shortKm: "ព្រ",
      score: 6.8,
      deltaEn: "+5%",
      deltaKm: "+៥%",
      moodEn: "Good",
      moodKm: "ស្រួលចិត្ត (Good)",
      emoji: "😊",
      feelingEn: "MindGuide lesson completed",
      feelingKm: "បញ្ចប់មេរៀនចិត្ត (MindGuide Lesson)",
    },
    {
      x: 225,
      y: 56,
      dayEn: "Fri",
      dayKm: "សុក្រ",
      shortEn: "F",
      shortKm: "ស",
      score: 7.1,
      deltaEn: "+8%",
      deltaKm: "+៨%",
      moodEn: "Uplifted",
      moodKm: "ស្រស់ស្រាយ (Uplifted)",
      emoji: "😊",
      feelingEn: "Relaxing soundscape session",
      feelingKm: "ស្ដាប់សំឡេងបន្ធូរអារម្មណ៍ (Soundscape)",
    },
    {
      x: 275,
      y: 50,
      dayEn: "Sat",
      dayKm: "សៅរ៍",
      shortEn: "S",
      shortKm: "សៅ",
      score: 7.3,
      deltaEn: "+10%",
      deltaKm: "+១០%",
      moodEn: "Great",
      moodKm: "រីករាយ (Great)",
      emoji: "😄",
      feelingEn: "Outdoor walk with friends",
      feelingKm: "ដើរលេងជាមួយមិត្តភក្តិ",
    },
    {
      x: 325,
      y: 46,
      dayEn: "Sun",
      dayKm: "អាទិត្យ",
      shortEn: "S",
      shortKm: "អា",
      score: 7.5,
      deltaEn: "+12%",
      deltaKm: "+១២%",
      moodEn: "Peaceful",
      moodKm: "ស្ងប់ចិត្ត (Peaceful)",
      emoji: "✨",
      feelingEn: "Restful sleep preparation",
      feelingKm: "ការរៀបចំខ្លួនសម្រាកដំណេក",
    },
  ];

  const currentChart = timeRange === "thisWeek" ? thisWeekChart : lastWeekChart;
  const activePt = currentChart[chartActiveIndex] || currentChart[3];
  const activePercentX = (activePt.x / 350) * 100;
  const activePercentY = (activePt.y / 100) * 100;

  // 7-Day Weekly Journey data (for section 4)
  const weekDays: DayMoodEntry[] = [
    {
      dayEn: "Mon",
      dayKm: "ច័ន្ទ",
      shortEn: "M",
      shortKm: "ច",
      emoji: "😊",
      moodNameEn: "Good",
      moodNameKm: "ស្រួលចិត្ត (Good)",
      score: 7.2,
      time: "8:30 AM",
      noteEn: "Morning meditation helped start the day refreshed.",
      noteKm: "ការធ្វើសមាធិ (Meditation) ពេលព្រឹក ជួយឱ្យថ្ងៃថ្មីចាប់ផ្តើមយ៉ាងស្រស់ស្រាយ។",
    },
    {
      dayEn: "Tue",
      dayKm: "អង្គារ",
      shortEn: "T",
      shortKm: "អ",
      emoji: "🙂",
      moodNameEn: "Peaceful",
      moodNameKm: "ស្ងប់ចិត្ត (Peaceful)",
      score: 6.8,
      time: "12:15 PM",
      noteEn: "Took a walk outside, feeling balanced and grounded.",
      noteKm: "បានដើរស្រូបខ្យល់ខាងក្រៅ មានអារម្មណ៍ស្ងប់ និងមានលំនឹងផ្លូវចិត្ត។",
    },
    {
      dayEn: "Wed",
      dayKm: "ពុធ",
      shortEn: "W",
      shortKm: "ព",
      emoji: "😌",
      moodNameEn: "Calm",
      moodNameKm: "ធូរស្រាល (Calm)",
      score: 7.0,
      time: "9:45 AM",
      noteEn: "Focused breathing session eased study tension.",
      noteKm: "ការដកដង្ហើម (Breathing) ជួយបន្ធូរភាពតានតឹង (Stress) ពីការរៀន។",
    },
    {
      dayEn: "Thu",
      dayKm: "ព្រហស្បតិ៍",
      shortEn: "T",
      shortKm: "ព្រ",
      emoji: todayMood === "Great" ? "😄" : todayMood === "Okay" ? "😐" : "😊",
      moodNameEn: todayMood,
      moodNameKm: todayMood === "Great" ? "រីករាយ (Great)" : todayMood === "Okay" ? "ធម្មតា (Okay)" : "ស្រួលចិត្ត (Good)",
      score: 7.4,
      time: "Today",
      noteEn: "Checked in today. Practiced mindfulness and self-care.",
      noteKm: "បានពិនិត្យអារម្មណ៍ថ្ងៃនេះ (Check-in) និងអនុវត្តការដកដង្ហើមថែទាំចិត្ត។",
      isToday: true,
    },
    {
      dayEn: "Fri",
      dayKm: "សុក្រ",
      shortEn: "F",
      shortKm: "ស",
      emoji: "😊",
      moodNameEn: "Uplifted",
      moodNameKm: "ស្រស់ស្រាយ (Uplifted)",
      score: 7.5,
      time: "Yesterday",
      noteEn: "Enjoyed music and rested well.",
      noteKm: "បានស្តាប់តន្ត្រី និងសម្រាកបានយ៉ាងស្រួល។",
    },
    {
      dayEn: "Sat",
      dayKm: "សៅរ៍",
      shortEn: "S",
      shortKm: "សៅ",
      emoji: "😄",
      moodNameEn: "Great",
      moodNameKm: "រីករាយ (Great)",
      score: 8.0,
      time: "Weekend",
      noteEn: "Shared moments with friends in the community.",
      noteKm: "បានជជែកលេងជាមួយមិត្តភក្តិក្នុងសហគមន៍ (Community)។",
    },
    {
      dayEn: "Sun",
      dayKm: "អាទិត្យ",
      shortEn: "S",
      shortKm: "អា",
      emoji: "⏳",
      moodNameEn: "Upcoming",
      moodNameKm: "គ្រោងទុក (Upcoming)",
      score: 0,
      time: "Tomorrow",
      noteEn: "Take time for a mindful rest day.",
      noteKm: "ចំណាយពេលសម្រាកចិត្តសម្រាប់ថ្ងៃស្អែក។",
      isFuture: true,
    },
  ];

  const selectedDay = weekDays[selectedDayIndex];

  return (
    <>
      <section
        id="progress-dashboard"
        aria-label={km ? "ដំណើរការរបស់អ្នក" : "Your Progress"}
        className="mt-6 flex flex-col gap-4 sm:gap-5 scroll-mt-6"
      >
        {/* ================= 1. SECTION HEADER ================= */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#14221f]">
              {km ? "ដំណើរការវិវឌ្ឍរបស់អ្នក (Your Progress)" : "Your Progress"}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#4b5563]">
              {km ? "«រាល់ជំហានតូចៗ សុទ្ធតែជាការរីកចម្រើនដ៏មានតម្លៃ។»" : "“Small steps are still progress.”"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFullDashboardOpen(true)}
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1f6f5b] hover:text-[#144b3e] transition-colors focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
          >
            <span>{km ? "មើលលម្អិត (View All)" : "View All"}</span>
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {/* ================= 2. REAL INTERACTIVE MAIN PROGRESS CARD ================= */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#e5efe9] bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(20,75,63,0.04)]">
          {/* Subtle natural ambient backdrop */}
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#e0f3ed]/60 blur-2xl" />

          {/* Heading, Subtitle & Interactive Timeframe Switcher */}
          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[#e0f3ed] text-[#1f6f5b]">
                  <TrendingUp size={14} />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#14221f]">
                  {km ? "អារម្មណ៍របស់អ្នកកំពុងតែប្រសើរឡើង" : "Your mood is improving"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#4b5563]">
                {km
                  ? "អារម្មណ៍របស់អ្នកមានលំនឹង និងធូរស្រាលល្អក្នុងសប្តាហ៍នេះ។"
                  : "Your mood has been more stable this week."}
              </p>
            </div>

            {/* Interactive Time Range Toggle Pill */}
            <div className="flex self-start sm:self-auto items-center rounded-xl bg-[#f0f6f3] p-1 border border-[#e2efe9]">
              <button
                type="button"
                onClick={() => setTimeRange("thisWeek")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  timeRange === "thisWeek"
                    ? "bg-white text-[#1f6f5b] shadow-xs"
                    : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                {km ? "សប្តាហ៍នេះ" : "This Week"}
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("lastWeek")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  timeRange === "lastWeek"
                    ? "bg-white text-[#1f6f5b] shadow-xs"
                    : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                {km ? "សប្តាហ៍មុន" : "Last Week"}
              </button>
            </div>
          </div>

          {/* ================= REAL INTERACTIVE SVG CHART ================= */}
          <div className="relative mt-6 pt-3 pb-1 select-none">
            {/* Real-time Dynamic Floating Tooltip Pill */}
            <div
              className="pointer-events-none absolute z-20 flex flex-col items-center transition-all duration-200 ease-out"
              style={{
                left: `${activePercentX}%`,
                top: `${activePercentY}%`,
                transform: "translate(-50%, -135%)",
              }}
            >
              <div className="flex items-center gap-1.5 rounded-full border border-[#1f6f5b]/25 bg-white px-2.5 py-1 shadow-[0_4px_16px_rgba(20,75,63,0.18)]">
                <span className="text-sm leading-none">{activePt.emoji}</span>
                <span className="text-xs font-bold text-[#14221f]">
                  {km ? activePt.moodKm : activePt.moodEn}
                </span>
                <span className="text-[11px] font-extrabold text-[#1f6f5b]">
                  {activePt.score}
                </span>
              </div>
              {/* Tooltip little downward arrow */}
              <div className="-mt-1 size-2 rotate-45 border-b border-r border-[#1f6f5b]/25 bg-white shadow-2xs" />
            </div>

            {/* SVG Chart Canvas */}
            <svg
              className="h-32 sm:h-36 w-full overflow-visible"
              viewBox="0 0 350 100"
              preserveAspectRatio="none"
              aria-label="Interactive 7-day mood trend chart"
            >
              <defs>
                <linearGradient id="arom-chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f6f5b" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#1f6f5b" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="arom-chart-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2aa684" />
                  <stop offset="50%" stopColor="#1f6f5b" />
                  <stop offset="100%" stopColor="#3ec89e" />
                </linearGradient>
              </defs>

              {/* Gentle horizontal baseline guides */}
              <line x1="15" y1="20" x2="335" y2="20" stroke="#f0f5f2" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="15" y1="55" x2="335" y2="55" stroke="#f0f5f2" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="15" y1="85" x2="335" y2="85" stroke="#f0f5f2" strokeDasharray="3 3" strokeWidth="1" />

              {/* Area fill under curve */}
              <path
                d={getAreaPath(currentChart, 96)}
                fill="url(#arom-chart-fill)"
                className="transition-all duration-500 ease-out"
              />

              {/* Dynamic Vertical Tracking Guideline */}
              <line
                x1={activePt.x}
                y1="10"
                x2={activePt.x}
                y2="96"
                stroke="#1f6f5b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                strokeOpacity="0.45"
                className="transition-all duration-150 ease-out"
              />

              {/* Smooth dynamic calming line */}
              <path
                d={getSvgPath(currentChart)}
                fill="none"
                stroke="url(#arom-chart-stroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />

              {/* 7 Interactive Data Points */}
              {currentChart.map((pt, i) => {
                const isActive = chartActiveIndex === i;
                return (
                  <g key={pt.dayEn} className="cursor-pointer">
                    {/* Active pulse aura */}
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="14"
                        fill="#1f6f5b"
                        fillOpacity="0.14"
                        className="animate-pulse"
                      />
                    )}

                    {/* Point Outer Ring */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? "7.5" : "4.5"}
                      fill="#ffffff"
                      stroke="#1f6f5b"
                      strokeWidth={isActive ? "3.2" : "2.5"}
                      className="transition-all duration-200"
                    />

                    {/* Active Center Dot */}
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#1f6f5b"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Transparent Touch & Scrub Overlay (7 Columns) */}
            <div className="absolute inset-0 grid grid-cols-7 z-10">
              {currentChart.map((pt, i) => (
                <div
                  key={pt.dayEn}
                  onMouseEnter={() => setChartActiveIndex(i)}
                  onTouchStart={() => setChartActiveIndex(i)}
                  onClick={() => setChartActiveIndex(i)}
                  className="h-full cursor-pointer hover:bg-[#1f6f5b]/5 transition-colors rounded-xl"
                  title={`${pt.dayEn}: ${pt.score} / 10`}
                />
              ))}
            </div>

            {/* X-Axis Interactive Day Buttons */}
            <div className="mt-3 grid grid-cols-7 text-center">
              {currentChart.map((d, i) => {
                const isActive = chartActiveIndex === i;
                return (
                  <button
                    key={d.dayEn}
                    type="button"
                    onClick={() => setChartActiveIndex(i)}
                    className={`flex flex-col items-center py-1.5 px-1 rounded-xl transition-all ${
                      isActive
                        ? "bg-[#eaf5f1] text-[#1f6f5b] font-bold ring-1 ring-[#1f6f5b]/30 shadow-2xs"
                        : "text-[#6b7280] hover:text-[#111827] hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs">
                      {km ? d.shortKm : d.shortEn}
                    </span>
                    {isActive ? (
                      <span className="size-1 rounded-full bg-[#1f6f5b] mt-0.5" />
                    ) : (
                      <span className="size-1 rounded-full bg-transparent mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Reactive Score & Context Below Graph */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-[#f0f5f2] pt-3.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14221f] transition-all">
                {activePt.score}
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#6b7280]">
                / 10
              </span>
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[#e3f4ef] px-2.5 py-0.5 text-xs font-bold text-[#1f6f5b]">
                <TrendingUp size={12} />
                <span>{km ? activePt.deltaKm : activePt.deltaEn}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#4b5563]">
              <span className="font-bold text-[#14221f]">
                {km ? activePt.dayKm : activePt.dayEn}
                {activePt.isToday ? (km ? " (ថ្ងៃនេះ)" : " (Today)") : ""}:
              </span>
              <span className="truncate">
                {km ? activePt.feelingKm : activePt.feelingEn}
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. QUICK STATISTICS ================= */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* 1. Mood Check-ins */}
          <div className="flex flex-col justify-between rounded-[20px] border border-[#e8f2ee] bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-[#6b7280]">
                {km ? "ពិនិត្យអារម្មណ៍ (Daily Check-ins)" : "Daily check-ins"}
              </span>
              <div className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-[#eaf5f1] text-[#1f6f5b]">
                <Smile size={14} />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-base sm:text-lg font-bold text-[#14221f]">
                6 <span className="text-xs font-normal text-[#6b7280]">/ 7 {km ? "ថ្ងៃ" : "days"}</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f5f2]">
                <div className="h-full rounded-full bg-[#1f6f5b]" style={{ width: "85%" }} />
              </div>
            </div>
          </div>

          {/* 2. Goals */}
          <div className="flex flex-col justify-between rounded-[20px] border border-[#e8f2ee] bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-[#6b7280]">
                {km ? "សម្រេចបាន (Completed)" : "Completed"}
              </span>
              <div className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-[#fcedd7] text-[#d97706]">
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-base sm:text-lg font-bold text-[#14221f]">
                8 <span className="text-xs font-normal text-[#6b7280]">/ 10</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f5f2]">
                <div className="h-full rounded-full bg-[#d97706]" style={{ width: "80%" }} />
              </div>
            </div>
          </div>

          {/* 3. MindGuide */}
          <div className="flex flex-col justify-between rounded-[20px] border border-[#e8f2ee] bg-white p-3.5 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-[#6b7280] truncate">
                {km ? "មេរៀនចិត្ត (MindGuide)" : "MindGuide"}
              </span>
              <div className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-[#e8edfa] text-[#2563eb]">
                <BookOpen size={14} />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-base sm:text-lg font-bold text-[#14221f]">
                12
              </p>
              <p className="text-[10px] text-[#6b7280] truncate">
                {km ? "សកម្មភាពរួចរាល់" : "Activities done"}
              </p>
            </div>
          </div>
        </div>

        {/* ================= 4. WEEKLY JOURNEY ================= */}
        <div className="rounded-[22px] border border-[#e8f2ee] bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#14221f]">
              {km ? "សប្តាហ៍នេះ" : "This Week"}
            </h3>
            <span className="text-xs text-[#6b7280]">
              {km ? "ចុចលើថ្ងៃនីមួយៗដើម្បីមើលកំណត់ត្រាអារម្មណ៍" : "Tap a day to view mood"}
            </span>
          </div>

          {/* 7 circles with mood indicator */}
          <div className="mt-3.5 grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={day.dayEn}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex flex-col items-center gap-1 rounded-2xl py-2 px-1 transition-all focus-visible:outline-2 focus-visible:outline-[#1f6f5b] ${
                    isSelected
                      ? "bg-[#eaf5f1] ring-2 ring-[#1f6f5b] shadow-xs"
                      : "hover:bg-[#f7faf9]"
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold ${
                      day.isToday ? "text-[#1f6f5b]" : "text-[#6b7280]"
                    }`}
                  >
                    {km ? day.shortKm : day.shortEn}
                  </span>

                  <div
                    className={`flex size-8 sm:size-9 items-center justify-center rounded-full text-base sm:text-lg transition-transform ${
                      day.isToday
                        ? "bg-[#d8f0e6] ring-2 ring-[#1f6f5b]/40 shadow-xs scale-105"
                        : day.isFuture
                        ? "bg-gray-100 text-gray-400 text-sm"
                        : "bg-[#f4faf7]"
                    }`}
                  >
                    {day.emoji}
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] ${
                      day.isToday ? "font-bold text-[#1f6f5b]" : "text-[#6b7280]"
                    }`}
                  >
                    {day.isToday ? (km ? "ថ្ងៃនេះ" : "Today") : day.moodNameEn === "Upcoming" ? (km ? "ស្អែក" : "Pending") : day.moodNameEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected day mini inspection note */}
          <div className="mt-3 rounded-xl bg-[#f7faf9] border border-[#e8f2ee] p-3 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedDay.emoji}</span>
              <div>
                <span className="font-bold text-[#14221f]">
                  {km ? selectedDay.dayKm : selectedDay.dayEn} ({selectedDay.time}):
                </span>{" "}
                <span className="text-[#4b5563]">
                  {km ? selectedDay.noteKm : selectedDay.noteEn}
                </span>
              </div>
            </div>
            {!selectedDay.isFuture && (
              <span className="shrink-0 rounded-md bg-[#e0f3ed] px-2 py-0.5 text-[10px] font-bold text-[#1f6f5b]">
                {selectedDay.score} / 10
              </span>
            )}
          </div>
        </div>

        {/* ================= 5. PROGRESS STREAK ================= */}
        <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[#fde8c5] bg-[#fffaf0] p-4 sm:p-4.5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fed7aa] text-[#d97706] shadow-sm">
              <Flame size={22} className="fill-[#d97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-[#14221f]">
                  {km ? "៦ ថ្ងៃជាប់គ្នា (6 Day Streak)" : "6 Day Streak"}
                </h4>
                <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-bold text-[#b45309]">
                  {km ? "គោលដៅ ៧ ថ្ងៃ (Goal)" : "Goal: 7 days"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#6b7280]">
                {km
                  ? "បន្តពិនិត្យអារម្មណ៍ជារៀងរាល់ថ្ងៃ ដើម្បីរក្សាភាពស្ងប់ស្ងាត់ផ្លូវចិត្ត។"
                  : "Keep checking in to continue your journey."}
              </p>
            </div>
          </div>

          {/* Streak mini progress bar */}
          <div className="hidden sm:flex flex-col items-end gap-1 w-24 shrink-0">
            <span className="text-[11px] font-bold text-[#b45309]">6 / 7</span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#fed7aa]">
              <div className="h-full rounded-full bg-[#d97706]" style={{ width: "85%" }} />
            </div>
          </div>
        </div>

        {/* ================= 6. RECOMMENDED NEXT STEP ================= */}
        <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[#d6ebe3] bg-[#f2faf7] p-4 sm:p-4.5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1f6f5b] text-white shadow-sm">
              <Wind size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f6f5b]">
                {km ? "ការអនុវត្តបន្ទាប់ (Next Step)" : "Your next step"}
              </span>
              <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#14221f]">
                {km
                  ? "សាកល្បងលំហាត់ដកដង្ហើមបន្ធូរអារម្មណ៍ ២ នាទី (Breathing)"
                  : "Try a 2-minute breathing exercise."}
              </p>
            </div>
          </div>

          <Link
            href="/practice"
            className="shrink-0 rounded-xl bg-[#1f6f5b] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#175646] active:scale-95"
          >
            {km ? "ចាប់ផ្តើម" : "Start"}
          </Link>
        </div>

        {/* ================= 7. FULL PROGRESS BUTTON ================= */}
        <button
          type="button"
          onClick={() => setIsFullDashboardOpen(true)}
          className="group flex w-full items-center justify-center gap-2 rounded-[20px] border border-[#1f6f5b]/30 bg-white py-3.5 text-sm font-bold text-[#1f6f5b] shadow-xs transition-all hover:bg-[#f0f9f6] hover:border-[#1f6f5b] active:scale-[0.99]"
        >
          <span>{km ? "មើលរបាយការណ៍ពេញលេញ (View Full Progress)" : "View Full Progress"}</span>
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </section>

      {/* ========================================================= */}
      {/* 8. COMPLETE FULL PROGRESS DASHBOARD MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isFullDashboardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#e2efe9] bg-[#f7faf9] p-5 sm:p-7 text-[#14221f] shadow-2xl"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-[#e5efe9] pb-4">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsFullDashboardOpen(false)}
                    className="flex size-9 items-center justify-center rounded-full text-[#1f6f5b] hover:bg-[#eaf5f1] transition-colors"
                    aria-label="Back"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#14221f]">
                      {km ? "ផ្ទាំងតាមដានការវិវឌ្ឍពេញលេញ (Full Progress)" : "Full Progress Dashboard"}
                    </h3>
                    <p className="text-xs text-[#6b7280]">
                      {km ? "ទិដ្ឋភាពទូទៅនៃសុខុមាលភាពផ្លូវចិត្ត និងការយល់ដឹងពីខ្លួនឯង" : "Holistic mental wellness journey & insights"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFullDashboardOpen(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body - 8 Comprehensive Sections */}
              <div className="mt-5 flex flex-col gap-5">
                {/* 1. Weekly Progress Summary */}
                <div className="rounded-[22px] border border-[#cce8dc] bg-gradient-to-br from-[#eaf6f2] to-[#f4fbf8] p-4.5 sm:p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-[#1f6f5b]">
                    <Compass size={17} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {km ? "ការសង្ខេបការវិវឌ្ឍប្រចាំសប្តាហ៍ (Weekly Summary)" : "Weekly Progress Summary"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#144b3e]">
                    {km
                      ? "«ក្នុងរយៈពេល ៧ ថ្ងៃនេះ អារម្មណ៍របស់អ្នកមានលំនឹង និងភាពស្ងប់ស្ងាត់ល្អគួរឱ្យកត់សម្គាល់ (+១២%)។ ការអនុវត្តលំហាត់ដកដង្ហើម និងការឆ្លុះបញ្ចាំងអារម្មណ៍ពេលព្រឹក ជួយកាត់បន្ថយភាពតានតឹង (Stress) បានយ៉ាងមានប្រសិទ្ធភាព។ អ្នកកំពុងដើរលើផ្លូវដ៏ល្អប្រសើរ!»"
                      : "“Over the past 7 days, your emotional rhythm has shown remarkable consistency (+12% stability). Regular guided pauses and morning reflections contributed to lower midday stress. You are building durable calm.”"}
                  </p>
                </div>

                {/* 2. Mood Trends & Emotional Patterns */}
                <div className="rounded-[22px] border border-[#e5efe9] bg-white p-4.5 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#14221f]">
                      {km ? "និន្នាការ និងទម្រង់អារម្មណ៍ (Mood Trends)" : "Mood Trends & Emotional Patterns"}
                    </h4>
                    <span className="text-xs font-semibold text-[#1f6f5b]">
                      72% Positive
                    </span>
                  </div>

                  {/* Horizontal spectrum */}
                  <div className="mt-3 flex h-3.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div title="Great (43%)" className="h-full bg-[#1f6f5b]" style={{ width: "43%" }} />
                    <div title="Good (29%)" className="h-full bg-[#3ea285]" style={{ width: "29%" }} />
                    <div title="Calm (14%)" className="h-full bg-[#83cfb9]" style={{ width: "14%" }} />
                    <div title="Restless (14%)" className="h-full bg-[#d0e2db]" style={{ width: "14%" }} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#4b5563]">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#1f6f5b]" />
                      <span>{km ? "រីករាយ (Great): ៣ ថ្ងៃ (៤៣%)" : "Great: 3 days (43%)"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#3ea285]" />
                      <span>{km ? "ស្រួលចិត្ត (Good): ២ ថ្ងៃ (២៩%)" : "Good: 2 days (29%)"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#83cfb9]" />
                      <span>{km ? "ស្ងប់ចិត្ត (Calm): ១ ថ្ងៃ (១៤%)" : "Calm: 1 day (14%)"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#d0e2db]" />
                      <span>{km ? "តានតឹង (Restless): ១ ថ្ងៃ (១៤%)" : "Restless: 1 day (14%)"}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Symptom & Assessment Trends (Non-Clinical Wellness) */}
                <div className="rounded-[22px] border border-[#e5efe9] bg-white p-4.5 sm:p-5 shadow-sm">
                  <h4 className="text-sm font-bold text-[#14221f]">
                    {km ? "សូចនាករសុខុមាលភាពប្រចាំសប្តាហ៍ (Wellness Indicators)" : "Wellness & Balance Indicators"}
                  </h4>
                  <p className="mt-0.5 text-xs text-[#6b7280]">
                    {km ? "ការវាយតម្លៃថាមពល និងការសម្រាក" : "Non-clinical wellness and energy indicators"}
                  </p>

                  <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-[#f7faf9] border border-[#e8f2ee] p-3 text-center">
                      <span className="text-[11px] font-medium text-[#6b7280]">{km ? "ដំណេក (Sleep Rest)" : "Sleep Rest"}</span>
                      <p className="text-base font-bold text-[#14221f] mt-1">7.8 / 10</p>
                      <span className="text-[10px] text-[#1f6f5b] font-semibold">{km ? "ស្រស់ស្រាយ" : "Uplifted"}</span>
                    </div>

                    <div className="rounded-xl bg-[#f7faf9] border border-[#e8f2ee] p-3 text-center">
                      <span className="text-[11px] font-medium text-[#6b7280]">{km ? "លំនឹងស្ត្រេស (Stress Balance)" : "Stress Balance"}</span>
                      <p className="text-base font-bold text-[#14221f] mt-1">6.9 / 10</p>
                      <span className="text-[10px] text-[#1f6f5b] font-semibold">{km ? "មានលំនឹង" : "Balanced"}</span>
                    </div>

                    <div className="rounded-xl bg-[#f7faf9] border border-[#e8f2ee] p-3 text-center">
                      <span className="text-[11px] font-medium text-[#6b7280]">{km ? "កម្រិតថាមពល (Daily Energy)" : "Daily Energy"}</span>
                      <p className="text-base font-bold text-[#14221f] mt-1">8.2 / 10</p>
                      <span className="text-[10px] text-[#1f6f5b] font-semibold">{km ? "រឹងមាំ" : "Strong"}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Goals, MindGuide & Therapy Progress */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* MindGuide & Goals */}
                  <div className="rounded-[22px] border border-[#e5efe9] bg-white p-4.5 shadow-sm">
                    <h4 className="text-sm font-bold text-[#14221f]">
                      {km ? "មេរៀនចិត្ត និងគោលដៅ (MindGuide & Goals)" : "MindGuide & Goals"}
                    </h4>
                    <ul className="mt-3 space-y-2 text-xs">
                      <li className="flex items-center justify-between">
                        <span className="text-[#4b5563]">{km ? "មេរៀន 'ស្វែងយល់ការថប់បារម្ភ (Anxiety)'" : "Lesson: Understanding Anxiety"}</span>
                        <span className="font-bold text-[#1f6f5b]">100%</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-[#4b5563]">{km ? "លំហាត់ដកដង្ហើម ៤-៧-៨ (Breathing)" : "Practice: 4-7-8 Breathing"}</span>
                        <span className="font-bold text-[#1f6f5b]">3 / 4</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-[#4b5563]">{km ? "កំណត់ត្រាដឹងគុណ (Gratitude Journal)" : "Gratitude Journaling"}</span>
                        <span className="font-bold text-[#1f6f5b]">{journalEntriesCount} / 7</span>
                      </li>
                    </ul>
                  </div>

                  {/* Therapy & Consultations */}
                  <div className="rounded-[22px] border border-[#e5efe9] bg-white p-4.5 shadow-sm">
                    <h4 className="text-sm font-bold text-[#14221f]">
                      {km ? "ការពិគ្រោះយោបល់វិជ្ជាជីវៈ (Therapy & Support)" : "Therapy & Support"}
                    </h4>
                    <p className="mt-1 text-xs text-[#6b7280]">
                      {km
                        ? "អ្នកមានការណាត់ជួបពិគ្រោះយោបល់បន្ទាប់ជាមួយអ្នកជំនាញ (Counselor) នៅថ្ងៃច័ន្ទក្រោយ។"
                        : "Next consultation session ready with Licensed Counselor."}
                    </p>
                    <div className="mt-3 rounded-xl bg-[#eaf5f1] p-3 text-xs text-[#1b5e4c]">
                      <span className="font-bold">{km ? "ប្រធានបទសំខាន់ (Focus Area)៖" : "Focus area:"} </span>
                      <span>{km ? "លំនឹងការងារ និងជីវិត ព្រមទាំងដំណេក (Work-Life Balance & Sleep)" : "Work-life balance & healthy sleep rhythm"}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Recommended Next Steps in Modal */}
                <div className="rounded-[22px] border border-[#d6ebe3] bg-[#f0f9f6] p-4.5 sm:p-5">
                  <div className="flex items-center gap-2 text-[#1f6f5b]">
                    <Lightbulb size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {km ? "អនុសាសន៍ណែនាំសម្រាប់អ្នក (Next Steps)" : "Recommended Next Steps"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href="/practice"
                      className="rounded-xl bg-white border border-[#cce8dc] px-3.5 py-2 text-xs font-semibold text-[#1f6f5b] shadow-xs hover:bg-[#e0f3ed]"
                    >
                      🧘 {km ? "ដកដង្ហើម ២ នាទី (Breathing)" : "2-Min Breathing Session"}
                    </Link>
                    <Link
                      href="/detection/journal"
                      className="rounded-xl bg-white border border-[#cce8dc] px-3.5 py-2 text-xs font-semibold text-[#1f6f5b] shadow-xs hover:bg-[#e0f3ed]"
                    >
                      ✍️ {km ? "កត់ត្រាអារម្មណ៍ពេលល្ងាច (Journal)" : "Evening Reflection"}
                    </Link>
                    <Link
                      href="/community"
                      className="rounded-xl bg-white border border-[#cce8dc] px-3.5 py-2 text-xs font-semibold text-[#1f6f5b] shadow-xs hover:bg-[#e0f3ed]"
                    >
                      🤝 {km ? "ចូលរួមសហគមន៍ (Community)" : "Peer Community Group"}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Close Footer Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsFullDashboardOpen(false)}
                  className="rounded-xl bg-[#1f6f5b] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#175646] active:scale-95"
                >
                  {km ? "រួចរាល់ (Done)" : "Done"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
