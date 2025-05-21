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
  AreaChart
} from 'recharts'
import { ProgressUpdate } from '@/services/api'

interface ProgressChartProps {
  progressData: ProgressUpdate[]
  title?: string
  height?: number
  minimal?: boolean
}

// Format date to be more readable
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark rounded-lg p-3 shadow-lg">
        <p className="mb-1 text-sm text-dark-100">{label}</p>
        <p className="text-lg font-bold text-white">
          {`${payload[0].value}%`}
        </p>
        {payload[0].payload.notes && (
          <p className="mt-1 max-w-[200px] text-xs text-dark-200">
            {payload[0].payload.notes}
          </p>
        )}
      </div>
    )
  }
  return null
}

const ProgressChart = ({ progressData, title, height = 200, minimal = false }: ProgressChartProps) => {
  const [expanded, setExpanded] = useState(false)

  console.log('ProgressChart inputs:', {
    progressDataLength: progressData.length,
    progressData,
    title,
    minimal
  })

  // Format data for the chart
  const chartData = progressData.map(update => ({
    date: formatDate(update.created_at),
    progress: update.progress_value,
    notes: update.notes,
    rawDate: new Date(update.created_at).getTime()  // For sorting
  }))
  
  // Sort by date (oldest to newest)
  chartData.sort((a, b) => a.rawDate - b.rawDate)

  console.log('ChartData prepared:', chartData)

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
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="progress" 
              stroke="#38bdf8" 
              fillOpacity={1} 
              fill="url(#progressGradient)" 
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </AreaChart>
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
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e3142" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#868ca7' }} 
            axisLine={{ stroke: '#2e3142' }}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fill: '#868ca7' }} 
            axisLine={{ stroke: '#2e3142' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="progress" 
            stroke="#38bdf8" 
            activeDot={{ r: 8, fill: '#0ea5e9' }} 
            strokeWidth={3}
            dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 2, stroke: '#0c4a6e' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ProgressChart 