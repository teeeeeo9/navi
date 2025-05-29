import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/services/api';
import theme from '@/styles/theme';
import { useAuth } from '@/context/AuthContext';

interface SuggestionItem {
  title: string;
  message: string;
  icon?: string;
  color?: string;
}

interface ChatSuggestionsProps {
  onSuggestionSelected: (message: string) => void;
  hasGoals?: boolean; // Prop to indicate if the user has created any goals
  onYodaModeSwitch?: (isEntering: boolean) => void; // Callback for yoda mode switch animations
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ 
  onSuggestionSelected, 
  hasGoals = false,
  onYodaModeSwitch
}) => {
  const { user } = useAuth();
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [showYodaTooltip, setShowYodaTooltip] = useState(false);
  const isYodaMode = user?.preferences?.character_preference === 'yoda';
  
  // Function to switch character mode
  const switchCharacter = async (character: 'default' | 'yoda') => {
    console.log(`Attempting to switch character to: ${character}`);
    
    // Trigger animation callback before API call
    if (onYodaModeSwitch) {
      onYodaModeSwitch(character === 'yoda');
    }
    
    try {
      // Update the character preference via API
      const response = await api.updateCharacterPreference(character);
      console.log(`Character preference updated successfully:`, response);
      
      // Reload the page to see the changes after a slight delay to show animation
      console.log('Reloading page to apply changes...');
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Delay to allow animation to show
    } catch (error) {
      console.error('Failed to switch character:', error);
      // Show an error message to the user
      alert(`Failed to switch character mode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Click handler with visual feedback
  const handleClick = (message: string, index: number) => {
    // Set selected for visual feedback
    setSelectedSuggestion(index);
    
    // Call suggestion handler immediately
    onSuggestionSelected(message);
    
    // Reset animation after a brief moment
    setTimeout(() => {
      setSelectedSuggestion(null);
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
    // Only show the focus suggestion if user has goals
    ...(hasGoals ? [{
      title: "Help me focus",
      message: "Help me focus",
      icon: "🧠",
      color: theme.orange[600]
    }] : [])
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
        
        {/* Yoda mode suggestion */}
        <motion.div
          className="relative"
          onMouseEnter={() => setShowYodaTooltip(true)}
          onMouseLeave={() => setShowYodaTooltip(false)}
        >
          <motion.button
            className="rounded-full px-3.5 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 text-white/90 text-xs flex items-center space-x-1.5 transition-all"
            onClick={() => switchCharacter(isYodaMode ? 'default' : 'yoda')}
            whileHover={{ 
              y: -2,
              boxShadow: `0 0 0 1px ${theme.green[500]}30`,
              borderColor: `${theme.green[500]}50`,
              transition: { duration: 0.2 }
            }}
            animate={{ 
              scale: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
            transition={{ duration: 0.15 }}
          >
            <span>{isYodaMode ? "🧙‍♂️" : "🧙‍♂️"}</span>
            <span>{isYodaMode ? "Return to your normal Navi replica" : "Try Yoda mode"}</span>
          </motion.button>
          
          {/* Tooltip for Yoda mode */}
          {showYodaTooltip && !isYodaMode && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-lg text-xs text-white w-64 shadow-lg z-10"
            >
              The best way to be productive is to have fun in the meantime. Want Yoda to guide you? More characters are coming shortly;)
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChatSuggestions; 