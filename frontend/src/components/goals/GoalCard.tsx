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
  
  // Create a local copy of the goal data that we can update immediately
  const [localGoalData, setLocalGoalData] = useState({
    title: goal.title,
    description: goal.description || '',
    startDate: goal.start_date,
    targetDate: goal.target_date,
    status: goal.status
  });
  
  // Update local data when the prop changes
  useEffect(() => {
    setLocalGoalData({
      title: goal.title,
      description: goal.description || '',
      startDate: goal.start_date,
      targetDate: goal.target_date,
      status: goal.status
    });
  }, [goal]);
  
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
  
  // Local reflections copy that we can update immediately
  const [localReflections, setLocalReflections] = useState<Record<string, string>>({});
  
  // Initialize local reflections
  useEffect(() => {
    if (goal.reflections) {
      const values: Record<string, string> = {};
      Object.entries(goal.reflections).forEach(([type, reflection]) => {
        values[type] = reflection.content;
      });
      setLocalReflections(values);
    }
  }, [goal.reflections]);

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
    switch(localGoalData.status) {
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
    setTitleValue(localGoalData.title)
    setIsEditingTitle(true)
  }

  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === localGoalData.title) {
      setIsEditingTitle(false)
      return
    }

    // Exit edit mode immediately and update local display value
    const newTitle = titleValue.trim()
    setLocalGoalData(prev => ({ ...prev, title: newTitle }))
    setIsEditingTitle(false)

    try {
      const updatedGoal = await api.updateGoal(goal.id, { title: newTitle })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
    } catch (error) {
      console.error('Failed to update goal title:', error)
      // Revert to original value on error
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

  // Description editing handlers
  const handleDescriptionDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDescriptionValue(localGoalData.description)
    setIsEditingDescription(true)
  }

  const handleDescriptionSave = async () => {
    if (descriptionValue === localGoalData.description) {
      setIsEditingDescription(false)
      return
    }

    // Exit edit mode immediately and update local display value
    const newDescription = descriptionValue
    setLocalGoalData(prev => ({ ...prev, description: newDescription }))
    setIsEditingDescription(false)

    try {
      const updatedGoal = await api.updateGoal(goal.id, { description: newDescription })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
    } catch (error) {
      console.error('Failed to update goal description:', error)
      // Revert to original value on error
      setLocalGoalData(prev => ({ ...prev, description: goal.description || '' }))
    }
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave()
    } else if (e.key === 'Escape') {
      setIsEditingDescription(false)
    }
  }

  // Start date editing handlers
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

    // Exit edit mode immediately and update local display value
    const newStartDate = startDateValue
    const formattedDate = `${newStartDate}T00:00:00`
    setLocalGoalData(prev => ({ ...prev, startDate: formattedDate }))
    setIsEditingStartDate(false)
    
    // Update days remaining immediately
    setDaysRemaining(calculateDaysRemaining(localGoalData.targetDate))

    try {
      const updatedGoal = await api.updateGoal(goal.id, { start_date: formattedDate })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
    } catch (error) {
      console.error('Failed to update goal start date:', error)
      // Revert to original value on error
      setLocalGoalData(prev => ({ ...prev, startDate: goal.start_date }))
    }
  }

  // Target date editing handlers
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

    // Exit edit mode immediately and update local display value
    const newTargetDate = targetDateValue
    const formattedDate = `${newTargetDate}T00:00:00`
    setLocalGoalData(prev => ({ ...prev, targetDate: formattedDate }))
    setIsEditingTargetDate(false)
    
    // Update days remaining immediately
    const days = calculateDaysRemaining(formattedDate)
    setDaysRemaining(days)
    setIsOverdue(days < 0 && localGoalData.status === 'active')

    try {
      const updatedGoal = await api.updateGoal(goal.id, { target_date: formattedDate })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
    } catch (error) {
      console.error('Failed to update goal target date:', error)
      // Revert to original value on error
      setLocalGoalData(prev => ({ ...prev, targetDate: goal.target_date }))
      
      // Revert days remaining calculation
      setDaysRemaining(calculateDaysRemaining(goal.target_date))
      setIsOverdue(daysRemaining < 0 && localGoalData.status === 'active')
    }
  }

  // Status editing handlers
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

    // Exit edit mode immediately and update local display value
    const newStatus = statusValue
    setLocalGoalData(prev => ({ ...prev, status: newStatus }))
    setIsEditingStatus(false)
    
    // Update isOverdue immediately
    setIsOverdue(daysRemaining < 0 && newStatus === 'active')

    try {
      const updatedGoal = await api.updateGoal(goal.id, { status: newStatus })
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
    } catch (error) {
      console.error('Failed to update goal status:', error)
      // Revert to original value on error
      setLocalGoalData(prev => ({ ...prev, status: goal.status }))
      
      // Revert isOverdue calculation
      setIsOverdue(daysRemaining < 0 && goal.status === 'active')
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusValue(e.target.value as 'active' | 'completed' | 'abandoned')
  }

  // Reflection editing handlers
  const handleReflectionDoubleClick = (type: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingReflectionId(type)
    // Make sure we're editing the current displayed value
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

    // Exit edit mode immediately and update local display value
    const newContent = reflectionValues[type]
    setLocalReflections(prev => ({
      ...prev,
      [type]: newContent
    }))
    setEditingReflectionId(null)

    try {
      // Create the update object with the simple reflections format
      const updateData: GoalUpdateWithReflections = {
        reflections: {
          [type]: newContent
        }
      }

      // Type assertion to match the API's expected format
      const updatedGoal = await api.updateGoal(goal.id, updateData as any)
      
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal)
      }
    } catch (error) {
      console.error('Failed to update reflection:', error)
      // Revert to original value on error
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
          {localGoalData.status === 'completed' && (
            <span className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs ${getStatusColor()}`}>
              {localGoalData.status}
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
                {localGoalData.title}
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
                      {formatDate(localGoalData.targetDate)}
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
                {localGoalData.title}
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
                {localGoalData.description || 'No description'}
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
                {localGoalData.status === 'active' ? (isOverdue ? 'Overdue' : 'Active') : localGoalData.status}
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
                {formatDate(localGoalData.startDate)}
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
                {formatDate(localGoalData.targetDate)}
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
                      {localReflections[type] || reflection.content}
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
  // Local state for milestone data to update immediately
  const [localMilestone, setLocalMilestone] = useState({
    title: milestone.title,
    description: milestone.description || '',
    targetDate: milestone.target_date,
    status: milestone.status
  });
  
  // Update local data when props change
  useEffect(() => {
    setLocalMilestone({
      title: milestone.title,
      description: milestone.description || '',
      targetDate: milestone.target_date,
      status: milestone.status
    });
  }, [milestone]);

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
    switch(localMilestone.status) {
      case 'completed': return 'bg-green-500/10 text-green-200'
      case 'missed': return 'bg-red-500/10 text-red-200'
      default: return 'bg-dark-700/40'
    }
  }

  // Title editing handlers
  const handleTitleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitleValue(localMilestone.title);
    setIsEditingTitle(true);
  }

  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === localMilestone.title) {
      setIsEditingTitle(false);
      return;
    }

    // Exit edit mode immediately and update local display value
    const newTitle = titleValue.trim();
    setLocalMilestone(prev => ({ ...prev, title: newTitle }));
    setIsEditingTitle(false);

    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, { title: newTitle });
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
      }
    } catch (error) {
      console.error('Failed to update milestone title:', error);
      // Revert to original value on error
      setLocalMilestone(prev => ({ ...prev, title: milestone.title }));
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  }

  // Description editing handlers
  const handleDescriptionDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDescriptionValue(localMilestone.description);
    setIsEditingDescription(true);
  }

  const handleDescriptionSave = async () => {
    if (descriptionValue === localMilestone.description) {
      setIsEditingDescription(false);
      return;
    }

    // Exit edit mode immediately and update local display value
    const newDescription = descriptionValue;
    setLocalMilestone(prev => ({ ...prev, description: newDescription }));
    setIsEditingDescription(false);

    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, { description: newDescription });
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
      }
    } catch (error) {
      console.error('Failed to update milestone description:', error);
      // Revert to original value on error
      setLocalMilestone(prev => ({ ...prev, description: milestone.description || '' }));
    }
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setIsEditingDescription(false);
    }
  }

  // Target date editing handlers
  const handleTargetDateDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetDateValue(localMilestone.targetDate.split('T')[0]);
    setIsEditingTargetDate(true);
  }

  const handleTargetDateSave = async () => {
    if (!targetDateValue || targetDateValue === localMilestone.targetDate.split('T')[0]) {
      setIsEditingTargetDate(false);
      return;
    }

    // Exit edit mode immediately and update local display value
    const newTargetDate = targetDateValue;
    const formattedDate = `${newTargetDate}T00:00:00`;
    setLocalMilestone(prev => ({ ...prev, targetDate: formattedDate }));
    setIsEditingTargetDate(false);

    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, { target_date: formattedDate });
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
      }
    } catch (error) {
      console.error('Failed to update milestone target date:', error);
      // Revert to original value on error
      setLocalMilestone(prev => ({ ...prev, targetDate: milestone.target_date }));
    }
  }

  const handleTargetDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTargetDateSave();
    } else if (e.key === 'Escape') {
      setIsEditingTargetDate(false);
    }
  }

  // Status editing handlers
  const handleStatusDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusValue(localMilestone.status);
    setIsEditingStatus(true);
  }

  const handleStatusSave = async () => {
    if (statusValue === localMilestone.status) {
      setIsEditingStatus(false);
      return;
    }

    // Exit edit mode immediately and update local display value
    const newStatus = statusValue;
    setLocalMilestone(prev => ({ ...prev, status: newStatus }));
    setIsEditingStatus(false);

    try {
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, { status: newStatus });
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
      }
    } catch (error) {
      console.error('Failed to update milestone status:', error);
      // Revert to original value on error
      setLocalMilestone(prev => ({ ...prev, status: milestone.status }));
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
              {localMilestone.title}
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
              {localMilestone.description || 'No description'}
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
                  onKeyDown={handleTargetDateKeyDown}
                  className="bg-transparent text-xs outline-none focus:border-b focus:border-primary-400/50"
                />
              ) : (
                <span onDoubleClick={handleTargetDateDoubleClick}>
                  {formatDate(localMilestone.targetDate)}
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
              {localMilestone.status}
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