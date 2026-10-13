export type GroupMentor = {
  name: string;
  nameKm: string;
  role: string;
  roleKm: string;
  experience: string;
  experienceKm: string;
  avatarUrl?: string;
  badge?: string;
  badgeKm?: string;
  bio?: string;
  bioKm?: string;
};

export type SupportGroup = {
  id: string;
  name: string;
  nameKm: string;
  membersCount: number;
  maxMembers: number;
  iconType: "academic" | "stress" | "anxiety" | "depression";
  isAnonymous: boolean;
  about: string;
  aboutKm: string;
  expectations: string[];
  expectationsKm: string[];
  rules?: string[];
  rulesKm?: string[];
  mentor?: GroupMentor;
  mentorTitle?: string;
  mentorTitleKm?: string;
  isJoined?: boolean;
  // Closed groups stay readable for their members but nobody can send.
  status?: "active" | "closed";
  createdBy?: "admin" | "professional";
};

// What a user can report inside Community. A report points at the item, it
// never copies the content, and it never stores who sent it in admin screens.
export type CommunityReportTarget =
  | { kind: "member"; groupId: string; memberLabel: string; messageId?: string; memberId?: string }
  | { kind: "message"; groupId: string; messageId: string }
  | { kind: "image"; groupId: string; messageId: string }
  | { kind: "group"; groupId: string };

export type CommunityReportReason =
  | "harassment"
  | "spam"
  | "harmful"
  | "inappropriate_image"
  | "safety_concern"
  | "other";

export const DEFAULT_GROUP_RULES = [
  "Respect other members",
  "Keep conversations private",
  "No judgment",
  "No diagnosis of other members",
  "No harmful advice",
  "Follow mentor guidance",
];

export const DEFAULT_GROUP_RULES_KM = [
  "គោរពសមាជិកដទៃទៀត (Respect others)",
  "រក្សាការសន្ទនាជាការសម្ងាត់ (Keep conversations private)",
  "គ្មានការរិះគន់ ឬវិនិច្ឆ័យ (No judgment)",
  "គ្មានការធ្វើរោគវិនិច្ឆ័យលើសមាជិកដទៃ (No diagnosis)",
  "គ្មានការផ្តល់ដំបូន្មានដែលបង្កគ្រោះថ្នាក់ (No harmful advice)",
  "អនុវត្តតាមការណែនាំរបស់អ្នកសម្របសម្រួល (Follow mentor guidance)",
];

export type ChatAttachment = {
  name: string;
  url: string;
  type: "image" | "file";
  sizeStr?: string;
};

export type ChatMessage = {
  id: string;
  groupId: string;
  senderName: string;
  senderNameKm?: string;
  isAnonymous: boolean;
  isMentor?: boolean;
  text: string;
  textKm?: string;
  time: string;
  timeKm?: string;
  avatarType: "mask" | "mentor" | "user";
  attachment?: ChatAttachment;
};

export type GroupActivity = {
  id: string;
  groupId: string;
  title: string;
  titleKm: string;
  topic: string;
  topicKm?: string;
  dateStr: string;
  dateStrKm?: string;
  type: "discussion" | "mindfulness" | "support" | "study" | "coping";
  iconAsset?: string;
  isUpcoming: boolean;
  isJoined: boolean;
};

export type GroupMember = {
  id: string;
  groupId: string;
  name: string;
  nameKm?: string;
  isAnonymous: boolean;
  avatarType: "mask" | "user";
};

export const INITIAL_GROUPS: SupportGroup[] = [
  {
    id: "stress-burnout",
    name: "Stress & Burnout Support",
    nameKm: "ក្រុមគាំទ្រភាពតានតឹង (Stress & Burnout Support)",
    membersCount: 8,
    maxMembers: 10,
    iconType: "stress",
    isAnonymous: true,
    about:
      "A support space for people managing stress, exhaustion, and feeling overwhelmed. Here you can share, learn, and grow together.",
    aboutKm:
      "កន្លែងគាំទ្រសម្រាប់អ្នកដែលកំពុងប្រឈមនឹងភាពតានតឹង ការអស់កម្លាំង និងអារម្មណ៍ធុញថប់។ នៅទីនេះអ្នកអាចចែករំលែក រៀនសូត្រ និងរីកចម្រើនជាមួយគ្នា។",
    expectations: [
      "Share experiences anonymously",
      "Listen and support each other",
      "Guided discussions and activities",
      "Learn healthy coping strategies",
      "Support from a trained mentor",
    ],
    expectationsKm: [
      "ចែករំលែកបទពិសោធន៍ដោយអនាមិក",
      "ស្តាប់ និងគាំទ្រគ្នាទៅវិញទៅមក",
      "កិច្ចពិភាក្សា និងសកម្មភាពមានការណែនាំច្បាស់លាស់",
      "រៀនយុទ្ធសាស្ត្រដោះស្រាយប្រកបដោយសុខុមាលភាព",
      "ការគាំទ្រពីអ្នកណែនាំដែលបានទទួលការបណ្តុះបណ្តាលត្រឹមត្រូវ",
    ],
    rules: DEFAULT_GROUP_RULES,
    rulesKm: DEFAULT_GROUP_RULES_KM,
    mentor: {
      name: "Mentor Tivea",
      nameKm: "អ្នកណែនាំ ទីវា",
      role: "Stress & Burnout Specialist",
      roleKm: "អ្នកសម្របសម្រួលការគាំទ្រភាពតានតឹង (Stress Specialist)",
      experience: "4+ years experience",
      experienceKm: "បទពិសោធន៍ ៤+ ឆ្នាំក្នុងការគាំទ្រសុខភាពផ្លូវចិត្ត",
      avatarUrl: "/figma/community/mentor_tivea_avatar.png",
      badge: "Group Mentor",
      badgeKm: "អ្នកណែនាំក្រុម",
      bio: "Facilitates weekly check-ins, guides grounding routines, and ensures a safe, respectful space.",
      bioKm: "សម្របសម្រួលការសួរសុខទុក្ខប្រចាំសប្តាហ៍ ណែនាំការអនុវត្តសតិ និងធានានូវបរិយាកាសសុវត្ថិភាព។",
    },
    mentorTitle: "Tivea · Verified ARom Mentor",
    mentorTitleKm: "ទីវា · អ្នកណែនាំ ARom ផ្លូវការ",
    isJoined: true,
  },
  {
    id: "depression-support",
    name: "Depression Support Group",
    nameKm: "ក្រុមគាំទ្រជំងឺធ្លាក់ទឹកចិត្ត (Depression Support Group)",
    membersCount: 8,
    maxMembers: 10,
    iconType: "depression",
    isAnonymous: true,
    about:
      "A small, supportive group for people experiencing similar challenges related to depression and emotional well-being.",
    aboutKm:
      "ក្រុមគាំទ្រខ្នាតតូចសម្រាប់អ្នកដែលកំពុងប្រឈមនឹងបញ្ហាស្រដៀងគ្នាទាក់ទងនឹងការធ្លាក់ទឹកចិត្ត និងសុខុមាលភាពផ្លូវចិត្ត។",
    expectations: [
      "Share experiences",
      "Listen to others",
      "Support each other",
      "Participate in guided discussions",
      "Learn healthy coping strategies",
      "Receive guidance from your mentor",
    ],
    expectationsKm: [
      "ចែករំលែកបទពិសោធន៍ផ្ទាល់ខ្លួន",
      "ស្តាប់ និងយល់ចិត្តអ្នកដទៃ",
      "គាំទ្រគ្នាទៅវិញទៅមកដោយក្តីមេត្តា",
      "ចូលរួមក្នុងកិច្ចពិភាក្សាដែលមានការសម្របសម្រួល",
      "រៀនយុទ្ធសាស្ត្រទប់ទល់ដែលមានសុខភាពល្អ",
      "ទទួលបានការណែនាំពីអ្នកជំនាញ",
    ],
    rules: DEFAULT_GROUP_RULES,
    rulesKm: DEFAULT_GROUP_RULES_KM,
    mentor: {
      name: "Dara",
      nameKm: "ដារ៉ា",
      role: "Verified ARom Mentor",
      roleKm: "អ្នកណែនាំ ARom ផ្លូវការ",
      experience: "5+ years experience",
      experienceKm: "បទពិសោធន៍ ៥+ ឆ្នាំ",
      avatarUrl: "/therapists/malika-sok.jpg",
      badge: "Verified Mentor",
      badgeKm: "អ្នកណែនាំផ្លូវការ",
      bio: "Guides supportive discussions and emotional regulation techniques for depression recovery.",
      bioKm: "ណែនាំកិច្ចពិភាក្សាគាំទ្រ និងបច្ចេកទេសគ្រប់គ្រងអារម្មណ៍សម្រាប់ការស្តារឡើងវិញ។",
    },
    mentorTitle: "Dara · Verified ARom Mentor",
    mentorTitleKm: "ដារ៉ា · អ្នកណែនាំ ARom ផ្លូវការ",
    isJoined: false,
  },
  {
    id: "academic-stress",
    name: "Academic Stress Support",
    nameKm: "ក្រុមគាំទ្រភាពតានតឹងការសិក្សា (Academic Stress Support)",
    membersCount: 9,
    maxMembers: 10,
    iconType: "academic",
    isAnonymous: true,
    about:
      "A safe peer group for students dealing with exam pressure, heavy coursework, and deadline stress.",
    aboutKm:
      "ក្រុមមិត្តភក្តិសុវត្ថិភាពសម្រាប់សិស្ស និងនិស្សិត ដែលប្រឈមមុខនឹងសម្ពាធប្រឡង កិច្ចការច្រើន និងភាពតានតឹងនៃការផុតកំណត់កិច្ចការ។",
    expectations: [
      "Study-life balance strategies",
      "Exam calm-down techniques",
      "Peer encouragement",
      "Safe space to vent study anxieties",
    ],
    expectationsKm: [
      "យុទ្ធសាស្ត្រតុល្យភាពការសិក្សា និងជីវិត",
      "បច្ចេកទេសសម្រាលអារម្មណ៍មុនប្រឡង",
      "ការលើកទឹកចិត្តពីមិត្តភក្តិ",
      "កន្លែងសុវត្ថិភាពដើម្បីរំសាយការថប់បារម្ភក្នុងការសិក្សា",
    ],
    rules: DEFAULT_GROUP_RULES,
    rulesKm: DEFAULT_GROUP_RULES_KM,
    mentor: {
      name: "Mentor Sophea",
      nameKm: "អ្នកណែនាំ សុភា",
      role: "Academic Life & Student Coach",
      roleKm: "គ្រូបង្វឹកជីវិត និងការសិក្សាសិស្ស និស្សិត (Academic Coach)",
      experience: "5+ years experience",
      experienceKm: "បទពិសោធន៍ ៥+ ឆ្នាំក្នុងការប្រឹក្សាគរុកោសល្យ",
      avatarUrl: "/therapists/sopheap-chan.jpg",
      badge: "Academic Guide",
      badgeKm: "អ្នកណែនាំការសិក្សា",
      bio: "Helps students navigate academic pressure, build effective study habits, and maintain wellbeing.",
      bioKm: "ជួយសិស្ស និងនិស្សិត យកឈ្នះការថប់បារម្ភពេលប្រឡង បង្កើតទម្លាប់រៀនសូត្រប្រកបដោយប្រសិទ្ធភាព និងរក្សាតុល្យភាពសុខុមាលភាព។",
    },
    mentorTitle: "Sophea · Verified ARom Mentor",
    mentorTitleKm: "សុភា · អ្នកណែនាំ ARom ផ្លូវការ",
    isJoined: false,
  },
  {
    id: "anxiety-circle",
    name: "Anxiety Circle",
    nameKm: "រង្វង់គាំទ្រការថប់បារម្ភ (Anxiety Circle)",
    membersCount: 5,
    maxMembers: 10,
    iconType: "anxiety",
    isAnonymous: true,
    about:
      "Gentle space to talk about day-to-day anxiety, panic symptoms, and grounding routines.",
    aboutKm:
      "កន្លែងទន់ភ្លន់ដើម្បីពិភាក្សាអំពីការថប់បារម្ភប្រចាំថ្ងៃ រោគសញ្ញានៃការស្លន់ស្លោ និងការអនុវត្តដើម្បីឱ្យចិត្តស្ងប់។",
    expectations: [
      "Grounding exercises",
      "Non-judgmental community",
      "Shared coping mechanisms",
    ],
    expectationsKm: [
      "លំហាត់ទប់លំនឹងចិត្ត (Grounding Exercises)",
      "សហគមន៍ដែលគ្មានការរិះគន់ ឬវិនិច្ឆ័យ",
      "យន្តការទប់ទល់ និងដោះស្រាយដែលបានចែករំលែក",
    ],
    rules: DEFAULT_GROUP_RULES,
    rulesKm: DEFAULT_GROUP_RULES_KM,
    mentor: {
      name: "Mentor Rathana",
      nameKm: "អ្នកណែនាំ រតនា",
      role: "Mindfulness & Anxiety Facilitator",
      roleKm: "អ្នកសម្របសម្រួលសតិ និងការថប់បារម្ភ",
      experience: "3+ years experience",
      experienceKm: "បទពិសោធន៍ ៣+ ឆ្នាំក្នុងការបណ្តុះបណ្តាលសតិ",
      avatarUrl: "/therapists/ratanak-pich.jpg",
      badge: "Mindfulness Lead",
      badgeKm: "អ្នកដឹកនាំសតិ",
      bio: "Specializes in grounding practices, panic de-escalation, and creating a supportive circle.",
      bioKm: "ជំនាញក្នុងការអនុវត្តសតិសម្រាលអារម្មណ៍ និងការបង្កើតរង្វង់គាំទ្រដ៏កក់ក្តៅ។",
    },
    mentorTitle: "Rathana · Verified ARom Mentor",
    mentorTitleKm: "រតនា · អ្នកណែនាំ ARom ផ្លូវការ",
    isJoined: false,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    groupId: "stress-burnout",
    senderName: "Anonymous 01",
    senderNameKm: "សមាជិកអនាមិក ០១",
    isAnonymous: true,
    text: "I've been trying to take short walks when I feel overwhelmed.",
    textKm: "ខ្ញុំបានសាកល្បងដើរតិចៗនៅខាងក្រៅពេលមានអារម្មណ៍ធុញថប់ វាពិតជាជួយបានច្រើន។",
    time: "10:24 AM",
    timeKm: "ម៉ោង ១០:២៤ ព្រឹក",
    avatarType: "mask",
  },
  {
    id: "m2",
    groupId: "stress-burnout",
    senderName: "Yuee",
    senderNameKm: "យូអ៊ី (Yuee)",
    isAnonymous: true,
    text: "Same here! It really helps.",
    textKm: "ខ្ញុំក៏ដូចគ្នាដែរ! ជួយឱ្យអារម្មណ៍ស្រឡះ និងធូរស្បើយច្រើន។",
    time: "10:29 AM",
    timeKm: "ម៉ោង ១០:២៩ ព្រឹក",
    avatarType: "mask",
  },
  {
    id: "m3",
    groupId: "stress-burnout",
    senderName: "Anonymous 02",
    senderNameKm: "សមាជិកអនាមិក ០២",
    isAnonymous: true,
    text: "Does anyone have tips for staying motivated during exam season?",
    textKm: "តើមានអ្នកណាមានគន្លឹះដើម្បីរក្សាការលើកទឹកចិត្តខ្លួនឯងក្នុងអំឡុងពេលប្រឡងដែរទេ?",
    time: "10:35 AM",
    timeKm: "ម៉ោង ១០:៣៥ ព្រឹក",
    avatarType: "mask",
  },
  {
    id: "m4",
    groupId: "stress-burnout",
    senderName: "Mentor Tivea",
    senderNameKm: "អ្នកណែនាំ ទីវា",
    isAnonymous: false,
    isMentor: true,
    text: "That's a great question! Maybe we can share some small routines that work for us.",
    textKm: "សំណួរនេះល្អណាស់! ប្រហែលជាយើងអាចចែករំលែកទម្លាប់តូចៗប្រចាំថ្ងៃដែលយើងធ្លាប់អនុវត្តបានផលល្អ។",
    time: "10:45 AM",
    timeKm: "ម៉ោង ១០:៤៥ ព្រឹក",
    avatarType: "mentor",
  },
  {
    id: "m5",
    groupId: "stress-burnout",
    senderName: "Anonymous 03",
    senderNameKm: "សមាជិកអនាមិក ០៣",
    isAnonymous: true,
    text: "Here is a quick daily breathwork guide that helped me through today's deadlines.",
    textKm: "នេះជាការណែនាំអំពីការដកដង្ហើមប្រចាំថ្ងៃ ដែលបានជួយខ្ញុំឆ្លងកាត់ការងារបន្ទាន់ថ្ងៃនេះ។",
    time: "11:02 AM",
    timeKm: "ម៉ោង ១១:០២ ព្រឹក",
    avatarType: "mask",
    attachment: {
      name: "daily-breathwork-routine.pdf",
      url: "#",
      type: "file",
      sizeStr: "245 KB",
    },
  },
  {
    id: "m-dep-1",
    groupId: "depression-support",
    senderName: "Mentor Dara",
    senderNameKm: "អ្នកណែនាំ ដារ៉ា",
    isAnonymous: false,
    isMentor: true,
    text: "Welcome to Depression Support Group. Please take your time and know this is a safe, gentle space.",
    textKm: "សូមស្វាគមន៍មកកាន់ក្រុមគាំទ្រ។ សូមចំណាយពេលតាមសម្រួល ហើយសូមចងចាំថានេះជាទីកន្លែងសុវត្ថិភាព និងកក់ក្តៅបំផុតសម្រាប់អ្នក។",
    time: "9:00 AM",
    timeKm: "ម៉ោង ៩:០០ ព្រឹក",
    avatarType: "mentor",
  },
  {
    id: "m-dep-2",
    groupId: "depression-support",
    senderName: "Anonymous 01",
    senderNameKm: "សមាជិកអនាមិក ០១",
    isAnonymous: true,
    text: "Thank you mentor Dara, having a quiet space to share means a lot to me.",
    textKm: "អរគុណអ្នកណែនាំ ដារ៉ា ការមានកន្លែងស្ងប់ស្ងាត់ដើម្បីចែករំលែកបែបនេះពិតជាមានន័យខ្លាំងណាស់សម្រាប់ខ្ញុំ។",
    time: "9:15 AM",
    timeKm: "ម៉ោង ៩:១៥ ព្រឹក",
    avatarType: "mask",
  },
];

export const INITIAL_ACTIVITIES: GroupActivity[] = [
  {
    id: "act-1",
    groupId: "stress-burnout",
    title: "Group Discussion",
    titleKm: "កិច្ចពិភាក្សាក្រុម (Group Discussion)",
    topic: "Managing Exam Stress",
    topicKm: "ការគ្រប់គ្រងភាពតានតឹងពេលប្រឡង (Managing Exam Stress)",
    dateStr: "Sun, Mar 13, 10:33 PM",
    dateStrKm: "អាទិត្យ ១៣ មីនា ម៉ោង ១០:៣៣ យប់",
    type: "discussion",
    iconAsset: "/figma/community/icons/act_discussion.png",
    isUpcoming: true,
    isJoined: false,
  },
  {
    id: "act-2",
    groupId: "stress-burnout",
    title: "Mindfulness Session",
    titleKm: "វគ្គហ្វឹកហាត់សតិ (Mindfulness Session)",
    topic: "5-minute Breathing",
    topicKm: "ការដកដង្ហើម ៥ នាទី (5-Minute Breathing)",
    dateStr: "Wed, Mar 19, 8:33 PM",
    dateStrKm: "ពុធ ១៩ មីនា ម៉ោង ៨:៣៣ យប់",
    type: "mindfulness",
    iconAsset: "/figma/community/icons/act_mindfulness.png",
    isUpcoming: true,
    isJoined: false,
  },
  {
    id: "act-3",
    groupId: "stress-burnout",
    title: "Share & Support",
    titleKm: "ចែករំលែក និងគាំទ្រ (Share & Support)",
    topic: "Let’s Talk",
    topicKm: "ជជែកចែករំលែក (Let's Talk)",
    dateStr: "Sun, Mar 20, 1:33 PM",
    dateStrKm: "អាទិត្យ ២០ មីនា ម៉ោង ១:៣៣ រសៀល",
    type: "support",
    iconAsset: "/figma/community/icons/act_support.png",
    isUpcoming: true,
    isJoined: false,
  },
  {
    id: "act-4",
    groupId: "stress-burnout",
    title: "Study Tips Sharing",
    titleKm: "ការចែករំលែកគន្លឹះសិក្សា (Study Tips)",
    topic: "Past Event",
    topicKm: "កម្មវិធីកន្លងមក (Past Event)",
    dateStr: "Mar 3, 2026",
    dateStrKm: "៣ មីនា ២០២៦",
    type: "study",
    iconAsset: "/figma/community/icons/act_study.png",
    isUpcoming: false,
    isJoined: true,
  },
  {
    id: "act-5",
    groupId: "stress-burnout",
    title: "Coping with overwhelm",
    titleKm: "ការទប់ទល់នឹងភាពធុញថប់ (Coping with Overwhelm)",
    topic: "Past Event",
    topicKm: "កម្មវិធីកន្លងមក (Past Event)",
    dateStr: "Mar 1, 2026",
    dateStrKm: "១ មីនា ២០២៦",
    type: "coping",
    iconAsset: "/figma/community/icons/act_coping.png",
    isUpcoming: false,
    isJoined: true,
  },
  {
    id: "act-dep-1",
    groupId: "depression-support",
    title: "Gentle Sharing Circle",
    titleKm: "រង្វង់ចែករំលែកទន់ភ្លន់ (Sharing Circle)",
    topic: "Managing Low Energy Days",
    topicKm: "ការគ្រប់គ្រងថ្ងៃអស់កម្លាំង (Managing Low Energy Days)",
    dateStr: "Sat, Mar 22, 7:00 PM",
    dateStrKm: "សៅរ៍ ២២ មីនា ម៉ោង ៧:០០ យប់",
    type: "support",
    iconAsset: "/figma/community/icons/act_support.png",
    isUpcoming: true,
    isJoined: false,
  },
  {
    id: "act-dep-2",
    groupId: "depression-support",
    title: "Calm Breathing Routine",
    titleKm: "ការដកដង្ហើមស្ងប់ស្ងាត់ (Calm Breathing Routine)",
    topic: "10-minute Relaxation",
    topicKm: "ការសម្រាកអារម្មណ៍ ១០ នាទី (10-Minute Relaxation)",
    dateStr: "Tue, Mar 25, 8:00 PM",
    dateStrKm: "អង្គារ ២៥ មីនា ម៉ោង ៨:០០ យប់",
    type: "mindfulness",
    iconAsset: "/figma/community/icons/act_mindfulness.png",
    isUpcoming: true,
    isJoined: false,
  },
];

export const INITIAL_MEMBERS: GroupMember[] = [
  { id: "mem-1", groupId: "stress-burnout", name: "Anonymous 01", nameKm: "សមាជិកអនាមិក ០១", isAnonymous: true, avatarType: "mask" },
  { id: "mem-2", groupId: "stress-burnout", name: "Anonymous 02", nameKm: "សមាជិកអនាមិក ០២", isAnonymous: true, avatarType: "mask" },
  { id: "mem-3", groupId: "stress-burnout", name: "Panharith", nameKm: "បញ្ញារិទ្ធ (Panharith)", isAnonymous: false, avatarType: "user" },
  { id: "mem-4", groupId: "stress-burnout", name: "Anonymous 03", nameKm: "សមាជិកអនាមិក ០៣", isAnonymous: true, avatarType: "mask" },
  { id: "mem-5", groupId: "stress-burnout", name: "Seakkhim", nameKm: "សៀកឃីម (Seakkhim)", isAnonymous: false, avatarType: "user" },
  { id: "mem-6", groupId: "stress-burnout", name: "MalaNy", nameKm: "ម៉ាឡានី (MalaNy)", isAnonymous: false, avatarType: "user" },
  { id: "mem-7", groupId: "stress-burnout", name: "Anonymous 04", nameKm: "សមាជិកអនាមិក ០៤", isAnonymous: true, avatarType: "mask" },
  { id: "mem-8", groupId: "stress-burnout", name: "Anonymous 05", nameKm: "សមាជិកអនាមិក ០៥", isAnonymous: true, avatarType: "mask" },
  { id: "mem-dep-1", groupId: "depression-support", name: "Anonymous 01", nameKm: "សមាជិកអនាមិក ០១", isAnonymous: true, avatarType: "mask" },
  { id: "mem-dep-2", groupId: "depression-support", name: "Anonymous 02", nameKm: "សមាជិកអនាមិក ០២", isAnonymous: true, avatarType: "mask" },
  { id: "mem-dep-3", groupId: "depression-support", name: "Panharith", nameKm: "បញ្ញារិទ្ធ (Panharith)", isAnonymous: false, avatarType: "user" },
  { id: "mem-dep-4", groupId: "depression-support", name: "Seakkhim", nameKm: "សៀកឃីម (Seakkhim)", isAnonymous: false, avatarType: "user" },
  { id: "mem-dep-5", groupId: "depression-support", name: "MalaNy", nameKm: "ម៉ាឡានី (MalaNy)", isAnonymous: false, avatarType: "user" },
  { id: "mem-dep-6", groupId: "depression-support", name: "Anonymous 03", nameKm: "សមាជិកអនាមិក ០៣", isAnonymous: true, avatarType: "mask" },
  { id: "mem-dep-7", groupId: "depression-support", name: "Anonymous 04", nameKm: "សមាជិកអនាមិក ០៤", isAnonymous: true, avatarType: "mask" },
  { id: "mem-dep-8", groupId: "depression-support", name: "Anonymous 05", nameKm: "សមាជិកអនាមិក ០៥", isAnonymous: true, avatarType: "mask" },
];
