import { useState, useEffect } from 'react';
import { getTopics } from '../api/client';

interface Topic {
  id: number;
  topic: string;
  category: string;
  difficulty: string;
}

interface TopicSelectionProps {
  onSelectTopic: (topicId: number, position: 'FOR' | 'AGAINST') => void;
}

export default function TopicSelection({ onSelectTopic }: TopicSelectionProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (position: 'FOR' | 'AGAINST') => {
    if (selectedTopic) {
      onSelectTopic(selectedTopic, position);
    }
  };

  const handleRandom = () => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomPosition = Math.random() > 0.5 ? 'FOR' : 'AGAINST';
    onSelectTopic(randomTopic.id, randomPosition);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl">Loading topics...</div>
      </div>
    );
  }

  const selectedTopicData = topics.find(t => t.id === selectedTopic);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">🥊 Debate Arena</h1>
        <p className="text-xl text-gray-300">Choose your battlefield</p>
      </div>

      {!selectedTopic ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className="p-6 bg-gradient-to-br from-purple-800/50 to-blue-800/50 rounded-lg border-2 border-purple-500/30 hover:border-purple-400 transition text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs px-2 py-1 bg-purple-600/50 rounded">{topic.category}</span>
                  <span className="text-xs px-2 py-1 bg-blue-600/50 rounded capitalize">{topic.difficulty}</span>
                </div>
                <h3 className="text-lg font-semibold mt-2">{topic.topic}</h3>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleRandom}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-bold text-xl hover:scale-105 transition shadow-lg"
            >
              🎲 Random Topic & Position
            </button>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 border-2 border-purple-500/50">
          <h2 className="text-3xl font-bold mb-4">{selectedTopicData?.topic}</h2>
          <div className="flex gap-4 mb-8">
            <span className="px-3 py-1 bg-purple-600/50 rounded">{selectedTopicData?.category}</span>
            <span className="px-3 py-1 bg-blue-600/50 rounded capitalize">{selectedTopicData?.difficulty}</span>
          </div>

          <p className="text-xl mb-8">Choose your position:</p>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <button
              onClick={() => handleStart('FOR')}
              className="p-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl hover:scale-105 transition shadow-xl"
            >
              <div className="text-6xl mb-4">✅</div>
              <div className="text-2xl font-bold">FOR</div>
              <div className="text-sm mt-2 opacity-75">Argue in favor</div>
            </button>

            <button
              onClick={() => handleStart('AGAINST')}
              className="p-8 bg-gradient-to-br from-red-600 to-pink-700 rounded-xl hover:scale-105 transition shadow-xl"
            >
              <div className="text-6xl mb-4">❌</div>
              <div className="text-2xl font-bold">AGAINST</div>
              <div className="text-sm mt-2 opacity-75">Argue against</div>
            </button>
          </div>

          <button
            onClick={() => setSelectedTopic(null)}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            ← Back to Topics
          </button>
        </div>
      )}
    </div>
  );
}
