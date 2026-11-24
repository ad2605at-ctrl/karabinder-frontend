import { router, useLocalSearchParams } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { historyFor, localDate } from '../../data/model';
import { useRecords } from '../../data/store';
import { mediaUri } from '../../data/media';
import { Playback } from '../../components/voice';
import { Action, Page, s } from '../../ui';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { records } = useRecords();
  const contact = records.contacts.find(c => c.id === id);
  if (!contact) return <Page><Text style={s.body}>この名刺が見つかりません。</Text><Action label="名刺一覧へ" onPress={() => router.replace('/')} /></Page>;
  const meetings = historyFor(records, contact.id);
  return <Page>
    <View style={s.card}>
      <Text style={s.hint}>{contact.company || '会社名未登録'}</Text>
      <Text style={s.heading}>{contact.name}</Text>
      {!!contact.photo && <Image accessibilityLabel="撮影した名刺" resizeMode="contain" style={{ width: '100%', height: 180 }} source={{ uri: mediaUri(contact.photo) }} />}
      <Action secondary label="名刺を編集" onPress={() => router.push({ pathname: '/contact-form', params: { id } })} />
    </View>
    <Text style={s.label}>会話の履歴（{meetings.length}件）</Text>
    <Action label="＋ 会話メモを追加" onPress={() => router.push({ pathname: '/conversation-form', params: { contactId: id } })} />
    {meetings.map(m => <View key={m.id} style={s.card}>
      <Text style={s.hint}>{localDate(m.date)}　{new Date(m.date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</Text>
      <Text style={s.label}>{records.contacts.filter(c => m.contactIds.includes(c.id)).map(c => c.name).join('・')}</Text>
      {!!m.text && <Text selectable style={s.body}>{m.text}</Text>}
      {!!m.audio && <Playback uri={mediaUri(m.audio)} />}
      <Action secondary label="メモを編集" onPress={() => router.push({ pathname: '/conversation-form', params: { id: m.id, contactId: id } })} />
    </View>)}
    {!meetings.length && <Text style={s.hint}>最初の会話メモを追加できます。</Text>}
  </Page>;
}
