import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from './theme';
import { pushScheduleToCloud } from './firebase';

/**
 * Save schedule locally AND push to Firebase so all devices sync.
 * Called only from admin context.
 */
export async function saveSchedule(data) {
  // 1. Local cache — fast and works offline
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
  // 2. Cloud — broadcasts change to all installed apps in real time
  await pushScheduleToCloud(data);
}

/**
 * Load schedule from local AsyncStorage cache (used as initial/offline value).
 * The VaultScreen real-time Firebase listener overwrites this once connected.
 */
export async function loadSchedule() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}

/**
 * Cache an incoming cloud snapshot locally so the app works offline too.
 */
export async function cacheSchedule(data) {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {}
}
