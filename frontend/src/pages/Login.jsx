import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Firebase
import { auth, googleProvider, db } from "../firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import SuccessPopup from "../components/SuccessPopup";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 🔒 Set persistence to SESSION (clears on tab close)
      await setPersistence(auth, browserSessionPersistence);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🔐 Store UID
      sessionStorage.setItem("uid", user.uid);

      // 🔥 Ensure Firestore user exists
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName?.split(" ")[0] || "User",
          lastName: user.displayName?.split(" ")[1] || "",
          email: user.email,
          hasCompletedQuiz: false,
          createdAt: new Date(),
        });
      }

      setPopup({
        type: "success",
        message: "Login successful! Redirecting...",
      });

      // 🔍 Check if survey is completed
      if (snap.exists() && snap.data().surveyCompleted) {
        setTimeout(() => navigate("/dashboard"), 1800);
      } else {
        setTimeout(() => navigate("/survey"), 1800);
      }

    } catch (error) {
      setPopup({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EMAIL LOGIN ---------------- */
  const handleEmailLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      setPopup({
        type: "error",
        message: "Please enter email and password",
      });
      return;
    }

    setLoading(true);

    try {
      // 🔒 Set persistence to SESSION (clears on tab close)
      await setPersistence(auth, browserSessionPersistence);
      
      const res = await signInWithEmailAndPassword(auth, email, password);
      // 🔐 Store UID
      sessionStorage.setItem("uid", res.user.uid);

      // 🔍 Check Survey Status
      const userRef = doc(db, "users", res.user.uid);
      const snap = await getDoc(userRef);

      setPopup({
        type: "success",
        message: "Login successful! Redirecting...",
      });

      if (snap.exists() && snap.data().surveyCompleted) {
        setTimeout(() => navigate("/dashboard"), 1800);
      } else {
        setTimeout(() => navigate("/survey"), 1800);
      }

    } catch (error) {
      setPopup({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-3 sm:px-4 py-6 sm:py-8">

      {/* POPUP */}
      {popup && (
        <SuccessPopup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 sm:p-8 text-center">

        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Log in</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Access your personalized dashboard
        </p>

        {/* GOOGLE BUTTON */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center gap-2 sm:gap-3 border rounded-full py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-gray-50 transition disabled:opacity-60 text-sm sm:text-base"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 sm:w-6"
            alt="google"
          />
          <span className="mx-auto">
            {loading ? "Please wait..." : "Continue with Google"}
          </span>
        </button>

        {/* DIVIDER */}
        <div className="flex items-center my-6 sm:my-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 sm:px-3 text-sm sm:text-base text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* EMAIL */}
        <div className="text-left mb-3 sm:mb-4">
          <label className="text-sm sm:text-base">Email</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-full py-2.5 sm:py-3 px-3 sm:px-4 mt-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* PASSWORD */}
        <div className="text-left mb-5 sm:mb-6">
          <label className="text-sm sm:text-base">Password</label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-full py-2.5 sm:py-3 px-3 sm:px-4 mt-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full bg-black text-white rounded-full py-2.5 sm:py-3 text-base sm:text-lg disabled:opacity-60 hover:bg-gray-800 transition-colors"
        >
          {loading ? "Logging in..." : "Continue"}
        </button>

        <p className="text-gray-500 text-xs sm:text-sm mt-5 sm:mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
