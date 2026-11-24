import { File, Paths } from 'expo-file-system';
import { newId } from './model';

// Store a relative filename because the app's container path can change on iOS.
export function mediaUri(name: string) {
  return new File(Paths.document, name).uri;
}
function remove(name: string) {
  try { new File(Paths.document, name).delete(); } catch { /* The file may already be gone. */ }
}

export async function saveWithMedia(original: string | undefined, source: string | undefined,
  fallbackExtension: string, write: (filename?: string) => Promise<void>) {
  if (!source) return write(original);
  const file = new File(source);
  const suffix = /^\.[a-z0-9]{1,6}$/i.test(file.extension) ? file.extension : fallbackExtension;
  const name = newId() + suffix;
  try {
    await file.copy(new File(Paths.document, name));
    await write(name);
  } catch (error) {
    remove(name);
    throw error;
  }
  if (original) remove(original);
}
