import { Goal } from '@/services/api'
import colorScheme from '@/styles/colorScheme'

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
    >
      <div className="relative flex h-full flex-col p-5">
        {/* Progress ring */}
        <div className="absolute -right-3 -top-3">
          <div className="backdrop-blur-md bg-dark-800/40 rounded-full p-1.5">
            <ProgressRing progress={progressValue} size={56} strokeWidth={5} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-white">
              {progressValue}/10
            </span>
          </div>
        </div>
        
        <div className="pr-12 flex-grow">
          <h3 className="mb-2 text-lg font-bold text-white line-clamp-2">
            {goal.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-gray-300">
            <span className="rounded-lg bg-white/5 px-2.5 py-1.5">
              {formatDate(goal.target_date)}
            </span>
            <span className={`rounded-lg px-2.5 py-1.5 ${isOverdue ? 'bg-orange-500/10 text-orange-300' : 'bg-blue-500/10 text-blue-300'}`}>
              {Math.abs(daysRemaining)} days {daysRemaining >= 0 ? 'left' : 'overdue'}
            </span>
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
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400" 
              style={{ width: `${goal.completion_status}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompactGoalCard 