import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Action, s } from '../ui';

export function Playback({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  return <Action secondary label={status.playing ? '再生を一時停止' : '音声を再生'} onPress={async () => {
    if (status.playing) return player.pause();
    if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.1)) await player.seekTo(0);
    player.play();
  }} />;
}

export function Recorder({ onReady, onBusy, disabled }: {
  onReady: (uri: string) => void; onBusy: (value: boolean) => void; disabled: boolean;
}) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [active, setActive] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    };
  }, []);
  async function toggle() {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setMessage('');
    onBusy(true);
    let keepRecording = false;
    try {
      if (active) {
        await recorder.stop();
        if (!recorder.uri) throw Error();
        onReady(recorder.uri);
      } else {
        const permission = await requestRecordingPermissionsAsync();
        if (!permission.granted) {
          setMessage('録音するには、端末の設定でマイクを許可してください。');
          return;
        }
        if (!mounted.current) return;
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        if (!mounted.current) return;
        recorder.record();
        keepRecording = true;
      }
    } catch {
      setMessage('録音を完了できませんでした。もう一度お試しください。');
    } finally {
      if (!keepRecording) await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
      locked.current = false;
      if (mounted.current) {
        setActive(keepRecording);
        setPending(false);
        onBusy(keepRecording);
      }
    }
  }
  return <>
    <Text style={s.hint}>相手の了承を得てから録音を開始してください。</Text>
    <Action secondary label={active ? '録音を終了（' + Math.floor(state.durationMillis / 1000) + '秒）' : '録音を開始'}
      disabled={pending || disabled} onPress={toggle} />
    {!!message && <Text accessibilityRole="alert" style={s.error}>{message}</Text>}
  </>;
}
