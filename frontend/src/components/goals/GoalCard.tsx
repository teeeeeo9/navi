import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Goal, Milestone, Reflection } from '@/services/api'
import ProgressChart from './ProgressChart'
import api from '@/services/api'

// Define an interface for goal updates with simpler reflection format
interface GoalUpdateWithReflections extends Partial<Omit<Goal, 'reflections'>> {
  reflections?: Record<string, string>;
}

// Progress Ring Component
const ProgressRing = ({ progress, size = 80, strokeWidth = 6 }: { progress: number, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

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
  onGoalUpdate?: (updatedGoal: Goal) => void
}

const GoalCard = ({ goal, isSelected = false, onClick, compact = false, onGoalUpdate }: GoalCardProps) => {
  const [showCharts, setShowCharts] = useState(true) // Set default to true for testing
  
  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(goal.title)
  const titleInputRef = useRef<HTMLInputElement>(null)
  
  // Description editing state
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [descriptionValue, setDescriptionValue] = useState(goal.description || '')
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null)
  
  // Start date editing state
  const [isEditingStartDate, setIsEditingStartDate] = useState(false)
  const [startDateValue, setStartDateValue] = useState(goal.start_date.split('T')[0])
  const startDateInputRef = useRef<HTMLInputElement>(null)
  
  // Target date editing state
  const [isEditingTargetDate, setIsEditingTargetDate] = useState(false)
  const [targetDateValue, setTargetDateValue] = useState(goal.target_date.split('T')[0])
  const targetDateInputRef = useRef<HTMLInputElement>(null)
  
  // Status editing state
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [statusValue, setStatusValue] = useState(goal.status)
  const statusSelectRef = useRef<HTMLSelectElement>(null)
  
  // Reflection editing state
  const [editingReflectionId, setEditingReflectionId] = useState<string | null>(null)
  const [reflectionValues, setReflectionValues] = useState<Record<string, string>>({})
  const reflectionInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Calculate days remaining - as a reactive value
  const [daysRemaining, setDaysRemaining] = useState(calculateDaysRemaining(goal.target_date))
  const [isOverdue, setIsOverdue] = useState(calculateDaysRemaining(goal.target_date) < 0 && goal.status === 'active')

  // Recalculate days remaining whenever target date changes
  useEffect(() => {
    const days = calculateDaysRemaining(goal.target_date)
    setDaysRemaining(days)
    setIsOverdue(days < 0 && goal.status === 'active')
  }, [goal.target_date, goal.status])

  // Function to calculate days remaining
  function calculateDaysRemaining(targetDateStr: string) {
    const targetDate = new Date(targetDateStr)
    const today = new Date()
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  }

  // Initialize reflection values
  useEffect(() => {
    if (goal.reflections) {
      const values: Record<string, string> = {}
      Object.entries(goal.reflections).forEach(([type, reflection]) => {
        values[type] = reflection.content
      })
      setReflectionValues(values)
    }
  }, [goal.reflections])
  
  // Set input focus when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus()
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
  }, [isEditingTitle, isEditingDescription, isEditingStartDate, isEditingTargetDate, isEditingStatus, editingReflectionId])
  
  // Debug log to check progress data
  console.log(`GoalCard for goal "${goal.title}":`, {
    hasProgressUpdates: !!goal.progress_updates,
    progressUpdatesCount: goal.progress_updates?.length || 0,
    progressUpdates: goal.progress_updates
  })
  
  // Format dates
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
  const getStatusColor = () => {
    switch(statusValue) {
      case 'completed': return 'bg-green-500/20 text-green-300'
      case 'abandoned': return 'bg-red-500/20 text-red-300'
      default: 
        return isOverdue 
          ? 'bg-amber-500/20 text-amber-300'
          : 'bg-blue-500/20 text-blue-300'
    }
  }

  // Title editing handlers
  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingTitle(true)
  }

  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === goal.title) {
      setTitleValue(goal.title)
      setIsEditingTitle(false)
      return
    }

    try {
      const updatedGoal = await api.updateGoal(goal.id, { title: titleValue })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Failed to update goal title:', error)
      setTitleValue(goal.title)
      setIsEditingTitle(false)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setTitleValue(goal.title)
      setIsEditingTitle(false)
    }
  }

  // Description editing handlers
  const handleDescriptionDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingDescription(true)
  }

  const handleDescriptionSave = async () => {
    if (descriptionValue === goal.description) {
      setIsEditingDescription(false)
      return
    }

    try {
      const updatedGoal = await api.updateGoal(goal.id, { description: descriptionValue })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
      setIsEditingDescription(false)
    } catch (error) {
      console.error('Failed to update goal description:', error)
      setDescriptionValue(goal.description || '')
      setIsEditingDescription(false)
    }
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave()
    } else if (e.key === 'Escape') {
      setDescriptionValue(goal.description || '')
      setIsEditingDescription(false)
    }
  }

  // Start date editing handlers
  const handleStartDateDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingStartDate(true)
  }

  const handleStartDateSave = async () => {
    if (!startDateValue || startDateValue === goal.start_date.split('T')[0]) {
      setStartDateValue(goal.start_date.split('T')[0])
      setIsEditingStartDate(false)
      return
    }

    try {
      const updatedGoal = await api.updateGoal(goal.id, { start_date: `${startDateValue}T00:00:00` })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
      
      // Update days remaining immediately
      setDaysRemaining(calculateDaysRemaining(goal.target_date))
      setIsEditingStartDate(false)
    } catch (error) {
      console.error('Failed to update goal start date:', error)
      setStartDateValue(goal.start_date.split('T')[0])
      setIsEditingStartDate(false)
    }
  }

  // Target date editing handlers
  const handleTargetDateDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingTargetDate(true)
  }

  const handleTargetDateSave = async () => {
    if (!targetDateValue || targetDateValue === goal.target_date.split('T')[0]) {
      setTargetDateValue(goal.target_date.split('T')[0])
      setIsEditingTargetDate(false)
      return
    }

    try {
      const updatedGoal = await api.updateGoal(goal.id, { target_date: `${targetDateValue}T00:00:00` })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
      
      // Update days remaining immediately
      const days = calculateDaysRemaining(`${targetDateValue}T00:00:00`)
      setDaysRemaining(days)
      setIsOverdue(days < 0 && statusValue === 'active')
      
      setIsEditingTargetDate(false)
    } catch (error) {
      console.error('Failed to update goal target date:', error)
      setTargetDateValue(goal.target_date.split('T')[0])
      setIsEditingTargetDate(false)
    }
  }

  // Status editing handlers
  const handleStatusDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingStatus(true)
  }

  const handleStatusSave = async () => {
    if (statusValue === goal.status) {
      setIsEditingStatus(false)
      return
    }

    try {
      const updatedGoal = await api.updateGoal(goal.id, { status: statusValue })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
      
      // Update isOverdue immediately
      setIsOverdue(daysRemaining < 0 && statusValue === 'active')
      
      setIsEditingStatus(false)
    } catch (error) {
      console.error('Failed to update goal status:', error)
      setStatusValue(goal.status)
      setIsEditingStatus(false)
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusValue(e.target.value as 'active' | 'completed' | 'abandoned')
  }

  // Reflection editing handlers
  const handleReflectionDoubleClick = (type: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingReflectionId(type)
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

    if (reflectionValues[type] === goal.reflections[type].content) {
      setEditingReflectionId(null)
      return
    }

    try {
      // Create the update object with the simple reflections format
      const updateData: GoalUpdateWithReflections = {
        reflections: {
          [type]: reflectionValues[type]
        }
      }

      // Type assertion to match the API's expected format
      const updatedGoal = await api.updateGoal(goal.id, updateData as any)
      
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
      setEditingReflectionId(null)
    } catch (error) {
      console.error('Failed to update reflection:', error)
      if (goal.reflections && goal.reflections[type]) {
        setReflectionValues(prev => ({
          ...prev,
          [type]: goal.reflections[type].content
        }))
      }
      setEditingReflectionId(null)
    }
  }

  const handleReflectionKeyDown = (type: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleReflectionSave(type)
    } else if (e.key === 'Escape') {
      if (goal.reflections && goal.reflections[type]) {
        setReflectionValues(prev => ({
          ...prev,
          [type]: goal.reflections[type].content
        }))
      }
      setEditingReflectionId(null)
    }
  }

  if (compact) {
    // Compact view of goal card (for carousel or list)
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`glass relative cursor-pointer overflow-hidden rounded-xl p-0.5 transition-all ${
          isSelected ? 'ring-2 ring-primary-400/70' : ''
        }`}
      >
        <div className="relative rounded-xl p-4">
          {/* Status indicator - only show for completed goals */}
          {goal.status === 'completed' && (
            <span className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs ${getStatusColor()}`}>
              {goal.status}
            </span>
          )}
          
          {/* Progress indicator */}
          <div className="absolute -right-4 -top-4">
            <ProgressRing progress={goal.completion_status} size={60} strokeWidth={4} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
              {goal.completion_status}%
            </span>
          </div>
          
          <div className="pr-12">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="mb-1 w-full bg-transparent text-xl font-bold text-white outline-none focus:border-b focus:border-primary-400/50"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 
                className="mb-1 text-xl font-bold text-white"
                onDoubleClick={handleTitleDoubleClick}
              >
                {goal.title}
              </h3>
            )}
            
            <div className="flex items-center space-x-2 text-xs text-dark-100">
              <span>
                Target: {
                  isEditingTargetDate ? (
                    <input
                      ref={targetDateInputRef}
                      type="date"
                      value={targetDateValue}
                      onChange={(e) => setTargetDateValue(e.target.value)}
                      onBlur={handleTargetDateSave}
                      className="bg-transparent text-xs text-dark-100 outline-none focus:border-b focus:border-primary-400/50"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span onDoubleClick={handleTargetDateDoubleClick}>
                      {formatDate(goal.target_date)}
                    </span>
                  )
                }
              </span>
              <span>•</span>
              <span className={isOverdue ? 'text-amber-400' : ''}>
                {Math.abs(daysRemaining)} days {daysRemaining >= 0 ? 'left' : 'overdue'}
              </span>
            </div>
            
            {/* Show milestone count if available */}
            {goal.milestones && goal.milestones.length > 0 && (
              <div className="mt-2 text-xs text-dark-200">
                {goal.milestones.length} milestone{goal.milestones.length > 1 ? 's' : ''}
              </div>
            )}
            
            {/* Show minimal progress chart if there's progress data */}
            {goal.progress_updates && goal.progress_updates.length > 0 && (
              <ProgressChart 
                progressData={goal.progress_updates} 
                minimal={true}
              />
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Detailed view of goal card (expanded when selected)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass h-full overflow-hidden rounded-2xl p-0.5"
    >
      <div className="relative h-full overflow-y-auto rounded-2xl p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="mb-2 w-full bg-transparent text-2xl font-bold text-white outline-none focus:border-b focus:border-primary-400/50"
              />
            ) : (
              <h2 
                className="mb-2 text-2xl font-bold text-white"
                onDoubleClick={handleTitleDoubleClick}
              >
                {goal.title}
              </h2>
            )}
            
            {isEditingDescription ? (
              <textarea
                ref={descriptionInputRef}
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={handleDescriptionKeyDown}
                className="w-full bg-transparent text-dark-100 outline-none focus:border-b focus:border-primary-400/50"
                rows={3}
                placeholder="Add a description..."
              />
            ) : (
              <p 
                className="text-dark-100"
                onDoubleClick={handleDescriptionDoubleClick}
              >
                {goal.description || 'No description'}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <div className="relative">
              <ProgressRing progress={goal.completion_status} size={90} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="block text-xl font-bold">{goal.completion_status}%</span>
                <span className="block text-xs text-dark-200">complete</span>
              </div>
            </div>
            
            {isEditingStatus ? (
              <select
                ref={statusSelectRef}
                value={statusValue}
                onChange={handleStatusChange}
                onBlur={handleStatusSave}
                className={`mt-2 rounded-full border border-dark-500 bg-dark-700/70 px-3 py-1 text-center text-sm outline-none focus:border-primary-400/50`}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            ) : (
              <div 
                className={`mt-2 rounded-full px-3 py-1 text-center text-sm ${getStatusColor()}`}
                onDoubleClick={handleStatusDoubleClick}
              >
                {goal.status === 'active' ? (isOverdue ? 'Overdue' : 'Active') : goal.status}
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-dark-700/50 p-3">
            <div className="text-sm text-dark-200">Start Date</div>
            {isEditingStartDate ? (
              <input
                ref={startDateInputRef}
                type="date"
                value={startDateValue}
                onChange={(e) => setStartDateValue(e.target.value)}
                onBlur={handleStartDateSave}
                className="bg-transparent font-medium outline-none focus:border-b focus:border-primary-400/50"
              />
            ) : (
              <div 
                className="font-medium"
                onDoubleClick={handleStartDateDoubleClick}
              >
                {formatDate(goal.start_date)}
              </div>
            )}
          </div>
          
          <div className="rounded-lg bg-dark-700/50 p-3">
            <div className="text-sm text-dark-200">Target Date</div>
            {isEditingTargetDate ? (
              <input
                ref={targetDateInputRef}
                type="date"
                value={targetDateValue}
                onChange={(e) => setTargetDateValue(e.target.value)}
                onBlur={handleTargetDateSave}
                className="bg-transparent font-medium outline-none focus:border-b focus:border-primary-400/50"
              />
            ) : (
              <div 
                className="font-medium"
                onDoubleClick={handleTargetDateDoubleClick}
              >
                {formatDate(goal.target_date)}
              </div>
            )}
          </div>
          
          <div className="rounded-lg bg-dark-700/50 p-3">
            <div className="text-sm text-dark-200">Time Remaining</div>
            <div className={`font-medium ${isOverdue ? 'text-amber-400' : ''}`}>
              {Math.abs(daysRemaining)} days {daysRemaining >= 0 ? 'left' : 'overdue'}
            </div>
          </div>
        </div>
        
        {/* Progress chart for goal */}
        {goal.progress_updates && goal.progress_updates.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Progress Timeline</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCharts(!showCharts)}
                className="rounded-full bg-dark-600 px-3 py-1 text-sm font-medium text-dark-100 hover:bg-dark-500 hover:text-white"
              >
                {showCharts ? 'Hide Charts' : 'Show Charts'}
              </motion.button>
            </div>
            
            <ProgressChart 
              progressData={goal.progress_updates} 
              title="Goal Progress"
            />
          </div>
        )}
        
        {/* Reflections */}
        {goal.reflections && Object.keys(goal.reflections).length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Reflections</h3>
            <div className="space-y-2">
              {Object.entries(goal.reflections).map(([type, reflection]) => (
                <div key={reflection.id} className="rounded-lg bg-dark-700/40 p-3">
                  <div className="mb-1 text-sm font-medium text-primary-300">
                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                  </div>
                  {editingReflectionId === type ? (
                    <input
                      ref={(el) => reflectionInputRefs.current[type] = el}
                      type="text"
                      value={reflectionValues[type] || ''}
                      onChange={(e) => handleReflectionChange(type, e.target.value)}
                      onBlur={() => handleReflectionSave(type)}
                      onKeyDown={(e) => handleReflectionKeyDown(type, e)}
                      className="w-full bg-transparent text-sm outline-none focus:border-b focus:border-primary-400/50"
                    />
                  ) : (
                    <div 
                      className="text-sm"
                      onDoubleClick={(e) => handleReflectionDoubleClick(type, e)}
                    >
                      {reflection.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Milestones */}
        {goal.milestones && goal.milestones.length > 0 && (
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">Milestones</h3>
            <div className="space-y-4">
              {goal.milestones.map((milestone) => (
                <MilestoneCard 
                  key={milestone.id} 
                  milestone={milestone} 
                  formatDate={formatDate}
                  showChart={showCharts}
                  onMilestoneUpdate={(updatedMilestone) => {
                    if (onGoalUpdate) {
                      // Refresh the goal to include the updated milestone
                      refreshGoal(goal.id, onGoalUpdate);
                    }
                  }}
                  goalId={goal.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Helper function to refresh goal data
const refreshGoal = async (goalId: number, onGoalUpdate: (goal: Goal) => void) => {
  try {
    const updatedGoal = await api.getGoalDetails(goalId);
    onGoalUpdate(updatedGoal);
  } catch (error) {
    console.error('Failed to refresh goal:', error);
  }
};

// Milestone component
interface MilestoneCardProps {
  milestone: Milestone;
  formatDate: (date: string) => string;
  showChart: boolean;
  onMilestoneUpdate?: (milestone: Milestone) => void;
  goalId: number;
}

const MilestoneCard = ({ milestone, formatDate, showChart, onMilestoneUpdate, goalId }: MilestoneCardProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(milestone.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(milestone.description || '');
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  
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
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
    if (isEditingTargetDate && targetDateInputRef.current) {
      targetDateInputRef.current.focus();
    }
    if (isEditingStatus && statusSelectRef.current) {
      statusSelectRef.current.focus();
    }
  }, [isEditingTitle, isEditingDescription, isEditingTargetDate, isEditingStatus]);
  
  const getStatusColor = () => {
    switch(statusValue) {
      case 'completed': return 'bg-green-500/10 text-green-200'
      case 'missed': return 'bg-red-500/10 text-red-200'
      default: return 'bg-dark-700/40'
    }
  }

  // Title editing handlers
  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);
  }

  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === milestone.title) {
      setTitleValue(milestone.title);
      setIsEditingTitle(false);
      return;
    }

    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, { title: titleValue });
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
      }
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update milestone title:', error);
      setTitleValue(milestone.title);
      setIsEditingTitle(false);
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleValue(milestone.title);
      setIsEditingTitle(false);
    }
  }

  // Description editing handlers
  const handleDescriptionDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDescription(true);
  }

  const handleDescriptionSave = async () => {
    if (descriptionValue === milestone.description) {
      setIsEditingDescription(false);
      return;
    }

    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, { description: descriptionValue });
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
      }
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Failed to update milestone description:', error);
      setDescriptionValue(milestone.description || '');
      setIsEditingDescription(false);
    }
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setDescriptionValue(milestone.description || '');
      setIsEditingDescription(false);
    }
  }

  // Target date editing handlers
  const handleTargetDateDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTargetDate(true);
  }

  const handleTargetDateSave = async () => {
    if (!targetDateValue || targetDateValue === milestone.target_date.split('T')[0]) {
      setTargetDateValue(milestone.target_date.split('T')[0]);
      setIsEditingTargetDate(false);
      return;
    }

    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, { target_date: `${targetDateValue}T00:00:00` });
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
      }
      setIsEditingTargetDate(false);
    } catch (error) {
      console.error('Failed to update milestone target date:', error);
      setTargetDateValue(milestone.target_date.split('T')[0]);
      setIsEditingTargetDate(false);
    }
  }

  // Status editing handlers
  const handleStatusDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingStatus(true);
  }

  const handleStatusSave = async () => {
    if (statusValue === milestone.status) {
      setIsEditingStatus(false);
      return;
    }

    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, { status: statusValue });
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
      }
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Failed to update milestone status:', error);
      setStatusValue(milestone.status);
      setIsEditingStatus(false);
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusValue(e.target.value as 'pending' | 'completed' | 'missed');
  }

  return (
    <div className={`rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className="w-full bg-transparent font-medium outline-none focus:border-b focus:border-primary-400/50"
            />
          ) : (
            <div 
              className="font-medium"
              onDoubleClick={handleTitleDoubleClick}
            >
              {milestone.title}
            </div>
          )}
          
          {isEditingDescription ? (
            <textarea
              ref={descriptionInputRef}
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              onBlur={handleDescriptionSave}
              onKeyDown={handleDescriptionKeyDown}
              className="w-full bg-transparent text-sm opacity-80 outline-none focus:border-b focus:border-primary-400/50"
              rows={2}
              placeholder="Add a description..."
            />
          ) : (
            <div 
              className="text-sm opacity-80"
              onDoubleClick={handleDescriptionDoubleClick}
            >
              {milestone.description || 'No description'}
            </div>
          )}
          
          <div className="mt-1 text-xs">
            Due: {
              isEditingTargetDate ? (
                <input
                  ref={targetDateInputRef}
                  type="date"
                  value={targetDateValue}
                  onChange={(e) => setTargetDateValue(e.target.value)}
                  onBlur={handleTargetDateSave}
                  className="bg-transparent text-xs outline-none focus:border-b focus:border-primary-400/50"
                />
              ) : (
                <span onDoubleClick={handleTargetDateDoubleClick}>
                  {formatDate(milestone.target_date)}
                </span>
              )
            }
          </div>
        </div>
        <div className="text-right">
          {isEditingStatus ? (
            <select
              ref={statusSelectRef}
              value={statusValue}
              onChange={handleStatusChange}
              onBlur={handleStatusSave}
              className="rounded-full bg-dark-700/50 px-2 py-0.5 text-xs outline-none focus:border-primary-400/50"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="missed">Missed</option>
            </select>
          ) : (
            <div 
              className="rounded-full bg-dark-700/50 px-2 py-0.5 text-xs"
              onDoubleClick={handleStatusDoubleClick}
            >
              {milestone.status}
            </div>
          )}
          <div className="mt-1 text-sm font-bold">
            {milestone.completion_status}%
          </div>
        </div>
      </div>
      
      {/* Progress chart for milestone if we get it from the backend */}
      {showChart && milestone.progress_updates && milestone.progress_updates.length > 0 && (
        <ProgressChart 
          progressData={milestone.progress_updates} 
          height={150}
          minimal={false}
        />
      )}
    </div>
  )
}

export default GoalCard 