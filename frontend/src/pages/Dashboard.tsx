import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import api, { Goal } from '@/services/api'

// Components
import ChatInterface from '@/components/chat/ChatInterface'
import GoalCard from '@/components/goals/GoalCard'
import GoalCarousel from '@/components/goals/GoalCarousel'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChatExpanded, setIsChatExpanded] = useState(true)
  const chatInterfaceRef = useRef<{ handleSystemUpdate: (updateType: string, entity: string, changes: any) => Promise<void> } | null>(null)

  // Load goals on component mount
  useEffect(() => {
    loadGoals()
  }, [])

  // If no goals are present, expand the chat by default
  useEffect(() => {
    if (goals.length === 0) {
      setIsChatExpanded(true)
    }
  }, [goals])

  const loadGoals = async () => {
    try {
      setIsLoading(true)
      const goalsData = await api.getGoals()
      setGoals(goalsData)
      
      // If we have goals but none selected, select the first one and get its full details
      if (goalsData.length > 0 && !selectedGoal) {
        // Get the full goal details for the first goal (including progress updates)
        const firstGoalDetails = await api.getGoalDetails(goalsData[0].id)
        console.log('First goal details:', firstGoalDetails)
        setSelectedGoal(firstGoalDetails)
      }
    } catch (error) {
      console.error('Failed to load goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle chat message actions (like goal creation)
  const handleMessageAction = (action: any) => {
    if (action.action === 'create_goal' && action.goal) {
      // Refresh goals to include the newly created one
      loadGoals()
    } else if (
      (action.action === 'update_progress' || action.action === 'update_milestone') && 
      selectedGoal
    ) {
      // Refresh the current goal to see the updates
      refreshSelectedGoal()
    }
  }

  // Refresh the details of the selected goal
  const refreshSelectedGoal = async () => {
    if (!selectedGoal) return

    try {
      const updatedGoal = await api.getGoalDetails(selectedGoal.id)
      
      // Debug log
      console.log('Updated goal data:', updatedGoal)
      console.log('Progress updates:', updatedGoal.progress_updates)
      
      setSelectedGoal(updatedGoal)
      
      // Also update the goal in the goals list
      setGoals(prev => 
        prev.map(g => g.id === updatedGoal.id ? updatedGoal : g)
      )
    } catch (error) {
      console.error('Failed to refresh goal:', error)
    }
  }

  // Handle goal updates from the UI
  const handleGoalUpdate = (updatedGoal: Goal, updateType?: string) => {
    // Notify the chat interface about the system update immediately
    if (updateType && chatInterfaceRef.current) {
      chatInterfaceRef.current.handleSystemUpdate(
        updateType, 
        `goal:${updatedGoal.id}`, 
        { goalId: updatedGoal.id }
      )
    }
    
    // Continue with updating the local state after the animation has started
    setTimeout(() => {
      // Always refresh the goal to get the complete data with all nested objects
      if (selectedGoal && selectedGoal.id === updatedGoal.id) {
        refreshSelectedGoal();
      } else {
        // If it's not the selected goal, we still update our list
        // but also trigger a background refresh to get full details
        setGoals(prev => 
          prev.map(g => g.id === updatedGoal.id ? {...g, ...updatedGoal} : g)
        );
        
        // Background refresh of this goal to ensure all data is up to date
        api.getGoalDetails(updatedGoal.id)
          .then(fullGoalData => {
            setGoals(prev => 
              prev.map(g => g.id === fullGoalData.id ? fullGoalData : g)
            );
          })
          .catch(error => {
            console.error('Background goal refresh failed:', error);
          });
      }
    }, 0); // Using setTimeout with 0ms delay to ensure animation starts first
  }

  // Layout animation variants
  const layoutVariants = {
    chatExpanded: {
      chatWidth: '100%',
      goalsWidth: '0%',
      opacity: 1
    },
    split: {
      chatWidth: '35%',
      goalsWidth: '65%',
      opacity: 1
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="glass-dark z-10 flex justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">Navi</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-sm text-dark-100">
              Logged in as <span className="text-primary-400">{user.username}</span>
            </span>
          )}
          <button
            onClick={logout}
            className="rounded-full bg-dark-700/70 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex flex-1 overflow-hidden p-4">
        {/* Chat section */}
        <motion.div
          animate={{
            width: goals.length > 0 ? layoutVariants.split.chatWidth : layoutVariants.chatExpanded.chatWidth
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`flex h-full ${goals.length === 0 ? 'px-4 md:px-6 lg:px-12' : ''}`}
        >
          <ChatInterface 
            className="w-full" 
            relatedGoalId={selectedGoal?.id}
            onMessageAction={handleMessageAction}
            compact={goals.length > 0}
            ref={chatInterfaceRef}
          />
        </motion.div>
        
        {/* Goals section - visible only when there are goals */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, width: layoutVariants.split.goalsWidth }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="ml-4 flex h-full flex-col"
          >
            {/* Carousel for compact view of goals */}
            <div className="h-40">
              <GoalCarousel 
                goals={goals}
                selectedGoalId={selectedGoal?.id}
                onSelectGoal={setSelectedGoal}
                onGoalUpdate={(goal) => handleGoalUpdate(goal)}
              />
            </div>

            {/* Selected goal details */}
            <div className="mt-4 flex-1 overflow-auto">
              {selectedGoal && (
                <GoalCard 
                  goal={selectedGoal} 
                  onGoalUpdate={handleGoalUpdate}
                />
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default Dashboard 