import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/* ================= USER ================= */

// Get user document
export async function getUserDoc(uid) {
  if (!uid) return null;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Create or update user document (merge-safe)
export async function createUserDoc(uid, payload) {
  if (!uid) return;

  const ref = doc(db, "users", uid);
  await setDoc(ref, payload, { merge: true });
}

// Mark survey as completed
export async function markSurveyCompleted(uid) {
  if (!uid) return;

  const ref = doc(db, "users", uid);
  await updateDoc(ref, { surveyCompleted: true });
}

/* ================= DASHBOARD ================= */

// Ensure dashboard stats document exists
export async function ensureDashboardStats(uid) {
  if (!uid) return;

  const ref = doc(db, "users", uid, "dashboard", "stats");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      totalTime: 0,
      streak: 1,
      weeklyHours: [0, 0, 0, 0, 0, 0, 0],
      lastStudyDate: new Date().toISOString().slice(0, 10),
      createdAt: Date.now(),
    });
  }
}

// Get dashboard stats
export async function getDashboardStats(uid) {
  if (!uid) return null;

  const ref = doc(db, "users", uid, "dashboard", "stats");
  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : null;
}

// Update dashboard stats (safe)
export async function updateDashboardStats(uid, data) {
  if (!uid) return;

  const ref = doc(db, "users", uid, "dashboard", "stats");
  await updateDoc(ref, data);
}
