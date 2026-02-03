import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// existing components
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Profile() {
  // layout
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // profile data
  const [profile, setProfile] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        setError("User not authenticated. Please log in.");
        return;
      }

      try {
        // Force token refresh to ensure we have valid permissions
        await user.getIdToken(true);
        
        const uid = user.uid;

        const userSnap = await getDoc(doc(db, "users", uid));
        const streakSnap = await getDoc(doc(db, "streaks", uid));

        let userData = userSnap.exists() ? userSnap.data() : null;
        console.log("📊 Profile Debug - User Data:", userData);

        const surveyData = (userData && userData.survey) ? userData.survey : {};
        console.log("📋 Profile Debug - Survey Data:", surveyData);

        const profileData = {
          firstName: surveyData.firstName || (userData && userData.firstName) || "User",
          profession: surveyData.profession || "Not specified",
          sector: surveyData.sector || "Not specified",
          subject: surveyData.subject || "Not specified",
          level: surveyData.level || "Not specified",
          goal: surveyData.goal || "Not specified",
          prepPlanDays: surveyData.prepPlanDays || 0,
          streakEnabled: surveyData.streakEnabled !== undefined ? surveyData.streakEnabled : true
        };
        console.log("✅ Profile Debug - Final Profile Data:", profileData);
        setProfile(profileData);

        let streakData;
        if (streakSnap.exists()) {
          streakData = streakSnap.data();
        } else {
          const defaultStreak = {
            currentStreak: 0,
            longestStreak: 0,
            activeDates: {}
          };
          // Try to create only if we have permission, otherwise just use default in memory
          try {
             await setDoc(doc(db, "streaks", uid), defaultStreak);
          } catch(e) {
             console.warn("Could not create streak doc:", e);
          }
          streakData = defaultStreak;
        }
        
        // Ensure activeDates exists
        if (streakData && !streakData.activeDates) streakData.activeDates = {};
        
        setStreak(streakData || { currentStreak: 0, longestStreak: 0, activeDates: {} });

        setLoading(false);
      } catch (err) {
        console.error("Profile Load Error:", err);
        
        // If it's a permissions error, suggest logout/login
        if (err.code === 'permission-denied' || err.message?.includes('permission')) {
          setError("Authentication expired. Please log out and log back in to refresh your session.");
        } else {
          setError("Failed to load profile: " + err.message);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf8f4]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf8f4]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  if (!profile || !streak) return null; // Safety check avoids crash

  return (
    <div className="min-h-screen bg-[#fbf8f4] flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Navbar */}
        <Navbar 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            username={profile.firstName}
            email={auth.currentUser?.email}
        />

        <main className="p-6">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* PROFILE CARD */}
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <h1 className="text-3xl font-serif mb-1">
                  👋 Hi, {profile.firstName}
                </h1>
                <p className="text-gray-500">
                  {profile.profession} • {profile.sector}
                </p>

                <div className="mt-4 space-y-1 text-gray-700">
                  <p><b>Subject:</b> {profile.subject}</p>
                  <p><b>Level:</b> {profile.level}</p>
                  <p><b>Goal:</b> {profile.goal}</p>
                  <p><b>Plan:</b> {profile.prepPlanDays} days</p>
                </div>
              </div>

              {/* STREAK SUMMARY */}
              <div className="bg-orange-50 rounded-xl p-5 w-full md:w-64">
                <p className="text-gray-500 text-sm">🔥 Current Streak</p>
                <p className="text-4xl font-bold text-orange-500">
                  {streak.currentStreak}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Longest: {streak.longestStreak} days
                </p>
              </div>
            </div>

            {/* STREAK CALENDAR */}
            {profile.streakEnabled && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-serif mb-4">
                  📅 Streak Calendar
                </h2>
                <StreakCalendar activeDates={streak.activeDates || {}} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------- STREAK CALENDAR ---------------- */

function StreakCalendar({ activeDates = {} }) {
  const today = new Date();
  const days = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);

    days.push({
      key,
      active: !!activeDates[key]
    });
  }

  return (
    <div className="grid grid-cols-10 gap-3">
      {days.map((day) => (
        <div
          key={day.key}
          title={day.key}
          className={`w-8 h-8 rounded-md ${
            day.active ? "bg-orange-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}
