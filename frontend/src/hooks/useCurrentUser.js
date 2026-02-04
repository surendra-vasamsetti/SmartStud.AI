import { useAuth } from "../contexts/AuthContext";

/**
 * Custom hook to get current user data
 * CONSUMES AuthContext - No independent listeners
 * Returns { user, username, email, loading }
 */
export function useCurrentUser() {
  const { currentUser, userData, loading } = useAuth();
  
  // Extract simple fields for backward compatibility
  const email = currentUser?.email || "";
  const firstName = userData?.survey?.firstName || userData?.firstName || "User";

  return { 
    user: currentUser, 
    username: firstName, 
    email, 
    loading 
  };
}
