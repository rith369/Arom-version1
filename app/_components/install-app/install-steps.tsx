'use client';

import { EllipsisVertical, Share, Smartphone, SquarePlus, type LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  text: string;
}

// Steps for browsers that cannot open an install dialog themselves: Safari on
// iPhone and iPad, and the browser menu everywhere else.
export function InstallSteps({ id, ios, km, className = '' }: { id: string; ios: boolean; km: boolean; className?: string }) {
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const steps: Step[] = ios
    ? [
        { icon: Share, text: t('ចុចប៊ូតុង ចែករំលែក (Share) នៅក្នុង Safari។', 'In Safari, tap the Share button.') },
        {
          icon: SquarePlus,
          text: t('ជ្រើសរើស "បន្ថែមទៅអេក្រង់ដើម" (Add to Home Screen)។', 'Choose "Add to Home Screen".'),
        },
        { icon: Smartphone, text: t('ចុច "បន្ថែម" (Add)។ AROM នឹងនៅលើអេក្រង់ដើមរបស់អ្នក។', 'Tap "Add". AROM is now on your home screen.') },
      ]
    : [
        { icon: EllipsisVertical, text: t('បើកម៉ឺនុយរបស់កម្មវិធីរុករក។', 'Open your browser menu.') },
        {
          icon: SquarePlus,
          text: t(
            'ជ្រើសរើស "ដំឡើងកម្មវិធី" (Install app) ឬ "បន្ថែមទៅអេក្រង់ដើម" (Add to Home screen)។',
            'Choose "Install app" or "Add to Home screen".',
          ),
        },
        { icon: Smartphone, text: t('AROM នឹងនៅលើអេក្រង់ដើមរបស់អ្នក។', 'AROM is now on your home screen.') },
      ];

  return (
    <ol id={id} className={`space-y-3 ${className}`}>
      {steps.map((step, index) => (
        <li key={step.text} className="flex items-center gap-3 text-sm text-ink">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-arom-wash text-arom">
            <step.icon size={17} aria-hidden="true" />
          </span>
          <span>
            <span className="sr-only">{t(`ជំហាន ${index + 1}:`, `Step ${index + 1}:`)} </span>
            {step.text}
          </span>
        </li>
      ))}
    </ol>
  );
}
