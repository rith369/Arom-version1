'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, CalendarCheck, FolderOpen, Lock, MessageCircle, Search } from 'lucide-react';

import { usePro } from './pro-provider';
import { SuggestSessionDialog } from './suggest-session-dialog';
import { ChatThread } from '../../_components/messages/chat-thread';
import { ChatListRow, mergeChatRows, type ChatRow } from '../../_components/messages/chat-list';
import { GroupChat } from '../../community/components/group-chat';
import { useMyGroups } from '../../community/group-api';
import {
  REPLY_TIME_LABELS,
  conversationId,
  setReplyTime,
  useConversations,
  useMessageStore,
  type Conversation,
  type ReplyTime,
} from '../../_components/messages/message-store';
import { useLanguage } from '../../_components/language-provider';
import { clientsFrom } from '../_data/clients';

// Messages holds every chat, like Telegram: private chats with clients and
// the support groups this professional leads or joined, newest first.
export function ProMessagesView({ clientId, groupId }: { clientId?: string; groupId?: string }) {
  const { bookings, profile, archivedClients, schedule } = usePro();
  const { replyTimes } = useMessageStore();
  const list = useConversations('professional');
  const myGroups = useMyGroups();
  const router = useRouter();
  const { language } = useLanguage();
  const km = language === 'km';
  const t = (kmText: string, enText: string) => (km ? kmText : enText);

  const [now] = useState(() => Date.now());
  const [query, setQuery] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  // Only people who booked with this professional can be messaged.
  const clients = clientsFrom(bookings, now);
  const conversationFor = (id: string, name: string): Conversation => ({
    id: conversationId(profile.slug, id),
    professionalId: profile.slug,
    professionalName: profile.displayName,
    kmProfessionalName: profile.kmDisplayName,
    clientId: id,
    clientName: name,
  });
  const summaryFor = (id: string) => list.conversations.find((item) => item.key === conversationId(profile.slug, id));

  const search = query.trim().toLocaleLowerCase();
  const clientRows: ChatRow[] = clients.map((client) => {
    const last = summaryFor(client.id)?.last ?? null;
    return {
      kind: 'direct',
      key: client.id,
      href: `/pro/messages/${client.id}`,
      name: client.name,
      lastAt: last?.createdAt ?? null,
      preview: !last
        ? t('មិនទាន់មានសារ', 'No messages yet')
        : last.kind === 'suggestion'
          ? t('អ្នកបានណែនាំម៉ោងវគ្គបន្ទាប់', 'You suggested times for the next session')
          : last.kind === 'voice'
            ? t('សារសំឡេង', 'Voice message')
            : last.kind === 'image'
              ? `${last.mine ? t('អ្នក: ', 'You: ') : ''}${t('រូបថត', 'Photo')}`
              : last.kind === 'file'
                ? `${last.mine ? t('អ្នក: ', 'You: ') : ''}PDF`
                : `${last.mine ? t('អ្នក: ', 'You: ') : ''}${last.text}`,
      voice: last?.kind === 'voice',
      unread: summaryFor(client.id)?.unread ?? 0,
      selected: client.id === clientId,
    };
  });
  const rows = mergeChatRows(clientRows, myGroups.groups, {
    href: (id) => `/pro/messages/groups/${id}`,
    selectedGroupId: groupId,
    km,
  }).filter((row) => row.name.toLocaleLowerCase().includes(search));
  const selectedGroup = myGroups.groups.find((group) => group.id === groupId);
  const hasSelection = Boolean(clientId || groupId);

  const selected = clients.find((client) => client.id === clientId);
  // Values for quick replies: {name}, {link} and {next}.
  const nextSession = bookings
    .filter((item) => item.clientId === clientId && item.status === 'booked' && Date.parse(item.startsAt) > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const nextLabel = nextSession
    ? new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Phnom_Penh' }).format(new Date(nextSession.startsAt))
    : '';
  const replyTime: ReplyTime = replyTimes[profile.slug] ?? 'one_day';
  const time = new Intl.DateTimeFormat(km ? 'km-KH' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Phnom_Penh' });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t('សារ', 'Messages')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            {t(
              'ការជជែកឯកជនជាមួយអតិថិជន (អ្នកគ្រប់គ្រងមិនអាចអានបានទេ) និងក្រុមគាំទ្ររបស់អ្នក (ក្រុមសុវត្ថិភាព AROM អាចអានបាន)។',
              'Private chats with your clients (admins cannot read them), and your support groups (the AROM safety team can read them).',
            )}
          </p>
        </div>
        <label className="text-xs font-medium text-ink-muted">
          {t('ពេលវេលាឆ្លើយតបដែលអតិថិជនឃើញ', 'Reply time clients see')}
          <select
            value={replyTime}
            onChange={(event) => void setReplyTime(profile.slug, event.target.value as ReplyTime)}
            className="mt-1 block rounded-xl border border-arom-border bg-white px-3 py-2 text-sm text-ink">
            {(Object.keys(REPLY_TIME_LABELS) as ReplyTime[]).map((value) => (
              <option key={value} value={value}>
                {km ? REPLY_TIME_LABELS[value].km : REPLY_TIME_LABELS[value].en}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid overflow-hidden rounded-3xl border border-arom-border bg-white shadow-card lg:h-[72vh] lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className={`border-arom-border lg:flex lg:min-h-0 lg:flex-col lg:border-r ${hasSelection ? 'hidden' : 'flex flex-col'}`}>
          <div className="border-b border-arom-border p-3">
            <div className="relative">
              <Search size={16} aria-hidden="true" className="absolute left-3 top-2.5 text-ink-muted" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t('ស្វែងរកការជជែក', 'Search chats')}
                placeholder={t('ស្វែងរកអតិថិជន ឬក្រុម...', 'Search clients or groups...')}
                className="w-full rounded-xl border border-arom-border bg-arom-wash/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-arom focus:bg-white"
              />
            </div>
          </div>
          {rows.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-muted">
              {clients.length === 0 && myGroups.groups.length === 0
                ? t('អ្នកអាចផ្ញើសារទៅអតិថិជន បន្ទាប់ពីពួកគេកក់ជាមួយអ្នក។', 'You can message clients after they book with you.')
                : t('រកមិនឃើញ', 'No matching chats')}
            </p>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-arom-border overflow-y-auto">
              {rows.map((row) => (
                <ChatListRow key={row.key} row={row} km={km} formatDate={(value) => time.format(new Date(value))} />
              ))}
            </ul>
          )}
        </aside>

        <section className={`min-h-0 flex-col ${hasSelection ? 'flex h-[75vh] lg:h-auto' : 'hidden lg:flex'}`}>
          {selectedGroup ? (
            <GroupChat key={selectedGroup.id} group={selectedGroup} onRead={myGroups.markRead} onBack={() => router.push('/pro/messages')} />
          ) : selected ? (
            <>
              <header className="flex flex-wrap items-center gap-3 border-b border-arom-border px-4 py-3 sm:px-6">
                <Link href="/pro/messages" aria-label={t('ត្រឡប់ក្រោយ', 'Back')} className="rounded-full p-1.5 text-arom hover:bg-arom-wash lg:hidden">
                  <ArrowLeft size={18} />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{selected.name}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    <Lock size={11} aria-hidden="true" />
                    {t('ឯកជន', 'Private')} · {km ? REPLY_TIME_LABELS[replyTime].km : REPLY_TIME_LABELS[replyTime].en}
                  </p>
                </div>
                {!archivedClients.includes(selected.id) && (
                  <button type="button" onClick={() => setSuggesting(true)} className="flex items-center gap-1.5 text-sm font-semibold text-arom hover:underline">
                    <CalendarCheck size={15} aria-hidden="true" />
                    {t('ណែនាំវគ្គ', 'Suggest a session')}
                  </button>
                )}
                <Link href={`/pro/clients/${selected.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-arom hover:underline">
                  <FolderOpen size={15} aria-hidden="true" />
                  {t('ឯកសារអតិថិជន', 'Client file')}
                </Link>
              </header>
              <div className="min-h-0 flex-1">
                <ChatThread
                  conversation={conversationFor(selected.id, selected.name)}
                  viewer="professional"
                  km={km}
                  quickReplyValues={{
                    name: selected.name,
                    link: nextSession?.meetingUrl ?? schedule.meetingUrl,
                    next: nextLabel,
                  }}
                  closedNote={
                    archivedClients.includes(selected.id)
                      ? t('អតិថិជននេះត្រូវបានដាក់ជាអតិថិជនចាស់។ សារត្រូវបានរក្សាទុក ប៉ុន្តែមិនអាចផ្ញើសារថ្មីបានទេ។', 'This client is archived. Messages are kept, but no new messages can be sent.')
                      : undefined
                  }
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <MessageCircle size={32} aria-hidden="true" className="text-ink-muted" />
              <p className="mt-3 text-sm text-ink-muted">{t('ជ្រើសរើសការជជែក ដើម្បីមើលសារ។', 'Choose a chat to see its messages.')}</p>
            </div>
          )}
        </section>
      </div>

      {suggesting && selected && (
        <SuggestSessionDialog
          clientId={selected.id}
          clientName={selected.name}
          defaultType={bookings.find((item) => item.clientId === selected.id)?.sessionType ?? 'online'}
          onClose={() => setSuggesting(false)}
        />
      )}
    </>
  );
}
