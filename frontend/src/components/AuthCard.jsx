import React, { useState } from "react";

export default function AuthCard() {
  const [flip, setFlip] = useState(false);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">

      {/* Perspective wrapper for real 3D depth */}
      <div className="relative w-full max-w-md h-[500px]" style={{ perspective: "1200px" }}>
        
        {/* Card container */}
        <div
          className={`w-full h-full transition-transform duration-700`}
          style={{
            transformStyle: "preserve-3d",
            transform: flip ? "rotateY(180deg)" : "rotateY(0deg)"
          }}
        >

          {/* FRONT SIDE - LOGIN */}
          <div
            className="absolute inset-0 bg-white shadow-xl rounded-2xl p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h1 className="text-3xl font-semibold mb-2">Log in or sign up</h1>
            <p className="text-gray-600 mb-6">
              You’ll get smarter responses and can upload files, images, and more.
            </p>

            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 border rounded-full py-3 px-4 hover:bg-gray-50 transition">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6" />
                <span className="mx-auto">Continue with Google</span>
              </button>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-3 text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="text-left mb-6">
              <label className="text-gray-700 text-sm">Email address</label>
              <input
                type="email"
                className="w-full border rounded-full py-3 px-4 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
              />
            </div>

            <button className="w-full bg-black text-white rounded-full py-3 text-lg hover:bg-gray-900 transition">
              Continue
            </button>

            <p className="text-gray-500 text-sm mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => setFlip(true)}
                className="text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* BACK SIDE - REGISTER */}
          <div
            className="absolute inset-0 bg-white shadow-xl rounded-2xl p-8 text-center"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden"
            }}
          >
            <h1 className="text-3xl font-semibold mb-2">Create your account</h1>
            <p className="text-gray-600 mb-6">
              Get personalized learning, AI tools, and more.
            </p>

            <div className="space-y-4">
              <button className="w-full flex items-center gap-3 border rounded-full py-3 px-4 hover:bg-gray-50 transition">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6" />
                <span className="mx-auto">Sign up with Google</span>
              </button>
            </div>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-3 text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="text-left mb-6">
              <label className="text-gray-700 text-sm">Email address</label>
              <input
                type="email"
                className="w-full border rounded-full py-3 px-4 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
              />
            </div>

            <button className="w-full bg-black text-white rounded-full py-3 text-lg hover:bg-gray-900 transition">
              Continue
            </button>

            <p className="text-gray-500 text-sm mt-6">
              Already have an account?{" "}
              <button
                onClick={() => setFlip(false)}
                className="text-blue-600 hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
