// utils/firebaseChat.js
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  deleteDoc,
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";

export const saveChatToFirebase = async (uid, question, answer) => {
  try {
    await addDoc(collection(db, "users", uid, "chatHistory"), {
      question,
      answer,
      createdAt: new Date(),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Error saving chat:", error);
    throw error;
  }
};

export const getChatHistory = async (uid, limitCount = 50) => {
  try {
    const chatQuery = query(
      collection(db, "users", uid, "chatHistory"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(chatQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
};

export const deleteChatFromFirebase = async (uid, chatId) => {
  try {
    await deleteDoc(doc(db, "users", uid, "chatHistory", chatId));
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
};

export const subscribeToChatHistory = (uid, callback, limitCount = 50) => {
  const chatQuery = query(
    collection(db, "users", uid, "chatHistory"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  return onSnapshot(chatQuery, (snapshot) => {
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(history);
  });
};