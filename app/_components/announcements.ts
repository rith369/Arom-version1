// Short messages from the AROM team shown at the top of every user page,
// guests included, until they end or an admin ends them. Only the newest
// one that is still running shows. Managed in Admin, Settings.

export type AnnouncementTone = 'info' | 'good' | 'important';

export type Announcement = {
  id: string;
  kmText: string;
  // Optional. Without it, English readers see the Khmer text.
  enText: string;
  tone: AnnouncementTone;
  // A page inside AROM such as /mindguide or /podcasts. Empty for no button.
  link: string;
  createdAt: string;
  createdBy: string;
  // null means it runs until an admin ends it.
  endsAt: string | null;
  endedAt: string | null;
};

export const ANNOUNCEMENT_MAX_LENGTH = 300;

// Empty until the backend serves announcements. Admin edits are mock for now.
export const ANNOUNCEMENTS: Announcement[] = [];

export function isRunning(item: Announcement, now: number) {
  return !item.endedAt && (item.endsAt === null || Date.parse(item.endsAt) > now);
}

export function currentAnnouncement(list: Announcement[], now: number) {
  return (
    list
      .filter((item) => isRunning(item, now))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
}

// Only links inside AROM, never another website.
export function isValidAppLink(value: string) {
  return /^\/(?!\/)[A-Za-z0-9\-._~/]*$/.test(value);
}
