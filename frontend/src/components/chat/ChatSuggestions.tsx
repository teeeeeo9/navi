import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestionItem {
  title: string;
  message: string;
  icon?: string;
}

interface ChatSuggestionsProps {
  onSuggestionSelected: (message: string) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ onSuggestionSelected }) => {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Pre-defined list of suggestions
  const suggestions: SuggestionItem[] = [
    {
      title: "Set the goals",
      message: "I'd like to set a new goal. Can you help me define a clear and achievable objective?",
      icon: "✨"
    },
    {
      title: "A deep dive into strategy",
      message: "Let's dive deep into strategy. Can you help me think strategically about a challenge I'm facing?",
      icon: "🧠"
    },
    {
      title: "Cheer me up!",
      message: "I could use some encouragement right now. Can you share something motivational?",
      icon: "🎉"
    },
    {
      title: "Track my progress",
      message: "I'd like to check in on my goals. Can you help me track my progress?",
      icon: "📊"
    },
    {
      title: "Help me focus",
      message: "I'm feeling distracted. Can you help me create a plan to focus better?",
      icon: "🎯"
    },
    {
      title: "Brainstorm ideas",
      message: "I need some fresh ideas for a project. Can we brainstorm together?",
      icon: "💡"
    },
    {
      title: "Overcome an obstacle",
      message: "I'm facing a challenge with my current goal. Can you help me find a way around it?",
      icon: "🚧"
    },
    {
      title: "Reflect on achievements",
      message: "I'd like to take a moment to reflect on what I've accomplished so far. Can you guide me?",
      icon: "🏆"
    }
  ];
  
  // Visible suggestions (limited when not expanded)
  const visibleSuggestions = expanded ? suggestions : suggestions.slice(0, 2);
  
  // Handle click outside to collapse expanded view
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div ref={containerRef} className="mb-4">
      <div className="flex items-center mb-2">
        <h3 className="text-lg font-medium bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent">
          Navi: Your strategic thinking partner, your personal mastermind replica
        </h3>
      </div>
      
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-dark-100">Try asking...</h4>
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        </div>
        
        <motion.div 
          layout 
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
        >
          <AnimatePresence>
            {visibleSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="glass-dark relative overflow-hidden group rounded-xl cursor-pointer shadow-lg"
                onClick={() => onSuggestionSelected(suggestion.message)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-3 relative z-10">
                  <div className="flex items-center">
                    {suggestion.icon && (
                      <span className="text-lg mr-2 group-hover:animate-bounce">{suggestion.icon}</span>
                    )}
                    <h5 className="font-medium text-white group-hover:text-primary-300 transition-colors">{suggestion.title}</h5>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary-500 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/0 via-primary-500/30 to-secondary-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 z-0"></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatSuggestions; 