#!/usr/bin/env node

/**
 * Debate Arena - Simple Integration Loader
 * Import this to enable debate functionality
 */

import {
  handleDebateCommand,
  handleDebateArgument,
  handleOpponentResponse,
  handleJudgeResponses,
  hasActiveDebate,
  getActiveDebate
} from './debate-handler.js';

export {
  handleDebateCommand,
  handleDebateArgument,
  handleOpponentResponse,
  handleJudgeResponses,
  hasActiveDebate,
  getActiveDebate
};

// Example usage:
/*

// In Clawdbot message handler:

import { handleDebateCommand, handleDebateArgument, hasActiveDebate } from './debate-arena/debate-integration.js';

// Handle commands
if (message.text?.startsWith('/debate')) {
  const result = await handleDebateCommand('/debate', userId);
  return result.message;
}

// Handle arguments during active debate
if (hasActiveDebate(userId) && message.voice) {
  // Transcribe voice
  const transcript = await transcribeVoice(message.voice);
  
  // Process argument
  const result = await handleDebateArgument(userId, transcript);
  
  if (result.needsOpponent) {
    // Spawn opponent agent
    const opponentResponse = await sessions_spawn({
      task: result.spawnInstructions.prompt,
      runTimeoutSeconds: 60
    });
    
    // Add opponent response
    const nextResult = await handleOpponentResponse(userId, opponentResponse);
    
    if (nextResult.needsJudging) {
      // Spawn 4 judges in parallel
      const judgePrompts = nextResult.spawnInstructions.prompts;
      const judgeResponses = await Promise.all(
        judgePrompts.map(judge => 
          sessions_spawn({
            task: judge.prompt,
            runTimeoutSeconds: 60
          })
        )
      );
      
      // Finalize
      const finalResult = await handleJudgeResponses(userId, judgeResponses);
      return finalResult.message;
    }
    
    return nextResult.message;
  }
}

*/
