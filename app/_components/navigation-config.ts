import {
  Home,
  BookOpen,
  Activity,
  BarChart3,
  Heart,
  Building2,
  CalendarCheck,
  UsersRound,
  Layers,
  ShieldCheck,
  Stethoscope,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/auth";

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
  /** Only these roles see the section. Leave out to show it to everyone. */
  roles?: readonly UserRole[];
};

/** Sections the given role may see. The server still guards each page. */
export function sectionsForRole(role: UserRole | undefined) {
  return NAVIGATION_SECTIONS.filter(
    (section) => !section.roles || (role !== undefined && section.roles.includes(role)),
  );
}

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    id: "admin",
    enTitle: "Admin",
    kmTitle: "អ្នកគ្រប់គ្រង",
    roles: ["admin"],
    items: [
      {
        id: "admin-panel",
        label: "AdminPanel",
        enTitle: "Admin panel",
        kmTitle: "ផ្ទាំងគ្រប់គ្រង (Admin panel)",
        icon: ShieldCheck,
        href: "/admin",
      },
      {
        // Admins can open the professional area to check how it works.
        id: "admin-professional-area",
        label: "ProfessionalArea",
        enTitle: "Professional area",
        kmTitle: "ផ្នែកអ្នកជំនាញ (Professional area)",
        icon: Stethoscope,
        href: "/pro",
      },
    ],
  },
  {
    id: "professional-area",
    enTitle: "My practice",
    kmTitle: "ការងាររបស់ខ្ញុំ",
    roles: ["professional"],
    items: [
      {
        id: "professional-area",
        label: "ProfessionalArea",
        enTitle: "Professional area",
        kmTitle: "ផ្នែកអ្នកជំនាញ (Professional area)",
        icon: Stethoscope,
        href: "/pro",
      },
    ],
  },
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
        id: "messages",
        label: "Messages",
        enTitle: "Messages",
        kmTitle: "សារ",
        icon: MessageCircle,
        href: "/messages",
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
        id: "appointments",
        label: "Appointments",
        enTitle: "Appointments",
        kmTitle: "ការណាត់ជួប",
        icon: CalendarCheck,
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
