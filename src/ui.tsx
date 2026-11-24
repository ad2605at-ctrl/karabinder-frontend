import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { ink: '#163831', muted: '#49665e', teal: '#126852', line: '#d0dfd8', paper: '#f6f8f4' };
export function Page({ children }: { children: ReactNode }) {
  return <SafeAreaView edges={['bottom','left','right']} style={{ flex: 1, backgroundColor: colors.paper }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>{children}</ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function Action({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.button, secondary && s.secondary, { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>
    <Text style={[s.buttonText, secondary && { color: colors.teal }]}>{label}</Text>
  </Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 6 }}><Text style={s.label}>{label}</Text><TextInput {...props} accessibilityLabel={label}
    placeholderTextColor="#637b71" style={[s.input, props.multiline && { minHeight: 110, textAlignVertical: 'top' }]} /></View>;
}
export const s = StyleSheet.create({
  page: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, gap: 16, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '700', color: colors.ink },
  label: { fontSize: 16, color: colors.ink, fontWeight: '600' },
  body: { fontSize: 16, color: colors.ink, lineHeight: 24 },
  hint: { fontSize: 14, color: colors.muted, lineHeight: 21 },
  error: { color: '#94382b', fontSize: 15 },
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, gap: 6 },
  input: { fontSize: 17, padding: 12, backgroundColor: '#fff', borderColor: colors.line, borderWidth: 1, borderRadius: 9, color: colors.ink },
  button: { backgroundColor: colors.teal, minHeight: 46, borderRadius: 9, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  secondary: { backgroundColor: '#e3eee6' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
