import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import api, { Goal } from '@/services/api'
import { useNavigate, Link } from 'react-router-dom'
import logoImage from '@/assets/logo.png'

// Components
import ChatInterface from '@/components/chat/ChatInterface'
import GoalCard from '@/components/goals/GoalCard'
import GoalCarousel from '@/components/goals/GoalCarousel'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [_isLoading, setIsLoading] = useState(true)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false)
  const chatInterfaceRef = useRef<{ handleSystemUpdate: (updateType: string, entity: string, changes: any) => Promise<void> } | null>(null)

  // Load goals on component mount
  useEffect(() => {
    loadGoals()
  }, [])

  // If no goals are present, expand the chat by default
  useEffect(() => {
    if (goals.length === 0) {
      setIsChatCollapsed(false)
      setSelectedGoal(null) // Ensure selectedGoal is null when no goals exist
    }
  }, [goals.length]) // Depend on goals.length instead of the entire goals array for better performance

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
    // Handle goal deletion
    if (updateType === 'goal_delete') {
      // Remove the goal from the list
      setGoals(prev => prev.filter(g => g.id !== updatedGoal.id));
      
      // If the deleted goal was selected, select another goal or set to null
      if (selectedGoal && selectedGoal.id === updatedGoal.id) {
        if (goals.length > 1) {
          // Find the next goal to select
          const index = goals.findIndex(g => g.id === updatedGoal.id);
          const nextIndex = index === goals.length - 1 ? index - 1 : index + 1;
          const nextGoal = goals[nextIndex];
          
          // Get full details for the next goal
          api.getGoalDetails(nextGoal.id)
            .then(fullGoalData => {
              setSelectedGoal(fullGoalData);
            })
            .catch(error => {
              console.error('Failed to load next goal details:', error);
              setSelectedGoal(nextGoal); // Fallback to basic goal data
            });
        } else {
          // No more goals left
          setSelectedGoal(null);
        }
      }
      
      // Notify the chat interface about the system update
      if (chatInterfaceRef.current) {
        chatInterfaceRef.current.handleSystemUpdate(
          updateType,
          `goal:${updatedGoal.id}`,
          { goalId: updatedGoal.id, goalTitle: updatedGoal.title }
        );
      }
      
      return; // Exit early as we've handled the deletion
    }
    
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleChat = () => {
    setIsChatCollapsed(!isChatCollapsed)
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800">
      {/* Header */}
      <header className="z-10 flex justify-between p-4 backdrop-blur-md bg-dark-900/30 border-b border-white/5">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logoImage} alt="Navi Logo" className="h-8 w-auto" />
          <h1 className="text-2xl font-bold text-white">Navi</h1>
        </Link>

        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-sm text-dark-100">
              Logged in as <span className="text-primary-400">{user.username}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="rounded-full bg-dark-700/50 hover:bg-dark-600/50 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left side: Chat */}
        <motion.div
          animate={{
            width: isChatCollapsed ? '60px' : (goals.length > 0 ? '30%' : '100%'),
            minWidth: isChatCollapsed ? '60px' : '300px'
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative h-full backdrop-blur-sm bg-dark-800/20 border-r border-white/5"
        >
          {goals.length > 0 && (
            <button
              onClick={toggleChat}
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-dark-700/50 hover:bg-dark-600/50 text-white transition-colors"
            >
              {isChatCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
          
          <AnimatePresence>
            {!isChatCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ChatInterface 
                  className="w-full" 
                  relatedGoalId={selectedGoal?.id}
                  onMessageAction={handleMessageAction}
                  compact={goals.length > 0}
                  ref={chatInterfaceRef}
                  hasGoals={goals.length > 0}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Right side: Goals section - visible only when there are goals */}
        <AnimatePresence>
          {goals.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, width: isChatCollapsed ? 'calc(100% - 60px)' : '70%' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex h-full flex-col overflow-hidden"
            >
              {/* Carousel for compact view of goals */}
              <div className="p-4 pb-0 backdrop-blur-sm bg-dark-800/10 border-b border-white/5">
                <GoalCarousel 
                  goals={goals}
                  selectedGoalId={selectedGoal?.id}
                  onSelectGoal={setSelectedGoal}
                  onGoalUpdate={(goal) => handleGoalUpdate(goal)}
                />
              </div>

              {/* Selected goal details */}
              <div className="flex-1 overflow-auto p-4 pt-2 scrollbar-thin scrollbar-track-dark-800/20 scrollbar-thumb-dark-700/50">
                {selectedGoal && (
                  <GoalCard 
                    goal={selectedGoal} 
                    onGoalUpdate={handleGoalUpdate}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Dashboard 