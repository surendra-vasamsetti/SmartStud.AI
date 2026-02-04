import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import SuccessPopup from "../components/SuccessPopup";

export default function Register() {
  const navigate = useNavigate();

  /* ---------- FORM STATE ---------- */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- GOOGLE SIGNUP ---------- */
  const handleGoogleSignup = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          firstName: user.displayName?.split(" ")[0] || "User",
          lastName: user.displayName?.split(" ")[1] || "",
          email: user.email,
          hasCompletedQuiz: false,
          createdAt: new Date(),
        });
      }

      sessionStorage.setItem("uid", user.uid);

      setPopup({
        type: "success",
        message: "Signup successful! Redirecting...",
      });

      setTimeout(() => navigate("/survey"), 1800);
    } catch (error) {
      setPopup({
        type: "error",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- EMAIL SIGNUP ---------- */
  const handleEmailSignup = async () => {
    if (loading) return;

    const { firstName, email, password } = form;

    if (!firstName || !email || password.length < 6) {
      setPopup({
        type: "error",
        message: "Fill all fields. Password must be at least 6 characters.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", res.user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        hasCompletedQuiz: false,
        createdAt: new Date(),
      });

      sessionStorage.setItem("uid", res.user.uid);

      setPopup({
        type: "success",
        message: "Account created successfully!",
      });

      setTimeout(() => navigate("/dashboard"), 1800);
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

        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Create your account</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Get personalized learning, AI tools, and more.
        </p>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center gap-2 sm:gap-3 border rounded-full py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-gray-50 transition disabled:opacity-60 text-sm sm:text-base"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 sm:w-6"
            alt="google"
          />
          <span className="mx-auto">
            {loading ? "Please wait..." : "Sign up with Google"}
          </span>
        </button>

        {/* DIVIDER */}
        <div className="flex items-center my-6 sm:my-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-2 sm:px-3 text-sm sm:text-base text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* FORM */}
        <input
          name="firstName"
          placeholder="First Name"
          onChange={handleChange}
          className="w-full border rounded-full py-2.5 sm:py-3 px-3 sm:px-4 mb-2.5 sm:mb-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="lastName"
          placeholder="Last Name"
          onChange={handleChange}
          className="w-full border rounded-full py-2.5 sm:py-3 px-3 sm:px-4 mb-2.5 sm:mb-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border rounded-full py-2.5 sm:py-3 px-3 sm:px-4 mb-2.5 sm:mb-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="password"
          type="password"
          placeholder="Password (min 6 chars)"
          onChange={handleChange}
          className="w-full border rounded-full py-2.5 sm:py-3 px-3 sm:px-4 mb-5 sm:mb-6 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleEmailSignup}
          disabled={loading}
          className="w-full bg-black text-white rounded-full py-2.5 sm:py-3 text-base sm:text-lg disabled:opacity-60 hover:bg-gray-800 transition-colors"
        >
          {loading ? "Creating account..." : "Continue"}
        </button>

        <p className="text-gray-500 text-xs sm:text-sm mt-5 sm:mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
