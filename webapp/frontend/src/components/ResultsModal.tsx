interface Judge {
  name: string;
  scores: {
    logic: number;
    evidence: number;
    rhetoric: number;
  };
  feedback: string;
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    judges: Judge[];
    averageScores: {
      logic: number;
      evidence: number;
      rhetoric: number;
    };
    voteBreakdown: {
      human: number;
      ai: number;
      tie: number;
    };
    winner: 'user' | 'opponent' | 'tie';
    eloChange: number;
  };
}

export default function ResultsModal({ isOpen, onClose, results }: ResultsModalProps) {
  if (!isOpen) return null;

  const getWinnerDisplay = () => {
    if (results.winner === 'user') return {
      icon: '🏆',
      text: 'YOU WIN!',
      color: 'text-green-400',
      bg: 'from-green-600/20 to-emerald-700/20'
    };
    if (results.winner === 'opponent') return {
      icon: '❌',
      text: 'OPPONENT WINS',
      color: 'text-red-400',
      bg: 'from-red-600/20 to-pink-700/20'
    };
    return {
      icon: '🤝',
      text: 'TIE',
      color: 'text-yellow-400',
      bg: 'from-yellow-600/20 to-orange-700/20'
    };
  };

  const winner = getWinnerDisplay();

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Prevent closing when clicking modal content
        if (e.target === e.currentTarget) {
          // Do nothing - user must click button
        }
      }}
    >
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl border-2 border-purple-500/50 max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header - Compact */}
        <div className={`bg-gradient-to-r ${winner.bg} border-b border-white/10 p-4 text-center`}>
          <div className="text-4xl mb-2">{winner.icon}</div>
          <h2 className={`text-3xl font-bold mb-2 ${winner.color}`}>{winner.text}</h2>
          <div className="text-lg">
            Elo: <span className={results.eloChange > 0 ? 'text-green-400' : results.eloChange < 0 ? 'text-red-400' : 'text-gray-400'}>
              {results.eloChange > 0 ? '+' : ''}{results.eloChange}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Judge Votes + Scores in one row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Judge Votes */}
            <div>
              <h3 className="text-lg font-bold mb-3">Judge Votes</h3>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{results.voteBreakdown.human}</div>
                  <div className="text-xs text-gray-400">You</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{results.voteBreakdown.ai}</div>
                  <div className="text-xs text-gray-400">AI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">{results.voteBreakdown.tie}</div>
                  <div className="text-xs text-gray-400">Tie</div>
                </div>
              </div>
            </div>

            {/* Average Scores */}
            <div>
              <h3 className="text-lg font-bold mb-3">Average Scores</h3>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Logic</div>
                  <div className="text-2xl font-bold text-blue-400">{results.averageScores.logic}<span className="text-sm text-gray-500">/10</span></div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Evidence</div>
                  <div className="text-2xl font-bold text-purple-400">{results.averageScores.evidence}<span className="text-sm text-gray-500">/10</span></div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Rhetoric</div>
                  <div className="text-2xl font-bold text-orange-400">{results.averageScores.rhetoric}<span className="text-sm text-gray-500">/10</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Judge Feedback - Compact Grid */}
          <div>
            <h3 className="text-lg font-bold mb-3">Judge Feedback</h3>
            <div className="grid grid-cols-2 gap-3">
              {results.judges.map((judge, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm">{judge.name}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-blue-400">{judge.scores.logic}</span>
                      <span className="text-purple-400">{judge.scores.evidence}</span>
                      <span className="text-orange-400">{judge.scores.rhetoric}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs leading-snug">{judge.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button - Compact */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-lg transition"
          >
            🥊 Start New Debate
          </button>
        </div>
      </div>
    </div>
  );
}
