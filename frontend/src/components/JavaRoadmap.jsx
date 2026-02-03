import { useNavigate } from "react-router-dom";
import { ChevronDown, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import JavaCourseOverview from "../components/JavaCourseOverview";

/* ================= FULL JAVA ROADMAP ================= */
const roadmap = [
  {
    title: "Java Tutorial",
    topics: [
      "Java HOME",
      "Java Intro",
      "Java Get Started",
      "Java Syntax",
      "Java Output",
      "Java Comments",
      "Java Variables",
      "Java Data Types",
      "Java Type Casting",
      "Java Operators",
      "Java Strings",
      "Java Math",
      "Java Booleans",
      "Java If...Else",
      "Java Switch",
      "Java While Loop",
      "Java For Loop",
      "Java Break/Continue",
      "Java Arrays",
    ],
    m: 0,
  },
  {
    title: "Java Methods",
    topics: [
      "Java Methods",
      "Java Method Parameters",
      "Java Method Overloading",
      "Java Scope",
      "Java Recursion",
    ],
    m: 1,
  },
  {
    title: "Java OOP",
    topics: [
      "Java OOP",
      "Java Classes/Objects",
      "Java Class Attributes",
      "Java Class Methods",
      "Java Constructors",
      "Java this Keyword",
      "Java Modifiers",
      "Java Encapsulation",
      "Java Packages / API",
      "Java Inheritance",
      "Java Polymorphism",
      "Java super Keyword",
      "Java Inner Classes",
      "Java Abstraction",
      "Java Interface",
      "Java Anonymous",
      "Java Enum",
      "Java User Input",
      "Java Date",
    ],
    m: 2,
  },
  {
    title: "Java Errors & Exceptions",
    topics: [
      "Java Errors",
      "Java Debugging",
      "Java Exceptions",
      "Java Multiple Exceptions",
      "Java try-with-resources",
    ],
    m: 3,
  },
  {
    title: "Java File Handling",
    topics: [
      "Java Files",
      "Java Create Files",
      "Java Write Files",
      "Java Read Files",
      "Java Delete Files",
    ],
    m: 4,
  },
  {
    title: "Java I/O Streams",
    topics: [
      "Java I/O Streams",
      "Java FileInputStream",
      "Java FileOutputStream",
      "Java BufferedReader",
      "Java BufferedWriter",
    ],
    m: 5,
  },
  {
    title: "Java Data Structures",
    topics: [
      "Java Data Structures",
      "Java Collections",
      "Java List",
      "Java ArrayList",
      "Java LinkedList",
      "Java List Sorting",
      "Java Set",
      "Java HashSet",
      "Java TreeSet",
      "Java LinkedHashSet",
      "Java Map",
      "Java HashMap",
      "Java TreeMap",
      "Java LinkedHashMap",
      "Java Iterator",
      "Java Algorithms",
    ],
    m: 6,
  },
  {
    title: "Java Advanced",
    topics: [
      "Java Wrapper Classes",
      "Java Generics",
      "Java Annotations",
      "Java RegEx",
      "Java Threads",
      "Java Lambda",
      "Java Advanced Sorting",
    ],
    m: 7,
  },
  {
    title: "Java Projects",
    topics: ["Java Projects"],
    m: 8,
  },
  {
    title: "Java Reference & Practice",
    topics: [
      "Java Reference",
      "Java Keywords",
      "Java String Methods",
      "Java Math Methods",
      "Java Output Methods",
      "Java Arrays Methods",
      "Java ArrayList Methods",
      "Java LinkedList Methods",
      "Java HashMap Methods",
      "Java Scanner Methods",
      "Java File Methods",
      "Java Iterator Methods",
      "Java Collections Methods",
      "Java System Methods",
      "Java Errors & Exceptions",
      "Java Examples",
      "Java Videos",
      "Java Compiler",
      "Java Exercises",
      "Java Quiz",
      "Java Server",
      "Java Syllabus",
      "Java Study Plan",
      "Java Interview Q&A",
      "Java Certificate",
    ],
    m: 9,
  },
];

/* ================= COMPONENT ================= */
export default function JavaRoadmap() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  return (
    <>
      <JavaCourseOverview />

      <section className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12
                       bg-gradient-to-r from-blue-600 to-purple-600
                       bg-clip-text text-transparent">
          Java Complete Learning Roadmap
        </h1>

        <div className="max-w-5xl mx-auto space-y-6">
          {roadmap.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl border overflow-hidden"
            >
              {/* SECTION HEADER */}
              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="w-full flex justify-between items-center p-6 text-left"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {section.title}
                </h2>
                <ChevronDown
                  className={`transition ${
                    open === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* TOPICS */}
              {open === index && (
                <div className="border-t px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {section.topics.map((topic, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      onClick={() =>
                        navigate(`/java-course/${section.m}/${i}`)
                      }
                      className="flex items-center gap-3 p-3 rounded-xl
                                 hover:bg-blue-50 text-left"
                    >
                      <CheckCircle className="text-blue-600" size={18} />
                      <span className="text-gray-700 text-sm">
                        {topic}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
