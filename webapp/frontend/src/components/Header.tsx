interface HeaderProps {
  elo: number
}

export default function Header({ elo }: HeaderProps) {
  return (
    <header className="border-b border-white/10 backdrop-blur-lg bg-black/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🥊</div>
          <div>
            <h1 className="text-2xl font-bold">Debate Arena</h1>
            <p className="text-sm text-gray-400">Sharpen your mind</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-400">Your Elo</div>
            <div className="text-2xl font-bold text-yellow-400">{elo}</div>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
            📊 Stats
          </button>
        </div>
      </div>
    </header>
  )
}
