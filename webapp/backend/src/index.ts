/**
 * Debate Arena Backend API
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { topics } from './topics';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * GET /api/topics
 * Get all available debate topics
 */
app.get('/api/topics', (req, res) => {
  const { category, difficulty } = req.query;
  
  let filtered = topics;
  
  if (category) {
    filtered = filtered.filter((t: any) => t.category === category);
  }
  
  if (difficulty) {
    filtered = filtered.filter((t: any) => t.difficulty === difficulty);
  }
  
  res.json(filtered);
});

/**
 * POST /api/debate/start
 * Start a new debate
 */
app.post('/api/debate/start', async (req, res) => {
  try {
    const { topicId, position } = req.body;
    
    const topic = topics.find((t: any) => t.id === topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Randomly assign position if not specified
    const finalPosition = position || (Math.random() > 0.5 ? 'FOR' : 'AGAINST');
    
    // Create debate session
    const debateSession = {
      id: `debate_${Date.now()}`,
      topic,
      position: finalPosition,
      round: 1,
      totalRounds: 4,
      startTime: Date.now(),
      messages: []
    };
    
    res.json(debateSession);
  } catch (error) {
    console.error('Start debate error:', error);
    res.status(500).json({ error: 'Failed to start debate' });
  }
});

/**
 * POST /api/debate/message
 * Send a message in ongoing debate
 */
app.post('/api/debate/message', async (req, res) => {
  try {
    const { debateId, content } = req.body;
    
    // TODO: Integrate with debate-engine.js to generate opponent response
    // For now, return a mock response
    
    const opponentResponse = {
      id: `msg_${Date.now()}`,
      type: 'opponent',
      content: 'That\'s an interesting point. However, I would argue that historical evidence suggests otherwise. Consider how previous technological revolutions have created more jobs than they eliminated.',
      timestamp: Date.now()
    };
    
    res.json(opponentResponse);
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * POST /api/debate/end
 * End debate and get judge scores
 */
app.post('/api/debate/end', async (req, res) => {
  try {
    const { debateId, messages } = req.body;
    
    // TODO: Integrate with debate-engine.js to get judge scores
    // For now, return mock scores
    
    const scores = {
      judges: [
        {
          name: 'Judge A',
          scores: { logic: 8, evidence: 7, rhetoric: 9 },
          feedback: 'Strong logical structure and compelling rhetoric.'
        },
        {
          name: 'Judge B',
          scores: { logic: 7, evidence: 8, rhetoric: 7 },
          feedback: 'Good use of evidence, but could be more persuasive.'
        },
        {
          name: 'Judge C',
          scores: { logic: 9, evidence: 7, rhetoric: 8 },
          feedback: 'Excellent logical flow and reasoning.'
        },
        {
          name: 'Judge D',
          scores: { logic: 8, evidence: 9, rhetoric: 8 },
          feedback: 'Well-researched arguments with solid evidence.'
        }
      ],
      averageScores: { logic: 8, evidence: 7.75, rhetoric: 8 },
      winner: 'user',
      eloChange: +15
    };
    
    res.json(scores);
  } catch (error) {
    console.error('End debate error:', error);
    res.status(500).json({ error: 'Failed to end debate' });
  }
});

/**
 * GET /api/stats/:userId
 * Get user stats
 */
app.get('/api/stats/:userId', (req, res) => {
  // TODO: Implement persistent stats storage
  // For now, return mock stats
  
  const stats = {
    elo: 1247,
    totalDebates: 24,
    wins: 16,
    losses: 8,
    winRate: 67,
    currentStreak: 5,
    topicMastery: {
      Technology: { debates: 8, winRate: 75 },
      Society: { debates: 6, winRate: 67 },
      Economics: { debates: 5, winRate: 60 }
    }
  };
  
  res.json(stats);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🥊 Debate Arena API running on port ${PORT}`);
});
