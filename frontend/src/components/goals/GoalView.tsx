import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Goal } from '@/services/api';
import api from '@/services/api';
import ProgressChart from './ProgressChart';
import MilestoneCard from './MilestoneCard';
import ReflectionCard, { reflectionTypes } from './ReflectionCard';
import CelebrationAnimation from './CelebrationAnimation';
import Modal from '@/components/ui/Modal';
import theme from '@/styles/theme';

// Progress Ring Component
const ProgressRing = ({ progress, size = 80, strokeWidth = 6 }: { progress: number, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - ((progress / 10) * circumference)
  
  // Calculate color based on progress - blue (for low) to orange (for high)
  const getColorForProgress = (progress: number) => {
    if (progress <= 2) return theme.blue[900]; // Dark blue for very low progress
    if (progress <= 4) return theme.blue[500]; // Blue for low-medium progress
    if (progress <= 6) return theme.grey[500]; // Grey for medium progress
    if (progress <= 9) return theme.blue[500]; // Back to blue for higher progress
    return theme.orange[700]; // Orange ONLY for perfect 10 progress
  }
  
  const progressColor = getColorForProgress(progress);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress circle with dynamic color */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: "stroke 0.3s ease" }}
      />
    </svg>
  )
}

interface GoalViewProps {
  goal: Goal;
  onGoalUpdate: (updatedGoal: Goal, updateType: string) => void;
}

const GoalView: React.FC<GoalViewProps> = ({ goal, onGoalUpdate }) => {
  const [progressValue, setProgressValue] = useState<number>(
    goal.completion_status / 10
  );
  const [effortValue, setEffortValue] = useState<number>(5);
  const [progressNotes, setProgressNotes] = useState<string>('');
  const [effortNotes, setEffortNotes] = useState<string>('');
  const [showProgressUpdate, setShowProgressUpdate] = useState<boolean>(false);
  
  // Add states for update feedback
  const [progressUpdateStatus, setProgressUpdateStatus] = useState<'idle' | 'updating' | 'success'>('idle');
  const [effortUpdateStatus, setEffortUpdateStatus] = useState<'idle' | 'updating' | 'success'>('idle');
  
  const [localGoalData, setLocalGoalData] = useState({
    title: goal.title,
    startDate: goal.start_date,
    targetDate: goal.target_date,
    status: goal.status
  });
  
  useEffect(() => {
    setLocalGoalData({
      title: goal.title,
      startDate: goal.start_date,
      targetDate: goal.target_date,
      status: goal.status
    });
    
    const newProgressValue = goal.completion_status / 10;
    setProgressValue(newProgressValue);
    setPreviousProgressValue(newProgressValue);
  }, [goal]);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(goal.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [startDateValue, setStartDateValue] = useState(goal.start_date.split('T')[0]);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingTargetDate, setIsEditingTargetDate] = useState(false);
  const [targetDateValue, setTargetDateValue] = useState(goal.target_date.split('T')[0]);
  const targetDateInputRef = useRef<HTMLInputElement>(null);
  
  const [daysRemaining, setDaysRemaining] = useState(calculateDaysRemaining(goal.target_date));
  const [isOverdue, setIsOverdue] = useState(calculateDaysRemaining(goal.target_date) < 0 && goal.status === 'active');

  // Celebration animation state
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousProgressValue, setPreviousProgressValue] = useState<number>(
    goal.completion_status / 10
  );

  useEffect(() => {
    const days = calculateDaysRemaining(goal.target_date);
    setDaysRemaining(days);
    setIsOverdue(days < 0 && goal.status === 'active');
  }, [goal.target_date, goal.status]);

  function calculateDaysRemaining(targetDateStr: string) {
    const targetDate = new Date(targetDateStr);
    const today = new Date();
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  }

  // Focus inputs when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
    if (isEditingStartDate && startDateInputRef.current) {
      startDateInputRef.current.focus();
    }
    if (isEditingTargetDate && targetDateInputRef.current) {
      targetDateInputRef.current.focus();
    }
  }, [isEditingTitle, isEditingStartDate, isEditingTargetDate]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
    });
  };

  // Function to handle submitting progress updates
  const handleProgressUpdate = async (type: 'progress' | 'effort', value: number) => {
    // Convert from 0-10 scale to 0-100 for backend
    const scaledValue = value * 10;
    
    // Use appropriate notes based on the update type (capture notes before clearing)
    const notes = type === 'progress' ? progressNotes : effortNotes;
    
    // Set updating status and clear notes immediately
    if (type === 'progress') {
      setProgressUpdateStatus('updating');
      setProgressNotes('');
    } else {
      setEffortUpdateStatus('updating');
      setEffortNotes('');
    }
    
    if (type === 'progress') {
      // Check if goal just reached completion (went from < 10 to 10)
      const wasNotCompleted = previousProgressValue < 10;
      const isNowCompleted = value === 10;
      
      console.log('Progress Update Debug:', {
        wasNotCompleted,
        isNowCompleted,
        previousProgressValue,
        currentValue: value,
        scaledValue: scaledValue
      });
      
      // Update previous progress value
      setPreviousProgressValue(value);
      
      // Immediately update local progress value for UI feedback
      setProgressValue(value);
      
      // Store completion state for later use after backend response
      const shouldCelebrate = wasNotCompleted && isNowCompleted;
      console.log('Should celebrate:', shouldCelebrate);
      
      try {
        // Use appropriate API function based on type
        await api.createProgressUpdate(goal.id, scaledValue, notes);
        setProgressUpdateStatus('success');
        
        // Update local goal data and notify parent only after successful backend response
        const updatedGoal = {
          ...goal,
          completion_status: scaledValue,
          status: scaledValue === 100 && goal.status === 'active' ? 'completed' : goal.status
        };
        setLocalGoalData(prev => ({
          ...prev,
          status: scaledValue === 100 && prev.status === 'active' ? 'completed' : prev.status
        }));
        onGoalUpdate(updatedGoal, type);
        
        // Trigger celebration after successful backend response
        if (shouldCelebrate) {
          setShowCelebration(true);
        }
        
      } catch (error) {
        console.error(`Failed to update ${type}:`, error);
        // Reset to idle on error
        setProgressUpdateStatus('idle');
      }
    } else {
      // Immediately update local effort value for UI feedback
      setEffortValue(value);
      
      try {
        await api.createEffortUpdate(goal.id, scaledValue, notes);
        setEffortUpdateStatus('success');
        
        // For effort updates, just notify parent to refresh data
        onGoalUpdate(goal, type);
        
      } catch (error) {
        console.error(`Failed to update ${type}:`, error);
        // Reset to idle on error
        setEffortUpdateStatus('idle');
      }
    }
    
    // Reset to idle after showing success for 2 seconds (only for successful updates)
    if (type === 'progress' && progressUpdateStatus === 'success') {
      setTimeout(() => {
        setProgressUpdateStatus('idle');
      }, 2000);
    } else if (type === 'effort' && effortUpdateStatus === 'success') {
      setTimeout(() => {
        setEffortUpdateStatus('idle');
      }, 2000);
    }
  };

  const handleTitleEdit = () => {
    setTitleValue(localGoalData.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === localGoalData.title) {
      setIsEditingTitle(false);
      return;
    }

    const newTitle = titleValue.trim();
    setLocalGoalData(prev => ({ ...prev, title: newTitle }));
    setIsEditingTitle(false);

    try {
      const updatedGoal = await api.updateGoal(goal.id, { title: newTitle });
      onGoalUpdate(updatedGoal, 'title_update');
    } catch (error) {
      console.error('Failed to update goal title:', error);
      setLocalGoalData(prev => ({ ...prev, title: goal.title }));
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleStartDateEdit = () => {
    setStartDateValue(localGoalData.startDate.split('T')[0]);
    setIsEditingStartDate(true);
  };

  const handleStartDateSave = async () => {
    if (!startDateValue || startDateValue === localGoalData.startDate.split('T')[0]) {
      setIsEditingStartDate(false);
      return;
    }

    const newStartDate = startDateValue;
    const formattedDate = `${newStartDate}T00:00:00`;
    setLocalGoalData(prev => ({ ...prev, startDate: formattedDate }));
    setIsEditingStartDate(false);
    
    setDaysRemaining(calculateDaysRemaining(localGoalData.targetDate));

    try {
      const updatedGoal = await api.updateGoal(goal.id, { start_date: formattedDate });
      onGoalUpdate(updatedGoal, 'start_date_update');
    } catch (error) {
      console.error('Failed to update goal start date:', error);
      setLocalGoalData(prev => ({ ...prev, startDate: goal.start_date }));
    }
  };

  const handleTargetDateEdit = () => {
    setTargetDateValue(localGoalData.targetDate.split('T')[0]);
    setIsEditingTargetDate(true);
  };

  const handleTargetDateSave = async () => {
    if (!targetDateValue || targetDateValue === localGoalData.targetDate.split('T')[0]) {
      setIsEditingTargetDate(false);
      return;
    }

    const newTargetDate = targetDateValue;
    const formattedDate = `${newTargetDate}T00:00:00`;
    setLocalGoalData(prev => ({ ...prev, targetDate: formattedDate }));
    setIsEditingTargetDate(false);
    
    const days = calculateDaysRemaining(formattedDate);
    setDaysRemaining(days);
    setIsOverdue(days < 0 && localGoalData.status === 'active');

    try {
      const updatedGoal = await api.updateGoal(goal.id, { target_date: formattedDate });
      onGoalUpdate(updatedGoal, 'target_date_update');
    } catch (error) {
      console.error('Failed to update goal target date:', error);
      setLocalGoalData(prev => ({ ...prev, targetDate: goal.target_date }));
      
      setDaysRemaining(calculateDaysRemaining(goal.target_date));
      setIsOverdue(daysRemaining < 0 && localGoalData.status === 'active');
    }
  };

  const handleReflectionSave = async (type: string, content: string) => {
    try {
      const updateData = {
        reflections: {
          [type]: content
        }
      };

      const updatedGoal = await api.updateGoal(goal.id, updateData as any);
      onGoalUpdate(updatedGoal, 'reflection_update');
    } catch (error) {
      console.error('Failed to update reflection:', error);
    }
  };

  const handleMilestoneUpdate = async () => {
    try {
      const updatedGoal = await api.getGoalDetails(goal.id);
      onGoalUpdate(updatedGoal, 'milestone_update');
    } catch (error) {
      console.error('Failed to refresh goal:', error);
    }
  };

  // Add state for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteGoal = async () => {
    // Close the modal immediately
    setIsDeleteModalOpen(false);
    
    // Immediately remove from UI (optimistic update) - pass the original goal
    onGoalUpdate(goal, 'goal_delete');
    
    // Send delete request to backend (async, don't wait)
    try {
      await api.deleteGoal(goal.id);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      // Note: We don't re-add the goal to UI as that would be confusing
      // The user has already seen it disappear, so we just log the error
      // In a production app, you might want to show a toast notification
    }
  };

  // Sort reflections to show "importance" first
  const getSortedReflections = () => {
    if (!goal.reflections) return [];
    
    // Define the preferred order of reflection types
    const order = [
      'importance',
      'obstacles',
      'environment',
      'timeline',
      'backups',
      'review_positive',
      'review_improve'
    ];
    
    // Get entries and sort them according to the order
    const entries = Object.entries(goal.reflections);
    return entries.sort((a, b) => {
      const indexA = order.indexOf(a[0]);
      const indexB = order.indexOf(b[0]);
      return indexA - indexB;
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
      <div className="p-8">
        {/* Header with title and progress */}
        <div className="mb-6 flex items-start justify-between gap-8">
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="mb-4">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full bg-transparent text-xl font-medium text-white border-b border-blue-400/50 px-4 py-2 outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center mb-4 relative">
                <h2 
                  className="text-xl font-medium text-white cursor-pointer"
                  onClick={handleTitleEdit}
                >
                  {localGoalData.title}
                </h2>
                <button
                  onClick={handleTitleEdit}
                  className="ml-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-gray-300 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                  </svg>
                </button>
                {/* Celebration Animation positioned absolutely to not affect layout */}
                {showCelebration && (
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center pointer-events-none">
                    <CelebrationAnimation
                      isVisible={showCelebration}
                      type="goal"
                      onComplete={() => {
                        setShowCelebration(false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm mb-6">
              {isEditingStartDate ? (
                <div className="bg-dark-800/50 rounded-lg border border-blue-400/30 px-3 py-1.5">
                  <input
                    ref={startDateInputRef}
                    type="date"
                    value={startDateValue}
                    onChange={(e) => setStartDateValue(e.target.value)}
                    onBlur={handleStartDateSave}
                    className="bg-transparent text-sm text-white outline-none"
                  />
                </div>
              ) : (
                <span
                  className="text-gray-300 cursor-pointer rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
                  onClick={handleStartDateEdit}
                >
                  Start: {formatDate(localGoalData.startDate)}
                </span>
              )}
              
              {isEditingTargetDate ? (
                <div className="bg-dark-800/50 rounded-lg border border-blue-400/30 px-3 py-1.5">
                  <input
                    ref={targetDateInputRef}
                    type="date"
                    value={targetDateValue}
                    onChange={(e) => setTargetDateValue(e.target.value)}
                    onBlur={handleTargetDateSave}
                    className="bg-transparent text-sm text-white outline-none"
                  />
                </div>
              ) : (
                <span
                  className="text-gray-300 cursor-pointer rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
                  onClick={handleTargetDateEdit}
                >
                  Target: {formatDate(localGoalData.targetDate)}
                </span>
              )}
              
              <span className={`rounded-lg px-3 py-1.5`}
                     style={{ 
                       backgroundColor: isOverdue ? 'rgba(247,144,81,0.1)' : 'rgba(113,160,198,0.1)',
                       color: isOverdue ? theme.orange[600] : theme.blue[500]
                     }}>
                {Math.abs(daysRemaining)} days {daysRemaining >= 0 ? 'left' : 'overdue'}
              </span>
            </div>
          </div>
          
          <div className="relative flex-shrink-0">
            <ProgressRing progress={progressValue} size={100} strokeWidth={8} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-white">
              {progressValue.toFixed(1)}/10
            </span>
          </div>
        </div>
        
        {/* Progress Chart - Always visible */}
        {goal.progress_updates && goal.progress_updates.length > 0 ? (
          <div className="mb-8">
            <ProgressChart 
              progressData={goal.progress_updates} 
              title={`${localGoalData.title} Progress`}
            />
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-lg border border-white/10 bg-white/5 text-center text-gray-400">
            No progress data available yet. Update your progress below.
          </div>
        )}
        
        {/* Button to show/hide progress update section */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowProgressUpdate(!showProgressUpdate)}
            className="rounded-lg px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 transition-colors"
          >
            {showProgressUpdate ? 'Hide Progress' : 'Track Progress'}
          </button>
        </div>
        
        {/* Progress and Effort Input - Hidden by default */}
        {showProgressUpdate && (
          <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-sm font-medium text-white">Update Your Progress</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Progress: {progressValue.toFixed(2)}/10
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
                    step="0.01" 
                    value={progressValue}
                    onChange={(e) => setProgressValue(parseFloat(e.target.value))}
                    className="range-blue w-full"
                  />
                  <button
                    className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
                      progressUpdateStatus === 'updating' 
                        ? 'bg-blue-500 opacity-75 cursor-not-allowed text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    onClick={() => handleProgressUpdate('progress', progressValue)}
                    disabled={progressUpdateStatus === 'updating'}
                  >
                    {progressUpdateStatus === 'updating' ? 'Updating...' : 
                     progressUpdateStatus === 'success' ? 'Updated!' : 'Update'}
                  </button>
                </div>
                <div className="mt-3">
                  <textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="Add notes about your progress..."
                    className="w-full rounded-lg border border-white/10 bg-dark-800/30 p-3 text-sm text-white placeholder:text-gray-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Effort: {effortValue.toFixed(2)}/10
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
                    step="0.01" 
                    value={effortValue}
                    onChange={(e) => setEffortValue(parseFloat(e.target.value))}
                    className="range-green w-full"
                  />
                  <button
                    className={`text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
                      effortUpdateStatus === 'updating' 
                        ? 'bg-green-500 opacity-75 cursor-not-allowed text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    onClick={() => handleProgressUpdate('effort', effortValue)}
                    disabled={effortUpdateStatus === 'updating'}
                  >
                    {effortUpdateStatus === 'updating' ? 'Updating...' : 
                     effortUpdateStatus === 'success' ? 'Updated!' : 'Update'}
                  </button>
                </div>
                <div className="mt-3">
                  <textarea
                    value={effortNotes}
                    onChange={(e) => setEffortNotes(e.target.value)}
                    placeholder="Add notes about your effort level..."
                    className="w-full rounded-lg border border-white/10 bg-dark-800/30 p-3 text-sm text-white placeholder:text-gray-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content - Two column layout for reflections and milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column: Reflections */}
          <div>
            <h3 className="text-base font-medium text-white mb-4">Reflections</h3>
            
            <div className="space-y-4">
              {getSortedReflections().map(([type, reflection]) => (
                <ReflectionCard
                  key={type}
                  type={type}
                  content={reflection.content}
                  goalId={goal.id}
                  onSave={handleReflectionSave}
                />
              ))}
              
              {/* Add reflection button if not all reflection types exist */}
              {goal.reflections && 
               Object.keys(goal.reflections).length < Object.keys(reflectionTypes).length && (
                <div className="mt-4">
                  <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 text-center transition-colors hover:bg-white/10">
                    <span className="text-gray-400">
                      Ask Navi to add more reflections
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Milestones */}
          <div>
            <h3 className="text-base font-medium text-white mb-4">Milestones</h3>
            
            {/* Milestones */}
            <div className="space-y-4">
              {goal.milestones && goal.milestones.length > 0 ? (
                goal.milestones.map(milestone => (
                  <MilestoneCard 
                    key={milestone.id} 
                    milestone={milestone} 
                    formatDate={formatDate}
                    onMilestoneUpdate={handleMilestoneUpdate}
                    goalId={goal.id}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-gray-400">
                    No milestones yet. Ask the AI to add some milestones.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Delete Goal Button */}
        <div className="mt-8 border-t border-white/10 pt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsDeleteModalOpen(true)}
            className="rounded-lg bg-white/5 border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-5 py-2.5 text-sm transition-colors"
          >
            Delete Goal
          </motion.button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Goal"
        confirmText="Delete"
        onConfirm={handleDeleteGoal}
        isDanger
      >
        <p>Are you sure you want to delete the goal?</p>
        {/* <p className="mt-2 text-sm text-gray-400">This action cannot be undone and all associated data will be permanently deleted.</p> */}
      </Modal>
    </div>
  );
};

export default GoalView; 