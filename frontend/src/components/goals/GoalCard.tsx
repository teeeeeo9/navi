import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Goal, Milestone, Reflection, ProgressUpdate } from '@/services/api'
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
  onGoalUpdate?: (updatedGoal: Goal) => void
}

const GoalCard = ({ goal, isSelected = false, onClick, compact = false, onGoalUpdate }: GoalCardProps) => {
  const [showCharts, setShowCharts] = useState(false)
  
  const [progressValue, setProgressValue] = useState<number>(
    Math.round(goal.completion_status / 10)
  )
  const [effortValue, setEffortValue] = useState<number>(5)
  const [progressNotes, setProgressNotes] = useState<string>('')
  
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

  // Function to handle submitting progress updates
  const handleProgressUpdate = async (type: 'progress' | 'effort', value: number) => {
    console.log(`Updating ${type} with value: ${value}/10`);
    
    try {
      // Convert from 0-10 scale to 0-100 for backend
      const scaledValue = value * 10
      console.log(`Scaled value for backend: ${scaledValue}/100`);
      
      // Use appropriate API function based on type
      let update: ProgressUpdate
      if (type === 'progress') {
        console.log('Calling createProgressUpdate API method');
        update = await api.createProgressUpdate(goal.id, scaledValue, progressNotes)
        console.log('Progress update response:', update);
        
        // Update local goal data if progress state was updated
        setLocalGoalData(prev => ({
          ...prev,
          status: scaledValue === 100 && prev.status === 'active' ? 'completed' : prev.status
        }))
      } else {
        console.log('Calling createEffortUpdate API method');
        update = await api.createEffortUpdate(goal.id, scaledValue, progressNotes)
        console.log('Effort update response:', update);
      }
      
      // Refresh the goal to get updated progress data
      if (onGoalUpdate) {
        console.log('Refreshing goal data');
        const updatedGoal = await api.getGoalDetails(goal.id)
        onGoalUpdate(updatedGoal)
      }
      
      // Clear notes after submission
      setProgressNotes('')
      
    } catch (error) {
      console.error(`Failed to update ${type}:`, error)
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
        onGoalUpdate(updatedGoal)
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
        onGoalUpdate(updatedGoal)
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
        onGoalUpdate(updatedGoal)
      }
    } catch (error) {
      console.error('Failed to update goal target date:', error)
      setLocalGoalData(prev => ({ ...prev, targetDate: goal.target_date }))
      
      setDaysRemaining(calculateDaysRemaining(goal.target_date))
      setIsOverdue(daysRemaining < 0 && localGoalData.status === 'active')
    }
  }

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
        onGoalUpdate(updatedGoal)
      }
    } catch (error) {
      console.error('Failed to update goal status:', error)
      setLocalGoalData(prev => ({ ...prev, status: goal.status }))
      
      setIsOverdue(daysRemaining < 0 && goal.status === 'active')
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusValue(e.target.value as 'active' | 'completed' | 'abandoned')
  }

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
        onGoalUpdate(updatedGoal)
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

  if (compact) {
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
          {localGoalData.status === 'completed' && (
            <span className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs ${getStatusColor()}`}>
              {localGoalData.status}
            </span>
          )}
          
          <div className="absolute -right-4 -top-4">
            <ProgressRing progress={progressValue} size={60} strokeWidth={4} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
              {progressValue}/10
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
            
            {goal.milestones && goal.milestones.length > 0 && (
              <div className="mt-2 text-xs text-dark-200">
                {goal.milestones.length} milestone{goal.milestones.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
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
              {isEditingStatus ? (
                <select
                  ref={statusSelectRef}
                  value={statusValue}
                  onChange={handleStatusChange}
                  onBlur={handleStatusSave}
                  className={`rounded-full px-2 py-0.5 text-xs outline-none ${getStatusColor()}`}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              ) : (
                <span 
                  className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor()}`}
                  onDoubleClick={handleStatusDoubleClick}
                >
                  {localGoalData.status}
                </span>
              )}
              
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
            </div>
            
            <div className="mb-3">
              <label className="text-sm font-medium text-dark-100 block mb-2">Notes:</label>
              <textarea
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                placeholder="Add notes about your progress or effort..."
                className="w-full rounded-lg bg-dark-800/60 border border-dark-600/50 p-3 text-sm text-white placeholder:text-dark-300 resize-none"
                rows={2}
              />
            </div>
          </div>
        )}
        
        {showCharts && goal.progress_updates && goal.progress_updates.length > 0 && (
          <ProgressChart 
            progressData={goal.progress_updates} 
            title="Progress & Effort History"
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
                  showChart={showCharts}
                  onMilestoneUpdate={(updatedMilestone) => {
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
      </div>
    </div>
  )
}

const refreshGoal = async (goalId: number, onGoalUpdate: (goal: Goal) => void) => {
  try {
    const updatedGoal = await api.getGoalDetails(goalId)
    onGoalUpdate(updatedGoal)
  } catch (error) {
    console.error('Failed to refresh goal:', error)
  }
}

interface MilestoneCardProps {
  milestone: Milestone;
  formatDate: (date: string) => string;
  showChart: boolean;
  onMilestoneUpdate?: (milestone: Milestone) => void;
  goalId: number;
}

const MilestoneCard = ({ milestone, formatDate, showChart, onMilestoneUpdate, goalId }: MilestoneCardProps) => {
  const [localMilestone, setLocalMilestone] = useState({
    title: milestone.title,
    targetDate: milestone.target_date,
    status: milestone.status
  });
  
  useEffect(() => {
    setLocalMilestone({
      title: milestone.title,
      targetDate: milestone.target_date,
      status: milestone.status
    });
  }, [milestone]);
  
  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(milestone.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingTargetDate, setIsEditingTargetDate] = useState(false);
  const [targetDateValue, setTargetDateValue] = useState(milestone.target_date.split('T')[0]);
  const targetDateInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusValue, setStatusValue] = useState(milestone.status);
  const statusSelectRef = useRef<HTMLSelectElement>(null);
  
  // Set focus when editing starts
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
  
  // Get status color
  const getStatusColor = () => {
    switch(localMilestone.status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'missed': return 'bg-red-500/20 text-red-300';
      default: return 'bg-blue-500/20 text-blue-300';
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
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, {
        title: newTitle
      });
      
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
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
      const updatedMilestone = await api.updateMilestone(goalId, milestone.id, {
        target_date: formattedDate
      });
      
      if (onMilestoneUpdate) {
        onMilestoneUpdate(updatedMilestone);
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
        onMilestoneUpdate(updatedMilestone);
      }
    } catch (error) {
      console.error('Failed to update milestone status:', error);
      setLocalMilestone(prev => ({ ...prev, status: milestone.status }));
    }
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusValue(e.target.value as 'pending' | 'completed' | 'missed');
  };

  // Convert from 0-100 to 0-10 scale for display
  const progressValue = Math.round(milestone.completion_status / 10);
  
  return (
    <div className="glass rounded-lg p-0.5">
      <div className="rounded-lg p-4">
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
              {isEditingStatus ? (
                <select
                  ref={statusSelectRef}
                  value={statusValue}
                  onChange={handleStatusChange}
                  onBlur={handleStatusSave}
                  className={`rounded-full px-2 py-0.5 text-xs outline-none ${getStatusColor()}`}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                </select>
              ) : (
                <span 
                  className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor()}`}
                  onDoubleClick={handleStatusDoubleClick}
                >
                  {localMilestone.status}
                </span>
              )}
              
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
            <span className="text-sm font-medium">{progressValue}/10</span>
          </div>
        </div>
        
        {showChart && milestone.progress_updates && milestone.progress_updates.length > 0 && (
          <ProgressChart 
            progressData={milestone.progress_updates} 
            title={`${localMilestone.title} Progress & Effort`}
            minimal={true}
          />
        )}
      </div>
    </div>
  );
};

export default GoalCard 