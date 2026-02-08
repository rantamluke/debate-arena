#!/usr/bin/env node

/**
 * Debate Arena - Clawdbot Message Handler
 * Main entry point for handling debate messages in Clawdbot
 */

import { DebateArena } from './debate.js';
import { existsSync } from 'fs';
import { join } from 'path';

// Global arena instance
let arenaInstance = null;

export function getArena() {
  if (!arenaInstance) {
    arenaInstance = new DebateArena();
  }
  return arenaInstance;
}

/**
 * Handle debate commands from Telegram
 * Called by Clawdbot when user sends debate-related messages
 */
export async function handleDebateCommand(command, userId, messageText = null, voiceTranscript = null) {
  const arena = getArena();

  try {
    switch (command) {
      case '/debate':
      case '/debate_start':
        return arena.startDebate(userId);

      case '/stats':
      case '/debate_stats':
        return arena.getStats(userId);

      case '/help':
      case '/debate_help':
        return arena.getHelp();

      case '/cancel':
      case '/debate_cancel':
        return arena.cancelDebate(userId);

      default:
        return {
          error: true,
          message: 'Unknown command. Try /debate, /stats, or /help'
        };
    }
  } catch (error) {
    console.error('Debate command error:', error);
    return {
      error: true,
      message: 'Something went wrong. Please try again.'
    };
  }
}

/**
 * Handle user's debate argument (voice or text)
 * Returns instructions for spawning opponent agent if needed
 */
export async function handleDebateArgument(userId, transcript) {
  const arena = getArena();

  try {
    if (!arena.hasActiveDebate(userId)) {
      return {
        error: true,
        message: 'No active debate. Start one with /debate'
      };
    }

    const result = await arena.processHumanArgument(userId, transcript);

    if (result.error) {
      return result;
    }

    // Return result with instructions for next steps
    return {
      success: true,
      needsOpponent: result.needsOpponent,
      needsJudging: false,
      debate: result.debate,
      // Instructions for Clawdbot to spawn opponent
      spawnInstructions: result.needsOpponent ? {
        type: 'opponent',
        prompt: arena.getOpponentPrompt(userId)
      } : null
    };
  } catch (error) {
    console.error('Debate argument error:', error);
    return {
      error: true,
      message: 'Error processing your argument. Please try again.'
    };
  }
}

/**
 * Handle opponent response from spawned agent
 * Returns instructions for judging if debate is complete
 */
export async function handleOpponentResponse(userId, opponentResponse) {
  const arena = getArena();

  try {
    const result = arena.addOpponentResponse(userId, opponentResponse);

    if (result.error) {
      return result;
    }

    // If judging needed, return judge prompts
    if (result.needsJudging) {
      return {
        success: true,
        needsJudging: true,
        message: result.message,
        spawnInstructions: {
          type: 'judges',
          prompts: arena.getJudgePrompts(userId)
        }
      };
    }

    // Otherwise, user's turn to respond
    return {
      success: true,
      message: result.message,
      needsUserResponse: true
    };
  } catch (error) {
    console.error('Opponent response error:', error);
    return {
      error: true,
      message: 'Error processing opponent response.'
    };
  }
}

/**
 * Handle judge responses and finalize debate
 */
export async function handleJudgeResponses(userId, judgeResponses) {
  const arena = getArena();

  try {
    const result = arena.finalizeDebate(userId, judgeResponses);
    return result;
  } catch (error) {
    console.error('Judge responses error:', error);
    return {
      error: true,
      message: 'Error processing judge responses.'
    };
  }
}

/**
 * Check if user has active debate
 */
export function hasActiveDebate(userId) {
  const arena = getArena();
  return arena.hasActiveDebate(userId);
}

/**
 * Get active debate info
 */
export function getActiveDebate(userId) {
  const arena = getArena();
  return arena.getActiveDebate(userId);
}

// CLI test interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const userId = 'test-user';

  (async () => {
    if (command === 'start') {
      const result = await handleDebateCommand('/debate', userId);
      console.log(result.message);
    } else if (command === 'stats') {
      const result = await handleDebateCommand('/stats', userId);
      console.log(result.message);
    } else if (command === 'help') {
      const result = await handleDebateCommand('/help', userId);
      console.log(result.message);
    } else if (command === 'test-flow') {
      // Test complete flow
      console.log('=== Testing Debate Flow ===\n');
      
      // Start
      console.log('1. Starting debate...');
      const startResult = await handleDebateCommand('/debate', userId);
      console.log(startResult.message);
      console.log('\n---\n');

      // Simulate human argument
      console.log('2. Human opening statement...');
      const argResult = await handleDebateArgument(
        userId, 
        'I believe this position is correct because of three key reasons: evidence, logic, and real-world impact.'
      );
      console.log('Needs opponent:', argResult.needsOpponent);
      console.log('Opponent prompt:', argResult.spawnInstructions?.prompt?.substring(0, 100) + '...');
      console.log('\n---\n');

      // Simulate opponent (would be from agent)
      console.log('3. Opponent response...');
      const oppResult = await handleOpponentResponse(
        userId,
        'I disagree with the human\'s position. While they mention evidence, the actual data shows...'
      );
      console.log(oppResult.message);
      console.log('\n---\n');

      // Continue would follow same pattern...
      console.log('(Flow continues with rebuttals and closing statements...)');
      
    } else {
      console.log('Usage: node debate-handler.js [start|stats|help|test-flow]');
    }
  })();
}
