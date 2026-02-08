#!/usr/bin/env node

/**
 * Debate Arena - Main Integration
 * Handles the full debate workflow with agent spawning
 */

import { DebateEngine } from './debate-engine.js';
import { DebateBot } from './bot-handler.js';

export class DebateArena {
  constructor() {
    this.engine = new DebateEngine();
    this.bot = new DebateBot();
  }

  // Start a new debate
  startDebate(userId, topicId = null, position = null) {
    // Get topic
    const topic = topicId 
      ? this.engine.getTopicById(topicId)
      : this.engine.getRandomTopic();
    
    if (!topic) {
      return { error: 'Topic not found' };
    }

    // Assign position
    if (!position) {
      position = Math.random() > 0.5 ? 'FOR' : 'AGAINST';
    }

    // Create debate
    const debate = this.engine.createDebate(topic, position);
    this.bot.setActiveDebate(userId, debate);

    return {
      success: true,
      message: this.bot.formatTopicMessage(topic, position),
      debate
    };
  }

  // Process human's argument (transcribed from voice or text)
  async processHumanArgument(userId, transcript) {
    const debate = this.bot.getActiveDebate(userId);
    if (!debate) {
      return { error: 'No active debate. Start one with /debate' };
    }

    const stage = this.bot.getDebateStage(debate);
    
    // Add human's round
    this.engine.addRound(
      debate,
      'human',
      this.bot.getStageLabel(stage),
      transcript,
      transcript
    );

    this.bot.setActiveDebate(userId, debate);

    // Check if debate is complete (human finished closing)
    if (stage === 'closing') {
      // Need to get opponent's closing, then judge
      return {
        success: true,
        needsOpponent: true,
        debate
      };
    }

    // If it's a rebuttal or opening, opponent responds next
    if (['opening', 'rebuttal1', 'rebuttal2'].includes(stage)) {
      return {
        success: true,
        needsOpponent: true,
        debate
      };
    }

    return { success: true, debate };
  }

  // Generate opponent response (to be called via agent spawning)
  getOpponentPrompt(userId) {
    const debate = this.bot.getActiveDebate(userId);
    if (!debate) return null;
    
    return this.engine.generateOpponentPrompt(debate);
  }

  // Add opponent's response
  addOpponentResponse(userId, response) {
    const debate = this.bot.getActiveDebate(userId);
    if (!debate) return { error: 'No active debate' };

    const stage = this.bot.getDebateStage(debate);
    
    this.engine.addRound(
      debate,
      'ai',
      this.bot.getStageLabel(stage),
      response
    );

    this.bot.setActiveDebate(userId, debate);

    // Check if we need judging now
    if (stage === 'opponent_closing') {
      return {
        success: true,
        needsJudging: true,
        debate,
        message: this.bot.formatJudgingMessage()
      };
    }

    return {
      success: true,
      message: this.bot.formatOpponentResponse(response, this.bot.getStageLabel(stage)),
      debate
    };
  }

  // Get judge prompts
  getJudgePrompts(userId) {
    const debate = this.bot.getActiveDebate(userId);
    if (!debate) return null;
    
    return this.engine.generateJudgePrompts(debate);
  }

  // Process judge responses and finalize debate
  finalizeDebate(userId, judgeResponses) {
    const debate = this.bot.getActiveDebate(userId);
    if (!debate) return { error: 'No active debate' };

    // Parse all judge responses
    const judgeScores = judgeResponses.map(response => 
      this.engine.parseJudgeResponse(response)
    );

    // Calculate results
    const results = this.engine.calculateResults(judgeScores);

    // Save debate
    this.engine.saveDebateResult(debate, results);

    // Clear active debate
    this.bot.clearActiveDebate(userId);

    return {
      success: true,
      results,
      message: this.bot.formatResults(debate, results)
    };
  }

  // Get user stats
  getStats(userId) {
    return {
      success: true,
      message: this.bot.formatStatsMessage()
    };
  }

  // Get help
  getHelp() {
    return {
      success: true,
      message: this.bot.formatHelpMessage()
    };
  }

  // Cancel active debate
  cancelDebate(userId) {
    this.bot.clearActiveDebate(userId);
    return {
      success: true,
      message: '🛑 Debate cancelled. Type /debate to start a new one.'
    };
  }

  // Export for use in other modules
  hasActiveDebate(userId) {
    return this.bot.hasActiveDebate(userId);
  }

  getActiveDebate(userId) {
    return this.bot.getActiveDebate(userId);
  }
}

// CLI interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const arena = new DebateArena();
  const command = process.argv[2];

  if (command === 'start') {
    const result = arena.startDebate('test-user');
    console.log(result.message);
  } else if (command === 'stats') {
    const result = arena.getStats('test-user');
    console.log(result.message);
  } else if (command === 'help') {
    const result = arena.getHelp();
    console.log(result.message);
  } else {
    console.log('Usage: node debate.js [start|stats|help]');
  }
}
