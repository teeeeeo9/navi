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
  status: 'active' | 'completed'
  start_date: string
  target_date: string
  completion_status: number // 0-100 scale in backend
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
  status: 'active' | 'completed'
  completion_status: number // 0-100 scale in backend
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
  milestone_id?: number
  progress_value: number // 0-100 scale in backend but displayed as 0-10 in UI
  type: 'progress' | 'effort' // Type of progress update
  progress_notes?: string // Notes for progress updates
  effort_notes?: string // Notes for effort updates
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

  // New method to notify chat interface about system updates
  handleSystemUpdate: async (updateType: string, entity: string, _changes: any): Promise<{
    system_message: ChatMessage
    ai_response: ChatMessage
  }> => {
    // This method doesn't actually make an API call - the system update is sent by the backend
    // when the entity is updated. This method is used to track that a system update is in progress
    // so the UI can show a loading animation
    
    // Return a dummy object that mimics the structure of the sendMessage response
    // The actual system message and AI response will come through the WebSocket
    // or when the user refreshes the chat history
    return {
      system_message: {
        id: Math.random(),
        sender: 'system',
        content: `SYSTEM_UPDATE: ${updateType} ${entity}`,
        created_at: new Date().toISOString()
      },
      ai_response: {
        id: Math.random(),
        sender: 'replica',
        content: 'Processing your update...',
        created_at: new Date().toISOString()
      }
    }
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

  getProgressUpdates: async (goalId: number, type?: 'progress' | 'effort'): Promise<ProgressUpdate[]> => {
    const typeParam = type ? `?type=${type}` : ''
    const { data } = await axios.get(`/api/progress/goals/${goalId}/updates${typeParam}`)
    return data.progress_updates
  },

  // Create a progress state update (affects goal completion status)
  createProgressUpdate: async (goalId: number, progressValue: number, notes: string = ''): Promise<ProgressUpdate> => {
    const { data } = await axios.post(`/api/progress/goals/${goalId}/updates`, {
      progress_value: progressValue, // Backend expects 0-100 scale
      type: 'progress',
      progress_notes: notes // Use only the type-specific notes field
    })
    return data.progress_update
  },

  // Create an effort level update (does not affect goal completion status)
  createEffortUpdate: async (goalId: number, effortValue: number, notes: string = ''): Promise<ProgressUpdate> => {
    const { data } = await axios.post(`/api/progress/goals/${goalId}/updates`, {
      progress_value: effortValue, // Backend expects 0-100 scale
      type: 'effort',
      effort_notes: notes // Use only the type-specific notes field
    })
    return data.progress_update
  },

  // Create a progress update for a milestone
  createMilestoneProgressUpdate: async (
    goalId: number, 
    milestoneId: number, 
    progressValue: number, 
    type: 'progress' | 'effort', 
    notes: string = ''
  ): Promise<ProgressUpdate> => {
    const { data } = await axios.post(`/api/goals/${goalId}/milestones/${milestoneId}/progress`, {
      progress_value: progressValue, // Backend expects 0-100 scale
      type,
      // Set the type-specific notes field based on update type
      ...(type === 'progress' ? { progress_notes: notes } : { effort_notes: notes })
    })
    return data.progress_update
  },

  // Get progress updates for a milestone
  getMilestoneProgressUpdates: async (
    goalId: number, 
    milestoneId: number,
    type?: 'progress' | 'effort'
  ): Promise<ProgressUpdate[]> => {
    const typeParam = type ? `?type=${type}` : ''
    const { data } = await axios.get(`/api/goals/${goalId}/milestones/${milestoneId}/progress${typeParam}`)
    return data.progress_updates
  },

  getAchievements: async () => {
    const { data } = await axios.get('/api/progress/achievements')
    return data
  },

  // User Preferences
  updateCharacterPreference: async (character: 'default' | 'yoda'): Promise<{message: string, character: string}> => {
    // Update user preference
    const { data } = await axios.put('/api/auth/preferences/character', { character })
    
    // Also notify the chat service about the character change
    if (character === 'yoda') {
      // Send a system message to the chat service to inform about Yoda mode
      await api.sendMessage(`SYSTEM_UPDATE: CHARACTER_CHANGE yoda`);
    } else {
      // Send a system message to revert to default mode
      await api.sendMessage(`SYSTEM_UPDATE: CHARACTER_CHANGE default`);
    }
    
    return data
  }
}

export default api