import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import api, { Goal } from '@/services/api'
import { useNavigate, Link } from 'react-router-dom'
import logoImage from '@/assets/logo.png'
import theme from '@/styles/theme'

// Components
import ChatInterface from '@/components/chat/ChatInterface'
import GoalView from '@/components/goals/GoalView'
import GoalCarousel from '@/components/goals/GoalCarousel'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const chatInterfaceRef = useRef<{ handleSystemUpdate: (updateType: string, entity: string, changes: any) => Promise<void> } | null>(null)

  // Load goals on component mount
  useEffect(() => {
    loadGoals()
  }, [])

  // If no goals are present, expand the chat by default
  useEffect(() => {
    if (goals.length === 0) {
      setSelectedGoal(null) // Ensure selectedGoal is null when no goals exist
    }
  }, [goals.length])

  const loadGoals = async () => {
    try {
      setIsLoading(true)
      const goalsData = await api.getGoals()
      setGoals(goalsData)
      
      // If we have goals but none selected, select the first one and get its full details
      if (goalsData.length > 0 && !selectedGoal) {
        const firstGoalDetails = await api.getGoalDetails(goalsData[0].id)
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
    
    // Continue with updating the local state
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
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-gradient-to-b from-dark-900 to-dark-800">
      {/* Background elements for glass effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full blur-[120px]" 
             style={{ backgroundColor: 'rgba(113, 160, 198, 0.1)' }} />
        <div className="absolute top-[40%] -right-[5%] h-[300px] w-[300px] rounded-full blur-[100px]"
             style={{ backgroundColor: 'rgba(122, 144, 161, 0.1)' }} />
        <div className="absolute bottom-[10%] left-[30%] h-[250px] w-[250px] rounded-full blur-[80px]"
             style={{ backgroundColor: 'rgba(247, 144, 81, 0.1)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between px-8 py-4">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logoImage} alt="Navi Logo" className="h-9 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-white">Navi</h1>
              <p className="text-xs" style={{ color: theme.blue[300] }}>Your strategic replica</p>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            {user && (
              <span className="text-sm text-gray-300">
                <span style={{ color: theme.blue[400] }}>{user.username}</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              style={{ borderColor: 'var(--color-border-light)' }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="relative z-10 flex flex-1 overflow-hidden p-4">
        {/* No goals state - centered chat */}
        {goals.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="w-full max-w-4xl h-[80vh] flex-1">
              <ChatInterface 
                className="glass-morphism rounded-2xl border border-white/10 shadow-xl p-4 h-full" 
                onMessageAction={handleMessageAction}
                compact={false}
                ref={chatInterfaceRef}
                hasGoals={false}
              />
            </div>
          </div>
        ) : (
          // With goals state - chat on left, content on right
          <div className="flex flex-1 space-x-6">
            {/* Left side: Chat */}
            <div className="w-[30%] min-w-[300px] h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
              <ChatInterface 
                className="h-full" 
                relatedGoalId={selectedGoal?.id}
                onMessageAction={handleMessageAction}
                compact={true}
                ref={chatInterfaceRef}
                hasGoals={true}
              />
            </div>
            
            {/* Right side: Goals section */}
            <div className="flex-1 flex h-full flex-col overflow-hidden">
              {/* Carousel for compact view of goals */}
              <div className="p-6 pb-4">
                <GoalCarousel 
                  goals={goals}
                  selectedGoalId={selectedGoal?.id}
                  onSelectGoal={setSelectedGoal}
                  onGoalUpdate={(goal) => handleGoalUpdate(goal)}
                />
              </div>

              {/* Selected goal details with glass morphism */}
              <div className="flex-1 overflow-auto px-2">
                {selectedGoal && (
                  <GoalView 
                    goal={selectedGoal} 
                    onGoalUpdate={handleGoalUpdate}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard 