import { useState, useEffect } from 'react'
import Header from './components/Header'
import DebateChat from './components/DebateChat'
import TopicSidebar from './components/TopicSidebar'
import TopicSelection from './components/TopicSelection'
import { startDebate, sendMessage, endDebate, getStats } from './api/client'

interface Message {
  id: string
  type: 'user' | 'opponent' | 'system'
  content: string
  timestamp: number
}

function App() {
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
      setCurrentTopic((prev: any) => ({
        ...prev,
        round: prev.round + 1
      }))
      
      // Check if debate is complete
      if (currentTopic.round >= currentTopic.totalRounds) {
        setTimeout(() => handleEndDebate(), 2000)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleEndDebate = async () => {
    if (!debateId) return
    
    setLoading(true)
    try {
      const results = await endDebate(debateId, messages)
      
      // Show results
      const resultsMessage: Message = {
        id: 'results',
        type: 'system',
        content: formatResults(results),
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, resultsMessage])
      
      // Reload stats
      await loadStats()
      
      // Show new debate option after a delay
      setTimeout(() => {
        if (confirm('Debate complete! Start a new one?')) {
          handleNewDebate()
        }
      }, 3000)
    } catch (error) {
      console.error('Failed to end debate:', error)
      alert('Failed to end debate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatResults = (results: any) => {
    const { judges, averageScores, voteBreakdown, winner, eloChange } = results
    
    return `🏆 **DEBATE COMPLETE!**

**Winner:** ${winner === 'user' ? 'YOU WIN! 🎉' : winner === 'opponent' ? 'Opponent Wins' : 'TIE'}

**Judge Votes:**
Human: ${voteBreakdown.human} | AI: ${voteBreakdown.ai} | Tie: ${voteBreakdown.tie}

**Average Scores:**
Logic: ${averageScores.logic}/10
Evidence: ${averageScores.evidence}/10
Rhetoric: ${averageScores.rhetoric}/10

**Elo Change:** ${eloChange > 0 ? '+' : ''}${eloChange}

**Judge Feedback:**
${judges.map((j: any, i: number) => `
${i + 1}. ${j.name}
   Logic: ${j.scores.logic} | Evidence: ${j.scores.evidence} | Rhetoric: ${j.scores.rhetoric}
   "${j.feedback}"`).join('\n')}
`
  }

  const handleNewDebate = () => {
    setDebateActive(false)
    setDebateId(null)
    setMessages([])
    setCurrentTopic(null)
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

  if (!debateActive) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen text-white">
        <Header elo={stats.elo} />
        <TopicSelection onSelectTopic={handleSelectTopic} />
      </div>
    )
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
    </div>
  )
}

export default App
