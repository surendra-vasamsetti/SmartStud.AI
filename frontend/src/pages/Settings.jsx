import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Palette, GraduationCap, Bell, Lock, Download, Trash2, 
  Camera, Save, X, AlertTriangle, Check 
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "../contexts/ThemeContext";
import { useSettings } from "../contexts/SettingsContext";
import { auth, db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { updateEmail, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { uploadProfilePicture } from "../utils/uploadProfilePicture";
import { exportUserData } from "../utils/exportUserData";

export default function Settings() {
  const navigate = useNavigate();
  const { username, email } = useCurrentUser();
  const { theme, updateTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeSection, setActiveSection] = useState("profile");
  
  // Profile state
  const [profileData, setProfileData] = useState({ firstName: "", lastName: "", email: "" });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Password state
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Toast notification
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Load user data
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setProfileData({
        firstName: username || "",
        lastName: "",
        email: user.email || ""
      });
    }
  }, [username]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      let photoURL = null;
      
      // Upload profile picture if selected
      if (profilePicture) {
        photoURL = await uploadProfilePicture(profilePicture, user.uid);
      }

      // Update Firestore
      const updates = {
        firstName: profileData.firstName,
        lastName: profileData.lastName
      };
      if (photoURL) updates.photoURL = photoURL;

      await updateDoc(doc(db, "users", user.uid), updates);

      // Update email if changed
      if (profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
      }

      showToast("Profile updated successfully!");
      setProfilePicture(null);
      setProfilePicturePreview(null);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (passwordData.new.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Not authenticated");

      // Reauthenticate
      const credential = EmailAuthProvider.credential(user.email, passwordData.current);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.new);

      showToast("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        showToast("Current password is incorrect", "error");
      } else {
        showToast(error.message, "error");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Export data
  const handleExportData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      
      await exportUserData(user.uid);
      showToast("Data exported successfully!");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Not authenticated");

      // Reauthenticate
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      // Delete Firestore data
      await deleteDoc(doc(db, "users", user.uid));
      await deleteDoc(doc(db, "streaks", user.uid));

      // Delete user account
      await deleteUser(user);

      // Redirect to landing page
      navigate("/");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: <User size={20} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={20} /> },
    { id: "learning", label: "Learning", icon: <GraduationCap size={20} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
    { id: "security", label: "Security", icon: <Lock size={20} /> },
    { id: "data", label: "Data & Privacy", icon: <Download size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} isMobile={isMobile} />

      <div className={`flex-1 transition-all ${!isMobile ? "md:ml-64" : ""}`}>
        <Navbar toggleSidebar={() => setIsOpen(!isOpen)} username={username} email={email} />

        <div className="pt-24 px-4 sm:px-6 pb-12 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24 z-10">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      if (isMobile) {
                        const content = document.getElementById('settings-content');
                        if (content) {
                          content.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-purple-100 text-purple-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {section.icon}
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div id="settings-content" className="lg:col-span-3">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6">Edit Profile</h2>

                  {/* Profile Picture */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {profilePicturePreview ? (
                            <img src={profilePicturePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User size={40} className="text-gray-400" />
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700">
                          <Camera size={16} />
                          <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                        </label>
                      </div>
                      {profilePicturePreview && (
                        <button
                          onClick={() => {
                            setProfilePicture(null);
                            setProfilePicturePreview(null);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Save size={18} />
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}

              {/* Appearance Section */}
              {activeSection === "appearance" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6 dark:text-white">Appearance</h2>

                  {/* Theme Preview */}
                  <div className="mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-sm font-medium mb-2 dark:text-gray-300">Preview:</p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-16 h-16 rounded-lg" 
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                      <div>
                        <p className="font-semibold dark:text-white">
                          {theme.mode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Accent: {theme.accentColor.charAt(0).toUpperCase() + theme.accentColor.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Theme Mode */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 dark:text-gray-300">Theme Mode</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateTheme({ mode: "light" })}
                        className={`flex-1 py-3 px-4 border-2 rounded-lg transition-all ${
                          theme.mode === "light"
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <span className="dark:text-white">☀️ Light</span>
                      </button>
                      <button
                        onClick={() => updateTheme({ mode: "dark" })}
                        className={`flex-1 py-3 px-4 border-2 rounded-lg transition-all ${
                          theme.mode === "dark"
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }`}
                      >
                        <span className="dark:text-white">🌙 Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-sm font-medium mb-3 dark:text-gray-300">Accent Color</label>
                    <div className="grid grid-cols-5 gap-3">
                      {[
                        { name: "purple", color: "#9333ea" },
                        { name: "blue", color: "#2563eb" },
                        { name: "green", color: "#16a34a" },
                        { name: "orange", color: "#ea580c" },
                        { name: "red", color: "#dc2626" },
                      ].map((color) => (
                        <button
                          key={color.name}
                          onClick={() => updateTheme({ accentColor: color.name })}
                          className={`h-12 rounded-lg border-2 transition-all ${
                            theme.accentColor === color.name
                              ? "border-gray-800 dark:border-white scale-110 ring-2 ring-offset-2 ring-gray-400"
                              : "border-gray-200 dark:border-gray-600 hover:scale-105"
                          }`}
                          style={{ backgroundColor: color.color }}
                          title={color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Learning Preferences */}
              {activeSection === "learning" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6">Learning Preferences</h2>

                  {/* Difficulty Level */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Difficulty Level</label>
                    <select
                      value={settings.learning.difficultyLevel}
                      onChange={(e) =>
                        updateSettings({
                          learning: { ...settings.learning, difficultyLevel: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* AI Model */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">AI Model</label>
                    <select
                      value={settings.learning.aiModel}
                      onChange={(e) =>
                        updateSettings({
                          learning: { ...settings.learning, aiModel: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Faster)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (More Accurate)</option>
                    </select>
                  </div>

                  {/* Default Study Mode */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Default Study Mode</label>
                    <select
                      value={settings.learning.defaultStudyMode}
                      onChange={(e) =>
                        updateSettings({
                          learning: { ...settings.learning, defaultStudyMode: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="flashcards">Flashcards</option>
                      <option value="quiz">Quiz</option>
                      <option value="mindmap">Mind Map</option>
                    </select>
                  </div>

                  {/* Auto-save */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium">Auto-save Drafts</label>
                      <p className="text-sm text-gray-500">Automatically save your progress</p>
                    </div>
                    <button
                      onClick={() =>
                        updateSettings({
                          learning: { ...settings.learning, autoSave: !settings.learning.autoSave },
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.learning.autoSave ? "bg-purple-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.learning.autoSave ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === "notifications" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6">Notifications</h2>

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium">Email Notifications</label>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() =>
                        updateSettings({
                          notifications: { ...settings.notifications, email: !settings.notifications.email },
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.notifications.email ? "bg-purple-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.notifications.email ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Study Reminders */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium">Study Reminders</label>
                      <p className="text-sm text-gray-500">Daily study reminders</p>
                    </div>
                    <button
                      onClick={() =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            studyReminders: !settings.notifications.studyReminders,
                          },
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.notifications.studyReminders ? "bg-purple-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.notifications.studyReminders ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Reminder Time */}
                  {settings.notifications.studyReminders && (
                    <div className="mb-4 ml-4">
                      <label className="block text-sm font-medium mb-2">Reminder Time</label>
                      <input
                        type="time"
                        value={settings.notifications.reminderTime}
                        onChange={(e) =>
                          updateSettings({
                            notifications: { ...settings.notifications, reminderTime: e.target.value },
                          })
                        }
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {/* Streak Alerts */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <label className="block text-sm font-medium">Streak Alerts</label>
                      <p className="text-sm text-gray-500">Get notified about your streak</p>
                    </div>
                    <button
                      onClick={() =>
                        updateSettings({
                          notifications: {
                            ...settings.notifications,
                            streakAlerts: !settings.notifications.streakAlerts,
                          },
                        })
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.notifications.streakAlerts ? "bg-purple-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.notifications.streakAlerts ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Notification Frequency</label>
                    <select
                      value={settings.notifications.frequency}
                      onChange={(e) =>
                        updateSettings({
                          notifications: { ...settings.notifications, frequency: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="instant">Instant</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Summary</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeSection === "security" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-6">Change Password</h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Lock size={18} />
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              )}

              {/* Data & Privacy */}
              {activeSection === "data" && (
                <div className="space-y-6">
                  {/* Export Data */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Export Your Data</h2>
                    <p className="text-gray-600 mb-4">
                      Download all your data including profile, chat history, quizzes, and courses in JSON format.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Download size={18} />
                      Download My Data
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
                    <h2 className="text-xl font-bold mb-4 text-red-600">Delete Account</h2>
                    <p className="text-gray-600 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 size={18} />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h3 className="text-xl font-bold">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you absolutely sure? This will permanently delete your account and all your data. This action cannot be undone.
            </p>

            <div className="mb-4">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">I understand this action is permanent</span>
              </label>

              <label className="block text-sm font-medium mb-2">Enter your password to confirm</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Your password"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm(false);
                  setDeletePassword("");
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deleteConfirm || !deletePassword}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            } text-white`}
          >
            {toast.type === "success" ? <Check size={20} /> : <X size={20} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
