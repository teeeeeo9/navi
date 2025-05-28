import { Goal } from '@/services/api'
import theme from '@/styles/theme'

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

interface CompactGoalCardProps {
  goal: Goal
  isSelected?: boolean
  onClick?: () => void
}

const CompactGoalCard = ({ goal, isSelected = false, onClick }: CompactGoalCardProps) => {
  // Calculate progress value on a scale of 0-10
  const progressValue = Math.round(goal.completion_status / 10)
  
  // Calculate days remaining
  function calculateDaysRemaining(targetDateStr: string) {
    const targetDate = new Date(targetDateStr)
    const today = new Date()
    return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  }
  
  const daysRemaining = calculateDaysRemaining(goal.target_date)
  const isOverdue = daysRemaining < 0 && goal.status === 'active'
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
    })
  }

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer h-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all ${
        isSelected ? 'ring-2 ring-blue-400' : 'hover:bg-white/10'
      }`}
      style={{ 
        borderColor: isSelected ? theme.blue[500] : 'var(--color-border-light)'
      }}
    >
      <div className="relative flex h-full flex-col p-5">
        {/* Remove progress ring */}
        
        <div className="flex-grow">
          <h3 className="mb-2 text-base font-medium text-white line-clamp-2">
            {goal.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-gray-300">
            <span className="rounded-lg bg-white/5 px-2.5 py-1.5">
              {formatDate(goal.target_date)}
            </span>
            {/* Removed status/days indicator */}
          </div>
          
          {goal.milestones && goal.milestones.length > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              {goal.milestones.length} milestone{goal.milestones.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-700/30">
            <div 
              className="h-full" 
              style={{ 
                width: `${goal.completion_status}%`,
                background: goal.completion_status === 100 
                  ? 'var(--gradient-progress-complete)' 
                  : 'var(--gradient-progress-incomplete)'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompactGoalCard 