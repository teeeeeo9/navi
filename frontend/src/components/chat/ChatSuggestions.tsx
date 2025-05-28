import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import theme from '@/styles/theme';

interface SuggestionItem {
  title: string;
  message: string;
  icon?: string;
  color?: string;
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
  
  // Pre-defined list of suggestions with different accent colors
  const suggestions: SuggestionItem[] = [
    {
      title: "How does Navi work?",
      message: "How does Navi work? How do I use the app?",
      icon: "❓",
      color: theme.blue[400]
    },    
    {
      title: "Set a new goal",
      message: "I'd like to set a new goal",
      icon: "🎯",
      color: theme.blue[600]
    },
    {
      title: "Deep dive into strategy",
      message: "Let's dive deep into strategy. Can you help me review strategically my goals, milestones and progress?",
      icon: "🔍",
      color: theme.grey[500]
    },
    {
      title: "Help me focus",
      message: "Help me focus",
      icon: "🧠",
      color: theme.orange[600]
    }
  ];
  
  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-2 justify-start">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.title}
            className="rounded-full px-3.5 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 text-white/90 text-xs flex items-center space-x-1.5 transition-all"
            onClick={() => handleClick(suggestion.message, index)}
            whileHover={{ 
              y: -2,
              boxShadow: `0 0 0 1px ${suggestion.color || theme.blue[500]}30`,
              borderColor: `${suggestion.color || theme.blue[500]}50`,
              transition: { duration: 0.2 }
            }}
            animate={{ 
              scale: selectedSuggestion === index ? 0.9 : 1,
              backgroundColor: selectedSuggestion === index ? `${suggestion.color || theme.blue[500]}20` : 'rgba(255, 255, 255, 0.05)'
            }}
            transition={{ duration: 0.15 }}
          >
            <span>{suggestion.icon}</span>
            <span>{suggestion.title}</span>
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
          <p className="text-xs text-gray-400 italic">
            Try Yoda mode for a fun strategizing experience
          </p>
          <motion.button
            onClick={switchToYoda}
            className="text-xs hover:text-blue-300"
            style={{ color: theme.blue[400] }}
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