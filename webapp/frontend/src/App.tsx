import { useState, useEffect } from 'react'
import Header from './components/Header'
import DebateChat from './components/DebateChat'
import TopicSidebar from './components/TopicSidebar'
import TopicSelection from './components/TopicSelection'
import StatsPage from './components/StatsPage'
import ResultsModal from './components/ResultsModal'
import { startDebate, sendMessage, endDebate, getStats } from './api/client'

type View = 'home' | 'debate' | 'stats'

interface Message {
  id: string
  type: 'user' | 'opponent' | 'system'
  content: string
  timestamp: number
}

function App() {
  const [view, setView] = useState<View>('home')
  const [debateActive, setDebateActive] = useState(false)
  const [debateId, setDebateId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTopic, setCurrentTopic] = useState<any>(null)
  const [stats, setStats] = useState({
    elo: 1000,
    winRate: 0,
    totalDebates: 0,
    currentStreak: 0
  })
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [debateResults, setDebateResults] = useState<any>(null)
  const [debateEnding, setDebateEnding] = useState(false)

  // Load stats on mount
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSelectTopic = async (topicId: number, position: 'FOR' | 'AGAINST') => {
    setLoading(true)
    try {
      const debate = await startDebate(topicId, position)
      
      setDebateId(debate.id)
      setCurrentTopic({
        title: debate.topic,
        category: debate.category,
        difficulty: debate.difficulty,
        position: debate.position,
        round: debate.round,
        totalRounds: debate.totalRounds
      })
      
      setMessages([{
        id: '1',
        type: 'system',
        content: `🎯 Round ${debate.round} - Opening Statement`,
        timestamp: Date.now()
      }])
      
      setDebateActive(true)
      setView('debate')
    } catch (error) {
      console.error('Failed to start debate:', error)
      alert('Failed to start debate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!debateId) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, newMessage])

    try {
      const response = await sendMessage(debateId, content)
      
      const opponentMessage: Message = {
        id: response.id,
        type: 'opponent',
        content: response.content,
        timestamp: response.timestamp
      }
      
      setMessages(prev => [...prev, opponentMessage])
      
      // Update round counter
      const newRound = currentTopic.round + 1
      setCurrentTopic((prev: any) => ({
        ...prev,
        round: newRound
      }))
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleEndDebate = async () => {
    if (!debateId) return
    
    // Prevent multiple calls
    if (showResults || debateEnding) return
    
    setDebateEnding(true)
    setLoading(true)
    try {
      const results = await endDebate(debateId, messages)
      
      // Show results in modal
      setDebateResults(results)
      setShowResults(true)
      
      // Reload stats
      await loadStats()
    } catch (error) {
      console.error('Failed to end debate:', error)
      setDebateEnding(false) // Reset flag on error so user can retry
      alert('Failed to end debate. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCloseResults = () => {
    setShowResults(false)
    setDebateResults(null)
    handleNewDebate()
  }

  const handleNewDebate = () => {
    setDebateActive(false)
    setDebateId(null)
    setMessages([])
    setCurrentTopic(null)
    setDebateEnding(false)
    setView('home')
  }

  const handleForfeit = () => {
    if (confirm('Are you sure you want to forfeit this debate?')) {
      handleNewDebate()
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  // Stats view
  if (view === 'stats') {
    return (
      <>
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white">
          <Header elo={stats.elo} onStatsClick={() => setView("stats")} onNewDebateClick={() => setView("home")} />
          <div className="max-w-7xl mx-auto px-4 py-6">
            <StatsPage />
          </div>
        </div>
        {showResults && debateResults && (
          <ResultsModal
            isOpen={showResults}
            onClose={handleCloseResults}
            results={debateResults}
          />
        )}
      </>
    );
  }

  // Debate view
  if (view === 'debate' && debateActive) {
    return (
      <>
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white">
          <Header elo={stats.elo} onStatsClick={() => setView("stats")} onNewDebateClick={() => setView("home")} />
          
          <div className="max-w-7xl mx-auto px-4 py-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TopicSidebar 
                currentTopic={currentTopic}
                stats={stats}
                onForfeit={handleForfeit}
              />
              
              <div className="lg:col-span-2">
                <DebateChat 
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onEndDebate={handleEndDebate}
                  userPosition={currentTopic?.position}
                  currentRound={currentTopic?.round}
                  totalRounds={currentTopic?.totalRounds}
                  canEndDebate={currentTopic?.round > currentTopic?.totalRounds}
                />
              </div>
            </div>
          </div>
        </div>
        {showResults && debateResults && (
          <ResultsModal
            isOpen={showResults}
            onClose={handleCloseResults}
            results={debateResults}
          />
        )}
      </>
    );
  }

  // Home view (topic selection)
  return (
    <>
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white">
        <Header elo={stats.elo} onStatsClick={() => setView("stats")} onNewDebateClick={() => setView("home")} />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <TopicSelection onSelectTopic={handleSelectTopic} />
        </div>
      </div>
      {showResults && debateResults && (
        <ResultsModal
          isOpen={showResults}
          onClose={handleCloseResults}
          results={debateResults}
        />
      )}
    </>
  );
}

export default App
