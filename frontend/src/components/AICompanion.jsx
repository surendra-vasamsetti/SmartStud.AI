import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useConversationHistory } from '../hooks/useConversationHistory';
import { useAgentMemory } from '../hooks/useAgentMemory';
import { 
  saveMessage, 
  createConversation,
  updateConversationTitle 
} from '../services/conversationStorage';
import { 
  generateContextualResponse,
  generateWelcomeMessage,
  detectEmotion,
  extractConcepts 
} from '../services/contextualAI';
import { updateStudyStreak } from '../services/agentMemory';
import { Volume2, VolumeX, History, Plus, X, Send, Trash2, LayoutDashboard } from 'lucide-react';
import ArcReactorAvatar from './ArcReactorAvatar';

export default function StudCompanion() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const uid = user?.uid;
  const userName = user?.username || user?.displayName || 'User';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [voiceError, setVoiceError] = useState(null);

  const {
    conversations,
    currentConversation,
    messages: historyMessages,
    loadConversation,
    startNewConversation,
    refreshConversations,
    clearAllHistory,
    loading: historyLoading // Alias logic
  } = useConversationHistory(uid);

  const { memory } = useAgentMemory(uid);
  
  const messagesEndRef = useRef(null);
  const synthesisRef = useRef(null);
  const voiceEnabledRef = useRef(voiceEnabled);
  const isSpeakingRef = useRef(isSpeaking);
  const initializedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Update messages from history
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      setMessages(historyMessages);
    }
  }, [historyMessages]);

  // Update study streak
  useEffect(() => {
    if (uid) {
      updateStudyStreak(uid);
    }
  }, [uid]);

  // Use a ref to track if we've already welcomed the user in this session mount
  // Note: In React Strict Mode (dev), effects run twice. We use this mechanism to prevent double greetings.
  const hasWelcomedRef = useRef(false);

  // Initialize conversation
  useEffect(() => {
    // Only proceed if we have a user, history is loaded, no current conversation is selected, 
    // and we haven't welcomed them yet in this component instance.
    if (uid && !historyLoading && !currentConversation && !hasWelcomedRef.current) {
      // Check if we already have a recent conversation to avoid creating duplicates on simple reloads
      if (conversations.length === 0) {
        hasWelcomedRef.current = true;
        initializeConversation();
      }
    }
  }, [uid, historyLoading, currentConversation, conversations.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeConversation = async () => {
    try {
        console.log('Initialize conversation triggered for:', uid);
        
        // Final safety check: if conversation was created while waiting
        if (conversations.length > 0) return;

        const conversationId = await startNewConversation('STUD AI Session');
        
        if (!conversationId) {
            throw new Error("Failed to create conversation ID");
        }

        // Personalized greeting
        const welcomeMsg = `Hi ${userName}! I am STUD, your personal AI tutor. What can I do for you buddy? Let's discuss anything you want to learn today! 🚀`;
        
        // Prevent duplicate local messages if state updates weirdly
        const welcomeMessage = {
          role: 'assistant',
          content: welcomeMsg,
          metadata: { type: 'welcome' }
        };
        
        await saveMessage(uid, conversationId, welcomeMessage);
        setMessages([welcomeMessage]);
        
        // Auto-speak the greeting when companion loads
        if (voiceEnabled) {
          // Small delay to ensure message is rendered first
          setTimeout(() => speak(welcomeMsg), 500);
        }

    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  // Stop speech immediately when voice is disabled
  useEffect(() => {
    if (!voiceEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [voiceEnabled]);

  /* ---------------- AUTO-ANALYSIS TRIGGER ---------------- */
  // Handles return from Quiz with results
  const analysisTriggeredRef = useRef(false);

  useEffect(() => {
    // Only proceed if we have quiz context AND a valid active conversation
    if (location.state?.quizContext && currentConversation && !analysisTriggeredRef.current) {
      console.log('📊 Analysis Trigger: Ready to analyze quiz results', location.state.quizContext);
      
      const { topic, level, score, total, weakAreas } = location.state.quizContext;
      
      // Mark as triggered immediately to prevent double-firing
      analysisTriggeredRef.current = true;
      
      const analysisPrompt = `
      [SYSTEM UPDATE: The student just completed a ${level} level quiz on "${topic}".
      Score: ${score}/${total}.
      Weak Areas: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None - Perfect score!'}
      
      Please provide a brief, encouraging analysis of their performance and 1 specific tip to improve. 
      Keep it conversational.]
      `;

      // Small delay to ensure state is stable
      setTimeout(() => {
        sendMessage(analysisPrompt, 'system'); 
        
        // Clear state so it doesn't re-trigger on refresh
        window.history.replaceState({}, document.title);
      }, 500);
    }
  }, [location, currentConversation]);

  /* ---------------- SPEECH SYNTHESIS ---------------- */
  const speak = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) {
      setVoiceError("Speech synthesis not supported or disabled");
      return;
    }

    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();

    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; 
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 1.0;

      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        // STRICT Female Voice Priority
        // 1. Google US English (reliable female voice on Chrome/Android)
        // 2. Microsoft Zira (reliable female voice on Windows)
        // 3. Any voice containing "Female"
        // 4. Any voice named "Samantha" (macOS)
        // 5. Fallback to any English voice
        const preferredVoice = voices.find(v => v.name === 'Google US English') 
          || voices.find(v => v.name.includes('Microsoft Zira'))
          || voices.find(v => v.name.includes('Google UK English Female'))
          || voices.find(v => v.name.includes('Samantha'))
          || voices.find(v => v.name.toLowerCase().includes('female'))
          || voices.find(v => v.lang.startsWith('en'));
        
        if (preferredVoice) {
          console.log("Selected Voice:", preferredVoice.name);
          utterance.voice = preferredVoice;
        }
      }

      utterance.onstart = () => {
        console.log('🔊 Speech started');
        setIsSpeaking(true);
        setVoiceError(null);
      };
      
      utterance.onend = () => {
        console.log('🔊 Speech ended');
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        // Handle common audio errors gracefully
        if (event.error === 'not-allowed') {
          console.log('🔇 Auto-play blocked by browser. Voice will active on next interaction.');
          // Do NOT disable voice or show error, just let it fail silently this time
          // It will likely work on next user interaction (click/type)
        } else if (event.error === 'interrupted') {
          console.log('Speech interrupted (normal)');
        } else {
          console.error('🔊 Speech error:', event.error);
          setVoiceError(`Voice error: ${event.error}`);
        }
        setIsSpeaking(false);
      };

      try {
        console.log('🔊 Attempting to speak:', text.substring(0, 50) + '...');
        window.speechSynthesis.speak(utterance);
        console.log('🔊 Speech queued successfully');
      } catch (e) {
        console.error("Speak exception:", e);
        // Don't show error to user, just log it
      }
    };

    // Robust voice loading - ensure we only call speakNow once
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speakNow();
    } else {
      // Voices not loaded yet, wait for them
      let voicesLoaded = false;
      window.speechSynthesis.onvoiceschanged = () => {
        if (!voicesLoaded) {
          voicesLoaded = true;
          window.speechSynthesis.onvoiceschanged = null;
          speakNow();
        }
      };
      // Fallback if event doesn't fire within 500ms
      setTimeout(() => {
        if (!voicesLoaded) {
          voicesLoaded = true;
          speakNow();
        }
      }, 500);
    }
  };

  const handleTestVoice = () => {
    setVoiceEnabled(true);
    setVoiceError(null);
    speak("Audio systems online. Voice enabled successfully.");
  };

  const handleTextSubmit = async (e) => {
    e?.preventDefault();
    if (!textInput.trim() || !uid || !currentConversation || loading) return;

    const message = textInput.trim();
    setTextInput('');
    await sendMessage(message, 'text');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const sendMessage = async (content, source = 'text') => {
    if (!content.trim() || !uid || !currentConversation || loading) {
      console.log('sendMessage blocked:', { content: !!content.trim(), uid: !!uid, currentConversation: !!currentConversation, loading });
      return;
    }

    console.log('Sending message:', content, 'from:', source);

    const userMessage = {
      role: 'user',
      content,
      metadata: {
        emotion: detectEmotion(content),
        concepts: extractConcepts(content),
        source
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      console.log('Saving user message...');
      await saveMessage(uid, currentConversation, userMessage);

      console.log('Generating AI response...');
      const aiResponse = await generateContextualResponse(
        uid,
        currentConversation,
        content,
        userName
      );

      console.log('AI Response received:', aiResponse);

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        metadata: {}
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage(uid, currentConversation, assistantMessage);

      console.log('Voice enabled:', voiceEnabled);
      
      // Check for JSON Action (Quiz Intent)
      let finalContent = aiResponse;
      try {
        // Attempt to extract JSON if embedded in backticks
        const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const actionData = JSON.parse(jsonStr);
          
          if (actionData.type === 'ACTION' && actionData.action === 'LAUNCH_QUIZ') {
             console.log("🚀 AGENT ACTION TRIGGERED:", actionData);
             
             // Speak the confirmation message first
             const confirmationMsg = actionData.message || "Starting quiz now...";
             
             if (voiceEnabled) {
               speak(confirmationMsg);
             }
             
             // 1. Show the message briefly
             const agentMessage = {
                role: 'assistant',
                content: confirmationMsg,
                metadata: { type: 'action', action: 'quiz_launch' }
             };
             setMessages(prev => [...prev, agentMessage]);
             await saveMessage(uid, currentConversation, agentMessage);

             // 2. Redirect after short delay to let voice start
             setTimeout(() => {
                navigate(`/quizzes?topic=${encodeURIComponent(actionData.params.topic)}&level=${actionData.params.level}&auto=true`);
             }, 1500);
             
             return; // Stop processing normal text flow
          }
        }
      } catch (e) {
        console.log("Not a JSON action, continuing as normal text");
      }

      // Speak AI response if voice is enabled (Normal flow)
      if (voiceEnabled) {
        console.log('Speaking response...');
        speak(aiResponse);
      }

      // Auto-title
      if (messages.filter(m => m.role === 'user').length === 0) {
        const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
        await updateConversationTitle(uid, currentConversation, title);
        refreshConversations();
      }

    } catch (error) {
      console.error('Error in conversation flow:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting to my neural network. Please check your connection and try again.",
        metadata: { type: 'error' }
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const conversationId = await startNewConversation('New STUD Session');
      setMessages([]);
      
      const welcomeMsg = `Hey ${userName}! Fresh session started. What's on your mind? Let's tackle some learning together! 💪`;
      const welcomeMessage = {
        role: 'assistant',
        content: welcomeMsg,
        metadata: { type: 'welcome' }
      };
      
      await saveMessage(uid, conversationId, welcomeMessage);
      setMessages([welcomeMessage]);
      setShowHistory(false);
      
      // Always speak if voice enabled, ignoring initialization check
      if (voiceEnabled) {
        speak(welcomeMsg);
      }
    } catch (error) {
      console.error('Error starting new session:', error);
    }
  };

  const handleSwitchConversation = async (conversationId) => {
    try {
      await loadConversation(conversationId);
      setShowHistory(false);
    } catch (error) {
      console.error('Error switching conversation:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 150, 255, .3) 25%, rgba(0, 150, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 150, 255, .3) 75%, rgba(0, 150, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 150, 255, .3) 25%, rgba(0, 150, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 150, 255, .3) 75%, rgba(0, 150, 255, .3) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="w-80 border-r border-blue-500/30 bg-gray-800/50 backdrop-blur-md flex flex-col transition-all duration-300 z-20">
          <div className="p-4 border-b border-blue-500/30 flex items-center justify-between bg-gray-900/50">
            <h3 className="font-semibold text-blue-300 flex items-center gap-2">
              <History size={18} /> Session History
            </h3>
            <div className="flex items-center gap-2">
              {conversations.length > 0 && (
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                      clearAllHistory();
                      setShowHistory(false);
                    }
                  }}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"
                  title="Clear All History"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setShowHistory(false)} 
                className="text-blue-400 hover:text-blue-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
            {conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => handleSwitchConversation(convo.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-all ${
                  currentConversation === convo.id
                    ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50'
                    : 'hover:bg-blue-900/30 text-gray-300 border border-transparent'
                }`}
              >
                <div className="font-medium truncate">{convo.title || 'Untitled Session'}</div>
                <div className="text-xs text-blue-400">
                  {convo.messageCount || 0} messages
                </div>
              </button>
            ))}
          </div>
        </div>
      )}



      {/* Main Area */}
      <div className="flex-1 flex flex-col relative z-0">
        {/* Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-blue-500/30 p-3 sm:p-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center animate-pulse">
                  <Volume2 className="text-white" size={20} />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  S.T.U.D
                </h1>
                <p className="text-[10px] sm:text-xs text-blue-300">
                  Smart Tutor Using Deep-learning
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/80 text-gray-300 transition-all flex items-center gap-2 border border-gray-600/50 flex-shrink-0"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 flex-shrink-0 ${
                  voiceEnabled 
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                    : 'bg-gray-700/30 text-gray-400 border border-gray-600/50'
                }`}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span className="hidden sm:inline">Voice</span>
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 transition-all flex items-center gap-2 border border-blue-500/50 flex-shrink-0"
              >
                <History size={18} />
                <span className="hidden sm:inline">History</span>
              </button>
              <button
                onClick={handleNewSession}
                className="px-3 py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 transition-all flex items-center gap-2 border border-cyan-500/50 flex-shrink-0"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Session</span>
              </button>
            </div>
          </div>
          
          {/* Voice Error Display */}
          {voiceError && (
              <div className="max-w-4xl mx-auto mt-2 px-3 py-2 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center justify-between">
                <p className="text-red-200 text-xs sm:text-sm flex items-center gap-2">
                  <VolumeX size={14} />
                  {voiceError}
                </p>
                <button 
                  onClick={handleTestVoice}
                  className="text-[10px] sm:text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded font-medium"
                >
                  Test Voice
                </button>
              </div>
          )}
        </div>

        {/* Avatar & Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            {/* Arc Reactor Avatar */}
            <div className="mb-6 sm:mb-8">
              <ArcReactorAvatar isSpeaking={isSpeaking} isListening={false} />
              <div className="text-center mt-4">
                <p className="text-blue-300 text-xs sm:text-sm">
                  {isSpeaking ? '🔊 Speaking...' : memory?.studyStreak > 0 ? `${memory.studyStreak} day streak 🔥` : 'Ready to assist'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-2xl rounded-2xl px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600/50 to-blue-600/50 text-white border border-cyan-500/50 backdrop-blur-sm'
                        : 'bg-gray-800/50 text-blue-100 border border-blue-500/30 backdrop-blur-sm'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.metadata?.error && (
                        <div className="mt-2 text-xs bg-white/10 p-2 rounded text-red-100 flex items-center gap-2">
                          ⚠️ Error generating response
                        </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/50 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 border border-blue-500/30 backdrop-blur-sm">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Text Control */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-t border-blue-500/30 p-3 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Text Input */}
            <form onSubmit={handleTextSubmit} className="mb-0 sm:mb-4">
              <div className="flex gap-2 sm:gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={loading}
                    rows={1}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-xl text-blue-100 placeholder-blue-400/50 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 resize-none backdrop-blur-sm transition-all custom-scrollbar text-sm sm:text-base"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !textInput.trim()}
                  className={`px-4 sm:px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
                    loading || !textInput.trim()
                      ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  <Send size={18} />
                  <span className="hidden sm:inline font-medium">Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

