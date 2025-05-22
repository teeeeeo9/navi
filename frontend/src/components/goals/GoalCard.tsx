import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Goal, Milestone, ProgressUpdate } from '@/services/api'
import ProgressChart from './ProgressChart'
import api from '@/services/api'
import Modal from '@/components/ui/Modal'

// Define an interface for goal updates with simpler reflection format
interface GoalUpdateWithReflections extends Partial<Omit<Goal, 'reflections'>> {
  reflections?: Record<string, string>;
}

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
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface GoalCardProps {
  goal: Goal
  isSelected?: boolean
  onClick?: () => void
  compact?: boolean
  onGoalUpdate?: (updatedGoal: Goal, updateType: string) => void
}

const GoalCard = ({ goal, isSelected = false, onClick, compact = false, onGoalUpdate }: GoalCardProps) => {
  const [showCharts, setShowCharts] = useState(false)
  
  const [progressValue, setProgressValue] = useState<number>(
    Math.round(goal.completion_status / 10)
  )
  const [effortValue, setEffortValue] = useState<number>(5)
  const [progressNotes, setProgressNotes] = useState<string>('')
  const [effortNotes, setEffortNotes] = useState<string>('')
  
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
  
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(goal.title)
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditingStartDate, setIsEditingStartDate] = useState(false)
  const [startDateValue, setStartDateValue] = useState(goal.start_date.split('T')[0])
  const startDateInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditingTargetDate, setIsEditingTargetDate] = useState(false)
  const [targetDateValue, setTargetDateValue] = useState(goal.target_date.split('T')[0])
  const targetDateInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [statusValue, setStatusValue] = useState(goal.status)
  const statusSelectRef = useRef<HTMLSelectElement>(null)
  
  const [editingReflectionId, setEditingReflectionId] = useState<string | null>(null)
  const [reflectionValues, setReflectionValues] = useState<Record<string, string>>({})
  const reflectionInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  
  const [localReflections, setLocalReflections] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (goal.reflections) {
      const values: Record<string, string> = {};
      Object.entries(goal.reflections).forEach(([type, reflection]) => {
        values[type] = reflection.content;
      });
      setLocalReflections(values);
    }
  }, [goal.reflections]);

  const [daysRemaining, setDaysRemaining] = useState(calculateDaysRemaining(goal.target_date))
  const [isOverdue, setIsOverdue] = useState(calculateDaysRemaining(goal.target_date) < 0 && goal.status === 'active')

  useEffect(() => {
    const days = calculateDaysRemaining(goal.target_date)
    setDaysRemaining(days)
    setIsOverdue(days < 0 && goal.status === 'active')
  }, [goal.target_date, goal.status])

  function calculateDaysRemaining(targetDateStr: string) {
    const targetDate = new Date(targetDateStr)
    const today = new Date()
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  }

  useEffect(() => {
    if (goal.reflections) {
      const values: Record<string, string> = {}
      Object.entries(goal.reflections).forEach(([type, reflection]) => {
        values[type] = reflection.content
      })
      setReflectionValues(values)
    }
  }, [goal.reflections])
  
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
    if (isEditingStartDate && startDateInputRef.current) {
      startDateInputRef.current.focus()
    }
    if (isEditingTargetDate && targetDateInputRef.current) {
      targetDateInputRef.current.focus()
    }
    if (isEditingStatus && statusSelectRef.current) {
      statusSelectRef.current.focus()
    }
    if (editingReflectionId && reflectionInputRefs.current[editingReflectionId]) {
      reflectionInputRefs.current[editingReflectionId]?.focus()
      reflectionInputRefs.current[editingReflectionId]?.select()
    }
  }, [isEditingTitle, isEditingStartDate, isEditingTargetDate, isEditingStatus, editingReflectionId])
  
  console.log(`GoalCard for goal "${goal.title}":`, {
    hasProgressUpdates: !!goal.progress_updates,
    progressUpdatesCount: goal.progress_updates?.length || 0,
    progressUpdates: goal.progress_updates
  })
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
    })
  }

  // Get status color
  /* const getStatusColor = () => {
    switch(localGoalData.status) {
      case 'completed': return 'bg-green-500/20 text-green-300'
      default: 
        return isOverdue 
          ? 'bg-amber-500/20 text-amber-300'
          : 'bg-blue-500/20 text-blue-300'
    }
  } */

  // Function to handle submitting progress updates
  const handleProgressUpdate = async (type: 'progress' | 'effort', value: number) => {
    console.log(`Submitting ${type} update with value: ${value}/10`);
    
    // Convert from 0-10 scale to 0-100 for backend
    const scaledValue = value * 10;
    
    // Use appropriate notes based on the update type
    const notes = type === 'progress' ? progressNotes : effortNotes;
    
    // Create an optimistic update to show immediately
    const tempUpdate: ProgressUpdate = {
      id: -1, // Temporary ID that will be replaced when the server responds
      goal_id: goal.id,
      progress_value: scaledValue,
      type: type,
      created_at: new Date().toISOString()
    };
    
    // Add type-specific notes
    if (type === 'progress') {
      tempUpdate.progress_notes = notes;
      
      // Update local goal data if progress state was updated
      setLocalGoalData(prev => ({
        ...prev,
        status: scaledValue === 100 && prev.status === 'active' ? 'completed' : prev.status
      }));
      
      // Immediately update local progress value
      setProgressValue(value);
    } else {
      tempUpdate.effort_notes = notes;
      
      // Immediately update local effort value
      setEffortValue(value);
    }
    
    // Immediately add the update to the UI
    if (goal.progress_updates) {
      // Create a new array with the optimistic update at the beginning
      const updatedProgressUpdates = [tempUpdate, ...goal.progress_updates];
      
      // Update the goal with the new progress updates
      const updatedGoal = {
        ...goal,
        progress_updates: updatedProgressUpdates,
        completion_status: type === 'progress' ? scaledValue : goal.completion_status
      };
      
      // Call the update handler to refresh the UI immediately
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal, type);
      }
    }
    
    try {
      // Use appropriate API function based on type
      let update: ProgressUpdate;
      if (type === 'progress') {
        console.log(`Creating progress update: ${scaledValue}/100, notes: "${notes}"`);
        update = await api.createProgressUpdate(goal.id, scaledValue, notes);
        console.log('Progress update created:', update);
      } else if (type === 'effort') {
        console.log(`Creating effort update: ${scaledValue}/100, notes: "${notes}"`);
        update = await api.createEffortUpdate(goal.id, scaledValue, notes);
        console.log('Effort update created:', update);
      } else {
        console.error('Unknown update type:', type);
        return;
      }
      
      // Verify the update has the correct type
      if (update.type !== type) {
        console.error(`Error: Update type mismatch. Expected "${type}", got "${update.type}"`);
      }
      
      // Refresh the goal to get updated progress data
      if (onGoalUpdate) {
        console.log('Refreshing goal data');
        const updatedGoal = await api.getGoalDetails(goal.id);
        
        // Check for progress updates in the refreshed goal
        if (updatedGoal.progress_updates && updatedGoal.progress_updates.length > 0) {
          const lastUpdate = updatedGoal.progress_updates[updatedGoal.progress_updates.length - 1];
          console.log('Latest update in goal:', lastUpdate);
          
          // Log types of all updates
          const progressTypes = updatedGoal.progress_updates.map(u => u.type || 'unknown');
          console.log('All update types:', progressTypes);
          
          // Count by type
          const progressCount = updatedGoal.progress_updates.filter(u => !u.type || u.type === 'progress').length;
          const effortCount = updatedGoal.progress_updates.filter(u => u.type === 'effort').length;
          console.log(`Update counts: ${progressCount} progress, ${effortCount} effort`);
        }
        
        onGoalUpdate(updatedGoal, type);
      }
      
      // Clear the appropriate notes field based on the update type
      if (type === 'progress') {
        setProgressNotes('');
      } else {
        setEffortNotes('');
      }
      
    } catch (error) {
      console.error(`Failed to update ${type}:`, error);
      // In case of error, refresh the goal to ensure UI is in sync with server
      if (onGoalUpdate) {
        const updatedGoal = await api.getGoalDetails(goal.id);
        onGoalUpdate(updatedGoal, type);
      }
    }
  }

  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTitleValue(localGoalData.title)
    setIsEditingTitle(true)
  }

  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === localGoalData.title) {
      setIsEditingTitle(false)
      return
    }

    const newTitle = titleValue.trim()
    setLocalGoalData(prev => ({ ...prev, title: newTitle }))
    setIsEditingTitle(false)

    try {
      const updatedGoal = await api.updateGoal(goal.id, { title: newTitle })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal, 'title_update')
      }
    } catch (error) {
      console.error('Failed to update goal title:', error)
      setLocalGoalData(prev => ({ ...prev, title: goal.title }))
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false)
    }
  }

  const handleStartDateDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setStartDateValue(localGoalData.startDate.split('T')[0])
    setIsEditingStartDate(true)
  }

  const handleStartDateSave = async () => {
    if (!startDateValue || startDateValue === localGoalData.startDate.split('T')[0]) {
      setIsEditingStartDate(false)
      return
    }

    const newStartDate = startDateValue
    const formattedDate = `${newStartDate}T00:00:00`
    setLocalGoalData(prev => ({ ...prev, startDate: formattedDate }))
    setIsEditingStartDate(false)
    
    setDaysRemaining(calculateDaysRemaining(localGoalData.targetDate))

    try {
      const updatedGoal = await api.updateGoal(goal.id, { start_date: formattedDate })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal, 'start_date_update')
      }
    } catch (error) {
      console.error('Failed to update goal start date:', error)
      setLocalGoalData(prev => ({ ...prev, startDate: goal.start_date }))
    }
  }

  const handleTargetDateDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTargetDateValue(localGoalData.targetDate.split('T')[0])
    setIsEditingTargetDate(true)
  }

  const handleTargetDateSave = async () => {
    if (!targetDateValue || targetDateValue === localGoalData.targetDate.split('T')[0]) {
      setIsEditingTargetDate(false)
      return
    }

    const newTargetDate = targetDateValue
    const formattedDate = `${newTargetDate}T00:00:00`
    setLocalGoalData(prev => ({ ...prev, targetDate: formattedDate }))
    setIsEditingTargetDate(false)
    
    const days = calculateDaysRemaining(formattedDate)
    setDaysRemaining(days)
    setIsOverdue(days < 0 && localGoalData.status === 'active')

    try {
      const updatedGoal = await api.updateGoal(goal.id, { target_date: formattedDate })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal, 'target_date_update')
      }
    } catch (error) {
      console.error('Failed to update goal target date:', error)
      setLocalGoalData(prev => ({ ...prev, targetDate: goal.target_date }))
      
      setDaysRemaining(calculateDaysRemaining(goal.target_date))
      setIsOverdue(daysRemaining < 0 && localGoalData.status === 'active')
    }
  }

  /* Unused status functions
  const handleStatusDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setStatusValue(localGoalData.status)
    setIsEditingStatus(true)
  }

  const handleStatusSave = async () => {
    if (statusValue === localGoalData.status) {
      setIsEditingStatus(false)
      return
    }

    const newStatus = statusValue
    setLocalGoalData(prev => ({ ...prev, status: newStatus }))
    setIsEditingStatus(false)
    
    setIsOverdue(daysRemaining < 0 && newStatus === 'active')

    try {
      const updatedGoal = await api.updateGoal(goal.id, { status: newStatus })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal, 'status_update')
      }
    } catch (error) {
      console.error('Failed to update goal status:', error)
      setLocalGoalData(prev => ({ ...prev, status: goal.status }))
      
      setIsOverdue(daysRemaining < 0 && goal.status === 'active')
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusValue(e.target.value as 'active' | 'completed')
  }
  */

  const handleReflectionDoubleClick = (type: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingReflectionId(type)
    setReflectionValues(prev => ({
      ...prev,
      [type]: localReflections[type] || (goal.reflections?.[type]?.content || '')
    }))
  }

  const handleReflectionChange = (type: string, value: string) => {
    setReflectionValues(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const handleReflectionSave = async (type: string) => {
    if (!goal.reflections || !goal.reflections[type]) {
      setEditingReflectionId(null)
      return
    }

    const originalContent = goal.reflections[type].content;
    if (reflectionValues[type] === originalContent) {
      setEditingReflectionId(null)
      return
    }

    const newContent = reflectionValues[type]
    setLocalReflections(prev => ({
      ...prev,
      [type]: newContent
    }))
    setEditingReflectionId(null)

    try {
      const updateData: GoalUpdateWithReflections = {
        reflections: {
          [type]: newContent
        }
      }

      const updatedGoal = await api.updateGoal(goal.id, updateData as any)
      
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal, 'reflection_update')
      }
    } catch (error) {
      console.error('Failed to update reflection:', error)
      setLocalReflections(prev => ({
        ...prev,
        [type]: originalContent
      }))
    }
  }

  const handleReflectionKeyDown = (type: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleReflectionSave(type)
    } else if (e.key === 'Escape') {
      setEditingReflectionId(null)
    }
  }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Handle goal deletion
  const handleDeleteGoal = async () => {
    try {
      await api.deleteGoal(goal.id)
      // Close the modal
      setIsDeleteModalOpen(false)
      // Notify parent component
      if (onGoalUpdate) {
        // Use a special update type for deletion
        onGoalUpdate({ ...goal, id: -1 }, 'goal_delete')
      }
    } catch (error) {
      console.error('Failed to delete goal:', error)
      setIsDeleteModalOpen(false)
    }
  }

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`glass relative cursor-pointer overflow-hidden rounded-xl p-0.5 transition-all h-full ${
          isSelected ? 'ring-2 ring-primary-400/70' : ''
        }`}
      >
        <div className="relative rounded-xl p-3 h-full flex flex-col">
          {/* Status badge removed */}
          
          <div className="absolute -right-4 -top-4">
            <ProgressRing progress={progressValue} size={50} strokeWidth={4} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
              {progressValue}/10
            </span>
          </div>
          
          <div className="pr-10 flex-grow">
            <h3 
              className="mb-1 text-lg font-bold text-white line-clamp-2"
              onDoubleClick={handleTitleDoubleClick}
            >
              {localGoalData.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-dark-100">
              <span>
                Target: {formatDate(localGoalData.targetDate)}
              </span>
              <span>•</span>
              <span className={isOverdue ? 'text-amber-400' : ''}>
                {Math.abs(daysRemaining)} days {daysRemaining >= 0 ? 'left' : 'overdue'}
              </span>
            </div>
            
            {goal.milestones && goal.milestones.length > 0 && (
              <div className="mt-1 text-xs text-dark-200">
                {goal.milestones.length} milestone{goal.milestones.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="w-full bg-dark-700/30 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-primary-400 h-full" 
                style={{ width: `${goal.completion_status}%` }}
              ></div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <div className="glass rounded-2xl p-0.5 mb-8">
        <div className="rounded-2xl p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className="mb-1 w-full bg-transparent text-2xl font-bold text-white outline-none focus:border-b focus:border-primary-400/50"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h2 
                  className="mb-1 text-2xl font-bold text-white"
                  onDoubleClick={handleTitleDoubleClick}
                >
                  {localGoalData.title}
                </h2>
              )}
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-dark-100">
                {/* Status selector removed */}
                
                <span>
                  Start: {
                    isEditingStartDate ? (
                      <input
                        ref={startDateInputRef}
                        type="date"
                        value={startDateValue}
                        onChange={(e) => setStartDateValue(e.target.value)}
                        onBlur={handleStartDateSave}
                        className="bg-transparent text-sm text-dark-100 outline-none focus:border-b focus:border-primary-400/50"
                      />
                    ) : (
                      <span onDoubleClick={handleStartDateDoubleClick}>
                        {formatDate(localGoalData.startDate)}
                      </span>
                    )
                  }
                </span>
                
                <span>
                  Target: {
                    isEditingTargetDate ? (
                      <input
                        ref={targetDateInputRef}
                        type="date"
                        value={targetDateValue}
                        onChange={(e) => setTargetDateValue(e.target.value)}
                        onBlur={handleTargetDateSave}
                        className="bg-transparent text-sm text-dark-100 outline-none focus:border-b focus:border-primary-400/50"
                      />
                    ) : (
                      <span onDoubleClick={handleTargetDateDoubleClick}>
                        {formatDate(localGoalData.targetDate)}
                      </span>
                    )
                  }
                </span>
                
                <span className={isOverdue ? 'text-amber-400' : ''}>
                  {Math.abs(daysRemaining)} days {daysRemaining >= 0 ? 'left' : 'overdue'}
                </span>
              </div>
            </div>
            
            <div className="relative flex-shrink-0">
              <ProgressRing progress={progressValue} size={90} strokeWidth={6} />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold">
                {progressValue}/10
              </span>
            </div>
          </div>
          
          <div className="mb-4 flex justify-end">
            <motion.button
              onClick={() => setShowCharts(!showCharts)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-dark-600/70 px-4 py-1.5 text-sm text-dark-100 hover:bg-dark-500/70 hover:text-white transition-colors"
            >
              {showCharts ? 'Hide Progress' : 'Show Progress'}
            </motion.button>
          </div>

          {showCharts && (
            <div className="mb-6 rounded-xl bg-dark-700/30 p-5 border border-dark-600/30">
              <h3 className="mb-4 text-lg font-medium text-white">Track Your Progress</h3>
              
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-dark-100">
                    Progress State: {progressValue}/10
                  </label>
                  <span className="text-xs text-dark-300">
                    How far you are from completing this goal
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="1" 
                    value={progressValue}
                    onChange={(e) => setProgressValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-md text-sm"
                    onClick={() => handleProgressUpdate('progress', progressValue)}
                  >
                    Update
                  </motion.button>
                </div>
                <div className="mt-2">
                  <label className="text-sm font-medium text-dark-100 block mb-2">Progress Notes:</label>
                  <textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="Add notes about your progress..."
                    className="w-full rounded-lg bg-dark-800/60 border border-dark-600/50 p-3 text-sm text-white placeholder:text-dark-300 resize-none"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-dark-100">
                    Effort Level: {effortValue}/10
                  </label>
                  <span className="text-xs text-dark-300">
                    How much effort you're currently investing
                  </span>
                </div>
                <div className="flex gap-4 items-center">
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
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                    onClick={() => handleProgressUpdate('effort', effortValue)}
                  >
                    Update
                  </motion.button>
                </div>
                <div className="mt-2">
                  <label className="text-sm font-medium text-dark-100 block mb-2">Effort Notes:</label>
                  <textarea
                    value={effortNotes}
                    onChange={(e) => setEffortNotes(e.target.value)}
                    placeholder="Add notes about your effort level..."
                    className="w-full rounded-lg bg-dark-800/60 border border-dark-600/50 p-3 text-sm text-white placeholder:text-dark-300 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
          
          {showCharts && goal.progress_updates && goal.progress_updates.length > 0 && (
            <ProgressChart 
              progressData={goal.progress_updates} 
              title="Goal Progress & Effort"
            />
          )}
          
          {goal.reflections && Object.keys(goal.reflections).length > 0 && (
            <div className="mb-6 mt-6">
              <h3 className="mb-3 text-lg font-medium text-white">Reflections</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(goal.reflections).map(([type, reflection]) => {
                  const isEditing = editingReflectionId === type;
                  const content = isEditing ? reflectionValues[type] : localReflections[type] || reflection.content;
                  
                  if (!content && !isEditing) return null;
                  
                  const getReflectionTitle = (type: string) => {
                    const titles: Record<string, string> = {
                      'importance': 'Why This Matters',
                      'obstacles': 'Potential Obstacles',
                      'environment': 'Environmental Setup',
                      'timeline': 'Timeline Considerations',
                      'backups': 'Backup Plans',
                      'review_positive': 'What Went Well',
                      'review_improve': 'Areas to Improve'
                    };
                    return titles[type] || type.replace('_', ' ');
                  };
                  
                  return (
                    <div key={type} className="rounded-lg bg-dark-700/30 p-4 border border-dark-600/30">
                      <h4 className="mb-2 text-sm font-medium text-dark-100">
                        {getReflectionTitle(type)}
                      </h4>
                      {isEditing ? (
                        <input
                          ref={(el) => reflectionInputRefs.current[type] = el}
                          type="text"
                          value={reflectionValues[type] || ''}
                          onChange={(e) => handleReflectionChange(type, e.target.value)}
                          onBlur={() => handleReflectionSave(type)}
                          onKeyDown={(e) => handleReflectionKeyDown(type, e)}
                          className="w-full bg-transparent text-white outline-none focus:border-b focus:border-primary-400/50"
                        />
                      ) : (
                        <p 
                          className="text-sm text-dark-200"
                          onDoubleClick={(e) => handleReflectionDoubleClick(type, e)}
                        >
                          {content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {goal.milestones && goal.milestones.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-medium text-white">Milestones</h3>
              <div className="space-y-4">
                {goal.milestones.map(milestone => (
                  <MilestoneCard 
                    key={milestone.id} 
                    milestone={milestone} 
                    formatDate={formatDate}
                    onMilestoneUpdate={() => {
                      if (onGoalUpdate) {
                        refreshGoal(goal.id, onGoalUpdate)
                      }
                    }}
                    goalId={goal.id}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Remove Goal Button */}
          <div className="mt-6 border-t border-dark-600/30 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-4 py-2 text-sm font-medium transition-colors"
            >
              Remove Goal
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Goal"
        confirmText="Remove"
        onConfirm={handleDeleteGoal}
        isDanger
      >
        <p>Are you sure you want to remove the goal "{goal.title}"?</p>
        <p className="mt-2">This action cannot be undone and all associated data will be permanently deleted.</p>
      </Modal>
    </>
  )
}

const refreshGoal = async (goalId: number, onGoalUpdate: (goal: Goal, updateType: string) => void) => {
  try {
    const goal = await api.getGoalDetails(goalId)
    onGoalUpdate(goal, 'refresh')
  } catch (error) {
    console.error('Failed to refresh goal:', error)
  }
}

const refreshMilestoneProgress = async (goalId: number, milestoneId: number): Promise<ProgressUpdate[]> => {
  try {
    const updates = await api.getMilestoneProgressUpdates(goalId, milestoneId)
    return updates
  } catch (error) {
    console.error('Failed to refresh milestone progress:', error)
    return []
  }
}

interface MilestoneCardProps {
  milestone: Milestone;
  formatDate: (date: string) => string;
  onMilestoneUpdate?: (updatedGoal: Goal, updateType: string) => void;
  goalId: number;
}

const MilestoneCard = ({ milestone, formatDate, onMilestoneUpdate, goalId }: MilestoneCardProps) => {
  const [localMilestone, setLocalMilestone] = useState({
    title: milestone.title,
    targetDate: milestone.target_date,
    status: milestone.status
  });
  
  // Independent state for showing/hiding progress for this milestone
  const [showMilestoneProgress, setShowMilestoneProgress] = useState(false);
  
  // States for tracking progress
  const [progressValue, setProgressValue] = useState<number>(
    Math.round(milestone.completion_status / 10)
  );
  const [effortValue, setEffortValue] = useState<number>(5);
  const [progressNotes, setProgressNotes] = useState<string>('');
  const [effortNotes, setEffortNotes] = useState<string>('');
  
  // State for milestone progress updates
  const [milestoneProgressUpdates, setMilestoneProgressUpdates] = useState<ProgressUpdate[]>(
    milestone.progress_updates || []
  );
  
  // Fetch milestone progress updates when the milestone is shown
  useEffect(() => {
    if (showMilestoneProgress && (!milestone.progress_updates || milestone.progress_updates.length === 0)) {
      const fetchMilestoneProgress = async () => {
        try {
          const updates = await api.getMilestoneProgressUpdates(goalId, milestone.id);
          setMilestoneProgressUpdates(updates);
        } catch (error) {
          console.error(`Failed to fetch milestone progress updates:`, error);
        }
      };
      
      fetchMilestoneProgress();
    }
  }, [showMilestoneProgress, milestone.id, goalId, milestone.progress_updates]);
  
  useEffect(() => {
    setLocalMilestone({
      title: milestone.title,
      targetDate: milestone.target_date,
      status: milestone.status
    });
    
    setProgressValue(Math.round(milestone.completion_status / 10));
    
    // Update progress updates if available
    if (milestone.progress_updates && milestone.progress_updates.length > 0) {
      setMilestoneProgressUpdates(milestone.progress_updates);
    }
  }, [milestone]);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(milestone.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingTargetDate, setIsEditingTargetDate] = useState(false);
  const [targetDateValue, setTargetDateValue] = useState(milestone.target_date.split('T')[0]);
  const targetDateInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusValue, setStatusValue] = useState(milestone.status);
  const statusSelectRef = useRef<HTMLSelectElement>(null);
  
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
    if (isEditingTargetDate && targetDateInputRef.current) {
      targetDateInputRef.current.focus();
    }
    if (isEditingStatus && statusSelectRef.current) {
      statusSelectRef.current.focus();
    }
  }, [isEditingTitle, isEditingTargetDate, isEditingStatus]);
  
  // Function to handle submitting progress updates for milestones
  const handleMilestoneProgressUpdate = async (type: 'progress' | 'effort', value: number) => {
    console.log(`Submitting ${type} update for milestone with value: ${value}/10`);
    
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
    setMilestoneProgressUpdates(prevUpdates => [tempUpdate, ...prevUpdates]);
    
    try {
      // Use the new API method to create a progress update for the milestone
      const update = await api.createMilestoneProgressUpdate(
        goalId,
        milestone.id,
        scaledValue,
        type,
        notes
      );
      
      console.log(`Milestone ${type} update successful:`, update);
      
      // Refresh milestone progress data to ensure we have the latest updates
      const refreshedUpdates = await refreshMilestoneProgress(goalId, milestone.id);
      setMilestoneProgressUpdates(refreshedUpdates);
      
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
      
      // Refresh the parent goal to get updated milestone data
      if (onMilestoneUpdate) {
        const updatedGoal = await api.getGoalDetails(goalId);
        onMilestoneUpdate(updatedGoal, `milestone_${type}_update`);
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
      const refreshedUpdates = await refreshMilestoneProgress(goalId, milestone.id);
      setMilestoneProgressUpdates(refreshedUpdates);
    }
  };
  
  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
        // Refresh the entire goal to update all milestone data
        const updatedGoal = await api.getGoalDetails(goalId);
        onMilestoneUpdate(updatedGoal, 'milestone_title_update');
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
  
  const handleTargetDateDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetDateValue(localMilestone.targetDate.split('T')[0]);
    setIsEditingTargetDate(true);
  };
  
  const handleTargetDateSave = async () => {
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
        // Refresh the entire goal to update all milestone data
        const updatedGoal = await api.getGoalDetails(goalId);
        onMilestoneUpdate(updatedGoal, 'milestone_target_date_update');
      }
    } catch (error) {
      console.error('Failed to update milestone target date:', error);
      setLocalMilestone(prev => ({ ...prev, targetDate: milestone.target_date }));
    }
  };
  
  const handleTargetDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTargetDateSave();
    } else if (e.key === 'Escape') {
      setIsEditingTargetDate(false);
    }
  };
  
  /* Unused status functions
  const handleStatusDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusValue(localMilestone.status);
    setIsEditingStatus(true);
  };
  
  const handleStatusSave = async () => {
    if (statusValue === localMilestone.status) {
      setIsEditingStatus(false);
      return;
    }
    
    const newStatus = statusValue;
    setLocalMilestone(prev => ({ ...prev, status: newStatus }));
    setIsEditingStatus(false);
    
    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, {
        status: newStatus
      });
      
      if (onMilestoneUpdate) {
        // Refresh the entire goal to update all milestone data
        const updatedGoal = await api.getGoalDetails(goalId);
        onMilestoneUpdate(updatedGoal, 'milestone_status_update');
      }
    } catch (error) {
      console.error('Failed to update milestone status:', error);
      setLocalMilestone(prev => ({ ...prev, status: milestone.status }));
    }
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusValue(e.target.value as 'active' | 'completed');
  };
  */

  // Convert from 0-100 to 0-10 scale for display
  const progressValue10 = Math.round(milestone.completion_status / 10);
  
  return (
    <div className="glass rounded-lg p-0.5">
      <div className="rounded-lg p-4 bg-dark-700/40 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="mb-2 w-full bg-transparent text-base font-medium text-white outline-none focus:border-b focus:border-primary-400/50"
              />
            ) : (
              <h4 
                className="mb-2 text-base font-medium text-white"
                onDoubleClick={handleTitleDoubleClick}
              >
                {localMilestone.title}
              </h4>
            )}
            
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-dark-100">
              {/* Status selector removed */}
              
              <span>
                Target: {
                  isEditingTargetDate ? (
                    <input
                      ref={targetDateInputRef}
                      type="date"
                      value={targetDateValue}
                      onChange={(e) => setTargetDateValue(e.target.value)}
                      onBlur={handleTargetDateSave}
                      onKeyDown={handleTargetDateKeyDown}
                      className="bg-transparent text-xs text-dark-100 outline-none focus:border-b focus:border-primary-400/50"
                    />
                  ) : (
                    <span onDoubleClick={handleTargetDateDoubleClick}>
                      {formatDate(localMilestone.targetDate)}
                    </span>
                  )
                }
              </span>
            </div>
          </div>
          
          <div className="ml-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-dark-700/50">
            <span className="text-sm font-medium">{progressValue10}/10</span>
          </div>
        </div>
        
        <div className="mt-3 flex justify-end">
          <motion.button
            onClick={() => setShowMilestoneProgress(!showMilestoneProgress)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full bg-dark-600/70 px-3 py-1 text-xs text-dark-100 hover:bg-dark-500/70 hover:text-white transition-colors"
          >
            {showMilestoneProgress ? 'Hide Progress' : 'Show Progress'}
          </motion.button>
        </div>
        
        {showMilestoneProgress && (
          <>
            <div className="mt-4 mb-4 rounded-xl bg-dark-700/30 p-4 border border-dark-600/30">
              <h3 className="mb-3 text-sm font-medium text-white">Track Milestone Progress</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-dark-100">
                    Progress State: {progressValue}/10
                  </label>
                  <span className="text-xs text-dark-300">
                    How far you are from completing this milestone
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
                    className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded-md text-xs"
                    onClick={() => handleMilestoneProgressUpdate('progress', progressValue)}
                  >
                    Update
                  </motion.button>
                </div>
                <div className="mt-2">
                  <label className="text-xs font-medium text-dark-100 block mb-1">Progress Notes:</label>
                  <textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="Add notes about your progress..."
                    className="w-full rounded-lg bg-dark-800/60 border border-dark-600/50 p-2 text-xs text-white placeholder:text-dark-300 resize-none"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-dark-100">
                    Effort Level: {effortValue}/10
                  </label>
                  <span className="text-xs text-dark-300">
                    How much effort you're currently investing
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
                    onClick={() => handleMilestoneProgressUpdate('effort', effortValue)}
                  >
                    Update
                  </motion.button>
                </div>
                <div className="mt-2">
                  <label className="text-xs font-medium text-dark-100 block mb-1">Effort Notes:</label>
                  <textarea
                    value={effortNotes}
                    onChange={(e) => setEffortNotes(e.target.value)}
                    placeholder="Add notes about your effort level..."
                    className="w-full rounded-lg bg-dark-800/60 border border-dark-600/50 p-2 text-xs text-white placeholder:text-dark-300 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            {milestoneProgressUpdates.length > 0 && (
              <div className="mt-3 rounded-lg bg-dark-700/30 p-3 border border-dark-600/30">
                <h4 className="mb-2 text-xs font-medium text-dark-100">Milestone Progress Chart</h4>
                <ProgressChart 
                  progressData={milestoneProgressUpdates} 
                  title={`${localMilestone.title}`}
                  height={180}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GoalCard 