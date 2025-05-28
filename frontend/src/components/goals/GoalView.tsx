import React, { useState, useRef, useEffect } from 'react';
import { Goal } from '@/services/api';
import api from '@/services/api';
import ProgressChart from './ProgressChart';
import MilestoneCard from './MilestoneCard';
import ReflectionCard, { reflectionTypes } from './ReflectionCard';
import colorScheme from '@/styles/colorScheme';

// Progress Ring Component
const ProgressRing = ({ progress, size = 80, strokeWidth = 6 }: { progress: number, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - ((progress / 10) * circumference)

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
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
      {/* Progress gradient */}
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colorScheme.blue[500]} />
          <stop offset="100%" stopColor={colorScheme.purple[500]} />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface GoalViewProps {
  goal: Goal;
  onGoalUpdate: (updatedGoal: Goal, updateType: string) => void;
}

const GoalView: React.FC<GoalViewProps> = ({ goal, onGoalUpdate }) => {
  const [progressValue, setProgressValue] = useState<number>(
    Math.round(goal.completion_status / 10)
  );
  const [effortValue, setEffortValue] = useState<number>(5);
  const [progressNotes, setProgressNotes] = useState<string>('');
  const [effortNotes, setEffortNotes] = useState<string>('');
  
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
    
    setProgressValue(Math.round(goal.completion_status / 10));
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
    
    // Use appropriate notes based on the update type
    const notes = type === 'progress' ? progressNotes : effortNotes;
    
    // Create an optimistic update
    const updatedGoal = {
      ...goal,
      completion_status: type === 'progress' ? scaledValue : goal.completion_status
    };
    
    if (type === 'progress') {
      // Update local goal data if progress state was updated
      setLocalGoalData(prev => ({
        ...prev,
        status: scaledValue === 100 && prev.status === 'active' ? 'completed' : prev.status
      }));
      
      // Immediately update local progress value
      setProgressValue(value);
    } else {
      // Immediately update local effort value
      setEffortValue(value);
    }
    
    // Call the update handler to refresh the UI immediately
    onGoalUpdate(updatedGoal, type);
    
    try {
      // Use appropriate API function based on type
      if (type === 'progress') {
        await api.createProgressUpdate(goal.id, scaledValue, notes);
      } else if (type === 'effort') {
        await api.createEffortUpdate(goal.id, scaledValue, notes);
      }
      
      // Clear the appropriate notes field based on the update type
      if (type === 'progress') {
        setProgressNotes('');
      } else {
        setEffortNotes('');
      }
      
    } catch (error) {
      console.error(`Failed to update ${type}:`, error);
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

  const handleMilestoneUpdate = async (milestoneId: number) => {
    try {
      const updatedGoal = await api.getGoalDetails(goal.id);
      onGoalUpdate(updatedGoal, 'milestone_update');
    } catch (error) {
      console.error('Failed to refresh goal:', error);
    }
  };

  const handleDeleteGoal = async () => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deleteGoal(goal.id);
      // Use a special update type for deletion
      onGoalUpdate({ ...goal, id: -1 }, 'goal_delete');
    } catch (error) {
      console.error('Failed to delete goal:', error);
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
                  className="w-full bg-dark-800/50 text-white rounded-lg border border-blue-400/30 px-4 py-2 text-2xl font-bold outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center mb-4">
                <h2 
                  className="text-2xl font-bold text-white cursor-pointer"
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
              
              <span className={`rounded-lg px-3 py-1.5 ${isOverdue ? 'bg-orange-500/10 text-orange-300' : 'bg-blue-500/10 text-blue-300'}`}>
                {Math.abs(daysRemaining)} days {daysRemaining >= 0 ? 'left' : 'overdue'}
              </span>
              
              {localGoalData.status === 'completed' && (
                <span className="rounded-lg bg-green-500/10 px-3 py-1.5 text-green-300">
                  Completed
                </span>
              )}
            </div>
          </div>
          
          <div className="relative flex-shrink-0">
            <ProgressRing progress={progressValue} size={100} strokeWidth={8} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-white">
              {progressValue}/10
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
        
        {/* Progress and Effort Input */}
        <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-base font-medium text-white">Update Your Progress</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
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
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs transition-colors"
                  onClick={() => handleProgressUpdate('progress', progressValue)}
                >
                  Update
                </button>
              </div>
              <div className="mt-3">
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Add notes about your progress..."
                  className="w-full rounded-lg border border-white/10 bg-dark-800/50 p-3 text-sm text-white placeholder:text-gray-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
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
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-md text-xs transition-colors"
                  onClick={() => handleProgressUpdate('effort', effortValue)}
                >
                  Update
                </button>
              </div>
              <div className="mt-3">
                <textarea
                  value={effortNotes}
                  onChange={(e) => setEffortNotes(e.target.value)}
                  placeholder="Add notes about your effort level..."
                  className="w-full rounded-lg border border-white/10 bg-dark-800/50 p-3 text-sm text-white placeholder:text-gray-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content - Two column layout for reflections and milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column: Reflections */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Reflections</h3>
            
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-450px)] pr-2">
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
                      Ask your AI assistant to add more reflections...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Milestones */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Milestones</h3>
            
            {/* Milestones */}
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-450px)] pr-2">
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
          <button
            onClick={handleDeleteGoal}
            className="rounded-lg bg-white/5 border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 px-5 py-2.5 text-sm transition-colors"
          >
            Delete Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalView; 