import { Stack } from 'expo-router';
import { RecordsProvider } from '../data/store';
import { colors } from '../ui';
export default function Layout() {
  return <RecordsProvider><Stack screenOptions={{ headerTintColor: colors.ink, headerBackButtonDisplayMode: 'minimal', headerStyle: { backgroundColor: colors.paper } }}>
    <Stack.Screen name="index" options={{ title: 'Karabinder' }} />
    <Stack.Screen name="contacts/[id]" options={{ title: '名刺の詳細' }} />
    <Stack.Screen name="contact-form" options={{ title: '名刺の登録・編集' }} />
    <Stack.Screen name="conversation-form" options={{ title: '会話メモ' }} />
  </Stack></RecordsProvider>;
}
