export type AdminJournalPrompt = {
  id: string;
  question: string;
  kmQuestion: string;
  placeholder: string;
  kmPlaceholder: string;
  order: number;
  isActive: boolean;
};

export const initialJournalPrompts: AdminJournalPrompt[] = [
  {
    id: 'q_happy',
    question: 'What made you happy today?',
    kmQuestion: 'អ្វីដែលធ្វើឱ្យអ្នកសប្បាយចិត្តថ្ងៃនេះ?',
    placeholder: 'e.g. A friend smiled at me, had a good lunch',
    kmPlaceholder: 'ឧ. មិត្តភក្តិញញឹមដាក់ ឬបានញ៉ាំអាហារឆ្ងាញ់',
    order: 1,
    isActive: true,
  },
  {
    id: 'q_difficult',
    question: 'What was challenging or difficult?',
    kmQuestion: 'អ្វីដែលជាឧបសគ្គ ឬពិបាកចិត្តថ្ងៃនេះ?',
    placeholder: 'e.g. Study pressure, unexpected delays',
    kmPlaceholder: 'ឧ. សម្ពាធរៀនសូត្រ ឬការពន្យារពេលដែលមិនបានរំពឹងទុក',
    order: 2,
    isActive: true,
  },
  {
    id: 'q_grateful',
    question: 'What are you grateful for today?',
    kmQuestion: 'តើអ្នកមានអំណរគុណចំពោះអ្វីថ្ងៃនេះ?',
    placeholder: 'Write about something you appreciated today.',
    kmPlaceholder: 'សរសេរអំពីអ្វីដែលអ្នកពេញចិត្តថ្ងៃនេះ។',
    order: 3,
    isActive: false,
  },
];
