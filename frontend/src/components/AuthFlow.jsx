// src/components/AuthFlow.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getUserDoc, createUserDoc } from "../utils/firebaseUsers";

export default function AuthFlow() {
  const [loading, setLoading] = useState(false);
  const [completeProfileOpen, setCompleteProfileOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  // temp holder for firebase user and prefilled info
  const [pendingUser, setPendingUser] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // ---------- GOOGLE SIGN-IN ----------
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user; // firebase user
      // check Firestore profile
      const doc = await getUserDoc(user.uid);
      if (doc) {
        // profile exists -> success flow
        setSuccessOpen(true);
        // redirect later: e.g. navigate("/dashboard")
      } else {
        // no profile -> open complete profile popup
        setPendingUser(user);
        setProfileData({
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          email: user.email || "",
        });
        setCompleteProfileOpen(true);
      }
    } catch (err) {
      console.error("Google login failed:", err);
      alert(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- EMAIL SIGNUP ----------
  const handleEmailSignup = async (email, password, firstName, lastName) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      // create profile doc immediately
      await createUserDoc(user.uid, {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
      });
      setSuccessOpen(true);
    } catch (err) {
      console.error("Signup failed:", err);
      alert(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- EMAIL LOGIN ----------
  const handleEmailLogin = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const doc = await getUserDoc(user.uid);
      if (doc) {
        setSuccessOpen(true);
      } else {
        // very rare: user created by auth but no profile doc
        setPendingUser(user);
        setProfileData({ firstName: "", lastName: "", email: user.email || "" });
        setCompleteProfileOpen(true);
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- COMPLETE PROFILE SUBMIT ----------
  const submitCompleteProfile = async () => {
    if (!pendingUser) return;
    const uid = pendingUser.uid;
    if (!profileData.firstName || !profileData.email) {
      alert("Please fill required fields");
      return;
    }
    setLoading(true);
    try {
      await createUserDoc(uid, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        createdAt: new Date().toISOString(),
      });
      setCompleteProfileOpen(false);
      setSuccessOpen(true);
    } catch (err) {
      console.error("Complete profile failed:", err);
      alert(err.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Example buttons (replace with your components/UI) */}
      <button
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-white border rounded"
        disabled={loading}
      >
        Continue with Google
      </button>

      {/* Example of email actions — connect to your form inputs */}
      {/* <button onClick={() => handleEmailSignup(email,password,first,last)}>Sign up</button> */}
      {/* <button onClick={() => handleEmailLogin(email,password)}>Login</button> */}

      {/* --- Complete Profile Modal --- */}
      {completeProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-600"
              onClick={() => setCompleteProfileOpen(false)}
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-2">Complete your profile</h3>
            <p className="text-sm text-gray-600 mb-4">
              We need a few details to finish your account.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="First name"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Last name"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={submitCompleteProfile}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
                disabled={loading}
              >
                Save & Continue
              </button>
              <button
                onClick={() => {
                  setCompleteProfileOpen(false);
                }}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Success Modal --- */}
      {successOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-xl shadow p-6 text-center max-w-sm w-full">
            <h4 className="text-xl font-semibold mb-2">Success</h4>
            <p className="mb-4">You are logged in successfully </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setSuccessOpen(false);
                // redirect to dashboard here, e.g. navigate("/dashboard")
                window.location.href = "/dashboard";
              }}
            >
              Go to dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
