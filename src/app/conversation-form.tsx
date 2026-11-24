import { useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Platform, Pressable, Text } from 'react-native';
import { Playback, Recorder } from '../components/voice';
import { mediaUri, saveWithMedia } from '../data/media';
import { newId, putConversation } from '../data/model';
import { useRecords } from '../data/store';
import { Action, colors, Field, Page, s } from '../ui';

export default function ConversationForm() {
  const { id, contactId } = useLocalSearchParams<{ id?: string; contactId?: string }>();
  const { records, update } = useRecords();
  const existing = records.conversations.find(m => m.id === id);
  const [text, setText] = useState(existing?.text || '');
  const [ids, select] = useState(existing?.contactIds ?? (contactId ? [contactId] : []));
  const [source, setSource] = useState<string>();
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  if (id && !existing) return <Page><Text>このメモが見つかりません。</Text></Page>;
  const playback = source || (existing?.audio && mediaUri(existing.audio));
  async function save() {
    if (lock.current || recording) return;
    if (!ids.length) return setError('会話した相手を選んでください。');
    if (!text.trim() && !playback) return setError('メモを入力するか、音声を録音してください。');
    lock.current = true;
    setSaving(true);
    setError('');
    try {
      await saveWithMedia(existing?.audio, source, '.m4a', audio => update(r => putConversation(r, {
        id: id || newId(), date: existing?.date || new Date().toISOString(), text, contactIds: ids, audio,
      })));
      if (router.canGoBack()) router.back();
      else router.replace({ pathname: '/contacts/[id]', params: { id: ids[0] } });
    } catch { setError('メモを保存できませんでした。もう一度お試しください。'); }
    finally { lock.current = false; setSaving(false); }
  }
  return <Page>
    <Text style={s.heading}>{existing ? '会話メモを編集' : '会話を記録'}</Text>
    <Text style={s.label}>会話した相手（複数選択可）</Text>
    {records.contacts.map(c => {
      const checked = ids.includes(c.id);
      return <Pressable key={c.id} accessibilityRole="checkbox" accessibilityState={{ checked }} style={[s.card, checked && { borderColor: colors.teal, backgroundColor: '#e3eee6' }]}
        onPress={() => select(old => old.includes(c.id) ? old.filter(x => x !== c.id) : [...old, c.id])}>
        <Text style={s.body}>{checked ? '✓　' : '□　'}{c.name}　{c.company}</Text>
      </Pressable>;
    })}
    <Field label="話した内容" multiline placeholder="相手の課題、約束したこと、次の連絡など" value={text} onChangeText={setText} />
    {Platform.OS !== 'web' && <>
      <Recorder onReady={setSource} onBusy={setRecording} disabled={saving} />
      {!!playback && !recording && <Playback uri={playback} />}
    </>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Action label="会話メモを保存" disabled={saving || recording} onPress={save} />
  </Page>;
}
