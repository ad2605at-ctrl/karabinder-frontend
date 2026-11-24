export type Contact = { id: string; name: string; company: string; photo?: string };
export type Conversation = { id: string; contactIds: string[]; date: string; text: string; audio?: string };
export type Records = { contacts: Contact[]; conversations: Conversation[] };

export const examples: Records = {
  contacts: [
    { id: 'aoi', name: '青井 葵', company: '青葉製作所' },
    { id: 'mori', name: '森 直人', company: '灯台デザイン' },
    { id: 'kishi', name: '岸 結衣', company: '水辺商会' },
  ],
  conversations: [
    { id: 'meeting-1', contactIds: ['aoi', 'mori'], date: '2026-10-20T04:30:00Z', text: '展示会で試作品の撮影について相談。青葉製作所から来週、製品写真を共有いただく。' },
    { id: 'meeting-2', contactIds: ['kishi'], date: '2026-10-19T03:00:00Z', text: '受発注の入力を簡単にしたいとのこと。次回は現在の帳票を見ながら話す。' },
  ],
};

export function historyFor(records: Records, id: string) {
  return records.conversations.filter(item => item.contactIds.includes(id))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function localDate(date: string) {
  const d = new Date(date);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function normalized(text: string) {
  return text.normalize('NFKC').toLowerCase().trim();
}

export function search(records: Records, query: string) {
  const words = normalized(query).split(/\s+/).filter(Boolean);
  if (!words.length) return records.contacts;
  return records.contacts.filter(contact => {
    const fields = [contact.name, contact.company, ...historyFor(records, contact.id).map(m => localDate(m.date) + ' ' + m.text)];
    const all = normalized(fields.join(' '));
    return words.every(word => all.includes(word));
  });
}

export function putContact(records: Records, contact: Contact): Records {
  const entry = { ...contact, name: contact.name.trim(), company: contact.company.trim() };
  if (!entry.name) throw Error('氏名を入力してください。');
  return { ...records, contacts: [entry, ...records.contacts.filter(c => c.id !== entry.id)] };
}

export function putConversation(records: Records, conversation: Conversation): Records {
  const entry = { ...conversation, text: conversation.text.trim(), contactIds: [...new Set(conversation.contactIds)] };
  if (!entry.text && !entry.audio) throw Error('メモを入力するか、音声を録音してください。');
  if (!entry.contactIds.length || !entry.contactIds.every(id => records.contacts.some(c => c.id === id))) {
    throw Error('会話した相手を選んでください。');
  }
  return { ...records, conversations: [entry, ...records.conversations.filter(m => m.id !== entry.id)] };
}

export function newId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}
