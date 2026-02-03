// // src/firebase.js
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyAUnbppjElsizJj3NTvzOB_wK-HXeL4sTA",
//   authDomain: "learnflow-1119a.firebaseapp.com",
//   projectId: "learnflow-1119a",
//   storageBucket: "learnflow-1119a.firebasestorage.app",
//   messagingSenderId: "754521614600",
//   appId: "1:754521614600:web:d7c6d3063e8950a295e4bd"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const googleProvider = new GoogleAuthProvider();
// export const db = getFirestore(app);


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaCh2uTilV8DDIyh4RVCJX8xJAUyDFhhs",
  authDomain: "smartstud-aia.firebaseapp.com",
  projectId: "smartstud-aia",
  storageBucket: "smartstud-aia.firebasestorage.app",
  messagingSenderId: "332283275615",
  appId: "1:332283275615:web:d9da45b1abbcc83aef6eea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
