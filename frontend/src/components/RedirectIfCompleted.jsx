// src/components/RedirectIfCompleted.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export function RedirectIfCompleted({ children }) {
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function check() {
      const local = sessionStorage.getItem("quizCompleted") === "true";
      if (local) {
        setCompleted(true);
        setChecked(true);
        return;
      }

      const uid = sessionStorage.getItem("uid");
      if (uid) {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          const data = snap.exists() ? snap.data() : null;
          if (data?.hasCompletedQuiz) {
            sessionStorage.setItem("quizCompleted", "true");
            setCompleted(true);
          } else {
            setCompleted(false);
          }
        } catch (e) {
          setCompleted(false);
        }
      } else {
        setCompleted(false);
      }
      setChecked(true);
    }
    check();
  }, []);

  if (!checked) return null;
  return completed ? <Navigate to="/dashboard" replace /> : children;
}
