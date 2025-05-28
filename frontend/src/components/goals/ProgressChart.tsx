import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line
} from 'recharts'
import { ProgressUpdate } from '@/services/api'
import colorScheme from '@/styles/colorScheme'

interface ProgressChartProps {
  progressData: ProgressUpdate[]
  title?: string
  height?: number
  minimal?: boolean
}

// Format date for x-axis
const formatXAxis = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timestamp = label // timestamp is used as the x-axis value
    const date = new Date(timestamp)
    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    
    // Extract progress and effort entries
    const progressEntry = payload.find((p: any) => p.dataKey === 'progress')
    const effortEntry = payload.find((p: any) => p.dataKey === 'effort')
    
    // Get notes from the payload
    const progressNotes = payload[0]?.payload?.progress_notes
    const effortNotes = payload[0]?.payload?.effort_notes
    
    return (
      <div className="rounded-lg border border-white/10 bg-dark-800/90 p-4 shadow-lg backdrop-blur-md">
        <p className="mb-2 text-sm text-gray-300">{formattedDate} {formattedTime}</p>
        
        {/* Show progress value if present */}
        {progressEntry && progressEntry.value !== undefined && (
          <p className="text-base font-bold text-white">
            <span 
              className="mr-2 inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: progressEntry.color }}
            ></span>
            Progress: {progressEntry.value}
          </p>
        )}
        
        {/* Show effort value if present */}
        {effortEntry && effortEntry.value !== undefined && (
          <p className="text-base font-bold text-white">
            <span 
              className="mr-2 inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: effortEntry.color }}
            ></span>
            Effort: {effortEntry.value}
          </p>
        )}
        
        {/* Display notes */}
        {progressNotes && progressEntry && (
          <p className="mt-2 max-w-[250px] text-sm text-gray-400">
            {progressNotes}
          </p>
        )}
        
        {effortNotes && effortEntry && (
          <p className="mt-2 max-w-[250px] text-sm text-gray-400">
            {effortNotes}
          </p>
        )}
      </div>
    )
  }
  return null
}

const ProgressChart = ({ 
  progressData, 
  title = "Progress & Effort", 
  height = 200, 
  minimal = false
}: ProgressChartProps) => {
  const [expanded, setExpanded] = useState(false)
  
  // Filter data to ensure it's specific to either a goal or milestone
  // If first item has milestone_id, only include items with that milestone_id
  // If first item has no milestone_id, exclude all items with milestone_id
  const filteredData = progressData.length > 0 
    ? (() => {
        const firstItem = progressData[0];
        const hasMilestoneId = !!firstItem.milestone_id;
        
        if (hasMilestoneId) {
          // This is milestone data - only show updates for this specific milestone
          return progressData.filter(update => update.milestone_id === firstItem.milestone_id);
        } else {
          // This is goal data - exclude any milestone updates
          return progressData.filter(update => !update.milestone_id);
        }
      })()
    : progressData;
    
  // Check if this is a milestone chart
  const isMilestoneChart = filteredData.length > 0 && !!filteredData[0].milestone_id;
  
  // Split data by type
  const progressUpdates = filteredData.filter(update => !update.type || update.type === 'progress')
  const effortUpdates = filteredData.filter(update => update.type === 'effort')
  
  console.log(`Chart data: ${filteredData.length} total updates`)
  console.log(`Progress updates: ${progressUpdates.length}`)
  console.log(`Effort updates: ${effortUpdates.length}`)

  // Process data for the chart
  const chartData = filteredData.map(update => {
    const timestamp = new Date(update.created_at).getTime()
    
    // Create data point with timestamp as x-axis value
    const dataPoint: any = {
      timestamp
    }
    
    // Set property based on update type
    if (update.type === 'effort') {
      dataPoint.effort = update.progress_value / 10 // Convert to 0-10 scale
      if (update.effort_notes) {
        dataPoint.effort_notes = update.effort_notes
      }
    } else {
      // Default to progress type if not specified or is 'progress'
      dataPoint.progress = update.progress_value / 10 // Convert to 0-10 scale
      if (update.progress_notes) {
        dataPoint.progress_notes = update.progress_notes
      }
    }
    
    return dataPoint
  })
  
  // Sort by timestamp
  chartData.sort((a: any, b: any) => a.timestamp - b.timestamp)
  
  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-sm text-gray-400 backdrop-blur-sm">
        No progress data available
      </div>
    )
  }

  if (minimal) {
    // Minimal chart for compact view
    return (
      <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={100}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorScheme.blue[500]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colorScheme.blue[500]} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={['dataMin', 'dataMax']}
              hide 
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Progress Area */}
            {progressUpdates.length > 0 && (
              <Area 
                type="monotone" 
                dataKey="progress" 
                stroke={colorScheme.blue[500]} 
                fillOpacity={1} 
                fill="url(#progressGradient)" 
                strokeWidth={2}
                connectNulls
              />
            )}
            
            {/* Effort Line */}
            {effortUpdates.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="effort" 
                stroke={colorScheme.purple[500]} 
                strokeWidth={2}
                dot={{ r: 3, fill: colorScheme.purple[500] }}
                activeDot={{ r: 4 }}
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Full interactive chart
  return (
    <motion.div 
      className={`overflow-hidden rounded-lg border border-white/10 ${
        isMilestoneChart ? 'bg-blue-500/5' : 'bg-white/5'
      } backdrop-blur-sm`}
      animate={{ height: expanded ? 'auto' : height }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h4 className="text-base font-medium text-white">{title}</h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span>
              <span className="text-xs text-gray-300">Progress</span>
              
              {effortUpdates.length > 0 && (
                <>
                  <span className="ml-3 h-2.5 w-2.5 rounded-full bg-purple-400"></span>
                  <span className="text-xs text-gray-300">Effort</span>
                </>
              )}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {expanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="px-3 pb-4">
        <ResponsiveContainer width="100%" height={expanded ? 350 : height - 60}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
            <defs>
              <linearGradient id="progressGradientFull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorScheme.blue[500]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colorScheme.blue[500]} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatXAxis}
              tick={{ fill: '#9ca3af', fontSize: 11 }} 
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              domain={[0, 10]}
              tick={{ fill: '#9ca3af', fontSize: 11 }} 
              axisLine={{ stroke: '#374151' }}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Progress Area */}
            {progressUpdates.length > 0 && (
              <Area 
                type="monotone" 
                dataKey="progress" 
                stroke={colorScheme.blue[500]} 
                fillOpacity={1} 
                fill="url(#progressGradientFull)" 
                strokeWidth={2}
                dot={{ r: 3, fill: colorScheme.blue[500], strokeWidth: 1, stroke: colorScheme.blue[800] }}
                activeDot={{ r: 4, fill: colorScheme.blue[500] }}
                name="Progress"
                connectNulls
              />
            )}
            
            {/* Effort Line */}
            {effortUpdates.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="effort" 
                stroke={colorScheme.purple[500]} 
                strokeWidth={2}
                dot={{ r: 3, fill: colorScheme.purple[500], strokeWidth: 1, stroke: colorScheme.purple[600] }}
                activeDot={{ r: 4, fill: colorScheme.purple[500] }}
                name="Effort"
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default ProgressChart 