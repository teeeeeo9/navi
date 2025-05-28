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
      <div className="glass-dark rounded-lg p-3 shadow-lg">
        <p className="mb-1 text-sm text-dark-100">{formattedDate} {formattedTime}</p>
        
        {/* Show progress value if present */}
        {progressEntry && progressEntry.value !== undefined && (
          <p className="text-base font-bold text-white">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: progressEntry.color }}
            ></span>
            Progress: {progressEntry.value}
          </p>
        )}
        
        {/* Show effort value if present */}
        {effortEntry && effortEntry.value !== undefined && (
          <p className="text-base font-bold text-white">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: effortEntry.color }}
            ></span>
            Effort: {effortEntry.value}
          </p>
        )}
        
        {/* Display notes */}
        {progressNotes && progressEntry && (
          <p className="mt-1 max-w-[200px] text-xs text-dark-200">
            {progressNotes}
          </p>
        )}
        
        {effortNotes && effortEntry && (
          <p className="mt-1 max-w-[200px] text-xs text-dark-200">
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
      <div className="rounded-lg bg-dark-700/30 p-3 text-center text-sm text-dark-300">
        No progress data available
      </div>
    )
  }

  if (minimal) {
    // Minimal chart for compact view - increase height for milestone charts
    return (
      <div className={`mt-2 bg-dark-800/40 p-2 rounded-lg ${isMilestoneChart ? 'border border-primary-400/20' : ''}`}>
        <ResponsiveContainer width="100%" height={100}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
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
                stroke="#38bdf8" 
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
                stroke="#4ade80" 
                strokeWidth={2}
                dot={{ r: 3, fill: "#4ade80" }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Full interactive chart - now more compact and stylish
  return (
    <motion.div 
      className={`mt-4 overflow-hidden rounded-lg border ${
        isMilestoneChart ? 'border-primary-400/30 bg-dark-700/40' : 'border-dark-600/30 bg-dark-700/20'
      }`}
      animate={{ height: expanded ? 'auto' : height }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <h4 className="text-sm font-medium text-dark-100">{title}</h4>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2 h-2 rounded-full bg-primary-400"></span>
              <span className="text-xs text-dark-200">Progress</span>
              
              {effortUpdates.length > 0 && (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 ml-2"></span>
                  <span className="text-xs text-dark-200">Effort</span>
                </>
              )}
            </div>
            <motion.button
              onClick={() => setExpanded(!expanded)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-dark-600/50 p-1 text-sm text-dark-200 hover:bg-dark-500/50 hover:text-white"
            >
              {expanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      )}
      
      <div className="px-2 pb-3">
        <ResponsiveContainer width="100%" height={expanded ? 300 : height - 60}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="progressGradientFull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3142" opacity={0.3} />
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatXAxis}
              tick={{ fill: '#868ca7', fontSize: 10 }} 
              axisLine={{ stroke: '#2e3142' }}
            />
            <YAxis 
              domain={[0, 10]}
              tick={{ fill: '#868ca7', fontSize: 10 }} 
              axisLine={{ stroke: '#2e3142' }}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Progress Area */}
            {progressUpdates.length > 0 && (
              <Area 
                type="monotone" 
                dataKey="progress" 
                stroke="#38bdf8" 
                fillOpacity={1} 
                fill="url(#progressGradientFull)" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 1, stroke: '#0c4a6e' }}
                activeDot={{ r: 6, fill: '#0ea5e9' }}
                name="Progress"
                connectNulls
              />
            )}
            
            {/* Effort Line */}
            {effortUpdates.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="effort" 
                stroke="#4ade80" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#22c55e', strokeWidth: 1, stroke: '#166534' }}
                activeDot={{ r: 6, fill: '#22c55e' }}
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