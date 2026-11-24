import { useRef, useState } from 'react';
import { Image, Platform, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Picker from 'expo-image-picker';
import { useRecords } from '../data/store';
import { mediaUri, saveWithMedia } from '../data/media';
import { newId, putContact } from '../data/model';
import { Action, Field, Page, s } from '../ui';

export default function ContactForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { records, update } = useRecords();
  const existing = records.contacts.find(c => c.id === id);
  const [name, setName] = useState(existing?.name || '');
  const [company, setCompany] = useState(existing?.company || '');
  const [source, setSource] = useState<string>();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const preview = source || (existing?.photo && mediaUri(existing.photo));
  if (id && !existing) return <Page><Text>この名刺が見つかりません。</Text></Page>;
  async function pick(camera: boolean) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (camera && !(await Picker.requestCameraPermissionsAsync()).granted) {
        setError('撮影するには端末の設定でカメラを許可してください。');
        return;
      }
      const options: Picker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
      const result = camera ? await Picker.launchCameraAsync(options) : await Picker.launchImageLibraryAsync(options);
      if (!result.canceled) setSource(result.assets[0].uri);
    } catch { setError('画像を取得できませんでした。もう一度お試しください。'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function save() {
    if (lock.current) return;
    if (!name.trim()) return setError('氏名を入力してください。');
    lock.current = true;
    setBusy(true);
    setError('');
    const contactId = id || newId();
    try {
      await saveWithMedia(existing?.photo, source, '.jpg', photo => update(r => putContact(r, { id: contactId, name, company, photo })));
      if (existing && router.canGoBack()) router.back();
      else router.replace({ pathname: '/contacts/[id]', params: { id: contactId } });
    } catch { setError('名刺を保存できませんでした。入力内容を確認して再試行してください。'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Page>
    <Text style={s.heading}>{existing ? '名刺を編集' : '名刺を登録'}</Text>
    <Field label="氏名（必須）" value={name} onChangeText={setName} />
    <Field label="会社名" value={company} onChangeText={setCompany} />
    {!!preview && <Image accessibilityLabel="名刺のプレビュー" resizeMode="contain" source={{ uri: preview }} style={{ width: '100%', height: 160 }} />}
    {Platform.OS !== 'web' && <>
      <Action secondary label="名刺を撮影" disabled={busy} onPress={() => pick(true)} />
      <Action secondary label="写真から選ぶ" disabled={busy} onPress={() => pick(false)} />
    </>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Action label="名刺を保存" disabled={busy} onPress={save} />
  </Page>;
}
