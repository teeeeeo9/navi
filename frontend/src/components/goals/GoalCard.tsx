import { useState } from 'react'
import { motion } from 'framer-motion'
import { Goal } from '@/services/api'

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
}

const GoalCard = ({ goal, isSelected = false, onClick, compact = false }: GoalCardProps) => {
  // Calculate days remaining
  const targetDate = new Date(goal.target_date)
  const today = new Date()
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  const isOverdue = daysRemaining < 0 && goal.status === 'active'
  
  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
    })
  }

  // Get status color
  const getStatusColor = () => {
    switch(goal.status) {
      case 'completed': return 'bg-green-500/20 text-green-300'
      case 'abandoned': return 'bg-red-500/20 text-red-300'
      default: 
        return isOverdue 
          ? 'bg-amber-500/20 text-amber-300'
          : 'bg-blue-500/20 text-blue-300'
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
          {/* Status indicator */}
          <span className={`absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs ${getStatusColor()}`}>
            {goal.status === 'active' ? (isOverdue ? 'Overdue' : 'Active') : goal.status}
          </span>
          
          {/* Progress indicator */}
          <div className="absolute -right-4 -top-4">
            <ProgressRing progress={goal.completion_status} size={60} strokeWidth={4} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
              {goal.completion_status}%
            </span>
          </div>
          
          <div className="pr-12">
            <h3 className="mb-1 text-xl font-bold text-white">{goal.title}</h3>
            
            <div className="flex items-center space-x-2 text-xs text-dark-100">
              <span>Target: {formatDate(goal.target_date)}</span>
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
      <div className="relative h-full rounded-2xl p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-white">{goal.title}</h2>
            <p className="text-dark-100">{goal.description || 'No description'}</p>
          </div>
          
          <div className="text-right">
            <div className="relative">
              <ProgressRing progress={goal.completion_status} size={90} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="block text-xl font-bold">{goal.completion_status}%</span>
                <span className="block text-xs text-dark-200">complete</span>
              </div>
            </div>
            
            <div className={`mt-2 rounded-full px-3 py-1 text-center text-sm ${getStatusColor()}`}>
              {goal.status === 'active' ? (isOverdue ? 'Overdue' : 'Active') : goal.status}
            </div>
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-dark-700/50 p-3">
            <div className="text-sm text-dark-200">Start Date</div>
            <div className="font-medium">{formatDate(goal.start_date)}</div>
          </div>
          
          <div className="rounded-lg bg-dark-700/50 p-3">
            <div className="text-sm text-dark-200">Target Date</div>
            <div className="font-medium">{formatDate(goal.target_date)}</div>
          </div>
          
          <div className="rounded-lg bg-dark-700/50 p-3">
            <div className="text-sm text-dark-200">Time Remaining</div>
            <div className={`font-medium ${isOverdue ? 'text-amber-400' : ''}`}>
              {Math.abs(daysRemaining)} days {daysRemaining >= 0 ? 'left' : 'overdue'}
            </div>
          </div>
        </div>
        
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
                  <div className="text-sm">{reflection.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Milestones */}
        {goal.milestones && goal.milestones.length > 0 && (
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">Milestones</h3>
            <div className="space-y-2">
              {goal.milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={`rounded-lg p-3 ${
                    milestone.status === 'completed' 
                      ? 'bg-green-500/10 text-green-200' 
                      : milestone.status === 'missed'
                      ? 'bg-red-500/10 text-red-200'
                      : 'bg-dark-700/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{milestone.title}</div>
                      <div className="text-sm opacity-80">
                        {milestone.description || 'No description'}
                      </div>
                      <div className="mt-1 text-xs">
                        Due: {formatDate(milestone.target_date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="rounded-full bg-dark-700/50 px-2 py-0.5 text-xs">
                        {milestone.status}
                      </div>
                      <div className="mt-1 text-sm font-bold">
                        {milestone.completion_status}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default GoalCard 