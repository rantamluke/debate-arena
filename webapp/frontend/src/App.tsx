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
    if (!debateId || debateEnding) return
    
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
      
      // Update round counter and check if debate is complete
      const newRound = currentTopic.round + 1
      setCurrentTopic((prev: any) => ({
        ...prev,
        round: newRound
      }))
      
      // Check if debate is complete (after both user and AI have argued)
      // We've just added the AI's response, so check if we've reached total rounds
      if (newRound > currentTopic.totalRounds && !debateEnding) {
        setDebateEnding(true)
        setTimeout(() => handleEndDebate(), 2000)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleEndDebate = async () => {
    if (!debateId || debateEnding === false) return
    
    // Prevent multiple calls
    if (showResults) return
    
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

  // Navigation component
  const Navigation = () => (
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={() => setView('home')}
        className={`px-6 py-3 rounded-lg font-semibold transition ${
          view === 'home'
            ? 'bg-gradient-to-r from-purple-600 to-blue-600'
            : 'bg-gray-800 hover:bg-gray-700'
        }`}
      >
        🥊 New Debate
      </button>
      <button
        onClick={() => setView('stats')}
        className={`px-6 py-3 rounded-lg font-semibold transition ${
          view === 'stats'
            ? 'bg-gradient-to-r from-purple-600 to-blue-600'
            : 'bg-gray-800 hover:bg-gray-700'
        }`}
      >
        📊 Stats
      </button>
    </div>
  );

  // Stats view
  if (view === 'stats') {
    return (
      <>
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white">
          <Header elo={stats.elo} onStatsClick={() => setView("stats")} />
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Navigation />
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
          <Header elo={stats.elo} onStatsClick={() => setView("stats")} />
          
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Navigation />
            
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
                  userPosition={currentTopic?.position}
                  currentRound={currentTopic?.round}
                  totalRounds={currentTopic?.totalRounds}
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
        <Header elo={stats.elo} onStatsClick={() => setView("stats")} />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Navigation />
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
