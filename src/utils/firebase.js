/**
 * CBTI Firebase — Real-time Schedule Sync
 *
 * Firebase web config is intentionally public (it's a client-side identifier,
 * not a secret). Security is enforced by Firebase Database Rules, not by
 * hiding this config. See: https://firebase.google.com/docs/projects/api-keys
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  onValue,
  off,
  serverTimestamp,
} from 'firebase/database';

const firebaseConfig = {
  apiKey:            'AIzaSyDO63J_szRNP9Gje2Gyue1VhihXM6ehPhY',
  authDomain:        'cbti-app.firebaseapp.com',
  databaseURL:       'https://cbti-app-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId:         'cbti-app',
  storageBucket:     'cbti-app.firebasestorage.app',
  messagingSenderId: '826656871637',
  appId:             '1:826656871637:web:987b2955ac38a18b6ebe5c',
};

// Initialise once — safe across hot reloads
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const db = getDatabase(app);

const SCHEDULE_PATH = 'cbti_schedule_v2';

/** Always true — config is hardcoded */
export function isFirebaseConfigured() {
  return true;
}

/**
 * Write the full schedule to Firebase.
 * Called only from admin context after a slot save/clear.
 */
export async function pushScheduleToCloud(scheduleData) {
  try {
    await set(ref(db, SCHEDULE_PATH), {
      data:      scheduleData,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('[CBTI Firebase] Write failed:', e.message);
  }
}

/**
 * Subscribe to live schedule updates.
 * Calls onUpdate immediately with current data, then on every change.
 * Returns an unsubscribe function — call on component unmount.
 */
export function subscribeSchedule(onUpdate, onError) {
  const schedRef = ref(db, SCHEDULE_PATH);

  onValue(
    schedRef,
    snapshot => onUpdate(snapshot.val()?.data ?? {}),
    error => {
      console.warn('[CBTI Firebase] Read error:', error.message);
      onError?.(error);
    },
  );

  return () => off(schedRef, 'value');
}
