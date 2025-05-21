import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Goal } from '@/services/api'
import GoalCard from './GoalCard'
import api from '@/services/api'

interface GoalCarouselProps {
  goals: Goal[]
  onSelectGoal: (goal: Goal) => void
  selectedGoalId?: number
}

const GoalCarousel = ({ goals, onSelectGoal, selectedGoalId }: GoalCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

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

  // Handle prev/next navigation
  const goToPrev = () => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : prev))
  }

  const goToNext = () => {
    setActiveIndex(prev => (prev < goals.length - 1 ? prev + 1 : prev))
  }

  if (goals.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <h3 className="mb-2 text-xl font-bold text-white">No Goals Yet</h3>
          <p className="text-dark-100">
            Start chatting with your AI assistant to create your first goal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {/* Navigation buttons */}
      {goals.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            disabled={activeIndex === 0}
            className="glass absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white opacity-80 transition-opacity hover:opacity-100 disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            disabled={activeIndex === goals.length - 1}
            className="glass absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white opacity-80 transition-opacity hover:opacity-100 disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      )}

      {/* Carousel */}
      <div 
        ref={carouselRef}
        className="scrollbar-hide h-full overflow-x-auto pb-6"
      >
        <div className="flex h-full gap-4 px-4">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              className="w-72 flex-shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GoalCard
                goal={goal}
                isSelected={selectedGoalId === goal.id}
                onClick={() => handleGoalSelect(goal, index)}
                compact
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      {goals.length > 1 && (
        <div className="absolute bottom-0 left-0 flex w-full justify-center space-x-2">
          {goals.map((_, index) => (
            <button
              key={index}
              onClick={() => handleGoalSelect(goals[index], index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === activeIndex ? 'bg-primary-400 w-4' : 'bg-dark-400'
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