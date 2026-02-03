    // src/components/RequireQuiz.jsx
    import React, { useEffect, useState } from "react";
    import { Navigate } from "react-router-dom";
    import { doc, getDoc } from "firebase/firestore";
    import { db } from "../firebase";
    // src/components/RequireQuiz.jsx
    import { Navigate } from "react-router-dom";

    export default function RequireQuiz({ children }) {
    const quizCompleted = sessionStorage.getItem("quizCompleted") === "true";

    if (!quizCompleted) {
        return <Navigate to="/topics" replace />;
    }

    return children; // ✅ THIS IS REQUIRED
    }

    export function RequireQuiz({ children }) {
    const [checked, setChecked] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        async function check() {
        const uid = sessionStorage.getItem("uid");
        // LocalStorage check (fast)
        const local = sessionStorage.getItem("quizCompleted") === "true";
        if (local) {
            setAllowed(true);
            setChecked(true);
            return;
        }

        // Firestore check (fallback)
        if (uid) {
            try {
            const snap = await getDoc(doc(db, "users", uid));
            const data = snap.exists() ? snap.data() : null;
            if (data?.hasCompletedQuiz) {
                sessionStorage.setItem("quizCompleted", "true");
                setAllowed(true);
            } else {
                setAllowed(false);
            }
            } catch (e) {
            setAllowed(false);
            }
        } else {
            setAllowed(false);
        }
        setChecked(true);
        }

        check();
    }, []);

    if (!checked) return null; // or loader

    return allowed ? children : <Navigate to="/topics" replace />;
    }
