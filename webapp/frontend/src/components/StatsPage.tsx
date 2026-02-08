import { useState, useEffect } from 'react';
import { getStats } from '../api/client';

interface StatsData {
  elo: number;
  totalDebates: number;
  wins: number;
  losses: number;
  ties: number;
  winRate: number;
  averageScores: {
    logic: number;
    evidence: number;
    rhetoric: number;
  };
  trends: {
    logic: number;
    evidence: number;
    rhetoric: number;
  };
  topicMastery: Array<{
    category: string;
    debates: number;
    wins: number;
    winRate: number;
    avgScore: number;
  }>;
  history: Array<{
    id: number;
    topic: string;
    category: string;
    position: string;
    outcome: string;
    scores: {
      logic: number;
      evidence: number;
      rhetoric: number;
    } | null;
    date: string;
  }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl mb-4">No stats available</div>
        <div className="text-gray-400">Complete your first debate to see stats!</div>
      </div>
    );
  }

  const getTrendIcon = (value: number) => {
    if (value > 0.3) return '📈';
    if (value < -0.3) return '📉';
    return '➡️';
  };

  const getTrendColor = (value: number) => {
    if (value > 0.3) return 'text-green-400';
    if (value < -0.3) return 'text-red-400';
    return 'text-gray-400';
  };

  const getOutcomeColor = (outcome: string) => {
    if (outcome === 'WIN') return 'bg-green-600/30 border-green-500';
    if (outcome === 'LOSS') return 'bg-red-600/30 border-red-500';
    return 'bg-gray-600/30 border-gray-500';
  };

  const getOutcomeIcon = (outcome: string) => {
    if (outcome === 'WIN') return '🏆';
    if (outcome === 'LOSS') return '❌';
    return '🤝';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">📊 Your Performance</h1>

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 p-6 rounded-lg border border-purple-500/30">
          <div className="text-gray-400 text-sm mb-2">Elo Rating</div>
          <div className="text-3xl font-bold">{stats.elo}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 p-6 rounded-lg border border-purple-500/30">
          <div className="text-gray-400 text-sm mb-2">Win Rate</div>
          <div className="text-3xl font-bold">{stats.winRate}%</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 p-6 rounded-lg border border-purple-500/30">
          <div className="text-gray-400 text-sm mb-2">Total Debates</div>
          <div className="text-3xl font-bold">{stats.totalDebates}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 p-6 rounded-lg border border-purple-500/30">
          <div className="text-gray-400 text-sm mb-2">Record</div>
          <div className="text-lg font-bold">
            <span className="text-green-400">{stats.wins}W</span>
            {' / '}
            <span className="text-red-400">{stats.losses}L</span>
            {stats.ties > 0 && <span className="text-gray-400"> / {stats.ties}T</span>}
          </div>
        </div>
      </div>

      {/* Average Scores with Trends */}
      <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border border-purple-500/30 mb-8">
        <h2 className="text-2xl font-bold mb-6">Average Scores</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logic */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">Logic</span>
              <span className={`text-sm ${getTrendColor(stats.trends.logic)}`}>
                {getTrendIcon(stats.trends.logic)} {stats.trends.logic > 0 ? '+' : ''}{stats.trends.logic}
              </span>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-4xl font-bold mb-2">{stats.averageScores.logic}</div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                  style={{ width: `${(stats.averageScores.logic / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">Evidence</span>
              <span className={`text-sm ${getTrendColor(stats.trends.evidence)}`}>
                {getTrendIcon(stats.trends.evidence)} {stats.trends.evidence > 0 ? '+' : ''}{stats.trends.evidence}
              </span>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-4xl font-bold mb-2">{stats.averageScores.evidence}</div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                  style={{ width: `${(stats.averageScores.evidence / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rhetoric */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">Rhetoric</span>
              <span className={`text-sm ${getTrendColor(stats.trends.rhetoric)}`}>
                {getTrendIcon(stats.trends.rhetoric)} {stats.trends.rhetoric > 0 ? '+' : ''}{stats.trends.rhetoric}
              </span>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-4xl font-bold mb-2">{stats.averageScores.rhetoric}</div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${(stats.averageScores.rhetoric / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          Trends show change vs previous 5 debates
        </div>
      </div>

      {/* Topic Mastery */}
      {stats.topicMastery.length > 0 && (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border border-purple-500/30 mb-8">
          <h2 className="text-2xl font-bold mb-6">Topic Mastery</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.topicMastery.map(tm => (
              <div key={tm.category} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-lg">{tm.category}</div>
                    <div className="text-sm text-gray-400">{tm.debates} debates</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{tm.winRate}%</div>
                    <div className="text-xs text-gray-400">win rate</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">{tm.wins}W</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-red-400">{tm.debates - tm.wins}L</span>
                  <span className="ml-auto text-gray-400">Avg: {tm.avgScore}/30</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debate History */}
      {stats.history.length > 0 && (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold mb-6">Recent Debates</h2>
          
          <div className="space-y-3">
            {stats.history.map(debate => (
              <div
                key={debate.id}
                className={`rounded-lg p-4 border ${getOutcomeColor(debate.outcome)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getOutcomeIcon(debate.outcome)}</span>
                      <span className="font-semibold">{debate.topic}</span>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-400">
                      <span>{debate.category}</span>
                      <span>•</span>
                      <span className="uppercase">{debate.position}</span>
                      <span>•</span>
                      <span>{new Date(debate.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {debate.scores && (
                  <div className="flex gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Logic:</span>
                      <span className="font-semibold">{debate.scores.logic}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Evidence:</span>
                      <span className="font-semibold">{debate.scores.evidence}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Rhetoric:</span>
                      <span className="font-semibold">{debate.scores.rhetoric}/10</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
