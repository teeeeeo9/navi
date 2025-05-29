import { useState, useEffect, useRef, FormEvent, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api, { ChatMessage } from '@/services/api'
import ChatSuggestions from './ChatSuggestions'
import MarkdownRenderer from './MarkdownRenderer'
import { useAuth } from '@/context/AuthContext'
import YodaImage from '@/assets/Yoda.jpeg'

interface ChatInterfaceProps {
  relatedGoalId?: number;
  onMessageAction?: (action: any) => void;
  className?: string;
  compact?: boolean;
  hasGoals?: boolean;
}

// Define the handle interface for the ref
export interface ChatInterfaceHandle {
  handleSystemUpdate: (updateType: string, entity: string, changes: any) => Promise<void>;
}

// Constants
const SYSTEM_UPDATE_PREFIX = "SYSTEM_UPDATE:";

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>(
  ({ relatedGoalId, onMessageAction, className = '', compact = false, hasGoals = false }, ref) => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [systemUpdateInProgress, setSystemUpdateInProgress] = useState(false)
    const [hideSuggestions, setHideSuggestions] = useState(() => {
        // Initialize from localStorage
        const saved = localStorage.getItem('hideChatSuggestions')
        return saved === 'true'
    })
    
    // Animation states for yoda mode transitions
    const [isYodaModeTransitioning, setIsYodaModeTransitioning] = useState(false)
    const [yodaModeTransitionType, setYodaModeTransitionType] = useState<'entering' | 'exiting'>('entering')
    const [lastMessageCount, setLastMessageCount] = useState(0)
    
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const messagesPerPage = 20
    const { user } = useAuth()
    const isYodaMode = user?.preferences?.character_preference === 'yoda'
    
    // Track yoda mode changes and trigger animations
    const [previousYodaMode, setPreviousYodaMode] = useState(isYodaMode)
    
    useEffect(() => {
      if (previousYodaMode !== isYodaMode) {
        // Yoda mode has changed, trigger transition animation
        setYodaModeTransitionType(isYodaMode ? 'entering' : 'exiting')
        setIsYodaModeTransitioning(true)
        setLastMessageCount(messages.length) // Remember current message count
        setPreviousYodaMode(isYodaMode)
      }
    }, [isYodaMode, previousYodaMode, messages.length])
    
    // Stop animation when new message arrives
    useEffect(() => {
      if (messages.length > lastMessageCount && isYodaModeTransitioning) {
        setIsYodaModeTransitioning(false)
      }
    }, [messages.length, lastMessageCount, isYodaModeTransitioning])

    // Handle yoda mode switch animation trigger
    const handleYodaModeSwitch = (isEntering: boolean) => {
      setYodaModeTransitionType(isEntering ? 'entering' : 'exiting')
      setIsYodaModeTransitioning(true)
      setLastMessageCount(messages.length)
    }

    // Expose the handleSystemUpdate method to the parent component
    useImperativeHandle(ref, () => ({
      handleSystemUpdate
    }));

    // Load chat history on component mount
    useEffect(() => {
      loadChatHistory()
    }, []) // No relatedGoalId dependency to keep chat global

    // Scroll to bottom when new messages are added (but not when loading older messages)
    useEffect(() => {
      if (!isLoadingMore) {
        scrollToBottom()
      }
    }, [messages, isLoadingMore])

    // Handle scroll events to implement infinite scrolling
    useEffect(() => {
      const container = chatContainerRef.current
      if (!container) return

      const handleScroll = () => {
        // When user scrolls near the top, load more messages
        if (container.scrollTop < 100 && !isLoadingMore && hasMore) {
          loadMoreMessages()
        }
      }

      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }, [isLoadingMore, hasMore, page])

    // Method to be called by parent components when a system update occurs
    const handleSystemUpdate = async (updateType: string, entity: string, changes: any) => {
      try {
        // Immediately show typing animation
        setSystemUpdateInProgress(true)
        
        // First add a dummy system update message to keep track of it
        const dummySystemMessage: ChatMessage = {
          id: Math.random(),
          sender: 'system',
          content: `SYSTEM_UPDATE: ${updateType} ${entity}`,
          created_at: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, dummySystemMessage])
        
        // Now call the API but we don't need the response here
        await api.handleSystemUpdate(updateType, entity, changes)
        
        // Wait a short time to simulate the AI responding, then refresh the chat history
        setTimeout(() => {
          loadChatHistory().then(() => {
            setSystemUpdateInProgress(false)
          })
        }, 1500)
      } catch (error) {
        console.error('Failed to handle system update:', error)
        setSystemUpdateInProgress(false)
      }
    }

    const loadChatHistory = async () => {
      try {
        setIsLoading(true)
        setPage(1) // Reset pagination
        const response = await api.getChatHistory(false, messagesPerPage, 0)
        setMessages(response.messages)
        setHasMore(response.pagination?.has_more || false)
        return response
      } catch (error) {
        console.error('Failed to load chat history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const loadMoreMessages = async () => {
      if (isLoadingMore || !hasMore) return

      try {
        setIsLoadingMore(true)
        const nextPage = page + 1
        // Calculate how many messages to skip
        const offset = page * messagesPerPage
        
        // Use backend pagination
        const response = await api.getChatHistory(false, messagesPerPage, offset)
        
        if (response.messages.length > 0) {
          // Save scroll position
          const container = chatContainerRef.current
          const scrollHeight = container?.scrollHeight || 0
          
          // Add older messages to the beginning of the array
          setMessages(prev => [...response.messages, ...prev])
          setPage(nextPage)
          
          // Restore scroll position
          if (container) {
            const newScrollHeight = container.scrollHeight
            container.scrollTop = newScrollHeight - scrollHeight
          }
          
          // Update hasMore flag
          setHasMore(response.pagination?.has_more || false)
        } else {
          setHasMore(false)
        }
      } catch (error) {
        console.error('Failed to load more messages:', error)
      } finally {
        setIsLoadingMore(false)
      }
    }

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e: FormEvent, directMessage?: string) => {
      e.preventDefault()
      // Use the direct message if provided, otherwise use the state value
      const messageToSend = directMessage || newMessage
      if (!messageToSend.trim() || isLoading) return

      try {
        setIsLoading(true)
        
        // Optimistically add user message to UI
        const tempUserMessage: ChatMessage = {
          id: Math.random(), // temporary ID
          sender: 'user',
          content: messageToSend,
          created_at: new Date().toISOString(),
          related_goal_id: relatedGoalId
        }
        
        setMessages(prev => [...prev, tempUserMessage])
        setNewMessage('')
        
        // Send message to API
        const response = await api.sendMessage(messageToSend, relatedGoalId)
        
        // Replace temp message with real one and add AI response
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== tempUserMessage.id),
          response.user_message,
          response.ai_response
        ])
        
        // If there's an action result, notify parent component
        if (response.action_result && onMessageAction) {
          onMessageAction(response.action_result)
        }
      } catch (error) {
        console.error('Failed to send message:', error)
        // Show error in chat
        setMessages(prev => [
          ...prev,
          {
            id: Math.random(),
            sender: 'system',
            content: 'Failed to send message. Please try again.',
            created_at: new Date().toISOString()
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    // Handle keyboard events for the textarea
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // If Ctrl+Enter is pressed, insert a new line
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        setNewMessage(prev => prev + '\n')
      } 
      // If Enter is pressed without Ctrl, submit the form
      else if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage(e as unknown as FormEvent)
      }
    }

    // Filter messages to hide system updates in the interface but show replica responses
    const filteredMessages = messages.filter((message, index, array) => {
      // Hide system update messages that start with the prefix
      if (message.content.startsWith(SYSTEM_UPDATE_PREFIX)) {
        return false;
      }
      
      // Keep all non-system messages and replica responses to system updates
      // For replica messages, we need to check if they're responses to system updates
      if (message.sender === 'replica' && index > 0) {
        // Check if the previous message was a system update
        const prevMessage = array[index - 1];
        if (prevMessage && prevMessage.content.startsWith(SYSTEM_UPDATE_PREFIX)) {
          // This is a replica response to a system update, so show it
          return true;
        }
      }
      
      // Keep all other messages
      return true;
    });

    // Method to handle suggestion selection
    const handleSuggestionSelected = (message: string) => {
      // Create an event and directly send the message without setting state first
      const event = { preventDefault: () => {} } as FormEvent
      handleSendMessage(event, message)
    }

    // Toggle suggestions visibility and persist to localStorage
    const toggleSuggestions = () => {
      const newValue = !hideSuggestions
      setHideSuggestions(newValue)
      localStorage.setItem('hideChatSuggestions', newValue.toString())
    }

    return (
      <div className={`flex h-full flex-col rounded-2xl ${className} ${compact ? '' : 'max-w-4xl mx-auto'} relative`}>
        {/* Yoda Mode Transition Animation Overlay */}
        <AnimatePresence>
          {isYodaModeTransitioning && (
            <motion.div 
              className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Background overlay */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-emerald-800/40 to-teal-900/50 backdrop-blur-xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              
              {/* Floating particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-green-400/60 rounded-full"
                  style={{
                    left: `${20 + (i * 7)}%`,
                    top: `${20 + (i % 3) * 20}%`,
                  }}
                  initial={{ 
                    scale: 0, 
                    opacity: 0,
                    y: yodaModeTransitionType === 'entering' ? 50 : 0 
                  }}
                  animate={{ 
                    scale: [0, 1.2, 0.8, 1],
                    opacity: [0, 1, 1, 0.7],
                    y: yodaModeTransitionType === 'entering' ? [50, -10, 5, 0] : [0, -50],
                    x: [0, Math.sin(i) * 20, Math.cos(i) * 15, 0]
                  }}
                  transition={{ 
                    duration: 2 + (i * 0.1), 
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: i * 0.1
                  }}
                />
              ))}
              
              {/* Central animation element */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="text-center bg-black/60 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {yodaModeTransitionType === 'entering' ? (
                    <>
                      <motion.div
                        className="text-6xl mb-4"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 0.9, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        🧙‍♂️
                      </motion.div>
                      <motion.p 
                        className="text-green-300 text-xl font-bold drop-shadow-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Entering Yoda Mode...
                      </motion.p>
                      <motion.p 
                        className="text-green-400 text-base mt-3 drop-shadow-md"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Wise guidance, you shall receive
                      </motion.p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        className="text-6xl mb-4"
                        animate={{ 
                          rotate: [0, -10, 10, 0],
                          scale: [1, 0.9, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        👋
                      </motion.div>
                      <motion.p 
                        className="text-blue-300 text-xl font-bold drop-shadow-lg"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Returning to Normal Mode...
                      </motion.p>
                      <motion.p 
                        className="text-blue-400 text-base mt-3 drop-shadow-md"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Back to regular Navi
                      </motion.p>
                    </>
                  )}
                </motion.div>
              </div>
              
              {/* Ripple effect */}
              <motion.div 
                className="absolute inset-0 border-2 border-green-400/30 rounded-2xl"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [0.5, 1.2, 1],
                  opacity: [0, 0.6, 0.2]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {isYodaMode && !isYodaModeTransitioning && (
          <motion.div 
            className="absolute top-4 left-4 z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img 
              src={YodaImage} 
              alt="Yoda" 
              className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-green-400/50" 
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0)",
                  "0 0 0 10px rgba(34, 197, 94, 0.1)",
                  "0 0 0 20px rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
        
        <div className="flex-1 overflow-hidden rounded-2xl flex flex-col bg-transparent">
          {isLoadingMore && (
            <div className="flex justify-center p-2">
              <div className="flex space-x-2 rounded-full bg-gray-700/40 px-4 py-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          
          <div 
            ref={chatContainerRef} 
            className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 no-scrollbar"
          >
            {filteredMessages.length === 0 && !isLoading ? (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <p className={`text-center ${!compact ? 'text-lg' : ''}`}>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <AnimatePresence>
                  {filteredMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600/50 text-white backdrop-blur-sm'
                            : message.sender === 'system'
                            ? 'bg-gray-700/50 text-gray-300 italic backdrop-blur-sm'
                            : 'bg-blue-400/50 text-white backdrop-blur-sm'
                        } ${!compact ? 'px-5 py-4 shadow-lg' : ''}`}
                        style={{
                          backgroundColor: message.sender === 'user' 
                            ? 'rgba(135, 138, 140, 0.25)' // More transparent grey for user
                            : message.sender === 'system'
                            ? 'rgba(126, 148, 168, 0.2)' // More transparent light grey for system
                            : 'rgba(113, 160, 198, 0.3)' // More transparent blue for replica
                        }}
                      >
                        <MarkdownRenderer content={message.content} />
                        <p className="mt-1 text-right text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}

            {(isLoading || systemUpdateInProgress) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 flex justify-start"
              >
                <div className="flex space-x-2 rounded-full bg-gray-700/40 px-4 py-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Suggestions positioned right above the input */}
        <div className="mt-2 mb-2">
          <div className="flex flex-col space-y-2">
            {!hideSuggestions && (
              <ChatSuggestions 
                onSuggestionSelected={handleSuggestionSelected} 
                hasGoals={hasGoals}
                onYodaModeSwitch={handleYodaModeSwitch}
              />
            )}
            
            {/* Hide/Show Suggestions Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={toggleSuggestions}
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-white/5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{hideSuggestions ? 'Show suggestions' : 'Hide suggestions'}</span>
                <motion.div
                  animate={{ rotate: hideSuggestions ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="mt-2">
          <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
               style={{ borderColor: 'var(--color-border-light)' }}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={compact ? "What's on your mind?" : "What's on your mind?"}
              className="flex-1 bg-transparent px-6 py-4 text-white outline-none resize-none min-h-[60px] max-h-40 overflow-y-auto text-base"
              disabled={isLoading || systemUpdateInProgress}
              rows={2}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-4 text-white"
              style={{ background: 'var(--gradient-blue-grey)' }}
              disabled={isLoading || systemUpdateInProgress || !newMessage.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </motion.button>
          </div>
        </form>
      </div>
    )
  }
)

export default ChatInterface 