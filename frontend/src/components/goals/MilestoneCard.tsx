import React, { useState, useRef, useEffect } from 'react';
import { Milestone, ProgressUpdate } from '@/services/api';
import api from '@/services/api';
import ProgressChart from './ProgressChart';
import { theme } from '@/styles/theme';
import { motion } from 'framer-motion';

interface MilestoneCardProps {
  milestone: Milestone;
  formatDate: (date: string) => string;
  onMilestoneUpdate?: (milestoneId: number) => void;
  goalId: number;
}

// Helper function to get color based on progress value
const getColorForProgress = (progress: number) => {
  if (progress <= 2) return theme.blue[900]; // Dark blue for very low progress
  if (progress <= 4) return theme.blue[500]; // Blue for low-medium progress
  if (progress <= 6) return theme.grey[500]; // Grey for medium progress
  if (progress <= 9) return theme.blue[500]; // Back to blue for higher progress
  return theme.orange[700]; // Orange ONLY for perfect 10 progress
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, formatDate, onMilestoneUpdate, goalId }) => {
  const [localMilestone, setLocalMilestone] = useState({
    title: milestone.title,
    targetDate: milestone.target_date,
    status: milestone.status
  });
  
  // Independent state for showing/hiding progress for this milestone
  const [showProgress, setShowProgress] = useState(false);
  
  // States for tracking progress
  const [progressValue, setProgressValue] = useState<number>(
    Math.round(milestone.completion_status / 10)
  );
  const [effortValue, setEffortValue] = useState<number>(5);
  const [progressNotes, setProgressNotes] = useState<string>('');
  const [effortNotes, setEffortNotes] = useState<string>('');
  
  // State for milestone progress updates
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>(
    milestone.progress_updates || []
  );
  
  // Fetch milestone progress updates when the milestone is shown
  useEffect(() => {
    if (showProgress && (!milestone.progress_updates || milestone.progress_updates.length === 0)) {
      const fetchMilestoneProgress = async () => {
        try {
          const updates = await api.getMilestoneProgressUpdates(goalId, milestone.id);
          setProgressUpdates(updates);
        } catch (error) {
          console.error(`Failed to fetch milestone progress updates:`, error);
        }
      };
      
      fetchMilestoneProgress();
    }
  }, [showProgress, milestone.id, goalId, milestone.progress_updates]);
  
  useEffect(() => {
    setLocalMilestone({
      title: milestone.title,
      targetDate: milestone.target_date,
      status: milestone.status
    });
    
    setProgressValue(Math.round(milestone.completion_status / 10));
    
    // Update progress updates if available
    if (milestone.progress_updates && milestone.progress_updates.length > 0) {
      setProgressUpdates(milestone.progress_updates);
    }
  }, [milestone]);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(milestone.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingTargetDate, setIsEditingTargetDate] = useState(false);
  const [targetDateValue, setTargetDateValue] = useState(milestone.target_date.split('T')[0]);
  const targetDateInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
    if (isEditingTargetDate && targetDateInputRef.current) {
      targetDateInputRef.current.focus();
    }
  }, [isEditingTitle, isEditingTargetDate]);
  
  // Function to handle submitting progress updates for milestones
  const handleProgressUpdate = async (type: 'progress' | 'effort', value: number) => {
    // Convert from 0-10 scale to 0-100 for backend
    const scaledValue = value * 10;
    
    // Use the appropriate notes field based on the update type
    const notes = type === 'progress' ? progressNotes : effortNotes;
    
    // Create an optimistic update to show immediately
    const tempUpdate: ProgressUpdate = {
      id: -1, // Temporary ID that will be replaced when the server responds
      goal_id: goalId,
      milestone_id: milestone.id,
      progress_value: scaledValue,
      type: type,
      created_at: new Date().toISOString()
    };
    
    // Add type-specific notes
    if (type === 'progress') {
      tempUpdate.progress_notes = notes;
      
      // Update local milestone status if needed
      if (scaledValue === 100 && localMilestone.status === 'active') {
        setLocalMilestone(prev => ({
          ...prev,
          status: 'completed'
        }));
      }
      
      // Update local progress value
      setProgressValue(value);
    } else {
      tempUpdate.effort_notes = notes;
      
      // Update local effort value
      setEffortValue(value);
    }
    
    // Immediately add the update to the UI
    setProgressUpdates(prevUpdates => [tempUpdate, ...prevUpdates]);
    
    try {
      // Use the API method to create a progress update for the milestone
      const update = await api.createMilestoneProgressUpdate(
        goalId,
        milestone.id,
        scaledValue,
        type,
        notes
      );
      
      // Refresh milestone progress data to ensure we have the latest updates
      const refreshedUpdates = await api.getMilestoneProgressUpdates(goalId, milestone.id);
      setProgressUpdates(refreshedUpdates);
      
      // If this is a progress update, update the milestone's completion status
      if (type === 'progress') {
        // Only update if this milestone has its status changed
        if (scaledValue === 100 && localMilestone.status === 'active') {
          await api.updateMilestone(goalId, milestone.id, {
            status: 'completed',
            completion_status: scaledValue
          });
        } else {
          await api.updateMilestone(goalId, milestone.id, {
            completion_status: scaledValue
          });
        }
      }
      
      // Refresh the parent goal
      if (onMilestoneUpdate) {
        onMilestoneUpdate(milestone.id);
      }
      
      // Clear the appropriate notes field based on the update type
      if (type === 'progress') {
        setProgressNotes('');
      } else {
        setEffortNotes('');
      }
      
    } catch (error) {
      console.error(`Failed to update milestone ${type}:`, error);
      // In case of error, refresh the milestone data to ensure UI is in sync with server
      const refreshedUpdates = await api.getMilestoneProgressUpdates(goalId, milestone.id);
      setProgressUpdates(refreshedUpdates);
    }
  };
  
  const handleTitleEdit = () => {
    setTitleValue(localMilestone.title);
    setIsEditingTitle(true);
  };
  
  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === localMilestone.title) {
      setIsEditingTitle(false);
      return;
    }
    
    const newTitle = titleValue.trim();
    setLocalMilestone(prev => ({ ...prev, title: newTitle }));
    setIsEditingTitle(false);
    
    try {
      await api.updateMilestone(goalId, milestone.id, {
        title: newTitle
      });
      
      if (onMilestoneUpdate) {
        onMilestoneUpdate(milestone.id);
      }
    } catch (error) {
      console.error('Failed to update milestone title:', error);
      setLocalMilestone(prev => ({ ...prev, title: milestone.title }));
    }
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };
  
  const handleDateEdit = () => {
    setTargetDateValue(localMilestone.targetDate.split('T')[0]);
    setIsEditingTargetDate(true);
  };
  
  const handleDateSave = async () => {
    if (!targetDateValue || targetDateValue === localMilestone.targetDate.split('T')[0]) {
      setIsEditingTargetDate(false);
      return;
    }
    
    const newTargetDate = targetDateValue;
    const formattedDate = `${newTargetDate}T00:00:00`;
    setLocalMilestone(prev => ({ ...prev, targetDate: formattedDate }));
    setIsEditingTargetDate(false);
    
    try {
      await api.updateMilestone(goalId, milestone.id, {
        target_date: formattedDate
      });
      
      if (onMilestoneUpdate) {
        onMilestoneUpdate(milestone.id);
      }
    } catch (error) {
      console.error('Failed to update milestone target date:', error);
      setLocalMilestone(prev => ({ ...prev, targetDate: milestone.target_date }));
    }
  };
  
  const handleDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDateSave();
    } else if (e.key === 'Escape') {
      setIsEditingTargetDate(false);
    }
  };
  
  return (
    <div className="group rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-md hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="mb-3">
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="w-full bg-dark-800/50 text-white rounded-lg border border-blue-400/30 px-3 py-2 text-base font-medium outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center mb-3">
              <h4 
                className="text-base font-medium text-white cursor-pointer"
                onClick={handleTitleEdit}
              >
                {localMilestone.title}
              </h4>
              <button
                onClick={handleTitleEdit}
                className="ml-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-gray-400 hover:text-white"
                aria-label="Edit milestone title"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                </svg>
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
            {isEditingTargetDate ? (
              <div className="bg-dark-800/50 rounded-lg border border-blue-400/30 px-2 py-1.5">
                <input
                  ref={targetDateInputRef}
                  type="date"
                  value={targetDateValue}
                  onChange={(e) => setTargetDateValue(e.target.value)}
                  onBlur={handleDateSave}
                  onKeyDown={handleDateKeyDown}
                  className="bg-transparent text-xs text-white outline-none w-32"
                />
              </div>
            ) : (
              <span 
                className="text-gray-300 rounded-lg bg-white/5 px-2.5 py-1.5 cursor-pointer" 
                onClick={handleDateEdit}
              >
                Due: {formatDate(localMilestone.targetDate)}
              </span>
            )}
            
            <span 
              className={`px-2.5 py-1.5 rounded-lg`}
              style={{ 
                backgroundColor: localMilestone.status === 'completed' 
                  ? 'rgba(113, 160, 198, 0.2)'
                  : 'rgba(126, 148, 168, 0.15)',
                color: localMilestone.status === 'completed' 
                  ? theme.orange[700]  // Only use orange for completed
                  : theme.blue[500]
              }}
            >
              {localMilestone.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>
        
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-sm font-medium"
             style={{ 
               backgroundColor: 'rgba(30, 30, 40, 0.4)', 
               color: getColorForProgress(progressValue)
             }}>
          {progressValue}/10
        </div>
      </div>
      
      <div className="mt-3 mb-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700/30">
          <div 
            className="h-full" 
            style={{ 
              width: `${milestone.completion_status}%`,
              background: milestone.completion_status === 100 
                ? 'var(--gradient-progress-complete)' 
                : 'var(--gradient-progress-incomplete)'
            }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowProgress(!showProgress)}
          className="rounded-lg px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 transition-colors"
        >
          {showProgress ? 'Hide Progress' : 'Track Progress'}
        </button>
      </div>
      
      {showProgress && (
        <div className="mt-5 space-y-5">
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-sm font-medium text-white">Track Milestone Progress</h3>
            
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-300">
                  Progress: {progressValue}/10
                </label>
                <span className="text-xs text-gray-400">
                  How far along are you?
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="1" 
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                  onClick={() => handleProgressUpdate('progress', progressValue)}
                >
                  Update
                </motion.button>
              </div>
              <div className="mt-3">
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Add notes about your progress..."
                  className="w-full rounded-lg border border-white/10 bg-dark-800/50 p-3 text-xs text-white placeholder:text-gray-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-300">
                  Effort: {effortValue}/10
                </label>
                <span className="text-xs text-gray-400">
                  How much effort are you investing?
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="1" 
                  value={effortValue}
                  onChange={(e) => setEffortValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                  onClick={() => handleProgressUpdate('effort', effortValue)}
                >
                  Update
                </motion.button>
              </div>
              <div className="mt-3">
                <textarea
                  value={effortNotes}
                  onChange={(e) => setEffortNotes(e.target.value)}
                  placeholder="Add notes about your effort level..."
                  className="w-full rounded-lg border border-white/10 bg-dark-800/50 p-3 text-xs text-white placeholder:text-gray-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {progressUpdates.length > 0 && (
            <ProgressChart 
              progressData={progressUpdates} 
              title={localMilestone.title}
              height={180}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MilestoneCard; 