import { useState } from 'react'
import Header from './components/Header'
import DebateChat from './components/DebateChat'
import TopicSidebar from './components/TopicSidebar'
import NewDebateButton from './components/NewDebateButton'

interface Message {
  id: string
  type: 'user' | 'opponent' | 'system'
  content: string
  timestamp: number
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '🎯 Round 1 - Opening Statement',
      timestamp: Date.now() - 120000
    },
    {
      id: '2',
      type: 'user',
      content: 'AI and automation are already transforming industries at an unprecedented rate. Look at autonomous vehicles, automated customer service, and algorithmic trading. By 2030, we\'ll see mass adoption across sectors that currently employ millions. This isn\'t fear-mongering—it\'s recognizing the exponential pace of technological advancement.',
      timestamp: Date.now() - 120000
    },
    {
      id: '3',
      type: 'opponent',
      content: 'While automation is advancing, history shows technology creates new jobs as it eliminates old ones. The Industrial Revolution automated farming but created factory jobs. The digital revolution eliminated typists but created software developers. We\'re not seeing mass unemployment—we\'re seeing job transformation. AI will augment human workers, not replace them entirely.',
      timestamp: Date.now() - 10000
    }
  ])

  const [currentTopic] = useState({
    title: 'AI will replace most jobs by 2030',
    category: 'Technology',
    difficulty: 'Beginner' as const,
    position: 'FOR' as const,
    round: 2,
    totalRounds: 4
  })

  const [stats] = useState({
    elo: 1247,
    winRate: 67,
    totalDebates: 24,
    currentStreak: 5
  })

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: Date.now()
    }
    setMessages([...messages, newMessage])

    // TODO: Send to backend and get opponent response
    setTimeout(() => {
      const opponentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'opponent',
        content: 'Interesting point. However, I would argue that...',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, opponentMessage])
    }, 2000)
  }

  const handleNewDebate = () => {
    // TODO: Implement new debate flow
    console.log('Starting new debate...')
  }

  const handleForfeit = () => {
    if (confirm('Are you sure you want to forfeit this debate?')) {
      // TODO: Implement forfeit logic
      console.log('Debate forfeited')
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white">
      <Header elo={stats.elo} />
      
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopicSidebar 
          currentTopic={currentTopic}
          stats={stats}
          onForfeit={handleForfeit}
        />
        
        <div className="lg:col-span-2">
          <DebateChat 
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      <NewDebateButton onClick={handleNewDebate} />
    </div>
  )
}

export default App
