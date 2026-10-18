'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../../_components/auth-provider';
import { GROUP_TOPICS } from '../group-topics';
import { useLanguage } from '../../_components/language-provider';
import {
  DEFAULT_GROUP_RULES,
  DEFAULT_GROUP_RULES_KM,
  type SupportGroup,
} from '../community-data';

const groupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameKm: z.string().trim().max(160),
  about: z.string().trim().min(1).max(1000),
  aboutKm: z.string().trim().max(1000),
  iconType: z.enum(['anxiety', 'stress', 'depression', 'sleep', 'burnout', 'academic', 'self_growth', 'general']),
  maxMembers: z.coerce.number().int().min(2).max(10),
  isAnonymous: z.boolean(),
  rules: z.string().max(2000),
});

type GroupFormInput = z.input<typeof groupSchema>;
type GroupFormValues = z.output<typeof groupSchema>;

type CreateGroupViewProps = {
  onBack: () => void;
  onCreate: (group: SupportGroup) => void;
};

const inputClass = (invalid: boolean) =>
  `mt-1.5 w-full rounded-[14px] border bg-white px-3.5 py-2.5 text-sm font-normal text-[#111827] outline-none focus:ring-2 focus:ring-[#1f6f5b]/20 ${
    invalid ? 'border-red-400' : 'border-gray-200 focus:border-[#1f6f5b]'
  }`;

export function CreateGroupView({ onBack, onCreate }: CreateGroupViewProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const km = language === 'km';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupFormInput, unknown, GroupFormValues>({
    resolver: zodResolver(groupSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      nameKm: '',
      about: '',
      aboutKm: '',
      iconType: 'stress',
      maxMembers: 10,
      isAnonymous: true,
      rules: DEFAULT_GROUP_RULES.join('\n'),
    },
  });

  const submit = handleSubmit((values) => {
    const rules = values.rules
      .split('\n')
      .map((rule) => rule.trim())
      .filter(Boolean);
    const usesDefaultRules =
      rules.length === 0 || rules.join('\n') === DEFAULT_GROUP_RULES.join('\n');
    const isProfessional = user?.role === 'professional';
    const creatorName = user?.fullName.trim() || (km ? 'អ្នកណែនាំ' : 'Mentor');

    onCreate({
      id: `group-${crypto.randomUUID()}`,
      name: values.name,
      nameKm: values.nameKm || values.name,
      about: values.about,
      aboutKm: values.aboutKm || values.about,
      membersCount: 1,
      maxMembers: values.maxMembers,
      iconType: values.iconType,
      isAnonymous: values.isAnonymous,
      expectations: [],
      expectationsKm: [],
      rules: usesDefaultRules ? DEFAULT_GROUP_RULES : rules,
      rulesKm: usesDefaultRules ? DEFAULT_GROUP_RULES_KM : rules,
      mentor: {
        name: creatorName,
        nameKm: creatorName,
        role: isProfessional ? 'Verified AROM Mentor' : 'AROM Team',
        roleKm: isProfessional ? 'អ្នកណែនាំ AROM ផ្លូវការ' : 'ក្រុមការងារ AROM',
        experience: 'Group creator',
        experienceKm: 'អ្នកបង្កើតក្រុម',
        badge: 'Group Mentor',
        badgeKm: 'អ្នកណែនាំក្រុម',
      },
      mentorTitle: `${creatorName} · ${isProfessional ? 'Verified AROM Mentor' : 'AROM Team'}`,
      mentorTitleKm: `${creatorName} · ${isProfessional ? 'អ្នកណែនាំ AROM ផ្លូវការ' : 'ក្រុមការងារ AROM'}`,
      isJoined: true,
      status: 'active',
      createdBy: isProfessional ? 'professional' : 'admin',
    });
  });

  const required = km ? 'សូមបំពេញ (Required)' : 'Required';

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 pt-3">
      <div className="flex items-center py-2">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-[#1f6f5b] hover:bg-[#eaf5f1] transition-colors"
          aria-label={km ? 'ត្រឡប់ក្រោយ' : 'Back'}>
          <ChevronLeft size={28} />
        </button>
      </div>

      <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
        {km ? 'បង្កើតក្រុមគាំទ្រ (Create a group)' : 'Create a support group'}
      </h1>
      <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
        {km
          ? 'ក្រុមនឹងបង្ហាញដល់អ្នកប្រើភ្លាមៗ។ អ្នកនឹងក្លាយជាអ្នកណែនាំក្រុម។'
          : 'Your group goes live right away. You will be its mentor.'}
      </p>

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-[#111827]">
          {km
            ? 'ឈ្មោះក្រុម ជាភាសាអង់គ្លេស (Name in English) *'
            : 'Group name (English) *'}
          <input
            {...register('name')}
            maxLength={120}
            aria-invalid={Boolean(errors.name)}
            className={inputClass(Boolean(errors.name))}
          />
          {errors.name && (
            <span className="mt-1 block text-xs text-red-600">{required}</span>
          )}
        </label>

        <label className="block text-sm font-semibold text-[#111827]">
          {km ? 'ឈ្មោះក្រុម ជាភាសាខ្មែរ (Name in Khmer)' : 'Group name (Khmer)'}
          <input
            {...register('nameKm')}
            maxLength={160}
            className={inputClass(false)}
          />
        </label>

        <label className="block text-sm font-semibold text-[#111827]">
          {km
            ? 'អំពីក្រុម ជាភាសាអង់គ្លេស (About in English) *'
            : 'About this group (English) *'}
          <textarea
            {...register('about')}
            rows={3}
            maxLength={1000}
            aria-invalid={Boolean(errors.about)}
            className={inputClass(Boolean(errors.about))}
          />
          {errors.about && (
            <span className="mt-1 block text-xs text-red-600">{required}</span>
          )}
        </label>

        <label className="block text-sm font-semibold text-[#111827]">
          {km
            ? 'អំពីក្រុម ជាភាសាខ្មែរ (About in Khmer)'
            : 'About this group (Khmer)'}
          <textarea
            {...register('aboutKm')}
            rows={3}
            maxLength={1000}
            className={inputClass(false)}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#111827]">
            {km ? 'ប្រធានបទ (Topic)' : 'Topic'}
            <select {...register('iconType')} className={inputClass(false)}>
              {GROUP_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {km ? `${topic.km} (${topic.en})` : topic.en}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-[#111827]">
            {km ? 'ចំនួនសមាជិកអតិបរមា (Maximum members)' : 'Maximum members'}
            <input
              {...register('maxMembers')}
              type="number"
              min={2}
              max={20}
              step={1}
              aria-invalid={Boolean(errors.maxMembers)}
              className={inputClass(Boolean(errors.maxMembers))}
            />
            {errors.maxMembers && (
              <span className="mt-1 block text-xs text-red-600">
                {km ? 'ពី ២ ដល់ ២០ នាក់' : 'From 2 to 20 members'}
              </span>
            )}
          </label>
        </div>

        <label className="block text-sm font-semibold text-[#111827]">
          {km
            ? 'ច្បាប់ក្រុម មួយក្នុងមួយបន្ទាត់ (Group rules)'
            : 'Group rules (one per line)'}
          <textarea
            {...register('rules')}
            rows={6}
            maxLength={2000}
            className={inputClass(false)}
          />
        </label>

        <label className="flex items-center gap-2.5 text-sm text-[#374151]">
          <input
            {...register('isAnonymous')}
            type="checkbox"
            className="size-4 accent-[#1a5d4d]"
          />
          {km
            ? 'សមាជិកអាចចូលរួមដោយអនាមិក (Anonymous)'
            : 'Members take part anonymously'}
        </label>

        <p className="rounded-[14px] bg-[#f2f9f6] p-3 text-xs text-[#2d6a54] leading-relaxed">
          {km
            ? 'ក្រុមការងារសុវត្ថិភាព AROM អាចអានការសន្ទនាក្នុងក្រុម និងអាចបិទក្រុមដែលមិនគោរពច្បាប់សហគមន៍។'
            : 'The AROM safety team can read group chats and can close a group that breaks the community rules.'}
        </p>

        <button
          type="submit"
          className="w-full rounded-[18px] bg-[#1a5d4d] py-3.5 text-center text-sm sm:text-base font-bold text-white shadow-lg shadow-[#1a5d4d]/25 transition-all duration-200 hover:bg-[#144b3e] active:scale-[0.99]">
          {km ? 'បង្កើតក្រុម (Create group)' : 'Create group'}
        </button>
      </form>
    </div>
  );
}
