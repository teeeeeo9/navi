import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line
} from 'recharts'
import { ProgressUpdate } from '@/services/api'
import theme from '@/styles/theme'

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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timestamp = label
    const date = new Date(timestamp)
    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    
    // Get the data points
    const progressEntry = payload.find((p: any) => p.dataKey === 'progress')
    const effortEntry = payload.find((p: any) => p.dataKey === 'effort')
    
    // Get notes if they exist
    const progressNotes = payload[0]?.payload?.progress_notes
    const effortNotes = payload[0]?.payload?.effort_notes
    
    return (
      <div className="rounded-lg border border-white/10 bg-dark-800/90 p-4 shadow-lg backdrop-blur-md">
        <p className="mb-2 text-sm text-gray-300">{formattedDate} {formattedTime}</p>
        
        {progressEntry && progressEntry.value !== undefined && (
          <p className="text-base font-bold text-white">
            <span 
              className="mr-2 inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: theme.blue[500] }}
            ></span>
            Progress: {progressEntry.value}
          </p>
        )}
        
        {effortEntry && effortEntry.value !== undefined && (
          <p className="text-base font-bold text-white">
            <span 
              className="mr-2 inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: theme.green[500] }}
            ></span>
            Effort: {effortEntry.value}
          </p>
        )}
        
        {progressNotes && (
          <p className="mt-2 max-w-[250px] text-sm text-gray-400">
            {progressNotes}
          </p>
        )}
        
        {effortNotes && (
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
  height = 200, 
  minimal = false
}: ProgressChartProps) => {
  const [expanded, setExpanded] = useState(false)
  
  // Filter data to ensure it's specific to either a goal or milestone
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

  // Process data for the chart - create a clean array with no duplicate timestamps
  const processData = () => {
    const dataMap = new Map();
    
    // First process all progress updates
    progressUpdates.forEach(update => {
      const timestamp = new Date(update.created_at).getTime();
      dataMap.set(timestamp, {
        timestamp,
        progress: update.progress_value / 10,
        progress_notes: update.progress_notes || ''
      });
    });
    
    // Then add effort updates (avoid overwriting progress data)
    effortUpdates.forEach(update => {
      const timestamp = new Date(update.created_at).getTime();
      const existingData = dataMap.get(timestamp) || { timestamp };
      dataMap.set(timestamp, {
        ...existingData,
        effort: update.progress_value / 10,
        effort_notes: update.effort_notes || ''
      });
    });
    
    // Convert map to array and sort by timestamp
    return Array.from(dataMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  };
  
  const chartData = processData();
  
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
                stroke={theme.blue[500]} 
                fill="rgba(113, 160, 198, 0.2)"
                strokeWidth={2}
                activeDot={{ r: 4, fill: theme.blue[500] }}
                dot={{ r: 3, fill: theme.blue[500], strokeWidth: 0 }}
                connectNulls
              />
            )}
            
            {/* Effort Line */}
            {effortUpdates.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="effort" 
                stroke={theme.green[500]} 
                strokeWidth={2}
                dot={{ r: 3, fill: theme.green[500], strokeWidth: 0 }}
                activeDot={{ r: 4, fill: theme.green[500] }}
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Full chart
  return (
    <motion.div 
      className={`overflow-hidden rounded-lg border border-white/10 ${
        isMilestoneChart ? 'bg-blue-500/5' : 'bg-white/5'
      } backdrop-blur-sm`}
      animate={{ height: expanded ? 'auto' : height }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-end px-3 pt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-full border border-white/10 bg-white/5 p-1 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
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
      
      <div className="px-3 pb-4">
        <ResponsiveContainer width="100%" height={expanded ? 350 : height - 30}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="timestamp" 
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatXAxis}
              tick={{ fill: theme.grey[300], fontSize: 11 }} 
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              domain={[0, 10]}
              tick={{ fill: theme.grey[300], fontSize: 11 }} 
              axisLine={{ stroke: '#374151' }}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Progress Area */}
            {progressUpdates.length > 0 && (
              <Area 
                type="monotone" 
                dataKey="progress" 
                stroke={theme.blue[500]} 
                fill="rgba(113, 160, 198, 0.2)"
                strokeWidth={2}
                dot={{ r: 3, fill: theme.blue[500], strokeWidth: 0 }}
                activeDot={{ r: 4, fill: theme.blue[500] }}
                name="Progress"
                connectNulls
              />
            )}
            
            {/* Effort Line */}
            {effortUpdates.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="effort" 
                stroke={theme.green[500]} 
                strokeWidth={2}
                dot={{ r: 3, fill: theme.green[500], strokeWidth: 0 }}
                activeDot={{ r: 4, fill: theme.green[500] }}
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