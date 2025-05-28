import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Goal } from '@/services/api'
import CompactGoalCard from './CompactGoalCard'
import api from '@/services/api'

interface GoalCarouselProps {
  goals: Goal[]
  onSelectGoal: (goal: Goal) => void
  selectedGoalId?: number
  onGoalUpdate?: (updatedGoal: Goal, updateType?: string) => void
}

const GoalCarousel = ({ goals, onSelectGoal, selectedGoalId, onGoalUpdate }: GoalCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showNav, setShowNav] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const navTimeoutRef = useRef<number>()

  // Set active index based on selected goal ID
  useEffect(() => {
    if (selectedGoalId) {
      const index = goals.findIndex(goal => goal.id === selectedGoalId)
      if (index !== -1) {
        setActiveIndex(index)
      }
    }
  }, [selectedGoalId, goals])

  // Handle scrolling to the selected item
  useEffect(() => {
    if (carouselRef.current && goals.length > 0) {
      const scrollContainer = carouselRef.current
      const cardWidth = scrollContainer.querySelector('div')?.clientWidth || 300
      const scrollPosition = activeIndex * (cardWidth + 16) // 16px for the gap
      
      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
      
      // Show navigation when changing slides
      setShowNav(true)
      clearTimeout(navTimeoutRef.current)
      navTimeoutRef.current = window.setTimeout(() => setShowNav(false), 2000)
    }
  }, [activeIndex, goals.length])

  // Handle goal selection with full details
  const handleGoalSelect = async (goal: Goal, index: number) => {
    try {
      setActiveIndex(index)
      // Fetch full goal details to get all progress updates
      const fullGoalDetails = await api.getGoalDetails(goal.id)
      onSelectGoal(fullGoalDetails)
    } catch (error) {
      console.error('Failed to get goal details:', error)
      // Fall back to basic goal data if details fetch fails
      onSelectGoal(goal)
    }
  }

  // Handle goal updates from child components
  const handleGoalUpdate = (updatedGoal: Goal, updateType?: string) => {
    if (onGoalUpdate) {
      onGoalUpdate(updatedGoal, updateType)
    }
  }

  // Handle prev/next navigation
  const goToPrev = () => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : prev))
    setShowNav(true)
    clearTimeout(navTimeoutRef.current)
    navTimeoutRef.current = window.setTimeout(() => setShowNav(false), 2000)
  }

  const goToNext = () => {
    setActiveIndex(prev => (prev < goals.length - 1 ? prev + 1 : prev))
    setShowNav(true)
    clearTimeout(navTimeoutRef.current)
    navTimeoutRef.current = window.setTimeout(() => setShowNav(false), 2000)
  }

  const handleScroll = () => {
    setShowNav(true)
    clearTimeout(navTimeoutRef.current)
    navTimeoutRef.current = window.setTimeout(() => setShowNav(false), 2000)
  }

  if (goals.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
          <h3 className="mb-3 text-xl font-bold text-white">No Goals Yet</h3>
          <p className="text-gray-300">
            Start chatting with your AI assistant to create your first goal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="relative h-full"
      onMouseEnter={() => setShowNav(true)}
      onMouseLeave={() => {
        const timer = window.setTimeout(() => setShowNav(false), 1000)
        return () => clearTimeout(timer)
      }}
    >
      {/* Navigation buttons */}
      {goals.length > 1 && (
        <>
          <motion.button
            onClick={goToPrev}
            disabled={activeIndex === 0}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-dark-800/60 p-2 text-white transition-colors hover:bg-dark-700/60 disabled:opacity-30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: showNav ? 0.9 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
            </svg>
          </motion.button>
          <motion.button
            onClick={goToNext}
            disabled={activeIndex === goals.length - 1}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10 bg-dark-800/60 p-2 text-white transition-colors hover:bg-dark-700/60 disabled:opacity-30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: showNav ? 0.9 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </>
      )}

      {/* Carousel */}
      <div 
        ref={carouselRef}
        className="scrollbar-hide h-full overflow-x-auto pb-3"
        onScroll={handleScroll}
      >
        <div className="flex h-full gap-4 px-2">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              className="w-72 flex-shrink-0 h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <CompactGoalCard
                goal={goal}
                isSelected={selectedGoalId === goal.id}
                onClick={() => handleGoalSelect(goal, index)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      {goals.length > 1 && (
        <div className="absolute -bottom-2 left-0 flex w-full justify-center space-x-2">
          {goals.map((_, index) => (
            <button
              key={index}
              onClick={() => handleGoalSelect(goals[index], index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? 'bg-blue-400 w-6' : 'bg-white/20 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default GoalCarousel 