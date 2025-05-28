import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '@/services/api';

interface SuggestionItem {
  title: string;
  message: string;
  icon?: string;
}

interface ChatSuggestionsProps {
  onSuggestionSelected: (message: string) => void;
  hasGoals?: boolean; // Prop to indicate if the user has created any goals
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ 
  onSuggestionSelected, 
  hasGoals = false 
}) => {
  const [showCharacterTip, setShowCharacterTip] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  
  // Show the character tip only if the user has created goals
  useEffect(() => {
    if (hasGoals) {
      setShowCharacterTip(true);
    }
  }, [hasGoals]);
  
  // Function to switch to Yoda character
  const switchToYoda = async () => {
    try {
      await api.updateCharacterPreference('yoda');
      // Reload the page to see the changes
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch character:', error);
    }
  };
  
  // Click handler with visual feedback
  const handleClick = (message: string, index: number) => {
    setSelectedSuggestion(index);
    
    // Reset after animation completes
    setTimeout(() => {
      setSelectedSuggestion(null);
      onSuggestionSelected(message);
    }, 150);
  };
  
  // Pre-defined list of suggestions - using shorter titles for minimalism
  const suggestions: SuggestionItem[] = [
    {
      title: "How does Navi work?",
      message: "How does Navi work? How do I use the app?",
      icon: " "
    },    
    {
      title: "Set a new goal",
      message: "I'd like to set a new goal",
      icon: " "
    },
    {
      title: "Deep dive into strategy",
      message: "Let's dive deep into strategy. Can you help me review strategically my goals, milestones and progress?",
      icon: " "
    },

    {
      title: "Help me focus",
      message: "Help me focus",
      icon: " "
    }
  ];
  
  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-2 justify-start">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.title}
            className="rounded-full px-3 py-1 bg-dark-700/50 backdrop-blur-sm border border-dark-600/20 text-white/90 text-xs flex items-center space-x-1.5 transition-all hover:bg-dark-600/60"
            onClick={() => handleClick(suggestion.message, index)}
            whileHover={{ 
              y: -2,
              transition: { duration: 0.2 }
            }}
            animate={{ 
              scale: selectedSuggestion === index ? 0.9 : 1,
              backgroundColor: selectedSuggestion === index ? 'rgba(99, 102, 241, 0.4)' : 'rgba(31, 41, 55, 0.5)'
            }}
            transition={{ duration: 0.15 }}
          >
            <span>{suggestion.icon}</span>
            <span>{suggestion.title}</span>
            
            {/* Subtle gradient ring on hover */}
            <motion.span 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 hover:opacity-100"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        ))}
      </div>
      
      {/* Character mode suggestion - simplified */}
      {showCharacterTip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex justify-between items-center"
        >
          <p className="text-xs text-dark-200 italic">
            Try Yoda mode for a fun strategizing experience
          </p>
          <motion.button
            onClick={switchToYoda}
            className="text-xs text-primary-400 hover:text-primary-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Switch to Yoda
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ChatSuggestions; 