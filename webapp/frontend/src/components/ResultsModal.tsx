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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl border-2 border-purple-500/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${winner.bg} border-b border-white/10 p-8 text-center`}>
          <div className="text-8xl mb-4">{winner.icon}</div>
          <h2 className={`text-5xl font-bold mb-4 ${winner.color}`}>{winner.text}</h2>
          <div className="text-2xl">
            Elo: <span className={results.eloChange > 0 ? 'text-green-400' : results.eloChange < 0 ? 'text-red-400' : 'text-gray-400'}>
              {results.eloChange > 0 ? '+' : ''}{results.eloChange}
            </span>
          </div>
        </div>

        {/* Judge Votes */}
        <div className="p-8 border-b border-white/10">
          <h3 className="text-2xl font-bold mb-4">Judge Votes</h3>
          <div className="flex justify-center gap-8 text-lg">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">{results.voteBreakdown.human}</div>
              <div className="text-sm text-gray-400">For You</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400">{results.voteBreakdown.ai}</div>
              <div className="text-sm text-gray-400">For AI</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-400">{results.voteBreakdown.tie}</div>
              <div className="text-sm text-gray-400">Tie</div>
            </div>
          </div>
        </div>

        {/* Average Scores */}
        <div className="p-8 border-b border-white/10">
          <h3 className="text-2xl font-bold mb-6">Your Average Scores</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Logic</div>
              <div className="text-5xl font-bold text-blue-400">{results.averageScores.logic}</div>
              <div className="text-sm text-gray-500">/10</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Evidence</div>
              <div className="text-5xl font-bold text-purple-400">{results.averageScores.evidence}</div>
              <div className="text-sm text-gray-500">/10</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Rhetoric</div>
              <div className="text-5xl font-bold text-orange-400">{results.averageScores.rhetoric}</div>
              <div className="text-sm text-gray-500">/10</div>
            </div>
          </div>
        </div>

        {/* Individual Judge Feedback */}
        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6">Judge Feedback</h3>
          <div className="space-y-4">
            {results.judges.map((judge, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-lg">{judge.name}</div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-blue-400">L: {judge.scores.logic}</span>
                    <span className="text-purple-400">E: {judge.scores.evidence}</span>
                    <span className="text-orange-400">R: {judge.scores.rhetoric}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{judge.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="p-8 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-xl transition"
          >
            Start New Debate
          </button>
        </div>
      </div>
    </div>
  );
}
