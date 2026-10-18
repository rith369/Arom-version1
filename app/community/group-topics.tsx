import {
  BatteryLow,
  Brain,
  CloudRain,
  GraduationCap,
  Moon,
  Sprout,
  UsersRound,
  Waves,
  type LucideIcon,
} from 'lucide-react';

// The topic of a support group (support_groups.concern, free text in the
// database). "academic" is shown as Study; anything unknown counts as General
// support. Chosen with Rith on 19 Oct 2026.
export type GroupTopic =
  | 'anxiety'
  | 'stress'
  | 'depression'
  | 'sleep'
  | 'burnout'
  | 'academic'
  | 'self_growth'
  | 'general';

export type TopicInfo = {
  id: GroupTopic;
  en: string;
  km: string;
  Icon: LucideIcon;
  // Soft AROM friendly tints: tile background, icon circle, icon colour.
  tile: string;
  circle: string;
  ink: string;
};

export const GROUP_TOPICS: TopicInfo[] = [
  { id: 'anxiety', en: 'Anxiety', km: 'ការថប់បារម្ភ', Icon: Brain, tile: 'bg-[#eef0fb]', circle: 'bg-[#dfe3f8]', ink: 'text-[#4b55a8]' },
  { id: 'stress', en: 'Stress', km: 'ភាពតានតឹង', Icon: Waves, tile: 'bg-[#e8f5ef]', circle: 'bg-[#d3ecdf]', ink: 'text-[#1f6f5b]' },
  { id: 'depression', en: 'Depression', km: 'ការធ្លាក់ទឹកចិត្ត', Icon: CloudRain, tile: 'bg-[#eaf2f8]', circle: 'bg-[#d6e6f2]', ink: 'text-[#2f6690]' },
  { id: 'sleep', en: 'Sleep', km: 'ការគេង', Icon: Moon, tile: 'bg-[#eef1fa]', circle: 'bg-[#dde3f5]', ink: 'text-[#3d4f8f]' },
  { id: 'burnout', en: 'Burnout', km: 'ការអស់កម្លាំង', Icon: BatteryLow, tile: 'bg-[#fbf0e8]', circle: 'bg-[#f6dfcd]', ink: 'text-[#a4592a]' },
  { id: 'academic', en: 'Study', km: 'ការសិក្សា', Icon: GraduationCap, tile: 'bg-[#f3f6e7]', circle: 'bg-[#e4ecc9]', ink: 'text-[#5c6f1f]' },
  { id: 'self_growth', en: 'Self growth', km: 'ការអភិវឌ្ឍខ្លួន', Icon: Sprout, tile: 'bg-[#fbeef2]', circle: 'bg-[#f5dbe3]', ink: 'text-[#a3405f]' },
  { id: 'general', en: 'General support', km: 'ការគាំទ្រទូទៅ', Icon: UsersRound, tile: 'bg-[#f1f3f2]', circle: 'bg-[#e1e6e4]', ink: 'text-[#3f4f4a]' },
];

export function topicOf(concern: string | null | undefined): GroupTopic {
  return GROUP_TOPICS.find((topic) => topic.id === concern)?.id ?? 'general';
}

export function topicInfo(topic: GroupTopic): TopicInfo {
  return GROUP_TOPICS.find((item) => item.id === topic) ?? GROUP_TOPICS[GROUP_TOPICS.length - 1];
}

/** The topic's icon in its soft coloured circle. */
export function TopicBadge({ topic, size = 'md' }: { topic: GroupTopic; size?: 'sm' | 'md' | 'lg' }) {
  const info = topicInfo(topic);
  const box = size === 'lg' ? 'size-16' : size === 'sm' ? 'size-10' : 'size-12';
  const icon = size === 'lg' ? 30 : size === 'sm' ? 18 : 22;
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center rounded-full ${info.circle} ${info.ink}`}>
      <info.Icon size={icon} aria-hidden="true" />
    </span>
  );
}
