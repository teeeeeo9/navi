import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  ComposedChart
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
    
    return (
      <div className="glass-dark rounded-lg p-3 shadow-lg">
        <p className="mb-1 text-sm text-dark-100">{formattedDate} {formattedTime}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.value === undefined) return null
          
          // Set appropriate label based on dataKey
          const label = entry.dataKey === 'progress' ? 'Progress' : 'Effort'
          
          return (
            <p key={index} className="text-base font-bold text-white">
              <span 
                className={`inline-block w-3 h-3 rounded-full mr-2`}
                style={{ backgroundColor: entry.color }}
              ></span>
              {label}: {entry.value}
            </p>
          )
        })}
        {payload[0]?.payload?.notes && (
          <p className="mt-1 max-w-[200px] text-xs text-dark-200">
            {payload[0].payload.notes}
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
  
  // Split data by type
  const progressUpdates = progressData.filter(update => !update.type || update.type === 'progress')
  const effortUpdates = progressData.filter(update => update.type === 'effort')
  
  console.log(`Chart data: ${progressData.length} total updates`)
  console.log(`Progress updates: ${progressUpdates.length}`)
  console.log(`Effort updates: ${effortUpdates.length}`)

  // Process data for the chart
  const chartData = progressData.map(update => {
    const timestamp = new Date(update.created_at).getTime()
    
    // Create data point with timestamp as x-axis value
    const dataPoint: any = {
      timestamp,
      notes: update.notes
    }
    
    // Set property based on update type
    if (update.type === 'effort') {
      dataPoint.effort = update.progress_value / 10 // Convert to 0-10 scale
    } else {
      // Default to progress type if not specified or is 'progress'
      dataPoint.progress = update.progress_value / 10 // Convert to 0-10 scale
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
    // Minimal chart for compact view
    return (
      <div className="mt-2 bg-dark-800/40 p-2 rounded-lg">
        <ResponsiveContainer width="100%" height={70}>
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

  // Full interactive chart
  return (
    <motion.div 
      className="mt-4 overflow-hidden rounded-lg bg-dark-700/60 p-4 border border-dark-600/30"
      animate={{ height: expanded ? 'auto' : height }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-dark-100">{title}</h4>
          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-dark-600/50 p-1 text-sm text-dark-200 hover:bg-dark-500/50 hover:text-white"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </motion.button>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={expanded ? 300 : height - 60}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="progressGradientFull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e3142" />
          <XAxis 
            dataKey="timestamp" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatXAxis}
            tick={{ fill: '#868ca7' }} 
            axisLine={{ stroke: '#2e3142' }}
          />
          <YAxis 
            domain={[0, 10]}
            tick={{ fill: '#868ca7' }} 
            axisLine={{ stroke: '#2e3142' }}
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
              strokeWidth={3}
              dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 2, stroke: '#0c4a6e' }}
              activeDot={{ r: 8, fill: '#0ea5e9' }}
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
              strokeWidth={3}
              dot={{ r: 6, fill: '#22c55e', strokeWidth: 2, stroke: '#166534' }}
              activeDot={{ r: 8, fill: '#22c55e' }}
              name="Effort"
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ProgressChart 