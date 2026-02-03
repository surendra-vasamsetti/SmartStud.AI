import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Sparkles, Menu, X } from "lucide-react";
import {
  loadProgress,
  markCompleted,
  saveLesson,
} from "../utils/courseProgress";

/* ================= COURSE ================= */
const course = [
  {
    module: "Java Tutorial",
    lessons: [
      "Java Home",
      "Java Introduction",
      "Java Get Started",
      "Java Syntax",
      "Java Variables",
      "Java Data Types",
      "Java If Else",
      "Java Loops",
      "Java Arrays",
    ],
  },
  {
    module: "Java Methods",
    lessons: [
      "Java Methods",
      "Method Parameters",
      "Method Overloading",
      "Java Scope",
      "Java Recursion",
    ],
  },
];

export default function JavaCourse() {
  const { moduleIndex = 0, lessonIndex = 0 } = useParams();
  const uid = sessionStorage.getItem("uid");

  const [active, setActive] = useState({
    m: Number(moduleIndex),
    l: Number(lessonIndex),
  });

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({});
  const [popup, setPopup] = useState(false);

  /* MOBILE SIDEBAR */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topic =
    course[active.m]?.lessons[active.l] || "Java Introduction";

  /* LOAD PROGRESS */
  useEffect(() => {
    if (!uid) return;

    loadProgress(uid).then((data) => {
      setProgress(data.completed || {});
      if (data.lessons?.[`${active.m}-${active.l}`]) {
        setLesson(data.lessons[`${active.m}-${active.l}`]);
      }
    });
  }, [uid, active]);

  /* GENERATE CONTENT */
  async function generateLesson() {
    setLoading(true);

    const res = await fetch(
      "http://localhost:5000/api/generate-lesson",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      }
    );

    const data = await res.json();
    setLesson(data);
    await saveLesson(uid, active.m, active.l, data);
    setLoading(false);
  }

  useEffect(() => {
    if (!lesson) generateLesson();
  }, [active]);

  /* MARK COMPLETE */
  async function completeLesson() {
    await markCompleted(uid, active.m, active.l);

    setProgress((prev) => ({
      ...prev,
      [`${active.m}-${active.l}`]: true,
    }));

    setPopup(true);
    setTimeout(() => setPopup(false), 2000);
  }

  /* PROGRESS % */
  const totalLessons = course.reduce(
    (s, m) => s + m.lessons.length,
    0
  );

  const completedCount = Object.values(progress).filter(Boolean)
    .length;

  const percent = Math.round(
    (completedCount / totalLessons) * 100
  );

  return (
    <div className="min-h-screen bg-gray-100 flex relative">

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-40 flex items-center justify-between px-4 py-3 shadow">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu />
        </button>
        <h2 className="font-semibold">Java Course</h2>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          w-72 h-full bg-white border-r p-4 overflow-y-auto
          transform transition-transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* CLOSE BUTTON (MOBILE) */}
        <div className="md:hidden flex justify-end mb-2">
          <button onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Java Course</h2>

        {/* PROGRESS */}
        <p className="text-sm font-semibold">
          Progress: {percent}%
        </p>

        <div className="w-full bg-gray-200 h-2 rounded-full my-2">
          <div
            className="bg-green-600 h-2 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>

        {course.map((mod, mi) => (
          <div key={mi} className="mb-4">
            <h3 className="font-semibold mb-2">
              {mod.module}
            </h3>

            {mod.lessons.map((les, li) => (
              <button
                key={li}
                onClick={() => {
                  setActive({ m: mi, l: li });
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded text-sm mb-1
                  ${
                    active.m === mi && active.l === li
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
              >
                <CheckCircle
                  size={14}
                  className={
                    progress[`${mi}-${li}`]
                      ? "text-green-500"
                      : "text-gray-300"
                  }
                />
                {les}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 mt-14 md:mt-0">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          {topic}
        </h1>

        {loading && (
          <p className="flex gap-2 text-gray-500 mb-4">
            <Sparkles className="animate-spin" />
            Generating lesson...
          </p>
        )}

        {lesson && (
          <>
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow mb-6">
              <h2 className="font-semibold text-blue-600 mb-2">
                Explanation
              </h2>
              <p className="whitespace-pre-line text-gray-700">
                {lesson.content}
              </p>
            </div>

            <pre className="bg-black text-green-400 p-5 rounded-xl overflow-x-auto text-sm sm:text-base">
              {lesson.code}
            </pre>

            <button
              onClick={completeLesson}
              className="mt-6 bg-green-600 hover:bg-green-700
                         text-white px-6 py-3 rounded-xl font-semibold"
            >
              Mark as Completed ✅
            </button>
          </>
        )}
      </main>

      {/* POPUP */}
      {popup && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          🎉 Lesson completed!
        </div>
      )}
    </div>
  );
}
