import axios from 'axios'

// Types
export interface ChatMessage {
  id: number
  sender: 'user' | 'replica' | 'system'
  content: string
  related_goal_id?: number
  created_at: string
  is_system?: boolean
}

export interface PaginatedResponse<T> {
  messages: T[]
  pagination: {
    total: number
    offset: number
    limit: number
    has_more: boolean
  }
}

export interface Goal {
  id: number
  title: string
  importance: number
  status: 'active' | 'completed' | 'abandoned'
  start_date: string
  target_date: string
  completion_status: number
  parent_goal_id: number | null
  milestones: Milestone[]
  reflections: Record<string, Reflection>
  progress_updates: ProgressUpdate[]
  subgoals_count: number
}

export interface Milestone {
  id: number
  goal_id: number
  title: string
  target_date: string
  status: 'pending' | 'completed' | 'missed'
  completion_status: number
  progress_updates?: ProgressUpdate[]
}

export interface Reflection {
  id: number
  content: string
  reflection_type: string
  created_at: string
  updated_at: string
}

export interface ProgressUpdate {
  id: number
  goal_id: number
  progress_value: number
  notes: string
  created_at: string
}

// API service
const api = {
  // Chat
  getChatHistory: async (includeSystem = false, limit = 50, offset = 0): Promise<PaginatedResponse<ChatMessage>> => {
    const { data } = await axios.get(`/api/chat/history?include_system=${includeSystem}&limit=${limit}&offset=${offset}`)
    return data
  },

  sendMessage: async (content: string, relatedGoalId?: number): Promise<{
    user_message: ChatMessage
    ai_response: ChatMessage
    action_result?: any
  }> => {
    const { data } = await axios.post('/api/chat/send', {
      content,
      related_goal_id: relatedGoalId
    })
    return data
  },

  // Goals
  getGoals: async (): Promise<Goal[]> => {
    const { data } = await axios.get('/api/goals/')
    return data.goals
  },

  getGoalDetails: async (goalId: number): Promise<Goal> => {
    const { data } = await axios.get(`/api/goals/${goalId}`)
    return data.goal
  },

  updateGoal: async (goalId: number, goalData: Partial<Goal>): Promise<Goal> => {
    const { data } = await axios.put(`/api/goals/${goalId}`, goalData)
    return data.goal
  },

  deleteGoal: async (goalId: number): Promise<void> => {
    await axios.delete(`/api/goals/${goalId}`)
  },

  // Milestones
  getMilestones: async (goalId: number): Promise<Milestone[]> => {
    const { data } = await axios.get(`/api/goals/${goalId}/milestones`)
    return data.milestones
  },

  updateMilestone: async (goalId: number, milestoneId: number, milestoneData: Partial<Milestone>): Promise<Milestone> => {
    const { data } = await axios.put(`/api/goals/${goalId}/milestones/${milestoneId}`, milestoneData)
    return data.milestone
  },

  // Progress
  getProgressSummary: async () => {
    const { data } = await axios.get('/api/progress/summary')
    return data
  },

  createProgressUpdate: async (goalId: number, progressValue: number, notes: string = ''): Promise<ProgressUpdate> => {
    const { data } = await axios.post(`/api/progress/goals/${goalId}/updates`, {
      progress_value: progressValue,
      notes
    })
    return data.progress_update
  },

  getAchievements: async () => {
    const { data } = await axios.get('/api/progress/achievements')
    return data
  }
}

export default api 