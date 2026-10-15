import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData, Campaign } from './model';
import { starterTemplates } from './templates';

/** Everything lives in one small JSON value on the phone. No database, no migrations. */
const KEY = 'dmcompanion.v1';

const fresh = (): AppData => ({ templates: starterTemplates(), campaigns: [] });

export function useStore() {
  const [data, setData] = useState<AppData>(fresh);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<AppData>(data);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed.templates) || !Array.isArray(parsed.campaigns)) {
              throw new Error('unexpected shape');
            }
            ref.current = parsed as AppData;
            setData(ref.current);
          } catch {
            // Never overwrite data we couldn't read: keep a copy first.
            await AsyncStorage.setItem(`${KEY}.corrupt-${Date.now()}`, raw);
          }
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const update = useCallback((change: (d: AppData) => AppData) => {
    const next = change(ref.current);
    ref.current = next;
    setData(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const editCampaign = useCallback(
    (id: string, change: (c: Campaign) => Campaign) =>
      update((d) => ({
        ...d,
        campaigns: d.campaigns.map((c) => (c.id === id ? change(c) : c)),
      })),
    [update],
  );

  return { data, loaded, update, editCampaign };
}

export type Store = ReturnType<typeof useStore>;
