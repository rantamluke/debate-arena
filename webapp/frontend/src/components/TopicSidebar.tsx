interface TopicSidebarProps {
  currentTopic: {
    title: string
    category: string
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    position: 'FOR' | 'AGAINST'
    round: number
    totalRounds: number
  }
  stats: {
    winRate: number
    totalDebates: number
    currentStreak: number
  }
  onForfeit: () => void
}

export default function TopicSidebar({ currentTopic, stats, onForfeit }: TopicSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Current Topic Card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="text-sm text-gray-400 mb-2">Current Debate</div>
        <h3 className="text-xl font-bold mb-4">{currentTopic.title}</h3>
        
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-500/30 rounded-full text-sm">
            {currentTopic.category}
          </span>
          <span className="px-3 py-1 bg-green-500/30 rounded-full text-sm">
            {currentTopic.difficulty}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span>Your Position:</span>
            <span className="font-bold text-green-400">
              ✅ {currentTopic.position}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Round:</span>
            <span className="font-bold">{currentTopic.round} of {currentTopic.totalRounds}</span>
          </div>
        </div>

        <button 
          onClick={onForfeit}
          className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg font-bold transition"
        >
          🏳️ Forfeit Debate
        </button>
      </div>

      {/* Quick Stats */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-bold mb-4">Your Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Win Rate</span>
            <span className="font-bold text-green-400">{stats.winRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Debates</span>
            <span className="font-bold">{stats.totalDebates}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Current Streak</span>
            <span className="font-bold text-orange-400">🔥 {stats.currentStreak}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
