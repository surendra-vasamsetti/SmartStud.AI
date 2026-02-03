import React from 'react';
import { 
  Code, 
  Terminal, 
  Cpu, 
  Database, 
  Globe, 
  Layers, 
  Server, 
  Wifi, 
  Shield, 
  Cloud 
} from 'lucide-react';

export default function CourseThumbnail({ course, className = "h-48" }) {
  // 1. If valid image exists, use it
  if (course.thumbnail && !course.thumbnail.includes('source.unsplash.com')) {
    return (
      <img
        src={course.thumbnail}
        alt={course.title}
        className={`w-full object-cover ${className}`}
      />
    );
  }

  // 2. Otherwise, generate Gradient
  const getGradient = (category) => {
    switch (category) {
      case 'Programming': return 'from-blue-600 via-indigo-600 to-violet-600';
      case 'AI': return 'from-fuchsia-600 via-purple-600 to-indigo-600';
      case 'Web Development': return 'from-orange-500 via-amber-500 to-yellow-500';
      case 'Data Science': return 'from-emerald-500 via-teal-500 to-cyan-500';
      case 'Mobile Development': return 'from-rose-500 via-pink-500 to-fuchsia-500';
      case 'DevOps': return 'from-slate-700 via-gray-700 to-zinc-700';
      case 'Cybersecurity': return 'from-red-600 via-red-500 to-orange-500';
      case 'Cloud Computing': return 'from-sky-500 via-blue-500 to-indigo-500';
      default: return 'from-violet-600 via-purple-600 to-fuchsia-600';
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'Programming': return <Terminal size={48} className="text-white/80" />;
      case 'AI': return <Cpu size={48} className="text-white/80" />;
      case 'Web Development': return <Globe size={48} className="text-white/80" />;
      case 'Data Science': return <Database size={48} className="text-white/80" />;
      case 'Mobile Development': return <Layers size={48} className="text-white/80" />;
      case 'DevOps': return <Server size={48} className="text-white/80" />;
      case 'Cybersecurity': return <Shield size={48} className="text-white/80" />;
      case 'Cloud Computing': return <Cloud size={48} className="text-white/80" />;
      default: return <Code size={48} className="text-white/80" />;
    }
  };

  const gradientClass = getGradient(course.category);
  const icon = getIcon(course.category);

  return (
    <div className={`w-full ${className} bg-gradient-to-br ${gradientClass} relative overflow-hidden flex items-center justify-center`}>
      
      {/* Abstract Shapes/Patterns */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-5 translate-y-5"></div>
      
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* Central Icon */}
      <div className="relative z-10 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl">
        {icon}
      </div>
    </div>
  );
}
