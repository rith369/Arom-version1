'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle, Plus, UsersRound } from 'lucide-react';
import { useLanguage } from '../../_components/language-provider';
import { CreateGroupView } from '../../community/components/create-group-view';
import type { SupportGroup } from '../../community/community-data';
import { createSupportGroup } from '../../community/group-api';

// What GET /api/community/groups returns for each group.
type GroupRow = {
  id: string;
  name: string;
  nameKm: string | null;
  membersCount: number;
  maxMembers: number;
  // True for groups this professional leads (mentor) or joined.
  isJoined: boolean;
  status: 'active' | 'closed';
};

type Status = 'loading' | 'ready' | 'failed';

/**
 * /pro/groups: the support groups a professional leads, and a way to start
 * one without leaving the professional area. The chat itself opens on
 * /community, where members are.
 */
export function ProGroupsView() {
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [status, setStatus] = useState<Status>('loading');
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch('/api/community/groups', { cache: 'no-store' });
        if (!response.ok) throw new Error('failed');
        const result: { groups: GroupRow[] } = await response.json();
        if (!active) return;
        setGroups(result.groups.filter((group) => group.isJoined));
        setStatus('ready');
      } catch {
        if (active) setStatus('failed');
      }
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  async function handleCreate(group: SupportGroup) {
    setCreateError('');
    const result = await createSupportGroup(group);
    if (!result.ok) {
      setCreateError(result.error);
      return;
    }
    setCreating(false);
    setRefresh((value) => value + 1);
  }

  if (creating) {
    return (
      <div>
        {createError && (
          <p role="alert" className="mx-auto max-w-lg px-4 pt-3 text-sm text-red-600">
            {createError}
          </p>
        )}
        <CreateGroupView
          onBack={() => {
            setCreateError('');
            setCreating(false);
          }}
          onCreate={(group) => void handleCreate(group)}
        />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('ក្រុមគាំទ្រ', 'Support groups')}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-muted">
            {t(
              'ក្រុមគាំទ្រដែលអ្នកដឹកនាំ។ សមាជិកនៅតែអនាមិក។ ក្រុមសុវត្ថិភាព AROM អាចអានការជជែកក្នុងក្រុម ដើម្បីរក្សាសុវត្ថិភាព។',
              'Peer support groups you lead. Members stay anonymous. The AROM safety team can read group chats to keep them safe.',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-full bg-arom px-4 py-2.5 text-sm font-semibold text-white hover:bg-arom-deep">
          <Plus size={17} aria-hidden="true" />
          {t('បង្កើតក្រុម', 'Create a group')}
        </button>
      </div>

      {status === 'loading' && <p className="mt-6 text-sm text-ink-muted">{t('កំពុងផ្ទុក...', 'Loading...')}</p>}

      {status === 'failed' && (
        <p role="alert" className="mt-6 text-sm text-red-600">
          {t('មិនអាចផ្ទុកក្រុមបានទេ។ សូមព្យាយាមម្តងទៀតពេលក្រោយ។', 'Your groups could not be loaded. Please try again later.')}
        </p>
      )}

      {status === 'ready' && groups.length === 0 && (
        <div className="mt-6 rounded-2xl border border-arom-border bg-white p-5 shadow-card">
          <p className="font-semibold text-ink">{t('អ្នកមិនទាន់មានក្រុមនៅឡើយទេ', 'You do not lead a group yet')}</p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            {t(
              'បង្កើតក្រុមមួយ ដើម្បីឱ្យមនុស្សដែលមានបញ្ហាដូចគ្នាអាចគាំទ្រគ្នាទៅវិញទៅមក។',
              'Create one so people facing the same thing can support each other.',
            )}
          </p>
        </div>
      )}

      {status === 'ready' && groups.length > 0 && (
        <ul className="mt-6 space-y-3">
          {groups.map((group) => (
            <li key={group.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-arom-border bg-white p-4 shadow-card">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-arom-wash text-arom">
                <UsersRound size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{km ? group.nameKm || group.name : group.name}</p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {group.membersCount}/{group.maxMembers} {t('សមាជិក', 'members')}
                  {group.status === 'closed' && (
                    <span className="ml-2 rounded-full bg-arom-danger-soft px-2 py-0.5 text-xs font-semibold text-arom-danger">
                      {t('បានបិទ', 'Closed')}
                    </span>
                  )}
                </p>
              </div>
              <Link
                href={`/pro/messages/groups/${group.id}`}
                className="flex items-center gap-1.5 rounded-full border border-arom-border px-3.5 py-2 text-sm font-semibold text-arom hover:bg-arom-wash">
                <MessageCircle size={16} aria-hidden="true" />
                {t('បើកការជជែក', 'Open chat')}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
