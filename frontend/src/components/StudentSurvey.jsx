import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const TOTAL_STEPS = 7;

export default function StudentSurvey() {
  const navigate = useNavigate();
  const uid = sessionStorage.getItem("uid");

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [surveyData, setSurveyData] = useState({
    firstName: "",
    profession: "",
    sector: "",
    subject: "",
    level: "",
    goal: "",
    prepPlanDays: "",
    streakEnabled: true
  });

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const handleChange = (key, value) => {
    setSurveyData((prev) => ({ ...prev, [key]: value }));
  };

  const submitSurvey = async () => {
    try {
      await updateDoc(doc(db, "users", uid), {
        surveyCompleted: true,
        survey: {
          ...surveyData,
          prepPlanDays: Number(surveyData.prepPlanDays),
          createdAt: serverTimestamp()
        }
      });

      localStorage.setItem("survey_completed", "true");
      setSubmitted(true);
    } catch (err) {
      console.error("Survey submit failed:", err);
    }
  };

  /* ---------------- THANK YOU SCREEN ---------------- */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fbf8f4] flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-6">
            <span className="text-white text-3xl">✓</span>
          </div>

          <h1 className="text-3xl font-serif mb-3">
            Thank you,{" "}
            <span className="text-orange-500">
              {surveyData.firstName || "there"}
            </span>
            !
          </h1>

          <p className="text-gray-600 mb-8">
            Your learning plan has been created successfully.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-lg border hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f4] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-10">

        {/* Top Progress */}
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Question {step} of {TOTAL_STEPS}</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full h-1 bg-gray-200 rounded-full mb-8">
          <div
            className="h-full bg-orange-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* STEP 1 – NAME */}
        {step === 1 && (
          <>
            <h1 className="text-3xl font-serif mb-2">
              First, what's your name?
            </h1>
            <p className="text-gray-500 mb-6">
              We'd love to get to know you
            </p>

            <input
              className="w-full border-b text-lg outline-none py-2"
              placeholder="Enter your first name"
              value={surveyData.firstName}
              onChange={(e) =>
                handleChange("firstName", e.target.value)
              }
            />
          </>
        )}

        {/* STEP 2 – PROFESSION */}
        {step === 2 && (
          <>
            <h1 className="text-3xl font-serif mb-6">
              What's your profession?
            </h1>

            {["Student", "Working Professional", "Job Seeker"].map((opt) => (
              <OptionCard
                key={opt}
                label={opt}
                selected={surveyData.profession === opt}
                onClick={() => handleChange("profession", opt)}
              />
            ))}
          </>
        )}

        {/* STEP 3 – SECTOR */}
        {step === 3 && (
          <>
            <h1 className="text-3xl font-serif mb-6">
              Which sector are you in?
            </h1>

            {["IT", "Non-IT"].map((opt) => (
              <OptionCard
                key={opt}
                label={opt}
                selected={surveyData.sector === opt}
                onClick={() => handleChange("sector", opt)}
              />
            ))}
          </>
        )}

        {/* STEP 4 – SUBJECT */}
        {step === 4 && (
          <>
            <h1 className="text-3xl font-serif mb-6">
              What subject are you preparing for?
            </h1>

            <input
              className="w-full border-b text-lg outline-none py-2"
              placeholder="Java, Python, Banking..."
              value={surveyData.subject}
              onChange={(e) =>
                handleChange("subject", e.target.value)
              }
            />
          </>
        )}

        {/* STEP 5 – LEVEL */}
        {step === 5 && (
          <>
            <h1 className="text-3xl font-serif mb-6">
              What's your experience level?
            </h1>

            {[
              { label: "I'm just getting started 🌱", value: "Beginner" },
              { label: "I have some experience 🚀", value: "Intermediate" },
              { label: "I'm an expert ⭐", value: "Advanced" }
            ].map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                selected={surveyData.level === opt.value}
                onClick={() => handleChange("level", opt.value)}
              />
            ))}
          </>
        )}

        {/* STEP 6 – GOAL */}
        {step === 6 && (
          <>
            <h1 className="text-3xl font-serif mb-6">
              What’s your main goal?
            </h1>

            <textarea
              className="w-full border rounded-lg p-3 outline-none"
              placeholder="Crack IT job in 3 months"
              value={surveyData.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
            />
          </>
        )}

        {/* STEP 7 – PLAN + STREAK */}
        {step === 7 && (
          <>
            <h1 className="text-3xl font-serif mb-6">
              How many days can you prepare?
            </h1>

            <input
              type="number"
              className="w-full border-b text-lg outline-none py-2 mb-6"
              placeholder="20"
              value={surveyData.prepPlanDays}
              onChange={(e) =>
                handleChange("prepPlanDays", e.target.value)
              }
            />

            <OptionCard
              label="Enable daily streak tracking 🔥"
              selected={surveyData.streakEnabled}
              onClick={() =>
                handleChange("streakEnabled", !surveyData.streakEnabled)
              }
            />
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-10">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="text-gray-500 hover:text-black disabled:opacity-40"
          >
            ← Back
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !surveyData.firstName) ||
                (step === 2 && !surveyData.profession) ||
                (step === 3 && !surveyData.sector) ||
                (step === 4 && !surveyData.subject) ||
                (step === 5 && !surveyData.level) ||
                (step === 6 && !surveyData.goal)
              }
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium disabled:opacity-50"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={submitSurvey}
              disabled={!surveyData.prepPlanDays}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium disabled:opacity-50"
            >
              Finish →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------- Option Card Component -------- */
function OptionCard({ label, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center border rounded-xl p-4 mb-4 cursor-pointer transition
        ${selected ? "border-orange-400 bg-orange-50" : "hover:bg-gray-50"}
      `}
    >
      <span className="text-lg">{label}</span>
      <div
        className={`w-5 h-5 rounded-full border ${
          selected ? "border-orange-500 bg-orange-500" : ""
        }`}
      />
    </div>
  );
}
