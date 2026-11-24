import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text, View, Button } from 'react-native';
import { examples, type Records } from './model';

const key = 'karabinder.records.v1';
type Store = { records: Records; update: (change: (current: Records) => Records) => Promise<void> };
const Context = createContext<Store | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Records | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, retry] = useState(0);
  const current = useRef<Records>(examples);
  const queue = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    async function load() {
      setFailed(false);
      const raw = await AsyncStorage.getItem(key);
      const loaded: Records = raw === null ? examples : JSON.parse(raw);
      if (!Array.isArray(loaded?.contacts) || !Array.isArray(loaded.conversations)) throw Error('形式エラー');
      if (active) {
        current.current = loaded;
        setRecords(loaded);
      }
    }
    load().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [attempt]);

  function update(change: (current: Records) => Records) {
    const task = queue.current.then(async () => {
      const next = change(current.current);
      await AsyncStorage.setItem(key, JSON.stringify(next));
      current.current = next;
      setRecords(next);
    });
    queue.current = task.catch(() => {});
    return task;
  }
  if (!records) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    {failed ? <><Text>端末のデータを読み込めませんでした。</Text><Button title="再試行" onPress={() => retry(n => n + 1)} /></> : <ActivityIndicator accessibilityLabel="読み込み中" />}
  </View>;
  return <Context.Provider value={{ records, update }}>{children}</Context.Provider>;
}
export function useRecords() {
  const value = useContext(Context);
  if (!value) throw Error('RecordsProvider is required');
  return value;
}
