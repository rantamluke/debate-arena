import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface Message {
  id: string
  type: 'user' | 'opponent' | 'system'
  content: string
  timestamp: number
}

interface DebateChatProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  userPosition?: 'FOR' | 'AGAINST'
}

export default function DebateChat({ messages, onSendMessage, userPosition = 'FOR' }: DebateChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpponentTyping, setIsOpponentTyping] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(90)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSend = () => {
    if (!inputValue.trim()) return
    onSendMessage(inputValue)
    setInputValue('')
    setIsOpponentTyping(true)
    setTimeout(() => setIsOpponentTyping(false), 3000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoice = () => {
    // TODO: Implement voice recording
    alert('Voice recording coming soon!')
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-[calc(100vh-200px)] flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} userPosition={userPosition} />
        ))}
        
        {isOpponentTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3">
          <button
            onClick={handleVoice}
            className="px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl transition flex items-center gap-2"
          >
            🎤 Voice
          </button>
          <input
            type="text"
            placeholder="Type your argument (or use voice)..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500 transition text-white placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          ⏱️ {timeRemaining} seconds remaining for your rebuttal
        </div>
      </div>
    </div>
  )
}
