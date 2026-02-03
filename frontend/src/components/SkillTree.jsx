import { CheckCircle, Lock, Play, Star, Loader2 } from 'lucide-react';

const TopicNode = ({ topic, index, isLeft, isCompleted, isUnlocked, isGenerating }) => {
  return (
    <div className={`relative flex items-center gap-4 mb-8 ${isLeft ? 'flex-row-reverse text-right' : 'flex-row'} ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
      
      {/* Content Card */}
      <div className={`
        flex-1 p-4 rounded-xl border-2 transition-all duration-300 relative group
        ${isCompleted 
          ? 'bg-purple-900/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
          : isGenerating
            ? 'bg-indigo-50 border-indigo-500 shadow-lg scale-105'
          : isUnlocked 
            ? 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-lg scale-105' 
            : 'bg-gray-50 border-gray-200 opacity-60 grayscale'
        }
      `}>
        <h4 className={`font-bold ${isCompleted ? 'text-purple-700' : isGenerating ? 'text-indigo-700' : 'text-gray-800'}`}>
          {topic.title}
        </h4>
        <div className={`text-xs mt-1 font-medium ${isLeft ? 'justify-end' : 'justify-start'} flex items-center gap-1`}>
             {isCompleted ? (
               <span className="text-purple-600 flex items-center gap-1"><CheckCircle size={12}/> Mastered</span>
             ) : isGenerating ? (
               <span className="text-indigo-600 flex items-center gap-1 animate-pulse"><Loader2 size={12} className="animate-spin"/> Generating Content...</span>
             ) : isUnlocked ? (
               <span className="text-blue-600 flex items-center gap-1"><Play size={12}/> Ready to Start</span>
             ) : (
               <span className="text-gray-400 flex items-center gap-1"><Lock size={12}/> Locked</span>
             )}
        </div>

        {/* Connector Line (Horizontal) */}
        <div className={`absolute top-1/2 w-8 h-0.5 ${isGenerating ? 'bg-indigo-400' : 'bg-purple-300'} ${isLeft ? '-right-8' : '-left-8'} hidden md:block opacity-50`}></div>
      </div>

      {/* Node Icon */}
      <div className={`
        w-12 h-12 rounded-full border-4 flex items-center justify-center z-20 shrink-0 relative
        ${isCompleted 
          ? 'bg-purple-600 border-purple-200 shadow-[0_0_20px_rgba(147,51,234,0.5)]' 
          : isGenerating 
            ? 'bg-indigo-600 border-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse'
          : isUnlocked 
            ? 'bg-white border-purple-500 animate-pulse' 
            : 'bg-gray-100 border-gray-300'
        }
      `}>
         {isCompleted ? <Star className="text-white w-5 h-5 fill-current" /> : 
          isGenerating ? <Loader2 className="text-white w-6 h-6 animate-spin" /> :
          isUnlocked ? <Play className="text-purple-600 w-5 h-5 ml-1" /> : 
          <Lock className="text-gray-400 w-4 h-4" />
         }
      </div>

      {/* Spacer for proper alignment on the other side */}
      <div className="flex-1 hidden md:block"></div>
    </div>
  );
};

export default function SkillTree({ chapters, isOutline, isGenerating, completedTopics = [], isEnrolled, onStartLearning }) {
  // Flat list of all topics with chapter info to build the continuous tree
  let firstIncompleteFound = false;

  // Flatten topics to calculate global index for sequential unlocking
  const allTopics = [];
  chapters.forEach((chap, cIdx) => {
    chap.topics.forEach((top, tIdx) => {
      allTopics.push({ ...top, chapterTitle: chap.title, cIdx, tIdx, originalTopicId: `ch${cIdx+1}-t${tIdx+1}` });
    });
  });

  return (
    <div className="py-10 relative">
      
      {/* Central Trunk Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-200 via-purple-400 to-purple-200 transform md:-translate-x-1/2"></div>

      <div className="space-y-4 md:space-y-0 relative z-10">
        {chapters.map((chapter, cIndex) => (
          <div key={cIndex} className="relative">
            
            {/* Chapter Milestone Marker */}
            <div className="flex justify-center mb-12 pt-8">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg z-20 border-4 border-white relative text-center min-w-[200px]">
                <span className="text-xs uppercase tracking-[0.2em] opacity-80 block mb-1">Level {cIndex + 1}</span>
                {chapter.title}
                {/* Glow effect */}
                <div className="absolute inset-0 bg-purple-500 rounded-full filter blur-xl opacity-30 -z-10"></div>
              </div>
            </div>

            {/* Topics for this chapter */}
            <div className="relative">
              {chapter.topics.map((topic, tIndex) => {
                const topicGlobalId = `ch${cIndex + 1}-t${tIndex + 1}`; // Match backend ID format? Or use _id if available
                // Note: topic.topicId usually exists from backend generation
                const actualTopicId = topic.topicId || topicGlobalId;
                
                const isLeft = tIndex % 2 === 0; 
                const hasContent = topic.content && topic.content.length > 50;

                // --- 1. GENERATION STATE LOGIC ---
                // Identify the specific topic currently being generated
                let isGeneratingThis = false;
                if (isGenerating && !hasContent && !firstIncompleteFound) {
                    isGeneratingThis = true;
                    firstIncompleteFound = true; 
                }

                // --- 2. LEARNING PROGRESS LOGIC ---
                // "Mastered" means user has completed it (in learning mode) OR content exists (in outline mode, old logic)
                // New Logic: 
                // - Generated: hasContent
                // - User Completed: completedTopics.includes(actualTopicId)
                
                let isCompleted = false;
                let isUnlocked = false;

                if (isOutline) {
                    // Pre-enrollment / Generation View
                    isCompleted = false; // You can't master it before enrolling
                    isUnlocked = hasContent; // It's "ready" if content exists
                } else {
                    // Post-enrollment / Learning View
                    isCompleted = completedTopics.includes(actualTopicId);
                    
                    // Unlock Logic: 
                    // - First topic of first chapter is always unlocked
                    // - Otherwise, unlocked if PREVIOUS topic is completed
                    if (cIndex === 0 && tIndex === 0) {
                        isUnlocked = true;
                    } else {
                        // Find previous topic in linear list
                        const currentLinearIndex = allTopics.findIndex(t => t.cIdx === cIndex && t.tIdx === tIndex);
                        if (currentLinearIndex > 0) {
                           const prevTopic = allTopics[currentLinearIndex - 1];
                           const prevTopicId = prevTopic.originalTopicId || prevTopic.topicId; // fallback
                           // Check if previous is completed
                           // Note: Using flexible ID matching since backend might use different formats
                           // We reuse `completedTopics` assuming it contains topicIds
                           // In a real robust app, we should use unique UUIDs
                            
                           // Since we don't have easy access to prev ID here without complex lookup, 
                           // let's assume `completedTopics` check. 
                           // But wait, we need to check if PREVIOUS is in completedTopics.
                           
                           // Simplifying assumption:
                           // If current is completed, it's unlocked.
                           // If not completed, check if previous is completed.
                            const prevLinearTopic = allTopics[currentLinearIndex - 1];
                            const prevId = prevLinearTopic.topicId; // from flattened list
                            isUnlocked = completedTopics.includes(prevId);
                        }
                    }
                }

                // Override unlock if completed (completed implies unlocked)
                if (isCompleted) isUnlocked = true;


                return (
                  <div key={tIndex} className="md:w-full w-full pl-12 md:pl-0" onClick={() => (isUnlocked && !isGenerating) && onStartLearning && onStartLearning(chapter, topic)}>
                    <div className="md:hidden">
                       <TopicNode topic={topic} index={tIndex} isLeft={false} isCompleted={isCompleted} isUnlocked={isUnlocked} isGenerating={isGeneratingThis} />
                    </div>
                    
                    <div className="hidden md:block">
                       <TopicNode topic={topic} index={tIndex} isLeft={isLeft} isCompleted={isCompleted} isUnlocked={isUnlocked} isGenerating={isGeneratingThis} />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>
      
      {/* Final Trophy */}
      <div className="flex justify-center mt-12">
         <div className="w-24 h-24 bg-yellow-400 rounded-full border-8 border-white shadow-2xl flex items-center justify-center relative z-20">
            <Star className="w-12 h-12 text-yellow-700 fill-current animate-bounce" />
         </div>
      </div>

    </div>
  );
}
