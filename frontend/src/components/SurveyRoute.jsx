import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import StudentSurvey from "./StudentSurvey";

export default function SurveyRoute() {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      setAllowed(false);
      return;
    }

    const checkSurveyStatus = async () => {
      try {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (snap.exists() && snap.data()?.surveyCompleted === true) {
          localStorage.setItem("survey_completed", "true");
          setAllowed(false);
          return;
        }

        setAllowed(true);
      } catch (error) {
        console.error(error);
        setAllowed(false);
      }
    };

    checkSurveyStatus();
  }, []);

  if (allowed === null) return null;

  return allowed ? <StudentSurvey /> : <Navigate to="/dashboard" replace />;
}
