import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Custom hook to get current user data
 * Returns { username, email, loading }
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        setEmail(firebaseUser.email || "");
        
        // Try to get username from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Check survey data first, then root level
          const firstName = userData?.survey?.firstName || userData?.firstName || "User";
          setUsername(firstName);
        } else {
          // Fallback to display name from auth
          setUsername(firebaseUser.displayName?.split(" ")[0] || "User");
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUsername(firebaseUser.displayName?.split(" ")[0] || "User");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, username, email, loading };
}
