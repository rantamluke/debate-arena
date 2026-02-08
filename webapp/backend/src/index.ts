/**
 * Debate Arena Backend API
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { topics } from './topics';
import { DebateEngine } from './debate-engine';
import { AIService } from './ai-service';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const debateEngine = new DebateEngine(topics);

let aiService: AIService | null = null;
if (process.env.AI_PROVIDER && process.env.AI_API_KEY) {
  aiService = new AIService({
    provider: process.env.AI_PROVIDER as 'openai' | 'anthropic',
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL
  });
}

// In-memory debate sessions (in production, use Redis or DB)
const activeDebates: Map<string, any> = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    aiEnabled: aiService !== null
  });
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
    
    // Create debate using engine
    const debate = debateEngine.createDebate(topic, finalPosition);
    
    // Store in active debates
    const debateId = `debate_${debate.id}`;
    activeDebates.set(debateId, debate);
    
    res.json({
      id: debateId,
      topic: debate.topic,
      category: debate.category,
      difficulty: debate.difficulty,
      position: finalPosition,
      round: 1,
      totalRounds: 4,
      startTime: Date.now(),
      messages: []
    });
  } catch (error) {
    console.error('Start debate error:', error);
    res.status(500).json({ error: 'Failed to start debate' });
  }
});

/**
 * POST /api/debate/message
 * Send a message in ongoing debate and get opponent response
 */
app.post('/api/debate/message', async (req, res) => {
  try {
    const { debateId, content } = req.body;
    
    const debate = activeDebates.get(debateId);
    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }
    
    // Add human's message to debate
    debateEngine.addRound(debate, 'human', 'argument', content, content);
    
    // Generate opponent response
    let opponentContent: string;
    
    if (aiService) {
      // Use real AI
      const prompt = debateEngine.generateOpponentPrompt(debate);
      opponentContent = await aiService.generateOpponentResponse(prompt);
    } else {
      // Fallback to mock response
      opponentContent = getMockOpponentResponse(debate.rounds.length);
    }
    
    // Add opponent's response to debate
    debateEngine.addRound(debate, 'ai', 'rebuttal', opponentContent, opponentContent);
    
    // Save updated debate
    activeDebates.set(debateId, debate);
    
    const opponentResponse = {
      id: `msg_${Date.now()}`,
      type: 'opponent',
      content: opponentContent,
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
    const { debateId } = req.body;
    
    const debate = activeDebates.get(debateId);
    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }
    
    let judgeScores;
    
    if (aiService) {
      // Use real AI judges
      const judgePrompts = debateEngine.generateJudgePrompts(debate);
      const responses = await aiService.generateJudgeScores(judgePrompts);
      
      judgeScores = responses.map((response, i) => ({
        name: judgePrompts[i].name,
        ...debateEngine.parseJudgeResponse(response)
      }));
    } else {
      // Fallback to mock scores
      judgeScores = getMockJudgeScores();
    }
    
    // Calculate results
    const results = debateEngine.calculateResults(judgeScores);
    
    // Save debate result
    debateEngine.saveDebateResult(debate, results);
    
    // Remove from active debates
    activeDebates.delete(debateId);
    
    // Calculate Elo change
    const oldElo = debateEngine.getStats().eloRating - (results.outcome === 'WIN' ? 15 : results.outcome === 'LOSS' ? -15 : 0);
    const eloChange = debateEngine.getStats().eloRating - oldElo;
    
    res.json({
      judges: judgeScores.map(j => ({
        name: j.name,
        scores: {
          logic: j.logic,
          evidence: j.evidence,
          rhetoric: j.rhetoric
        },
        feedback: j.feedback
      })),
      averageScores: results.averageScores,
      voteBreakdown: results.voteBreakdown,
      winner: results.outcome === 'WIN' ? 'user' : results.outcome === 'LOSS' ? 'opponent' : 'tie',
      eloChange
    });
  } catch (error) {
    console.error('End debate error:', error);
    res.status(500).json({ error: 'Failed to end debate' });
  }
});

/**
 * GET /api/stats
 * Get user stats (using userId from query for multi-user support later)
 */
app.get('/api/stats', (req, res) => {
  const stats = debateEngine.getStats();
  const recentDebates = debateEngine.getRecentDebates(20);
  
  // Calculate average scores across all debates
  const debatesWithScores = recentDebates.filter(d => d.results?.averageScores);
  const avgScores = debatesWithScores.length > 0 ? {
    logic: Math.round(debatesWithScores.reduce((sum, d) => sum + (d.results.averageScores.logic || 0), 0) / debatesWithScores.length * 10) / 10,
    evidence: Math.round(debatesWithScores.reduce((sum, d) => sum + (d.results.averageScores.evidence || 0), 0) / debatesWithScores.length * 10) / 10,
    rhetoric: Math.round(debatesWithScores.reduce((sum, d) => sum + (d.results.averageScores.rhetoric || 0), 0) / debatesWithScores.length * 10) / 10
  } : { logic: 0, evidence: 0, rhetoric: 0 };
  
  // Calculate trends (last 5 vs previous 5)
  const last5 = debatesWithScores.slice(0, 5);
  const prev5 = debatesWithScores.slice(5, 10);
  
  const last5Avg = last5.length > 0 ? {
    logic: last5.reduce((sum, d) => sum + (d.results.averageScores.logic || 0), 0) / last5.length,
    evidence: last5.reduce((sum, d) => sum + (d.results.averageScores.evidence || 0), 0) / last5.length,
    rhetoric: last5.reduce((sum, d) => sum + (d.results.averageScores.rhetoric || 0), 0) / last5.length
  } : null;
  
  const prev5Avg = prev5.length > 0 ? {
    logic: prev5.reduce((sum, d) => sum + (d.results.averageScores.logic || 0), 0) / prev5.length,
    evidence: prev5.reduce((sum, d) => sum + (d.results.averageScores.evidence || 0), 0) / prev5.length,
    rhetoric: prev5.reduce((sum, d) => sum + (d.results.averageScores.rhetoric || 0), 0) / prev5.length
  } : null;
  
  const trends = (last5Avg && prev5Avg) ? {
    logic: Math.round((last5Avg.logic - prev5Avg.logic) * 10) / 10,
    evidence: Math.round((last5Avg.evidence - prev5Avg.evidence) * 10) / 10,
    rhetoric: Math.round((last5Avg.rhetoric - prev5Avg.rhetoric) * 10) / 10
  } : { logic: 0, evidence: 0, rhetoric: 0 };
  
  // Format debate history
  const history = recentDebates.map(d => ({
    id: d.id,
    topic: d.topic,
    category: d.category,
    position: d.humanPosition,
    outcome: d.results?.outcome || 'INCOMPLETE',
    scores: d.results?.averageScores || null,
    date: d.completedAt || d.startedAt
  }));
  
  const topicMasteryArray = Object.entries(stats.topicMastery).map(([category, data]: [string, any]) => ({
    category,
    debates: data.debates,
    wins: data.wins,
    winRate: data.debates > 0 ? Math.round((data.wins / data.debates) * 100) : 0,
    avgScore: data.avgScore
  }));
  
  res.json({
    elo: stats.eloRating,
    totalDebates: stats.totalDebates,
    wins: stats.wins,
    losses: stats.losses,
    ties: stats.ties,
    winRate: stats.totalDebates > 0 ? Math.round((stats.wins / stats.totalDebates) * 100) : 0,
    currentStreak: 0, // TODO: Calculate from recent debates
    averageScores: avgScores,
    trends,
    topicMastery: topicMasteryArray,
    history
  });
});

// Mock responses for when AI is not configured
function getMockOpponentResponse(roundNumber: number): string {
  const responses = [
    "While automation is advancing, history shows technology creates new jobs as it eliminates old ones. The Industrial Revolution automated farming but created factory jobs. The digital revolution eliminated typists but created software developers. We're not seeing mass unemployment—we're seeing job transformation. AI will augment human workers, not replace them entirely.",
    "Your points about historical job creation are valid for previous technological shifts, but AI is fundamentally different. Unlike past automation that replaced physical labor, AI can replicate cognitive tasks—the very thing that made humans irreplaceable. When AI can write, analyze, create art, and make decisions, what uniquely human skills remain in the job market?",
    "The human elements of creativity, emotional intelligence, ethical judgment, and complex problem-solving in ambiguous situations remain beyond AI's reach. AI excels at pattern recognition and optimization within defined parameters, but struggles with novel situations requiring genuine understanding. The jobs of 2030 will require these uniquely human capabilities, with AI as a tool to enhance productivity.",
    "That's a compelling argument about human uniqueness, but it assumes AI capabilities will plateau. Current AI development shows rapid advancement in creative tasks, emotional analysis, and even ethical reasoning. If AI continues this trajectory, the 'uniquely human' capabilities you mention may not remain exclusive for long. We must prepare for a future where human cognitive advantage narrows significantly."
  ];
  
  return responses[Math.min(roundNumber - 1, responses.length - 1)];
}

function getMockJudgeScores() {
  return [
    {
      name: 'Judge 1 - Logic',
      logic: 8,
      evidence: 7,
      rhetoric: 9,
      winner: 'HUMAN' as const,
      feedback: 'Strong logical structure and compelling rhetoric. The arguments were well-reasoned and built upon each other effectively.'
    },
    {
      name: 'Judge 2 - Evidence',
      logic: 7,
      evidence: 8,
      rhetoric: 7,
      winner: 'HUMAN' as const,
      feedback: 'Good use of evidence and historical examples. Could have benefited from more recent data points.'
    },
    {
      name: 'Judge 3 - Rhetoric',
      logic: 9,
      evidence: 7,
      rhetoric: 8,
      winner: 'HUMAN' as const,
      feedback: 'Excellent persuasive technique. The progression of arguments was natural and convincing.'
    },
    {
      name: 'Judge 4 - Overall',
      logic: 8,
      evidence: 9,
      rhetoric: 8,
      winner: 'TIE' as const,
      feedback: 'Both sides presented strong arguments. The human showed slightly better adaptation to opponent points, but the AI maintained consistency. Very close debate.'
    }
  ];
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🥊 Debate Arena API running on port ${PORT}`);
  console.log(`AI Service: ${aiService ? 'ENABLED' : 'DISABLED (using mock responses)'}`);
});
