import { useState, useEffect, useRef, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api, { ChatMessage } from '@/services/api'

interface ChatInterfaceProps {
  relatedGoalId?: number;
  onMessageAction?: (action: any) => void;
  className?: string;
  compact?: boolean;
}

// Constants
const SYSTEM_UPDATE_PREFIX = "SYSTEM_UPDATE:";

const ChatInterface = ({ relatedGoalId, onMessageAction, className = '', compact = false }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesPerPage = 20

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

  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      setPage(1) // Reset pagination
      const response = await api.getChatHistory(false, messagesPerPage, 0)
      setMessages(response.messages)
      setHasMore(response.pagination?.has_more || false)
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

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    try {
      setIsLoading(true)
      
      // Optimistically add user message to UI
      const tempUserMessage: ChatMessage = {
        id: Math.random(), // temporary ID
        sender: 'user',
        content: newMessage,
        created_at: new Date().toISOString(),
        related_goal_id: relatedGoalId
      }
      
      setMessages(prev => [...prev, tempUserMessage])
      setNewMessage('')
      
      // Send message to API
      const response = await api.sendMessage(newMessage, relatedGoalId)
      
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

  // Filter messages to hide system updates in the interface
  const filteredMessages = messages.filter(message => {
    // Hide any message that starts with SYSTEM_UPDATE prefix, regardless of sender
    return !message.content.startsWith(SYSTEM_UPDATE_PREFIX);
  });

  return (
    <div className={`flex h-full flex-col rounded-2xl ${className} ${compact ? '' : 'max-w-4xl mx-auto'}`}>
      <div className="glass-dark flex-1 overflow-hidden rounded-2xl">
        {isLoadingMore && (
          <div className="flex justify-center p-2">
            <div className="flex space-x-2 rounded-full bg-dark-700/70 px-4 py-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-400"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-400" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-400" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div 
          ref={chatContainerRef} 
          className="flex h-full flex-col overflow-y-auto p-6 scrollbar-thin"
        >
          {filteredMessages.length === 0 && !isLoading ? (
            <div className="flex h-full flex-col items-center justify-center text-dark-100">
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
                          ? 'bg-primary-700/70 text-white'
                          : message.sender === 'system'
                          ? 'bg-dark-600/70 text-dark-200 italic'
                          : 'bg-secondary-700/70 text-white'
                      } ${!compact ? 'px-5 py-4 shadow-lg' : ''}`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
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

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex justify-start"
            >
              <div className="flex space-x-2 rounded-full bg-dark-700/70 px-4 py-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-400"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-400" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-400" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="mt-4">
        <div className="glass-dark flex overflow-hidden rounded-2xl">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={compact ? "Type here..." : "What's on your mind?"}
            className="flex-1 bg-transparent px-6 py-4 text-white outline-none resize-none min-h-[60px] max-h-40 overflow-y-auto text-lg"
            disabled={isLoading}
            rows={2}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-primary-600 px-6 py-4 text-white"
            disabled={isLoading || !newMessage.trim()}
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

export default ChatInterface 