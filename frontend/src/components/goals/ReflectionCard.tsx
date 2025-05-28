import React, { useState, useRef } from 'react';

// Define reflection types with their icons and styling
export const reflectionTypes = {
  'importance': {
    title: 'Why This Matters',
    icon: '✨',
    description: 'The core reason this goal is meaningful to you'
  },
  'obstacles': {
    title: 'Potential Obstacles',
    icon: '🧗',
    description: 'Challenges you might face along the way'
  },
  'environment': {
    title: 'Environmental Setup',
    icon: '🏡',
    description: 'Creating the right conditions for success'
  },
  'timeline': {
    title: 'Timeline Considerations',
    icon: '⏱️',
    description: 'Thoughts on timing and scheduling'
  },
  'backups': {
    title: 'Backup Plans',
    icon: '🛟',
    description: 'Alternative approaches if things don\'t go as planned'
  },
  'review_positive': {
    title: 'What Went Well',
    icon: '👍',
    description: 'Successful aspects worth continuing'
  },
  'review_improve': {
    title: 'Areas to Improve',
    icon: '🔍',
    description: 'Opportunities for growth and refinement'
  }
};

interface ReflectionCardProps {
  type: string;
  content: string;
  goalId: number;
  onSave: (type: string, content: string) => Promise<void>;
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({ 
  type, 
  content, 
  goalId,
  onSave 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const reflectionStyle = reflectionTypes[type as keyof typeof reflectionTypes] || {
    title: type.replace('_', ' '),
    icon: '📝',
    description: 'Additional reflections on your goal'
  };
  
  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
    
    // Focus the textarea after it renders
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 50);
  };
  
  const handleSave = async () => {
    if (editedContent !== content) {
      await onSave(type, editedContent);
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      handleSave();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedContent(content);
    }
  };

  return (
    <div 
      id={`reflection-${goalId}-${type}`}
      className="group rounded-lg border border-white/10 bg-white/5 p-5 transition-all backdrop-blur-md hover:bg-white/10"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{reflectionStyle.icon}</span>
        <div>
          <h4 className="text-base font-medium text-white">
            {reflectionStyle.title}
          </h4>
          <p className="text-xs text-gray-400">{reflectionStyle.description}</p>
        </div>
        
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label={`Edit ${reflectionStyle.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
            </svg>
          </button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="mt-3">
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-dark-800/60 text-white outline-none border border-blue-400/30 p-3 rounded-lg resize-none text-sm"
            rows={4}
            placeholder={`Add your thoughts on ${reflectionStyle.title.toLowerCase()}...`}
          />
          <div className="mt-2 flex justify-end">
            <button 
              onClick={handleSave}
              className="px-3 py-1.5 text-xs bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p 
          className="text-sm text-gray-300 pl-1 whitespace-pre-wrap mt-2 cursor-text"
          onClick={handleEdit}
        >
          {content || (
            <span className="text-gray-500 italic">
              Click to add your reflection...
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default ReflectionCard; 