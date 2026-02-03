import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const messages = [
    "Boost your learning",
    "Generate study materials",
    "Create personalized quizzes",
    "Understand concepts better",
  ];

  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");

  // Modal States
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const toggleTerms = () => setShowTerms(!showTerms);
  const togglePrivacy = () => setShowPrivacy(!showPrivacy);

  // Typing effect
  useEffect(() => {
    let current = messages[index];
    let i = 0;

    const typing = setInterval(() => {
      setDisplayText(current.slice(0, i));
      i++;
      if (i > current.length) {
        clearInterval(typing);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % messages.length);
          setDisplayText("");
        }, 1200);
      }
    }, 80);

    return () => clearInterval(typing);
  }, [index]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT SECTION */}
      <div className="hidden md:w-1/2 md:flex relative flex-col justify-center px-16 py-20 bg-[#F3F7FF] overflow-hidden">

        <img
          src="https://www.svgrepo.com/show/454730/education-laboratory-school.svg"
          className="w-40 opacity-10 absolute top-10 left-10"
          alt="icon"
        />
        <img
          src="https://www.svgrepo.com/show/454725/search-research.svg"
          className="w-32 opacity-10 absolute bottom-16 left-32 rotate-12"
          alt="icon"
        />
        <img
          src="https://www.svgrepo.com/show/454731/light-office-room.svg"
          className="w-28 opacity-10 absolute top-1/2 left-1/4 -translate-y-1/2"
          alt="icon"
        />

        <h1 className="text-2xl font-bold text-blue-700 mb-8">
          Smartstud.Ai
        </h1>
        <h2 className="text-5xl font-bold text-blue-700">
          {displayText}
        </h2>
        <p className="text-xl text-blue-500 mt-4">
          The smartest education companion powered by AI
        </p>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-white min-h-screen px-6 py-10 relative">

        <div className="w-full max-w-sm flex flex-col items-center">

          {/* LOGO (TOP CENTER) */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300">
              <img
                src="https://github.com/shaik1207/images/blob/main/ChatGPT%20Image%20Dec%2021,%202025,%2007_10_12%20PM.png?raw=true"
                alt="logo"
                className="w-11 h-11 rounded-full object-cover bg-white p-1"
              />
            </div>
          </div>

          {/* TITLE */}
          <h1 className="text-3xl font-semibold text-blue-800 mb-6 text-center">
            Get Started
          </h1>

          {/* BUTTONS */}
          <div className="w-full flex flex-col gap-4 mb-6">
            <Link
              to="/login"
              className="w-full py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-center"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="w-full py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition text-center"
            >
              Sign up free
            </Link>
          </div>

          <p className="text-gray-500 text-sm mb-10">Try it first</p>

          {/* FOOTER LINKS */}
          <div className="flex gap-4 text-gray-400 text-sm">
            <button onClick={toggleTerms} className="hover:text-gray-600">
              Terms of use
            </button>
            <span>|</span>
            <button onClick={togglePrivacy} className="hover:text-gray-600">
              Privacy policy
            </button>
          </div>
        </div>
      </div>

      {/* TERMS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="relative bg-white w-11/12 max-w-lg p-6 rounded-xl shadow-xl animate-[popIn_0.5s_ease]">
            <button
              onClick={toggleTerms}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              Terms of Use
            </h2>

            <p className="text-gray-700 leading-relaxed">
              By accessing LearnifyAI, you agree to follow all guidelines regarding
              AI-assisted learning, user responsibilities, and secure content usage.
            </p>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="relative bg-white w-11/12 max-w-lg p-6 rounded-xl shadow-xl animate-[popIn_0.5s_ease]">
            <button
              onClick={togglePrivacy}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              Privacy Policy
            </h2>

            <p className="text-gray-700 leading-relaxed">
              LearnifyAI respects your privacy. Data is encrypted and used only
              to improve learning experience.
            </p>
          </div>
        </div>
      )}

      {/* POP-IN ANIMATION */}
      <style>
        {`
          @keyframes popIn {
            0% {
              transform: scale(0.5) rotateX(-40deg);
              opacity: 0;
            }
            60% {
              transform: scale(1.05) rotateX(10deg);
              opacity: 1;
            }
            100% {
              transform: scale(1) rotateX(0deg);
            }
          }
        `}
      </style>
    </div>
  );
}
