import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Zap, BarChart, Menu, X, Layers, Activity, Award, Code, Database, Globe, Cpu, Sun, Moon, Atom, Terminal } from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "Course Generator",
      desc: "Generate complete courses on any topic with AI-curated modules and lessons."
    },
    {
      icon: <Zap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      title: "Quiz Generator",
      desc: "Instantly create quizzes to test your knowledge and reinforce learning."
    },
    {
      icon: <Layers className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      title: "Flashcards",
      desc: "Smart flashcards that use spaced repetition to help you memorize faster."
    },
    {
      icon: <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: "Mind Maps",
      desc: "Visualize complex topics with AI-generated interactive mind maps."
    },
    {
      icon: <BarChart className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      title: "Performance Tracking",
      desc: "Detailed analytics to track your progress and identify weak areas."
    },
     {
      icon: <Award className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      title: "Skill Assessment",
      desc: "Adaptive assessments to gauge your current level and customize paths."
    }
  ];

  return (
    <div className={`font-sans transition-colors duration-500 overflow-x-hidden min-h-screen relative ${isDark ? 'bg-[#030014] text-gray-200 selection:bg-purple-500 selection:text-white' : 'bg-white text-gray-800 selection:bg-cyan-500 selection:text-white'}`}>
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-500">
         {isDark ? (
           <>
             <div className="absolute inset-0 bg-[#030014]"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px]" />
           </>

         ) : (
           <>
              <div className="absolute inset-0 bg-white"></div>
              
              {/* Genesis Inspired Colors - Enhanced Visibility */}
              <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-orange-500/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
              <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] bg-pink-600/30 rounded-full blur-[100px] mix-blend-multiply" />
              <div className="absolute bottom-[-10%] right-[0%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[100px] mix-blend-multiply" />
           </>
         )}
      </div>

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? isDark 
              ? "bg-[#030014]/50 backdrop-blur-md shadow-lg shadow-purple-900/20 py-3 border-b border-[#2A0E61]" 
              : "bg-white/70 backdrop-blur-md shadow-lg py-3 border-b border-gray-100"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(147,51,234,0.5)]">
              <Brain className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isDark ? "from-white to-gray-400" : "from-gray-900 to-gray-600"}`}>
              SmartStud.Ai
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition duration-300`}>Features</a>
            <a href="#how-it-works" className={`${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition duration-300`}>How It Works</a>
            <Link to="/login" className={`${isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition duration-300`}>Log In</Link>
            
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-colors ${isDark ? "bg-[#1a1a2e] text-yellow-400 hover:bg-[#2A0E61]" : "bg-gray-100 text-orange-500 hover:bg-gray-200"}`}
            >
               {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link
              to="/get-started"
              className="px-6 py-2 rounded-full bg-[#2A0E61]/50 border border-[#7042f88b] text-white hover:bg-[#2A0E61] shadow-[0_0_15px_rgba(112,66,248,0.5)] transition-all duration-300"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button - Add logic here too if needed, simplified for brevity */}
          <div className="md:hidden flex items-center gap-4">
            <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full transition-colors ${isDark ? "bg-[#1a1a2e] text-yellow-400" : "bg-gray-100 text-orange-500"}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              className={isDark ? "text-white" : "text-gray-800"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
         {mobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 right-0 p-6 flex flex-col gap-4 shadow-xl z-50 backdrop-blur-xl border-b ${
              isDark 
              ? "bg-[#030014]/95 border-[#2A0E61]" 
              : "bg-white/95 border-gray-100"
            }`}>
             <a href="#features" className={`${isDark ? "text-gray-300" : "text-gray-600"} py-2`} onClick={() => setMobileMenuOpen(false)}>Features</a>
             <a href="#how-it-works" className={`${isDark ? "text-gray-300" : "text-gray-600"} py-2`} onClick={() => setMobileMenuOpen(false)}>How It Works</a>
             <Link to="/login" className={`${isDark ? "text-gray-300" : "text-gray-600"} py-2`} onClick={() => setMobileMenuOpen(false)}>Log In</Link>
             <Link to="/get-started" className="w-full text-center py-3 rounded-xl bg-purple-600/50 border border-purple-500 text-white" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
          </div>
         )}
      </nav>

      {/* HERO SECTION */}
      <header className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* LEFT: TEXT */}
          <div className="lg:w-1/2 text-center lg:text-left z-20">
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm mb-6 ${
                 isDark 
                 ? "border-[#7042f88b] bg-[#2A0E61]/30 text-gray-300 shadow-[0_0_15px_rgba(112,66,248,0.3)]"
                 : "border-purple-200 bg-purple-50 text-purple-700 shadow-sm"
               }`}
            >
               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
               AI-Powered Learning
            </motion.div>

            <motion.h1 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className={`text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r leading-tight mb-6 ${
                 isDark 
                 ? "from-white via-gray-200 to-gray-500" 
                 : "from-gray-900 via-gray-700 to-gray-500"
               }`}
            >
              Master Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
                 Studies
              </span>
            </motion.h1>

            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.8, delay: 0.4 }}
               className={`text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
               Experience the universe of knowledge with personalized AI courses, quizzes, and mind maps. 
               Your journey to mastery starts here.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.6 }}
               className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
            >
              <Link
                to="/get-started"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-lg hover:shadow-[0_0_30px_rgba(112,66,248,0.6)] transition-all w-full sm:w-auto text-center border border-white/10"
              >
                Start Learning Now
              </Link>
              <button className={`px-8 py-4 rounded-lg bg-transparent border font-semibold text-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2 group ${
                isDark 
                ? "border-[#7042f88b] text-white hover:bg-[#2A0E61]/30"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}>
                 Watch Demo
              </button>
            </motion.div>
          </div>

          {/* RIGHT: MULTI-RING BRAIN ORBIT */}
          <div className="lg:w-1/2 relative flex justify-center items-center h-[600px] w-full z-10 perspective-1000">
             
             {/* Center Glow */}
             <div className="absolute w-[150px] h-[150px] rounded-full bg-purple-600/30 blur-[80px] animate-pulse"></div>
             
             {/* Center Logo */}
             <motion.div 
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="relative z-20"
             >
                <div className={`relative w-32 h-32 rounded-full border-2 flex items-center justify-center backdrop-blur-md ${
                  isDark 
                  ? "bg-[#030014] border-[#7042f8] shadow-[0_0_30px_rgba(112,66,248,0.6)]"
                  : "bg-white border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                }`}>
                   <Brain className={`w-16 h-16 ${isDark ? "text-white" : "text-purple-600"} drop-shadow-md`} />
                </div>
             </motion.div>

             {/* Ring 1 - Dashed with React Atom */}
             <motion.div 
                className={`absolute w-[280px] h-[280px] border border-dashed rounded-full ${isDark ? "border-white/20" : "border-purple-900/10"}`}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
             >
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border rounded-full flex items-center justify-center shadow-lg ${
                  isDark 
                  ? "bg-[#030014] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  : "bg-white border-blue-500 shadow-blue-500/20"
                }`}>
                   <Atom className="w-5 h-5 text-blue-500" />
                </div>
             </motion.div>

             {/* Ring 2 - Purple Glow With Database (Right - 3 o'clock) */}
             <motion.div 
                className={`absolute w-[400px] h-[400px] rounded-full border ${isDark ? "border-purple-500/30" : "border-purple-500/20"}`}
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateX: 15, rotateY: 15, rotateZ: 360 }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
             >
                <div className={`absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 border rounded-full flex items-center justify-center shadow-lg ${
                  isDark 
                  ? "bg-[#030014] border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                  : "bg-white border-cyan-500 shadow-cyan-500/20"
                }`}>
                   <Database className="w-6 h-6 text-cyan-500" />
                </div>
             </motion.div>

             {/* Ring 3 - Tilted Cyan Orbit with Code (Left - 9 o'clock) */}
             <motion.div 
                className={`absolute w-[520px] h-[520px] rounded-full border ${isDark ? "border-cyan-500/20" : "border-cyan-500/20"}`}
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateX: -15, rotateY: -15, rotateZ: -360 }}
                transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
             >
                <div className={`absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border rounded-full flex items-center justify-center shadow-lg ${
                  isDark 
                  ? "bg-[#030014] border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                  : "bg-white border-pink-500 shadow-pink-500/20"
                }`}>
                   <Code className="w-6 h-6 text-pink-500" />
                </div>
             </motion.div>

             {/* Ring 4 - Large Outer Ring with Tech Icons */}
             <motion.div 
                className={`absolute w-[650px] h-[650px] border rounded-full ${isDark ? "border-white/5" : "border-gray-200"}`}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
             >
                 {/* Decorative dots on ring */}
                 <div className="absolute top-1/2 left-0 w-3 h-3 bg-purple-500 rounded-full shadow-lg"></div>
                 
                 {/* Terminal Icon */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                     <div className={`w-10 h-10 border rounded-full flex items-center justify-center shadow-lg ${
                      isDark 
                      ? "bg-[#030014] border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      : "bg-white border-green-500 shadow-green-500/20"
                    }`}>
                       <Terminal className="w-5 h-5 text-green-500" />
                    </div>
                 </div>

                 <div className="absolute bottom-1/2 right-0 w-2 h-2 bg-pink-500 rounded-full shadow-lg"></div>
                 
                 {/* CPU Icon */}
                 <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2">
                     <div className={`w-10 h-10 border rounded-full flex items-center justify-center shadow-lg ${
                      isDark 
                      ? "bg-[#030014] border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                      : "bg-white border-orange-500 shadow-orange-500/20"
                    }`}>
                       <Cpu className="w-5 h-5 text-orange-500" />
                    </div>
                 </div>
             </motion.div>
             
             {/* Floating Particles in background */}
             <div className="absolute inset-0 z-0">
                 {[...Array(10)].map((_, i) => (
                     <motion.div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full opacity-50 ${isDark ? "bg-white" : "bg-purple-600"}`}
                        initial={{ 
                            x: Math.random() * 400 - 200, 
                            y: Math.random() * 400 - 200,
                            scale: Math.random() 
                        }}
                        animate={{ 
                            y: [Math.random() * 400 - 200, Math.random() * 400 - 200],
                            opacity: [0.2, 0.8, 0.2]
                        }}
                        transition={{ 
                            duration: 5 + Math.random() * 5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                     />
                 ))}
             </div>

          </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative z-10">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500 mb-6">
               Explore Our Features
            </h2>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
               Powerful tools designed to supercharge your learning efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                className={`group p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                  isDark 
                  ? "bg-[#2A0E61]/20 border-[#2A0E61] hover:border-[#7042f88b] hover:shadow-[0_0_20px_rgba(112,66,248,0.3)]"
                  : "bg-white/50 border-gray-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10"
                }`}
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-14 h-14 rounded-xl border flex items-center justify-center mb-6 shadow-inner ${
                  isDark 
                  ? "bg-[#030014] border-white/10 shadow-purple-900/20"
                  : "bg-white border-purple-100 shadow-purple-100"
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 transition-colors ${isDark ? "text-white group-hover:text-cyan-300" : "text-gray-900 group-hover:text-purple-600"}`}>{feature.title}</h3>
                <p className={`leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className={`py-24 relative z-10 ${isDark ? "bg-[#030014]/50" : "bg-white/50"}`}>
         <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? "from-[#030014] via-[#2A0E61]/10 to-[#030014]" : "from-white via-purple-50 to-white"}`}></div>
         <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
               <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>How It Works</h2>
               <p className={isDark ? "text-gray-400" : "text-gray-600"}>Your journey to mastery in 4 simple steps.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
               {[
                  { step: "01", title: "Assess Skills", desc: "Take a diagnostic test." },
                  { step: "02", title: "AI Plan", desc: "Get a custom curriculum." },
                  { step: "03", title: "Learn", desc: "Interactive lessons & quizzes." },
                  { step: "04", title: "Track", desc: "Visualize your progress." }
               ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    className={`relative p-6 rounded-xl border backdrop-blur-md ${
                      isDark 
                      ? "border-[#7042f88b]/30 bg-[#1a1a2e]/50"
                      : "border-purple-100 bg-white/60 hover:shadow-lg"
                    }`}
                    whileHover={{ y: -5 }}
                  >
                     <div className="absolute -top-4 -left-4 text-4xl font-bold text-[#7042f88b] opacity-50">{item.step}</div>
                     <h3 className="text-xl font-bold text-cyan-500 mb-2 mt-4">{item.title}</h3>
                     <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{item.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className={`relative z-10 border-t pt-16 pb-8 ${isDark ? "bg-[#030014] border-[#2A0E61]" : "bg-gray-50 border-gray-200"}`}>
         <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
               <div className="flex items-center gap-2 mb-4 md:mb-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                    <Brain className="w-4 h-4"/>
                  </div>
                  <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>SmartStud.Ai</span>
               </div>
               <div className={`flex gap-6 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  <a href="#" className="hover:text-cyan-400 transition">Terms</a>
                  <a href="#" className="hover:text-cyan-400 transition">Privacy</a>
                  <a href="#" className="hover:text-cyan-400 transition">Contact</a>
               </div>
            </div>
            <div className="text-center text-xs text-gray-500">
               © 2024 SmartStud.Ai. All rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
}
