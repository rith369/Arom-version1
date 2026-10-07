import {
  Home,
  Compass,
  ShoppingBag,
  Users,
  BookOpen,
  Activity,
  BarChart3,
  Heart,
  Building2,
  CalendarCheck,
  CalendarClock,
  UsersRound,
  Layers,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  enTitle: string;
  kmTitle: string;
  icon: LucideIcon;
  href?: string;
  isComingSoon?: boolean;
  emphasized?: boolean;
};

export type NavSection = {
  id: string;
  enTitle: string;
  kmTitle: string;
  items: NavItem[];
};

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    id: "main",
    enTitle: "Main Page",
    kmTitle: "ទំព័រចម្បង",
    items: [
      {
        id: "home",
        label: "Home",
        enTitle: "Home",
        kmTitle: "ទំព័រដើម",
        icon: Home,
        href: "/",
      },
      {
        id: "mindguide",
        label: "MindGuide",
        enTitle: "MindGuide",
        kmTitle: "មគ្គុទ្ទេសក៍ចិត្ត",
        icon: BookOpen,
        href: "/mindguide",
      },
      {
        id: "detection",
        label: "Detection",
        enTitle: "Detection",
        kmTitle: "ពិនិត្យអារម្មណ៍",
        icon: Activity,
        emphasized: true,
      },
      {
        id: "progress",
        label: "Progress",
        enTitle: "Progress Dashboard",
        kmTitle: "ផ្ទាំងតាមដានការវិវត្ត",
        icon: BarChart3,
        href: "/#progress-dashboard",
      },
      {
        id: "quests",
        label: "Quests",
        enTitle: "Quests",
        kmTitle: "បេសកកម្ម",
        icon: Compass,
        isComingSoon: true,
      },
      {
        id: "shop",
        label: "Shop",
        enTitle: "Shop",
        kmTitle: "ហាងទំនិញ",
        icon: ShoppingBag,
        isComingSoon: true,
      },
      {
        id: "friends",
        label: "Friends",
        enTitle: "Friends",
        kmTitle: "មិត្តភក្តិ",
        icon: Users,
        isComingSoon: true,
      },
    ],
  },
  {
    id: "professional",
    enTitle: "Professional",
    kmTitle: "អ្នកជំនាញ",
    items: [
      {
        id: "professional",
        label: "Professional",
        enTitle: "Professional",
        kmTitle: "អ្នកជំនាញ",
        icon: Heart,
        href: "/professional",
      },
      {
        id: "clinic-hospital",
        label: "ClinicHospital",
        enTitle: "Find Clinic & Hospital",
        kmTitle: "ស្វែងរកគ្លីនិក និងមន្ទីរពេទ្យ",
        icon: Building2,
        isComingSoon: true,
      },
      {
        id: "booking-history",
        label: "BookingHistory",
        enTitle: "Booking History",
        kmTitle: "ប្រវត្តិនៃការកក់",
        icon: CalendarCheck,
        isComingSoon: true,
      },
      {
        id: "schedule",
        label: "Schedule",
        enTitle: "Schedule Management",
        kmTitle: "ការគ្រប់គ្រងកាលវិភាគ",
        icon: CalendarClock,
        isComingSoon: true,
      },
    ],
  },
  {
    id: "community",
    enTitle: "Community",
    kmTitle: "សហគមន៍",
    items: [
      {
        id: "community",
        label: "Community",
        enTitle: "Community",
        kmTitle: "សហគមន៍",
        icon: UsersRound,
        href: "/community",
      },
      {
        id: "play-cards",
        label: "PlayCards",
        enTitle: "Play Cards with Friends",
        kmTitle: "លេងកាតជាមួយមិត្តភក្តិ",
        icon: Layers,
        isComingSoon: true,
      },
    ],
  },
];
