import { useState, useEffect, useRef, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api, { ChatMessage } from '@/services/api'

interface ChatInterfaceProps {
  relatedGoalId?: number;
  onMessageAction?: (action: any) => void;
  className?: string;
  compact?: boolean;
}

const ChatInterface = ({ relatedGoalId, onMessageAction, className = '', compact = false }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory()
  }, [relatedGoalId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      const history = await api.getChatHistory(false)
      setMessages(history.filter(msg => !relatedGoalId || msg.related_goal_id === relatedGoalId))
    } catch (error) {
      console.error('Failed to load chat history:', error)
    } finally {
      setIsLoading(false)
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

  return (
    <div className={`flex h-full flex-col rounded-2xl ${className}`}>
      <div className="glass-dark flex-1 overflow-hidden rounded-2xl">
        <div 
          ref={chatContainerRef} 
          className="flex h-full flex-col overflow-y-auto p-4 scrollbar-thin"
        >
          {messages.length === 0 && !isLoading ? (
            <div className="flex h-full flex-col items-center justify-center text-dark-100">
              <p className="text-center">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
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
                      }`}
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
        <div className="glass-dark flex overflow-hidden rounded-full">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={compact ? "Type here..." : "Ask anything about your goals, planning, or strategy..."}
            className="flex-1 bg-transparent px-4 py-3 text-white outline-none"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-primary-600 px-5 py-3 text-white"
            disabled={isLoading || !newMessage.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
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