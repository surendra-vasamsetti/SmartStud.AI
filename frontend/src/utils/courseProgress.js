import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/* LOAD PROGRESS */
export async function loadProgress(uid) {
  const ref = doc(db, "progress", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { completed: {}, lessons: {} };
}

/* MARK COMPLETED */
export async function markCompleted(uid, m, l) {
  const ref = doc(db, "progress", uid);
  await setDoc(
    ref,
    {
      completed: {
        [`${m}-${l}`]: true,
      },
    },
    { merge: true }
  );
}

/* SAVE GENERATED LESSON */
export async function saveLesson(uid, m, l, lesson) {
  const ref = doc(db, "progress", uid);
  await setDoc(
    ref,
    {
      lessons: {
        [`${m}-${l}`]: lesson,
      },
    },
    { merge: true }
  );
}
