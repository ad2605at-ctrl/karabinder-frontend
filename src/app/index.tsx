import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { useRecords } from '../data/store';
import { historyFor, search } from '../data/model';
import { Action, Field, Page, s } from '../ui';

export default function Index() {
  const { records } = useRecords();
  const [query, setQuery] = useState('');
  const contacts = search(records, query);
  return <Page>
    <Text style={s.heading}>名刺一覧</Text>
    <Action label="＋ 名刺を登録" onPress={() => router.push('/contact-form')} />
    <Field label="名刺・会話を検索" placeholder="会社名、氏名、話した内容、日付" value={query} onChangeText={setQuery} returnKeyType="search" />
    <Text style={s.hint}>{contacts.length} 件の名刺</Text>
    {contacts.map(c => {
      const last = historyFor(records, c.id)[0];
      return <Pressable accessibilityRole="button" key={c.id} style={s.card} onPress={() => router.push({ pathname: '/contacts/[id]', params: { id: c.id } })}>
        <Text style={s.hint}>{c.company || '会社名未登録'}</Text><Text style={s.label}>{c.name}</Text>
        <Text style={s.body} numberOfLines={2}>{last ? last.text || '音声メモ' : '会話メモはまだありません'}</Text>
      </Pressable>;
    })}
    {!contacts.length && <Text style={s.body}>該当する名刺がありません。検索語を変えてみてください。</Text>}
  </Page>;
}
