"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Mic,
  MicOff,
  Plus,
  ShieldCheck,
  X,
  Calendar,
  Trash2,
  Check,
  MessageSquarePlus,
  Languages,
  Activity,
  Award,
  Cloud,
  CloudRain,
  Flame,
  Heart,
  Leaf,
  Moon,
  Smile,
  Sprout,
  UserRound,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { MOOD_LABELS, useMoodStore, type MoodLevel } from "../../_components/mood/mood-store";
import { MoodSprout } from "../../_components/mood/mood-sprout";
import { JournalWeekSummary } from "../../_components/journal/journal-week-summary";
import { DesktopNavigation } from "../../_components/app-navigation";
import { BottomNav } from "../../components/bottom-nav";
import { TopHeader } from "../../components/top-header";
import { useLanguage } from "../../_components/language-provider";
import { useConfirm } from "../../_components/confirm-dialog";
import {
  JOURNAL_MOODS,
  JOURNAL_MOOD_LEVEL,
  MOOD_LEVEL_JOURNAL,
  type JournalEntryDto,
  type JournalListResponse,
  type JournalMood,
  type JournalPrompt,
} from "@/lib/journal";
import { cambodiaDay } from "@/lib/mood";

type ViewMode = "entry" | "saved" | "history";

export type JournalQuestionAnswer = {
  id: string;
  question: string;
  kmQuestion: string;
  answer: string;
};

type JournalEntry = {
  id: string;
  date: string;
  mood: string;
  tags: string[];
  content: string;
  createdAt: string;
  questions?: JournalQuestionAnswer[];
  additionalNotes?: string;
};

export type JournalQuestionItem = {
  id: string;
  labelEn: string;
  labelKm: string;
  placeholderEn: string;
  placeholderKm: string;
  answer: string;
  isRemovable: boolean;
};

const DEFAULT_QUESTIONS: JournalQuestionItem[] = [
  {
    id: "q_happy",
    labelEn: "What made you happy today?",
    labelKm: "អ្វីដែលធ្វើឱ្យអ្នកសប្បាយចិត្តថ្ងៃនេះ (Positive Moments)",
    placeholderEn: "e.g. A friend smiled at me, had good lunch",
    placeholderKm: "ឧ. មិត្តភក្តិញញឹមដាក់ ឬបានញ៉ាំអាហារឆ្ងាញ់",
    answer: "",
    isRemovable: false,
  },
  {
    id: "q_difficult",
    labelEn: "What was challenging or difficult?",
    labelKm: "អ្វីដែលជាឧបសគ្គ ឬពិបាកចិត្ត (Challenges)",
    placeholderEn: "e.g. Study pressure, unexpected delays",
    placeholderKm: "ឧ. សម្ពាធរៀនសូត្រ ឬការងារដែលត្រូវប្រគល់បន្ទាន់",
    answer: "",
    isRemovable: false,
  },
];

const PRESET_ADDITIONAL_QUESTIONS = [
  {
    id: "preset_grateful",
    labelEn: "What are you grateful for today?",
    labelKm: "អ្វីដែលអ្នកដឹងគុណថ្ងៃនេះ (Gratitude)",
    placeholderEn: "e.g. Family, good health, peaceful morning",
    placeholderKm: "ឧ. គ្រួសារមានសុខភាពល្អ និងពេលព្រឹកស្ងប់ស្ងាត់",
    sampleKm: "ដឹងគុណដែលមានគ្រួសារ និងមិត្តភក្តិនៅក្បែរជួយលើកទឹកចិត្ត",
    sampleEn: "Grateful for supportive friends and good health today",
  },
  {
    id: "preset_calm",
    labelEn: "What helped you feel calm or grounded?",
    labelKm: "អ្វីដែលជួយឱ្យអ្នកស្ងប់ចិត្ត (Calm & Grounding)",
    placeholderEn: "e.g. Took deep breaths, listened to calm music",
    placeholderKm: "ឧ. ដកដង្ហើមវែងៗ ឬស្តាប់បទភ្លេងស្រាលៗ",
    sampleKm: "បានដកដង្ហើមវែងៗ ៥ នាទី និងដើរលំហែកាយ",
    sampleEn: "Took 5 minutes of deep breathing and listened to peaceful sounds",
  },
  {
    id: "preset_learned",
    labelEn: "What did you learn about yourself today?",
    labelKm: "អ្វីដែលអ្នកបានរៀនដឹងពីខ្លួនឯង (Self-Discovery)",
    placeholderEn: "e.g. Handled an argument patiently",
    placeholderKm: "ឧ. ខ្ញុំអាចរក្សាភាពស្ងប់ស្ងាត់បានល្អពេលជួបបញ្ហា",
    sampleKm: "ខ្ញុំអាចអត់ធ្មត់ និងយល់ចិត្តខ្លួនឯងបានប្រសើរជាងមុន",
    sampleEn: "I learned I can handle stressful moments with patience",
  },
  {
    id: "preset_tomorrow",
    labelEn: "A small positive intention for tomorrow",
    labelKm: "បំណងប្រាថ្នាតូចមួយសម្រាប់ថ្ងៃស្អែក (Tomorrow's Intention)",
    placeholderEn: "e.g. Sleep 8 hours, go for a short walk",
    placeholderKm: "ឧ. ចូលគេងឱ្យបានលឿន និងផឹកទឹកឱ្យបានច្រើន",
    sampleKm: "សម្រាកឱ្យបានគ្រប់គ្រាន់ និងរក្សាភាពវិជ្ជមាន",
    sampleEn: "Rest well and stay focused on what I can control",
  },
];

type MoodOption = {
  // The value saved with an entry. Never change it: old entries use it.
  en: JournalMood;
  level: MoodLevel;
};

// Shown with the same sprouts and names as the Home check in (MOOD_LABELS).
const MOODS: MoodOption[] = JOURNAL_MOODS.map((en) => ({ en, level: JOURNAL_MOOD_LEVEL[en] }));

type EmotionOption = {
  en: string;
  km: string;
  emoji: string;
  category: "positive" | "reflective";
};

const EMOTIONS: EmotionOption[] = [
  // Positive & Uplifting
  { en: "Happy", km: "រីករាយ (Happy)", emoji: "😊", category: "positive" },
  { en: "Grateful", km: "ដឹងគុណ (Grateful)", emoji: "🌻", category: "positive" },
  { en: "Calm", km: "ស្ងប់ស្ងាត់ (Calm)", emoji: "🌿", category: "positive" },
  { en: "Proud", km: "មានមោទនភាព (Proud)", emoji: "⭐", category: "positive" },
  { en: "Hopeful", km: "មានសង្ឃឹម (Hopeful)", emoji: "🌱", category: "positive" },
  { en: "Energetic", km: "មានថាមពល (Energetic)", emoji: "⚡", category: "positive" },
  { en: "Relaxed", km: "ធូរស្រាល (Relaxed)", emoji: "🕊️", category: "positive" },
  // Reflective & Challenging
  { en: "Tired", km: "អស់កម្លាំង (Tired)", emoji: "😴", category: "reflective" },
  { en: "Stressed", km: "តានតឹង (Stressed)", emoji: "🌪️", category: "reflective" },
  { en: "Anxious", km: "ថប់បារម្ភ (Anxious)", emoji: "💭", category: "reflective" },
  { en: "Sad", km: "កើតទុក្ខ (Sad)", emoji: "🌧️", category: "reflective" },
  { en: "Overwhelmed", km: "លើសលប់ (Overwhelmed)", emoji: "🌊", category: "reflective" },
  { en: "Lonely", km: "ឯកោ (Lonely)", emoji: "🥀", category: "reflective" },
  { en: "Angry", km: "ខឹង (Angry)", emoji: "🔥", category: "reflective" },
];

const EMOTION_ICONS: Record<string, LucideIcon> = {
  Happy: Smile,
  Grateful: Heart,
  Calm: Leaf,
  Proud: Award,
  Hopeful: Sprout,
  Energetic: Zap,
  Relaxed: Wind,
  Tired: Moon,
  Stressed: Activity,
  Anxious: Cloud,
  Sad: CloudRain,
  Overwhelmed: Waves,
  Lonely: UserRound,
  Angry: Flame,
};

function journalMoodFor(mood: MoodLevel): string {
  return MOOD_LEVEL_JOURNAL[mood];
}

// The server keeps entries (BACKEND-HANDOFF.md section 22), owner only.
function fromDto(entry: JournalEntryDto): JournalEntry {
  return {
    id: entry.id,
    date: entry.day,
    mood: entry.mood,
    tags: entry.emotions,
    content: entry.content,
    createdAt: entry.day,
    questions: entry.questions,
    additionalNotes: entry.additionalNotes,
  };
}

function journalDayLabel(day: string, km: boolean) {
  if (day === cambodiaDay(Date.now())) return km ? "ថ្ងៃនេះ" : "Today";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;
  return new Intl.DateTimeFormat(km ? "km-KH" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

const isJournalMood = (value: string): value is JournalMood => (JOURNAL_MOODS as readonly string[]).includes(value);

type JournalLoad =
  | { status: "ready"; entries: JournalEntry[] }
  | { status: "signed_out" | "error" };

async function fetchJournal(): Promise<JournalLoad> {
  try {
    const response = await fetch("/api/journal", { cache: "no-store" });
    if (response.status === 401) return { status: "signed_out" };
    const data = (await response.json().catch(() => null)) as JournalListResponse | null;
    if (!response.ok || !data) return { status: "error" };
    return { status: "ready", entries: data.entries.map(fromDto) };
  } catch {
    return { status: "error" };
  }
}

// The guided questions admins set in /admin/journal-prompts, in their order.
// Null means they could not be loaded, so the page keeps DEFAULT_QUESTIONS.
async function fetchPromptQuestions(): Promise<JournalQuestionItem[] | null> {
  try {
    const response = await fetch("/api/journal-prompts", { cache: "no-store" });
    const data = (await response.json().catch(() => null)) as { prompts?: JournalPrompt[] } | null;
    if (!response.ok || !data?.prompts) return null;
    return data.prompts.map((prompt) => ({
      id: prompt.id,
      labelEn: prompt.question,
      labelKm: prompt.kmQuestion,
      placeholderEn: prompt.placeholder,
      placeholderKm: prompt.kmPlaceholder,
      answer: "",
      isRemovable: false,
    }));
  } catch {
    return null;
  }
}

// Older versions kept the journal in this browser.
const OLD_JOURNAL_KEY = "arom_journal_entries";

function getDefaultEmotionsForMood(mood: string): string[] {
  if (mood === "Great") return ["Happy", "Grateful", "Energetic"];
  if (mood === "Good") return ["Calm", "Happy", "Proud"];
  if (mood === "Okay") return ["Calm", "Relaxed"];
  if (mood === "Not Good") return ["Tired"];
  if (mood === "Very difficult") return ["Stressed", "Overwhelmed"];
  return ["Calm", "Happy"];
}

function getStarterReflectionForMood(mood: string, km: boolean): string {
  switch (mood) {
    case "Great":
      return km
        ? "ថ្ងៃនេះពិតជាអស្ចារ្យណាស់! ខ្ញុំមានថាមពល បានបំពេញការងារដោយជោគជ័យ និងមានពេលវេលាដ៏មានន័យ។ ខ្ញុំមានអារម្មណ៍ដឹងគុណ និងរីករាយជាខ្លាំង។"
        : "Today was wonderful! I felt energized, accomplished my goals, and enjoyed some great moments. Feeling grateful and happy.";
    case "Good":
      return km
        ? "ថ្ងៃនេះជាថ្ងៃដ៏ល្អ និងមានផលិតភាព។ អ្វីៗដំណើរការយ៉ាងរលូន ហើយខ្ញុំមានអារម្មណ៍ស្ងប់ និងពេញចិត្តនឹងលទ្ធផល។"
        : "Had a good, productive day today! Things went smoothly, and I'm feeling peaceful, focused, and content.";
    case "Okay":
      return km
        ? "ថ្ងៃនេះធម្មតា និងមានសេចក្តីស្ងប់។ ខ្ញុំបានដោះស្រាយកិច្ចការប្រចាំថ្ងៃមួយជំហានម្តងៗ ហើយកំពុងរក្សាតុល្យភាពនៃចិត្ត។"
        : "Today was steady and calm. Handled my daily tasks at a steady pace and took time to keep myself balanced.";
    case "Not Good":
      return km
        ? "ថ្ងៃនេះមានអារម្មណ៍អស់កម្លាំងបន្តិច។ ខ្ញុំកំពុងឆ្លៀតពេលសម្រាក សម្រាលអារម្មណ៍ និងរំលឹកខ្លួនឯងថាការសម្រាកគឺជារឿងសំខាន់។"
        : "Felt a bit low on energy today. Giving myself permission to slow down, rest, and recharge tonight.";
    case "Very difficult":
      return km
        ? "ថ្ងៃនេះមានការលំបាក និងតានតឹងច្រើន។ ខ្ញុំកំពុងដកដង្ហើមវែងៗ បន្ថយល្បឿន និងដោះស្រាយម្តងមួយៗដោយការយល់ចិត្តខ្លួនឯង។"
        : "Today was quite challenging and overwhelming. I'm taking deep breaths, letting myself rest, and taking things one step at a time.";
    default:
      return km
        ? "ថ្ងៃនេះជាថ្ងៃដ៏ល្អ និងមានផលិតភាព។ អ្វីៗដំណើរការយ៉ាងរលូន ហើយខ្ញុំមានអារម្មណ៍ស្ងប់ និងពេញចិត្តនឹងលទ្ធផល។"
        : "Had a good, productive day today! Things went smoothly, and I'm feeling peaceful, focused, and content.";
  }
}

function getPlaceholderForMood(mood: string, km: boolean): string {
  switch (mood) {
    case "Great":
      return km
        ? "តើអ្វីដែលធ្វើឱ្យថ្ងៃនេះអស្ចារ្យយ៉ាងនេះ? សរសេរពីចំណុចល្អៗ ជោគជ័យ ឬអ្វីដែលធ្វើឱ្យអ្នកញញឹម..."
        : "What made today so wonderful? Write down your highlights, wins, or what made you smile...";
    case "Good":
      return km
        ? "តើមានអ្វីល្អកើតឡើងថ្ងៃនេះ? សរសេរអំពីអ្វីដែលអ្នកចូលចិត្ត ឬបានសម្រេច..."
        : "What went well today? Write about something you enjoyed or accomplished...";
    case "Okay":
      return km
        ? "តើថ្ងៃនេះដំណើរការយ៉ាងដូចម្តេច? សរសេរអ្វីដែលនៅក្នុងចិត្តរបស់អ្នក..."
        : "How did your day go? Write what's on your mind...";
    default:
      return km
        ? "តើអ្នកមានអារម្មណ៍យ៉ាងណាដែរថ្ងៃនេះ? ចែករំលែកគំនិតរបស់អ្នកដោយសេរី..."
        : "How are you feeling right now? It's safe to let your thoughts out here...";
  }
}

/**
 * Formats raw speech-to-text transcripts for natural Khmer and English orthography.
 * For Khmer: collapses artificial token spaces between adjacent Khmer words and transforms
 * western periods into authentic Khmer punctuation Khan (។). Preserves spaces around English words and numbers.
 */
function formatSpeechTranscript(raw: string, isKhmer: boolean): string {
  if (!raw) return "";

  if (isKhmer || /[\u1780-\u17FF]/.test(raw)) {
    let clean = raw;
    // 1. Remove artificial spaces between two Khmer characters
    // e.g. "ថ្ងៃ នេះ ខ្ញុំ មាន អារម្មណ៍ ចិត្ត" -> "ថ្ងៃនេះខ្ញុំមានអារម្មណ៍ចិត្ត"
    clean = clean.replace(/([\u1780-\u17FF])\s+(?=[\u1780-\u17FF])/g, "$1");

    // 2. Remove space before Khmer punctuation marks or signs
    clean = clean.replace(/\s+([\u17D4\u17D5\u17D6\u17D7\u17D8\u17D9\u17DA])/g, "$1");

    // 3. Convert western full stop following Khmer character to authentic Khmer Khan (។)
    clean = clean.replace(/([\u1780-\u17FF])\.\s*/g, "$1។ ");

    // 4. Clean up any trailing space before Khan
    clean = clean.replace(/\s+។/g, "។");

    // 5. Clean up duplicate spaces
    clean = clean.replace(/\s{2,}/g, " ");

    return clean.trim();
  }

  return raw.trim();
}

function JournalContent() {
  const router = useRouter();
  // Start from today's check in, loaded through the API. The mood is never
  // passed in the URL, because a URL ends up in browser history.
  const moodStore = useMoodStore();
  const initialMood = "Good";
  const moodTouched = useRef(false);

  const { language } = useLanguage();
  const km = language === "km";

  const [view, setView] = useState<ViewMode>("entry");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Form State initialized with URL query parameter
  const [selectedMood, setSelectedMood] = useState(initialMood);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(() =>
    getDefaultEmotionsForMood(initialMood)
  );

  useEffect(() => {
    if (moodTouched.current || !moodStore.today) return;
    const mood = journalMoodFor(moodStore.today);
    setSelectedMood(mood);
    setSelectedEmotions(getDefaultEmotionsForMood(mood));
  }, [moodStore.today]);

  // Guided Questions State with default Happy & Difficult questions (matching user design)
  const [questions, setQuestions] = useState<JournalQuestionItem[]>(DEFAULT_QUESTIONS);
  const [promptQuestions, setPromptQuestions] = useState<JournalQuestionItem[]>(DEFAULT_QUESTIONS);

  useEffect(() => {
    let active = true;
    void fetchPromptQuestions().then((list) => {
      if (!active || !list) return;
      setPromptQuestions(list);
      // Never replace questions someone has started answering.
      setQuestions((current) =>
        current.some((q) => q.answer.trim()) ? current : [...list, ...current.filter((q) => q.isRemovable)],
      );
    });
    return () => {
      active = false;
    };
  }, []);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Speech to Text (Voice Recording) State & Controls
  const [speechLang, setSpeechLang] = useState<"km" | "en">(language === "km" ? "km" : "en");
  const [recordingFieldId, setRecordingFieldId] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recognitionRef = useRef<{ stop: () => void; abort?: () => void } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const baseTextRef = useRef<string>("");
  const accumulatedTranscriptRef = useRef<string>("");

  useEffect(() => {
    setSpeechLang(language === "km" ? "km" : "en");
  }, [language]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Saved Entry & List State with lazy local storage hydration
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [journalStatus, setJournalStatus] = useState<"loading" | "ready" | "signed_out" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<"" | "signed_out" | "failed">("");
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [selectedDetailEntry, setSelectedDetailEntry] = useState<JournalEntry | null>(null);

  function applyJournal(result: JournalLoad) {
    if (result.status === "ready") setEntries(result.entries);
    setJournalStatus(result.status);
  }

  async function loadJournal() {
    applyJournal(await fetchJournal());
  }

  useEffect(() => {
    let active = true;
    void fetchJournal().then((result) => {
      if (active) applyJournal(result);
    });
    return () => {
      active = false;
    };
  }, []);

  // Entries an older version saved in this browser. They may belong to someone
  // else who used this device, so ask before moving them into this account.
  const askedAboutOldEntries = useRef(false);
  useEffect(() => {
    if (journalStatus !== "ready" || askedAboutOldEntries.current) return;
    askedAboutOldEntries.current = true;
    let old: JournalEntry[] = [];
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(OLD_JOURNAL_KEY) ?? "[]");
      if (Array.isArray(parsed)) {
        old = (parsed as JournalEntry[]).filter((entry) => typeof entry?.id === "string" && !entry.id.startsWith("figma-"));
      }
    } catch {
      return;
    }
    if (old.length === 0) return;
    void (async () => {
      const move = await confirm({
        title: km ? "ផ្លាស់ទីកំណត់ត្រាចាស់?" : "Move older entries to your account?",
        message: km
          ? `មានកំណត់ត្រា ${old.length} ដែលបានរក្សាទុកតែលើឧបករណ៍នេះ។ ផ្លាស់ទីវាទៅគណនីរបស់អ្នក ប្រសិនបើអ្នកជាអ្នកសរសេរវា។`
          : `${old.length} journal ${old.length === 1 ? "entry was" : "entries were"} saved only on this device. Move them to your account if you wrote them.`,
        confirmLabel: km ? "ផ្លាស់ទី" : "Move to my account",
        cancelLabel: km ? "មិនមែនពេលនេះ" : "Not now",
      });
      if (!move) return;
      const today = cambodiaDay(Date.now());
      const results = await Promise.all(
        old.map((entry) =>
          fetch("/api/journal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mood: isJournalMood(entry.mood) ? entry.mood : "Okay",
              emotions: (entry.tags ?? []).slice(0, 20),
              content: (entry.content || "").slice(0, 20000) || "No notes recorded.",
              questions: (entry.questions ?? []).slice(0, 20),
              additionalNotes: (entry.additionalNotes ?? "").slice(0, 5000),
              day: /^\d{4}-\d{2}-\d{2}$/.test(entry.createdAt) && entry.createdAt <= today ? entry.createdAt : today,
            }),
          }).then((response) => response.ok),
        ),
      );
      if (results.every(Boolean)) {
        try {
          localStorage.removeItem(OLD_JOURNAL_KEY);
        } catch {
          // Storage blocked: nothing more to clear.
        }
      }
      void loadJournal();
    })();
  }, [journalStatus, confirm, km]);

  const handleSelectMood = (moodName: string) => {
    moodTouched.current = true;
    setSelectedMood(moodName);
    setSelectedEmotions(getDefaultEmotionsForMood(moodName));
  };

  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  const handleQuestionAnswerChange = (id: string, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, answer: value } : q))
    );
  };

  const handleAddPresetQuestion = (preset: typeof PRESET_ADDITIONAL_QUESTIONS[number]) => {
    // Avoid duplicate
    if (questions.some((q) => q.labelKm === preset.labelKm || q.id === preset.id)) {
      setShowAddQuestionModal(false);
      return;
    }
    const newQuestion: JournalQuestionItem = {
      id: "q_" + Date.now(),
      labelEn: preset.labelEn,
      labelKm: preset.labelKm,
      placeholderEn: preset.placeholderEn,
      placeholderKm: preset.placeholderKm,
      answer: "",
      isRemovable: true,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setShowAddQuestionModal(false);
  };

  const handleAddCustomQuestion = () => {
    const trimmed = customQuestionInput.trim();
    if (!trimmed) return;
    const newQuestion: JournalQuestionItem = {
      id: "q_custom_" + Date.now(),
      labelEn: trimmed,
      labelKm: trimmed,
      placeholderEn: "Write or speak your reflection here...",
      placeholderKm: "សរសេរ ឬនិយាយចម្លើយរបស់អ្នកនៅទីនេះ...",
      answer: "",
      isRemovable: true,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setCustomQuestionInput("");
    setShowAddQuestionModal(false);
  };

  const handleRemoveQuestion = (id: string) => {
    if (recordingFieldId === id) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setRecordingFieldId(null);
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Bilingual Voice to Text (Speech Recognition) Engine
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setRecordingFieldId(null);
    setRecordingDuration(0);
  };

  // Saved with the entry as its input method. Audio itself is never kept.
  const usedVoice = useRef(false);

  const startRecording = (fieldId: string, targetLang?: "km" | "en") => {
    usedVoice.current = true;
    stopRecording();

    const activeLang = targetLang || speechLang;

    if (typeof window === "undefined") return;
    const windowObj = window as unknown as {
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        maxAlternatives: number;
        onstart: () => void;
        onresult: (e: {
          resultIndex: number;
          results: {
            length: number;
            [key: number]: {
              isFinal: boolean;
              [key: number]: { transcript: string };
            };
          };
        }) => void;
        onerror: (err: { error?: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        maxAlternatives: number;
        onstart: () => void;
        onresult: (e: {
          resultIndex: number;
          results: {
            length: number;
            [key: number]: {
              isFinal: boolean;
              [key: number]: { transcript: string };
            };
          };
        }) => void;
        onerror: (err: { error?: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
    };

    const SpeechRec = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceNotice(
        km
          ? "កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រមុខងារ Web Speech ទេ។ សូមប្រើ Google Chrome ឬ Microsoft Edge។"
          : "Your browser does not support Web Speech. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    // Set baseline text so newly spoken words append cleanly without duplicates
    if (fieldId === "additional_notes") {
      baseTextRef.current = additionalNotes.trim();
    } else {
      const q = questions.find((item) => item.id === fieldId);
      baseTextRef.current = q?.answer.trim() || "";
    }
    accumulatedTranscriptRef.current = "";

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLang === "km" ? "km-KH" : "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setRecordingFieldId(fieldId);
        setRecordingDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);

        setVoiceNotice(
          activeLang === "km"
            ? (km ? "កំពុងស្តាប់ជាភាសាខ្មែរ... សូមនិយាយ" : "Listening in Khmer... please speak")
            : (km ? "កំពុងស្តាប់ជាភាសាអង់គ្លេស... សូមនិយាយ" : "Listening in English... please speak")
        );
      };

      recognition.onresult = (event) => {
        let interimText = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || "";
          if (res.isFinal) {
            finalChunk += text;
          } else {
            interimText += text;
          }
        }

        if (finalChunk) {
          accumulatedTranscriptRef.current +=
            (accumulatedTranscriptRef.current ? " " : "") + finalChunk;
        }

        const rawSpoken = (accumulatedTranscriptRef.current + " " + interimText).trim();
        const formattedSpoken = formatSpeechTranscript(rawSpoken, activeLang === "km");

        const base = baseTextRef.current;
        let combined = formattedSpoken;
        if (base) {
          if (activeLang === "km" || /[\u1780-\u17FF]/.test(formattedSpoken)) {
            if (/[\u17D4\u17D5\u17D6!?.,]\s*$/.test(base) || /\s$/.test(base)) {
              combined = `${base.trim()} ${formattedSpoken}`;
            } else {
              combined = `${base} ${formattedSpoken}`;
            }
          } else {
            combined = `${base} ${formattedSpoken}`;
          }
        }

        if (fieldId === "additional_notes") {
          setAdditionalNotes(combined.slice(0, 500));
        } else {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === fieldId ? { ...q, answer: combined.slice(0, 300) } : q
            )
          );
        }
      };

      recognition.onerror = (event) => {
        const errType = event?.error;
        stopRecording();
        if (errType === "not-allowed" || errType === "permission-denied") {
          setVoiceNotice(
            km
              ? "ការអនុញ្ញាតមីក្រូហ្វូនត្រូវបានបដិសេធ។ សូមបើកសិទ្ធិមីក្រូហ្វូនក្នុងការកំណត់ Browser។"
              : "Microphone access was denied. Please allow microphone permissions in your browser settings."
          );
        } else if (errType === "no-speech") {
          setVoiceNotice(
            km
              ? "មិនបានឮសំឡេងទេ។ សូមព្យាយាមនិយាយម្តងទៀត។"
              : "No speech detected. Please speak closer to your microphone."
          );
        } else if (errType === "network") {
          setVoiceNotice(
            km
              ? "មានបញ្ហាតភ្ជាប់បណ្តាញក្នុងការបម្លែងសំឡេង។ សូមពិនិត្យអ៊ីនធឺណិត។"
              : "Network connection error with speech service. Please check your internet connection."
          );
        } else {
          setVoiceNotice(
            km
              ? "មិនអាចចាប់សំឡេងបានទេ។ សូមព្យាយាមម្តងទៀត។"
              : "Voice recognition encountered an issue. Please try again."
          );
        }
      };

      recognition.onend = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecordingFieldId((current) => (current === fieldId ? null : current));
        recognitionRef.current = null;

        // Final polish pass to guarantee authentic Khmer punctuation and spacing
        if (activeLang === "km") {
          if (fieldId === "additional_notes") {
            setAdditionalNotes((prev) => formatSpeechTranscript(prev, true));
          } else {
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === fieldId
                  ? { ...q, answer: formatSpeechTranscript(q.answer, true) }
                  : q
              )
            );
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      stopRecording();
      setVoiceNotice(
        km
          ? "មិនអាចបើកដំណើរការមីក្រូហ្វូនបានទេ។ សូមព្យាយាមម្តងទៀត។"
          : "Could not activate microphone. Please try again."
      );
    }
  };

  const handleToggleVoiceForField = (fieldId: string) => {
    if (recordingFieldId === fieldId) {
      stopRecording();
      setVoiceNotice(
        km ? "បានបញ្ចប់ការកត់ត្រាជាសំឡេង។" : "Voice recording completed."
      );
      setTimeout(() => setVoiceNotice(null), 3000);
    } else {
      startRecording(fieldId);
    }
  };

  const handleSwitchSpeechLang = (lang: "km" | "en") => {
    setSpeechLang(lang);
    if (recordingFieldId) {
      const activeField = recordingFieldId;
      stopRecording();
      setTimeout(() => {
        startRecording(activeField, lang);
      }, 150);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    const answeredQuestions = questions.filter((q) => q.answer.trim().length > 0);

    const formattedContent = [
      ...answeredQuestions.map((q) => `${km ? q.labelKm : q.labelEn}: ${q.answer.trim()}`),
      additionalNotes.trim()
        ? `${km ? "កំណត់ហេតុបន្ថែម" : "Additional Notes"}: ${additionalNotes.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const finalContent =
      formattedContent ||
      getStarterReflectionForMood(selectedMood, km) ||
      (km ? "គ្មានកំណត់ត្រា" : "No notes recorded.");

    const answers = answeredQuestions.map((q) => ({
      id: q.id,
      question: q.labelEn,
      kmQuestion: q.labelKm,
      answer: q.answer.trim(),
    }));

    setSaving(true);
    setSaveError("");
    let saved: JournalEntryDto | null = null;
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: isJournalMood(selectedMood) ? selectedMood : "Okay",
          emotions: selectedEmotions,
          content: finalContent,
          questions: answers,
          additionalNotes: additionalNotes.trim(),
          inputMethod: usedVoice.current ? "voice" : "text",
        }),
      });
      if (response.status === 401) {
        setSaveError("signed_out");
        return;
      }
      saved = response.ok ? ((await response.json().catch(() => null)) as JournalEntryDto | null) : null;
    } catch {
      saved = null;
    } finally {
      setSaving(false);
    }
    if (!saved) {
      setSaveError("failed");
      return;
    }

    const newEntry = fromDto(saved);
    setEntries((current) => [newEntry, ...current.filter((e) => e.id !== newEntry.id)]);
    setSavedEntry(newEntry);

    setView("saved");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEntry = async (id: string) => {
    const remove = await confirm({
      title: km ? "លុបកំណត់ត្រានេះ?" : "Delete this entry?",
      message: km ? "វានឹងត្រូវលុបជាអចិន្ត្រៃយ៍ ហើយមិនអាចយកមកវិញបានទេ។" : "It will be deleted for good and cannot be brought back.",
      confirmLabel: km ? "លុប" : "Delete",
      cancelLabel: km ? "បោះបង់" : "Cancel",
      tone: "danger",
    });
    if (!remove) return;
    const response = await fetch(`/api/journal/${id}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      setSaveError("failed");
      return;
    }
    setEntries((current) => current.filter((e) => e.id !== id));
    if (selectedDetailEntry?.id === id) {
      setSelectedDetailEntry(null);
    }
  };

  const getMoodLabel = (moodName: string) => {
    const found = MOODS.find((m) => m.en.toLowerCase() === moodName.toLowerCase());
    if (!found) return moodName;
    return km ? MOOD_LABELS[found.level].km : MOOD_LABELS[found.level].en;
  };

  return (
    <div className="min-h-screen bg-[#f7faf9] text-[#14221f] lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      {confirmDialog}
      {/* Desktop Sidebar Navigation */}
      <DesktopNavigation active="Detection" />

      {/* Main Content Area */}
      <div className="min-w-0 pb-28 sm:pb-32 lg:pb-12">
        <main className="mx-auto w-full max-w-[430px] px-5 pt-4 sm:px-6 md:max-w-xl lg:max-w-2xl lg:pt-8 xl:max-w-4xl">
          {/* Top Brand Header matching Figma */}
          <TopHeader />

          {/* ============================================================== */}
          {/* VIEW 1: Journal Entry Form (Figma Frame 77:120) */}
          {/* ============================================================== */}
          {view === "entry" && (
            <div className="mt-4 sm:mt-6 animate-in fade-in duration-200">
              {/* Top Navigation */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex size-11 items-center justify-center rounded-full text-[#165746] transition-colors hover:bg-[#e6f6f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b]"
                  aria-label={km ? "ត្រឡប់ក្រោយ" : "Back"}
                >
                  <ArrowLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => setView("history")}
                  className="inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold text-[#165746] transition-colors hover:bg-[#e6f6f1] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b] sm:text-sm"
                >
                  {km ? "មើលប្រវត្តិ (History)" : "View History"} ({entries.length})
                </button>
              </div>

              {/* Title */}
              <h1 className="mt-4 text-[26px] font-bold tracking-[-0.025em] text-[#14221f] sm:text-3xl">
                {km ? "តើអ្នកមានអារម្មណ៍យ៉ាងណាដែរថ្ងៃនេះ?" : "How are you feeling?"}
              </h1>

              {/* Section 1: Mood */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-[#34443f]">
                  {km ? "កម្រិតអារម្មណ៍ (Mood)" : "Mood"}
                </label>
                <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
                  {MOODS.map((m) => {
                    const isSelected = selectedMood === m.en;
                    return (
                      <button
                        key={m.en}
                        type="button"
                        onClick={() => handleSelectMood(m.en)}
                        className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b] sm:text-sm ${
                          isSelected
                            ? "border-[#1f6f5b] bg-[#e0f3ee] text-[#165746] font-semibold"
                            : "border-[#dcebe7] bg-white text-[#34443f] hover:border-[#a9c9bd] hover:bg-[#f0f8f6]"
                        }`}
                      >
                        <MoodSprout mood={m.level} className="h-8 w-auto" />
                        <span>{km ? MOOD_LABELS[m.level].km : MOOD_LABELS[m.level].en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: What’s coming up for you? */}
              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <label className="block text-sm font-semibold text-[#34443f]">
                    {km ? "តើអ្នកកំពុងមានអារម្មណ៍បែបណាខ្លះ? (Emotions)" : "What’s coming up for you?"}
                  </label>
                  <span className="rounded-full bg-[#e6f6f1] px-2.5 py-1 text-[11px] font-semibold text-[#165746]">
                    {km ? "អារម្មណ៍ និងការឆ្លុះបញ្ចាំង (Feelings & Reflection)" : "Feelings & reflection"}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2 sm:gap-2.5">
                  {EMOTIONS.map((e) => {
                    const isSelected = selectedEmotions.includes(e.en);
                    const EmotionIcon = EMOTION_ICONS[e.en];
                    return (
                      <button
                        key={e.en}
                        type="button"
                        onClick={() => toggleEmotion(e.en)}
                        className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b] sm:text-sm ${
                          isSelected
                            ? "border-[#1f6f5b] bg-[#e0f3ee] text-[#165746] font-semibold"
                            : "border-[#dcebe7] bg-white text-[#34443f] hover:border-[#a9c9bd] hover:bg-[#f0f8f6]"
                        }`}
                      >
                        <EmotionIcon
                          aria-hidden="true"
                          size={16}
                          strokeWidth={1.8}
                          className={isSelected ? "text-[#1f6f5b]" : "text-[#668d80]"}
                        />
                        <span>{km ? e.km : e.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Guided Reflection Questions & Global Voice Language Switcher */}
              <div className="mt-7">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-semibold text-[#34443f]">
                        {km ? "សំណួរឆ្លុះបញ្ចាំង និងកំណត់ត្រា (Guided Reflection)" : "Guided Reflection Questions"}
                      </label>
                      <span className="rounded-full bg-[#e6f6f1] px-2.5 py-1 text-[11px] font-semibold text-[#165746]">
                        {km ? "ឆ្លើយ ឬកត់ត្រាជាសំឡេង (Voice or Text)" : "Type or speak by voice"}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#667a75]">
                      {km
                        ? "ចុចរូបមេក្រូហ្វូននៅតាមសំណួរនីមួយៗ ដើម្បីនិយាយចម្លើយម្តងមួយៗដោយងាយស្រួល"
                        : "Tap the microphone on each question to speak your answers one by one."}
                    </p>
                  </div>

                  {/* Voice Language Switcher (Moved Up for Easy Access) */}
                  <div className="inline-flex w-full max-w-[280px] items-center gap-1 rounded-2xl border border-[#dcebe7] bg-[#f0f8f6] p-1 text-xs font-semibold sm:w-auto sm:max-w-none sm:self-auto sm:rounded-xl sm:bg-white sm:min-w-[360px]">
                    <div className="hidden items-center gap-1 pl-1 text-[#667a75] sm:flex">
                      <Languages size={14} className="text-[#1f6f5b]" />
                      <span className="hidden sm:inline text-[11px] font-medium text-gray-500">
                        {km ? "ភាសានិយាយ:" : "Voice:"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSwitchSpeechLang("km")}
                      aria-pressed={speechLang === "km"}
                      className={`flex min-h-10 min-w-0 flex-1 basis-0 items-center justify-center whitespace-nowrap rounded-xl px-1 text-[10px] transition-colors sm:px-2 sm:text-xs ${
                        speechLang === "km"
                          ? "bg-[#1f6f5b] text-white font-bold shadow-sm"
                          : "text-[#667a75] hover:bg-white/70 hover:text-[#165746]"
                      }`}
                    >
                      🇰🇭 ភាសាខ្មែរ (Khmer)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchSpeechLang("en")}
                      aria-pressed={speechLang === "en"}
                      className={`flex min-h-10 min-w-0 flex-1 basis-0 items-center justify-center whitespace-nowrap rounded-xl px-1 text-[10px] transition-colors sm:px-2 sm:text-xs ${
                        speechLang === "en"
                          ? "bg-[#1f6f5b] text-white font-bold shadow-sm"
                          : "text-[#667a75] hover:bg-white/70 hover:text-[#165746]"
                      }`}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>

                {/* Question Inputs Grid */}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {questions.map((q) => {
                    const isRecordingThis = recordingFieldId === q.id;
                    return (
                      <div
                        key={q.id}
                        className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 transition-colors duration-150 ${
                          isRecordingThis
                            ? "border-rose-400 ring-2 ring-rose-100"
                            : "border-[#dcebe7] focus-within:border-[#1f6f5b] focus-within:ring-2 focus-within:ring-[#1f6f5b]/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <label className="block text-xs font-semibold text-[#374151] sm:text-[13px]">
                            {km ? q.labelKm : q.labelEn}
                          </label>
                          {q.isRemovable && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id)}
                            className="inline-flex size-9 items-center justify-center rounded-full text-[#7a8984] transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
                              title={km ? "លុបសំណួរនេះ" : "Remove question"}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>

                        <div className="relative mt-2.5 flex items-center">
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => handleQuestionAnswerChange(q.id, e.target.value)}
                            placeholder={km ? q.placeholderKm : q.placeholderEn}
                            className="h-11 w-full rounded-xl border border-[#e3ece8] bg-[#f7faf9] pl-3 pr-11 text-sm text-[#14221f] outline-none transition-colors placeholder:text-[#81918b] focus:border-[#1f6f5b] focus:bg-white focus:ring-2 focus:ring-[#1f6f5b]/10"
                          />
                          <button
                            type="button"
                            onClick={() => handleToggleVoiceForField(q.id)}
                            title={
                              isRecordingThis
                                ? (km ? "បញ្ឈប់ការថតសំឡេង" : "Stop recording")
                                : (km ? "កត់ត្រាជាសំឡេងសម្រាប់សំណួរនេះ" : "Speak answer for this question")
                            }
                            className={`absolute right-1 flex size-10 items-center justify-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1f6f5b] ${
                              isRecordingThis
                                ? "bg-rose-500 text-white ring-2 ring-rose-200 animate-pulse"
                                : "text-[#1f6f5b] hover:bg-[#e0f3ee] active:scale-95"
                            }`}
                          >
                            {isRecordingThis ? <MicOff size={15} /> : <Mic size={15} />}
                          </button>
                        </div>

                        {/* Active listening indicator */}
                        {isRecordingThis && (
                          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-rose-600 animate-in fade-in">
                            <div className="flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
                              <span>
                                {speechLang === "km"
                                  ? (km ? "កំពុងស្តាប់ជាភាសាខ្មែរ... សូមនិយាយ" : "Listening in Khmer... speak now")
                                  : (km ? "កំពុងស្តាប់ជាភាសាអង់គ្លេស... សូមនិយាយ" : "Listening in English... speak now")}
                              </span>
                            </div>
                            <span className="font-mono text-rose-600 font-bold">
                              {formatDuration(recordingDuration)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* + Add a Question Button & Popover */}
                <div className="mt-3.5">
                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal((prev) => !prev)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-dashed border-[#9bbdb1] bg-white px-3.5 py-2 text-xs font-semibold text-[#165746] transition-colors hover:border-[#1f6f5b] hover:bg-[#f0f8f6] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b]"
                  >
                    <Plus size={15} />
                    <span>{km ? "បន្ថែមសំណួរឆ្លុះបញ្ចាំង (Add Question)" : "Add a Question"}</span>
                  </button>

                  {/* Add Question Popover / Presets */}
                  {showAddQuestionModal && (
                    <div className="mt-3 rounded-2xl border border-[#dcebe7] bg-[#f0f8f6] p-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#165746]">
                          {km ? "ជ្រើសរើសសំណួរគំរូ ឬសរសេរសំណួរផ្ទាល់ខ្លួន" : "Pick a prompt or write custom question"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddQuestionModal(false)}
                            className="inline-flex size-9 items-center justify-center rounded-full text-[#7a8984] transition-colors hover:bg-white hover:text-[#34443f] focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      {/* Preset Options */}
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {PRESET_ADDITIONAL_QUESTIONS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleAddPresetQuestion(preset)}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#dcebe7] bg-white px-3 py-1.5 text-xs font-medium text-[#34443f] transition-colors hover:border-[#a9c9bd] hover:bg-[#f0f8f6] hover:text-[#165746] focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
                          >
                            <Plus size={13} className="text-[#1f6f5b]" />
                            <span>{km ? preset.labelKm : preset.labelEn}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom Question Input */}
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={customQuestionInput}
                          onChange={(e) => setCustomQuestionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomQuestion();
                            }
                          }}
                          placeholder={km ? "សរសេរសំណួរផ្ទាល់ខ្លួនរបស់អ្នកនៅទីនេះ..." : "Write your custom question..."}
                          className="h-11 flex-1 rounded-xl border border-[#dcebe7] bg-white px-3 text-sm text-[#14221f] outline-none placeholder:text-[#81918b] focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#1f6f5b]/10"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomQuestion}
                          disabled={!customQuestionInput.trim()}
                          className="min-h-11 rounded-xl bg-[#1f6f5b] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#165746] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b] disabled:opacity-50"
                        >
                          {km ? "បញ្ចូល (Add)" : "Add"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Notes Textarea */}
                <div className="mt-5">
                  <div
                    className={`relative rounded-2xl border bg-white p-4 transition-colors ${
                      recordingFieldId === "additional_notes"
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-[#dcebe7] focus-within:border-[#1f6f5b] focus-within:ring-2 focus-within:ring-[#1f6f5b]/10"
                    }`}
                  >
                    <textarea
                      rows={3}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder={km ? "សរសេរកំណត់ហេតុបន្ថែមនៅទីនេះ..." : "Write additional notes here..."}
                      className="w-full resize-none bg-transparent text-sm leading-relaxed text-[#14221f] placeholder:text-[#81918b] focus:outline-none"
                    />
                    <div className="flex items-center justify-between border-t border-[#e7efec] pt-2 text-xs text-[#71827c]">
                      <span>
                        {recordingFieldId === "additional_notes" ? (
                          <span className="flex items-center gap-1.5 font-semibold text-rose-600 animate-in fade-in">
                            <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>
                              {speechLang === "km"
                                ? (km ? "កំពុងស្តាប់ជាភាសាខ្មែរ... សូមនិយាយ" : "Listening in Khmer... speak now")
                                : (km ? "កំពុងស្តាប់ជាភាសាអង់គ្លេស... សូមនិយាយ" : "Listening in English... speak now")}
                            </span>
                            <span className="font-mono text-rose-600 font-bold">
                              ({formatDuration(recordingDuration)})
                            </span>
                          </span>
                        ) : (
                          km ? "កំណត់ត្រាបន្ថែម (ស្រេចចិត្ត) (Additional Notes)" : "Additional notes (optional)"
                        )}
                      </span>
                      <span>{additionalNotes.length}/500</span>
                    </div>
                  </div>

                  {/* Section 4: Record with voice Button */}
                  <div className="mt-3.5 sm:mt-4">
                    <button
                      type="button"
                      onClick={() => handleToggleVoiceForField("additional_notes")}
                      className={`flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl border px-4 py-3.5 font-medium transition-colors duration-150 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b] ${
                        recordingFieldId === "additional_notes"
                          ? "border-rose-300 bg-rose-50 text-rose-700"
                          : "border-[#dcebe7] bg-white text-[#14221f] hover:border-[#a9c9bd] hover:bg-[#f0f8f6]"
                      }`}
                    >
                      {recordingFieldId === "additional_notes" ? (
                        <>
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-3.5 bg-rose-600 rounded-full animate-pulse [animation-delay:0ms]" />
                            <span className="w-1 h-5 bg-rose-600 rounded-full animate-pulse [animation-delay:150ms]" />
                            <span className="w-1 h-4 bg-rose-600 rounded-full animate-pulse [animation-delay:300ms]" />
                            <span className="w-1 h-2 bg-rose-600 rounded-full animate-pulse [animation-delay:450ms]" />
                          </span>
                          <MicOff size={18} className="text-rose-600" />
                          <span className="text-sm font-semibold text-rose-700">
                            {km ? "បញ្ឈប់ការថតសំឡេង (Stop)" : "Stop recording"}
                          </span>
                          <span className="rounded-full bg-rose-200/80 px-2 py-0.5 text-xs font-mono font-bold text-rose-800">
                            {formatDuration(recordingDuration)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Mic size={18} className="text-[#1f6f5b]" />
                          <span className="text-sm font-semibold">
                            {km ? "កត់ត្រាជាសំឡេង (Record with Voice)" : "Record with voice"}
                          </span>
                          <span className="rounded-full bg-[#e6f6f1] px-2 py-0.5 text-[11px] font-medium text-[#1f6f5b]">
                            {speechLang === "km" ? "ភាសាខ្មែរ" : "English"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Global Voice Notification Banner */}
              {voiceNotice && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs sm:text-sm text-[#1f6f5b] animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#1f6f5b] animate-ping" />
                    <span>{voiceNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceNotice(null)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Section 5: Security / Privacy Note */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#667a75]">
                  <ShieldCheck size={16} className="shrink-0 text-[#23aa89]" />
                <span>
                  {km
                    ? "កំណត់ត្រាផ្ទាល់ខ្លួនរបស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាព និងជាឯកជនភាព។"
                    : "Journal entries are private and handled securely."}
                </span>
              </div>

              {/* Section 6: Save Journal Button */}
              <div className="mt-6">
                {saveError && (
                  <p role="alert" className="mb-3 rounded-xl bg-arom-danger-soft/60 px-4 py-3 text-sm text-arom-danger">
                    {saveError === "signed_out" ? (
                      <>
                        {km ? "សូមចូលគណនីដើម្បីរក្សាទុកកំណត់ហេតុរបស់អ្នក។ " : "Please log in to save your journal. "}
                        <Link href="/login?next=%2Fdetection%2Fjournal" className="font-semibold underline">
                          {km ? "ចូលគណនី" : "Log in"}
                        </Link>
                      </>
                    ) : km ? (
                      "មិនអាចរក្សាទុកបានទេ។ អ្វីដែលអ្នកសរសេរនៅតែនៅទីនេះ។ សូមព្យាយាមម្តងទៀត។"
                    ) : (
                      "That could not be saved. What you wrote is still here. Please try again."
                    )}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  aria-busy={saving}
                  className="min-h-14 w-full disabled:opacity-60 rounded-xl bg-[#1f6f5b] py-4 text-center text-base font-semibold text-white shadow-[0_3px_10px_rgba(31,111,91,0.16)] transition-colors duration-150 hover:bg-[#165746] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f5b]"
                >
                  {saving
                    ? km
                      ? "កំពុងរក្សាទុក..."
                      : "Saving..."
                    : km
                      ? "រក្សាទុកកំណត់ត្រា (Save Journal)"
                      : "Save Journal"}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: Reflection Saved Screen (Figma Frame 77:133) */}
          {/* ============================================================== */}
          {view === "saved" && (
            <div className="mt-4 sm:mt-6 animate-in fade-in duration-300">
              {/* Top Navigation */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setView("entry")}
                  className="inline-flex size-10 items-center justify-center rounded-full text-[#111827] hover:bg-gray-100 transition-colors"
                  aria-label="Back to journal entry"
                >
                  <ArrowLeft size={22} />
                </button>
              </div>

              {/* Illustration & Headline */}
              <div className="mt-6 flex flex-col items-center text-center">
                <div className="relative h-44 w-64 sm:h-52 sm:w-72">
                  <Image
                    src="/figma/journal/reflection_saved_graphic.png"
                    alt="Reflection saved"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
                  {km ? "ការឆ្លុះបញ្ចាំងរបស់អ្នកត្រូវបានរក្សាទុកដោយជោគជ័យ។" : "Your reflection has been saved."}
                </h1>
                <p className="mt-2.5 max-w-sm text-sm sm:text-base text-[#4b5563] leading-relaxed">
                  {km
                    ? "ការចំណាយពេលស្វែងយល់ពីអារម្មណ៍របស់អ្នក ជួយឱ្យអ្នកកត់សម្គាល់ពីទម្លាប់ និងការប្រែប្រួលតាមពេលវេលា។"
                    : "Taking a moment to understand your feelings can help you notice patterns over time."}
                </p>
              </div>

              {/* Today’s Journal Summary Card */}
              <div className="mt-8 rounded-[22px] border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-base sm:text-lg font-bold text-[#111827]">
                  {km ? "កំណត់ត្រាថ្ងៃនេះ (Today's Journal)" : "Today’s Journal"}
                </h2>
                <div className="mt-1.5 flex items-center gap-2">
                  {(() => {
                    const moodObj = MOODS.find(
                      (m) => m.en.toLowerCase() === (savedEntry?.mood || selectedMood).toLowerCase()
                    );
                    return (
                      <>
                        {moodObj && <MoodSprout mood={moodObj.level} className="h-6 w-auto" />}
                        <p className="text-sm font-medium text-[#6b7280]">
                          {km ? "ថ្ងៃនេះ" : "Today"} • {getMoodLabel(savedEntry?.mood || selectedMood)}
                        </p>
                      </>
                    );
                  })()}
                </div>
                {savedEntry?.questions && savedEntry.questions.length > 0 ? (
                  <div className="mt-3.5 space-y-2">
                    {savedEntry.questions.map((q) => (
                      <div key={q.id} className="rounded-xl bg-[#f0f8f6] p-2.5 text-xs sm:text-sm">
                        <span className="font-bold text-[#1f6f5b]">
                          {km ? q.kmQuestion : q.question}:{" "}
                        </span>
                        <span className="text-[#374151]">{q.answer}</span>
                      </div>
                    ))}
                    {savedEntry.additionalNotes && (
                      <div className="rounded-xl bg-gray-50 p-2.5 text-xs sm:text-sm">
                        <span className="font-bold text-gray-700">
                          {km ? "កំណត់ត្រាបន្ថែម: " : "Additional Notes: "}
                        </span>
                        <span className="text-[#374151]">{savedEntry.additionalNotes}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#374151]">
                    {(savedEntry?.content || "").slice(0, 160)}
                    {(savedEntry?.content || "").length > 160 ? "..." : ""}
                  </p>
                )}
                {(savedEntry?.tags || selectedEmotions).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(savedEntry?.tags || selectedEmotions).map((t) => {
                      const emo = EMOTIONS.find((e) => e.en.toLowerCase() === t.toLowerCase());
                      return (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-md bg-[#e6f6f1] px-2 py-0.5 text-xs font-medium text-[#1f6f5b]"
                        >
                          {emo && <span>{emo.emoji}</span>}
                          <span>{km && emo ? emo.km : t}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setView("history")}
                  className="w-full rounded-2xl bg-[#1f6f5b] py-3.5 sm:py-4 text-center text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#185848] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
                >
                  {km ? "មើលកំណត់ត្រាទាំងអស់ (View Journal)" : "View Journal"}
                </button>

                <Link
                  href="/"
                  className="w-full rounded-2xl border border-[#1f6f5b] bg-white py-3.5 sm:py-4 text-center text-base font-semibold text-[#1f6f5b] transition-all duration-150 hover:bg-emerald-50 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#1f6f5b]"
                >
                  {km ? "ត្រឡប់ទៅទំព័រដើម (Back to Home)" : "Back to Home"}
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: My Journal List / History (Figma Frame 77:146) */}
          {/* ============================================================== */}
          {view === "history" && (
            <div className="mt-4 sm:mt-6 animate-in fade-in duration-200">
              {/* Top Navigation & Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setView("entry")}
                    className="inline-flex size-10 items-center justify-center rounded-full text-[#111827] hover:bg-gray-100 transition-colors"
                    aria-label="Back to new reflection"
                  >
                    <ArrowLeft size={22} />
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
                    {km ? "កំណត់ត្រាអារម្មណ៍របស់ខ្ញុំ (My Journal)" : "My Journal"}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMood("Good");
                    setSelectedEmotions(getDefaultEmotionsForMood("Good"));
                    setQuestions(promptQuestions.map((q) => ({ ...q, answer: "" })));
                    setAdditionalNotes("");
                    setRecordingFieldId(null);
                    setView("entry");
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-[#e6f6f1] px-3.5 py-1.5 text-xs font-semibold text-[#1f6f5b] hover:bg-[#d2eee8] transition-colors"
                >
                  <Plus size={16} />
                  <span>{km ? "សរសេរថ្មី (New Entry)" : "New Entry"}</span>
                </button>
              </div>

              {/* The last 7 days, counted from real entries (the old made up summary is gone) */}
              <JournalWeekSummary
                entries={entries}
                km={km}
                feelingLabel={(tag) => {
                  const found = EMOTIONS.find((e) => e.en === tag);
                  return found ? (km ? found.km : found.en) : tag;
                }}
              />

              {/* Journal Entries List Header */}
              <div className="mt-6 flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-[#111827]">
                  {km ? "កំណត់ត្រាកន្លងមក (Past Reflections)" : "Past Reflections"} ({entries.length})
                </h3>
                <span className="text-xs text-[#6b7280]">
                  {km ? "រៀបតាមកាលបរិច្ឆេទ (Chronological)" : "Chronological"}
                </span>
              </div>

              {/* Journal Entries List */}
              <div className="mt-3 flex flex-col gap-3.5">
                {entries.map((entry) => {
                  const moodObj = MOODS.find(
                    (m) => m.en.toLowerCase() === entry.mood.toLowerCase()
                  );
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedDetailEntry(entry)}
                      className="group flex cursor-pointer items-center justify-between rounded-[20px] border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-[#1f6f5b] hover:shadow-md hover:translate-y-[-1px]"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          {moodObj && <MoodSprout mood={moodObj.level} className="h-7 w-auto" />}
                          <p className="text-base font-bold text-[#111827] transition-colors group-hover:text-[#1f6f5b]">
                            {journalDayLabel(entry.createdAt, km)} • {getMoodLabel(entry.mood)}
                          </p>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-[#4b5563] leading-relaxed">
                          {entry.content}
                        </p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {entry.tags.map((t) => {
                              const emo = EMOTIONS.find((e) => e.en.toLowerCase() === t.toLowerCase());
                              return (
                                <span
                                  key={t}
                                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700"
                                >
                                  {emo && <span>{emo.emoji}</span>}
                                  <span>{km && emo ? emo.km : t}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <ChevronRight
                        size={20}
                        className="shrink-0 text-gray-400 group-hover:text-[#1f6f5b] group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quote Banner matching Figma 77:146 */}
              <div className="mt-8 relative overflow-hidden rounded-[24px] border border-[#d2eee8] bg-[#ebf7f4] p-5 sm:p-6 shadow-sm">
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="max-w-[62%] sm:max-w-[68%]">
                    <p className="text-base sm:text-lg font-medium leading-snug text-[#1f6f5b]">
                      {km
                        ? "រាល់គំនិតដែលអ្នកកត់ត្រា គឺជាជំហានមួយឆ្ពោះទៅរកភាពច្បាស់លាស់ និងស្ងប់ស្ងាត់នៃផ្លូវចិត្ត។"
                        : "Every thought you write is a step towards a clearer, calmer you."}
                    </p>
                  </div>
                  <div className="relative h-28 w-24 sm:h-32 sm:w-28 shrink-0">
                    <Image
                      src="/figma/journal/journal_quote_plant.png"
                      alt="Calm plant"
                      fill
                      className="object-contain object-right-bottom"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detail View Modal if user clicks on a journal entry */}
          {selectedDetailEntry && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
              onClick={() => setSelectedDetailEntry(null)}
            >
              <div
                className="w-full max-w-lg rounded-[26px] bg-white p-6 shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1f6f5b] bg-[#e6f6f1] px-3 py-1.5 rounded-full">
                    {(() => {
                      const moodObj = MOODS.find(
                        (m) => m.en.toLowerCase() === selectedDetailEntry.mood.toLowerCase()
                      );
                      return moodObj ? <MoodSprout mood={moodObj.level} className="h-6 w-auto" /> : <Calendar size={13} />;
                    })()}
                    <span>
                      {journalDayLabel(selectedDetailEntry.createdAt, km)} • {getMoodLabel(selectedDetailEntry.mood)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailEntry(null)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-[#111827]">
                    {km ? "សេចក្តីលម្អិតនៃការឆ្លុះបញ្ចាំង (Reflection Details)" : "Reflection Details"}
                  </h3>

                  {selectedDetailEntry.questions && selectedDetailEntry.questions.length > 0 ? (
                    <div className="mt-3.5 space-y-2.5">
                      {selectedDetailEntry.questions.map((q) => (
                        <div key={q.id} className="rounded-2xl border border-gray-100 bg-[#f7faf9] p-3.5">
                          <p className="text-xs font-bold text-[#1f6f5b]">
                            {km ? q.kmQuestion : q.question}
                          </p>
                          <p className="mt-1 text-sm text-[#111827]">{q.answer}</p>
                        </div>
                      ))}
                      {selectedDetailEntry.additionalNotes && (
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
                          <p className="text-xs font-bold text-gray-700">
                            {km ? "កំណត់ត្រាបន្ថែម (Additional Notes)" : "Additional Notes"}
                          </p>
                          <p className="mt-1 text-sm text-[#374151]">
                            {selectedDetailEntry.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed text-[#374151] whitespace-pre-wrap">
                      {selectedDetailEntry.content}
                    </p>
                  )}
                </div>

                {selectedDetailEntry.tags && selectedDetailEntry.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedDetailEntry.tags.map((tag) => {
                      const emo = EMOTIONS.find((e) => e.en.toLowerCase() === tag.toLowerCase());
                      return (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-[#1f6f5b]"
                        >
                          {emo && <span>{emo.emoji}</span>}
                          <span>{km && emo ? emo.km : tag}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => void handleDeleteEntry(selectedDetailEntry.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>{km ? "លុបកំណត់ត្រា (Delete Entry)" : "Delete Entry"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailEntry(null)}
                    className="rounded-xl bg-[#1f6f5b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#185848] transition-colors"
                  >
                    {km ? "បិទ (Close)" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Figma Bottom Navigation (Mobile/Tablet) */}
      <div className="lg:hidden">
        <BottomNav activeTab="Detection" />
      </div>
    </div>
  );
}

export default function JournalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7faf9]" />}>
      <JournalContent />
    </Suspense>
  );
}
