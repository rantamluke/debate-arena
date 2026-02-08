#!/usr/bin/env node

/**
 * Debate Arena Engine
 * Orchestrates debates between human and AI with multi-judge evaluation
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = './data';
const HISTORY_FILE = join(DATA_DIR, 'debate-history.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export class DebateEngine {
  constructor() {
    this.topics = JSON.parse(readFileSync('./topics.json', 'utf-8'));
    this.history = this.loadHistory();
  }

  loadHistory() {
    if (existsSync(HISTORY_FILE)) {
      return JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
    }
    return {
      debates: [],
      stats: {
        totalDebates: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        eloRating: 1000,
        topicMastery: {}
      }
    };
  }

  saveHistory() {
    writeFileSync(HISTORY_FILE, JSON.stringify(this.history, null, 2));
  }

  getRandomTopic(difficulty = null) {
    let pool = this.topics;
    if (difficulty) {
      pool = this.topics.filter(t => t.difficulty === difficulty);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  getTopicById(id) {
    return this.topics.find(t => t.id === id);
  }

  createDebate(topic, humanPosition) {
    const debate = {
      id: Date.now(),
      topic: topic.topic,
      category: topic.category,
      difficulty: topic.difficulty,
      humanPosition,
      aiPosition: humanPosition === 'FOR' ? 'AGAINST' : 'FOR',
      rounds: [],
      status: 'active',
      startedAt: new Date().toISOString()
    };
    
    return debate;
  }

  addRound(debate, speaker, type, content, transcript = null) {
    debate.rounds.push({
      speaker,
      type,
      content,
      transcript,
      timestamp: new Date().toISOString()
    });
  }

  generateOpponentPrompt(debate) {
    return `You are a skilled debater in the Debate Arena.

**Topic:** ${debate.topic}
**Your Position:** ${debate.aiPosition}
**Your Goal:** Present a compelling argument for your position

**Debate History So Far:**
${this.formatDebateHistory(debate)}

**Instructions:**
- Be persuasive but fair
- Use logic, evidence, and rhetoric
- Address the opponent's points directly
- Keep your response under 300 words
- Stay focused on the topic

**Now present your argument:**`;
  }

  formatDebateHistory(debate) {
    if (debate.rounds.length === 0) {
      return "(No arguments yet - you're going first)";
    }
    
    return debate.rounds.map((r, i) => {
      const speaker = r.speaker === 'human' ? 'OPPONENT' : 'YOU';
      return `${i + 1}. ${speaker} (${r.type}):\n${r.transcript || r.content}`;
    }).join('\n\n');
  }

  generateJudgePrompts(debate) {
    const fullTranscript = this.formatDebateHistory(debate);
    
    const basePrompt = `You are Judge #{N} in the Debate Arena. You will evaluate a debate and provide an impartial score.

**Topic:** ${debate.topic}
**Human Position:** ${debate.humanPosition}
**AI Position:** ${debate.aiPosition}

**Full Debate Transcript:**
${fullTranscript}

**Your Evaluation Criteria:**
{CRITERIA}

**Instructions:**
- Score each dimension from 0-10 (integers only)
- Be fair and objective
- Provide specific feedback on strengths and weaknesses
- Declare a winner: HUMAN or AI (or TIE if truly equal)

**Format your response EXACTLY as:**
\`\`\`
SCORES:
Logic: X/10
Evidence: X/10
Rhetoric: X/10

WINNER: [HUMAN/AI/TIE]

FEEDBACK:
[Your detailed feedback here]
\`\`\``;

    return [
      {
        name: 'Judge 1 - Logic',
        criteria: '**Logic (60% weight):** Argument structure, reasoning validity, logical consistency\n**Evidence (20% weight):** Use of facts and examples\n**Rhetoric (20% weight):** Persuasiveness',
        prompt: basePrompt.replace('{N}', '1').replace('{CRITERIA}', '**Logic (60% weight):** Argument structure, reasoning validity, logical consistency\n**Evidence (20% weight):** Use of facts and examples\n**Rhetoric (20% weight):** Persuasiveness')
      },
      {
        name: 'Judge 2 - Evidence',
        criteria: '**Evidence (60% weight):** Quality and relevance of facts, examples, and data\n**Logic (20% weight):** Reasoning structure\n**Rhetoric (20% weight):** Delivery',
        prompt: basePrompt.replace('{N}', '2').replace('{CRITERIA}', '**Evidence (60% weight):** Quality and relevance of facts, examples, and data\n**Logic (20% weight):** Reasoning structure\n**Rhetoric (20% weight):** Delivery')
      },
      {
        name: 'Judge 3 - Rhetoric',
        criteria: '**Rhetoric (60% weight):** Persuasiveness, emotional appeal, communication effectiveness\n**Logic (20% weight):** Reasoning quality\n**Evidence (20% weight):** Use of support',
        prompt: basePrompt.replace('{N}', '3').replace('{CRITERIA}', '**Rhetoric (60% weight):** Persuasiveness, emotional appeal, communication effectiveness\n**Logic (20% weight):** Reasoning quality\n**Evidence (20% weight):** Use of support')
      },
      {
        name: 'Judge 4 - Overall',
        criteria: '**Overall Persuasion:** Equal weight to Logic (33%), Evidence (33%), and Rhetoric (33%)\nConsider the debate holistically',
        prompt: basePrompt.replace('{N}', '4').replace('{CRITERIA}', '**Overall Persuasion:** Equal weight to Logic (33%), Evidence (33%), and Rhetoric (33%)\nConsider the debate holistically')
      }
    ];
  }

  parseJudgeResponse(response) {
    try {
      const scores = {
        logic: 0,
        evidence: 0,
        rhetoric: 0,
        winner: 'TIE',
        feedback: ''
      };

      // Extract logic score
      const logicMatch = response.match(/Logic:\s*(\d+)/i);
      if (logicMatch) scores.logic = parseInt(logicMatch[1]);

      // Extract evidence score
      const evidenceMatch = response.match(/Evidence:\s*(\d+)/i);
      if (evidenceMatch) scores.evidence = parseInt(evidenceMatch[1]);

      // Extract rhetoric score
      const rhetoricMatch = response.match(/Rhetoric:\s*(\d+)/i);
      if (rhetoricMatch) scores.rhetoric = parseInt(rhetoricMatch[1]);

      // Extract winner
      const winnerMatch = response.match(/WINNER:\s*(HUMAN|AI|TIE)/i);
      if (winnerMatch) scores.winner = winnerMatch[1].toUpperCase();

      // Extract feedback
      const feedbackMatch = response.match(/FEEDBACK:\s*(.+)/is);
      if (feedbackMatch) scores.feedback = feedbackMatch[1].trim();

      return scores;
    } catch (error) {
      console.error('Failed to parse judge response:', error);
      return {
        logic: 5,
        evidence: 5,
        rhetoric: 5,
        winner: 'TIE',
        feedback: 'Unable to parse feedback'
      };
    }
  }

  calculateResults(judgeScores) {
    const humanVotes = judgeScores.filter(j => j.winner === 'HUMAN').length;
    const aiVotes = judgeScores.filter(j => j.winner === 'AI').length;
    const tieVotes = judgeScores.filter(j => j.winner === 'TIE').length;

    let outcome;
    if (humanVotes > aiVotes) {
      outcome = 'WIN';
    } else if (aiVotes > humanVotes) {
      outcome = 'LOSS';
    } else {
      outcome = 'TIE';
    }

    const avgScores = {
      logic: Math.round(judgeScores.reduce((sum, j) => sum + j.logic, 0) / judgeScores.length),
      evidence: Math.round(judgeScores.reduce((sum, j) => sum + j.evidence, 0) / judgeScores.length),
      rhetoric: Math.round(judgeScores.reduce((sum, j) => sum + j.rhetoric, 0) / judgeScores.length)
    };

    return {
      outcome,
      voteBreakdown: {
        human: humanVotes,
        ai: aiVotes,
        tie: tieVotes
      },
      averageScores: avgScores,
      judgeDetails: judgeScores
    };
  }

  updateElo(currentElo, outcome, opponentElo = 1000) {
    const K = 32; // K-factor (volatility)
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
    
    let actualScore;
    if (outcome === 'WIN') actualScore = 1;
    else if (outcome === 'LOSS') actualScore = 0;
    else actualScore = 0.5;

    const newElo = Math.round(currentElo + K * (actualScore - expectedScore));
    return newElo;
  }

  saveDebateResult(debate, results) {
    debate.status = 'completed';
    debate.completedAt = new Date().toISOString();
    debate.results = results;

    // Update history
    this.history.debates.push(debate);
    this.history.stats.totalDebates++;
    
    if (results.outcome === 'WIN') {
      this.history.stats.wins++;
    } else if (results.outcome === 'LOSS') {
      this.history.stats.losses++;
    } else {
      this.history.stats.ties++;
    }

    // Update Elo
    this.history.stats.eloRating = this.updateElo(
      this.history.stats.eloRating,
      results.outcome
    );

    // Update topic mastery
    if (!this.history.stats.topicMastery[debate.category]) {
      this.history.stats.topicMastery[debate.category] = {
        debates: 0,
        wins: 0,
        avgScore: 0
      };
    }
    const mastery = this.history.stats.topicMastery[debate.category];
    mastery.debates++;
    if (results.outcome === 'WIN') mastery.wins++;
    
    const totalScore = results.averageScores.logic + 
                       results.averageScores.evidence + 
                       results.averageScores.rhetoric;
    mastery.avgScore = Math.round(
      ((mastery.avgScore * (mastery.debates - 1)) + totalScore) / mastery.debates
    );

    this.saveHistory();
  }

  getStats() {
    return this.history.stats;
  }

  getRecentDebates(limit = 5) {
    return this.history.debates
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, limit);
  }
}
