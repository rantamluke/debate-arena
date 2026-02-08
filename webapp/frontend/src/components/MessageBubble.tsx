interface Message {
  id: string
  type: 'user' | 'opponent' | 'system'
  content: string
  timestamp: number
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  if (message.type === 'system') {
    return (
      <div className="text-center message">
        <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-sm border border-blue-500/30">
          {message.content}
        </div>
      </div>
    )
  }

  const isUser = message.type === 'user'
  const timeAgo = getTimeAgo(message.timestamp)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} message`}>
      <div className="max-w-xl">
        <div
          className={`rounded-2xl p-4 shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-purple-600 to-blue-600 rounded-br-sm'
              : 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-bl-sm'
          }`}
        >
          <div className={`text-xs mb-1 ${isUser ? 'text-purple-200' : 'text-gray-400'}`}>
            {isUser ? 'You (FOR)' : 'AI Opponent (AGAINST)'}
          </div>
          <p className="text-base leading-relaxed">{message.content}</p>
        </div>
        <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {timeAgo}
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds} seconds ago`
  
  const minutes = Math.floor(seconds / 60)
  if (minutes === 1) return '1 minute ago'
  if (minutes < 60) return `${minutes} minutes ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours === 1) return '1 hour ago'
  return `${hours} hours ago`
}
