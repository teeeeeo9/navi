import { Goal } from '@/services/api'
import theme from '@/styles/theme'

interface CompactGoalCardProps {
  goal: Goal
  isSelected?: boolean
  onClick?: () => void
}

const CompactGoalCard = ({ goal, isSelected = false, onClick }: CompactGoalCardProps) => {
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