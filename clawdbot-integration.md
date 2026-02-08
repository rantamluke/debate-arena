# Debate Arena - Clawdbot Integration Guide

## Overview

The Debate Arena integrates with Clawdbot through:
1. **Voice transcription** (Whisper skill)
2. **Agent spawning** (opponent + 4 judges)
3. **Message handling** (Telegram interface)

## Architecture

```
Telegram Message
    ↓
Clawdbot Main Session
    ↓
Debate Arena Handler
    ↓
├─ Voice → Whisper Transcription
├─ Spawn Opponent Agent
├─ Spawn 4 Judge Agents
└─ Compile Results
    ↓
Reply to User
```

## Integration Points

### 1. Voice Message Handling

When user sends voice message during active debate:
```javascript
// Detect voice message
if (message.voice && arena.hasActiveDebate(userId)) {
  // Download voice file
  const voiceFile = await downloadVoiceMessage(message);
  
  // Transcribe with Whisper
  const transcript = await transcribeAudio(voiceFile);
  
  // Process in debate
  const result = await arena.processHumanArgument(userId, transcript);
  
  // Handle next steps...
}
```

### 2. Opponent Response via Agent

```javascript
if (result.needsOpponent) {
  const opponentPrompt = arena.getOpponentPrompt(userId);
  
  // Spawn agent for opponent
  const response = await sessions_spawn({
    task: opponentPrompt,
    agentId: 'debate-opponent',
    runTimeoutSeconds: 60
  });
  
  // Add opponent response
  const nextResult = arena.addOpponentResponse(userId, response);
  
  // Send to user
  await sendMessage(userId, nextResult.message);
}
```

### 3. Judging via 4 Parallel Agents

```javascript
if (result.needsJudging) {
  const judgePrompts = arena.getJudgePrompts(userId);
  
  // Spawn all 4 judges in parallel
  const judgeResponses = await Promise.all(
    judgePrompts.map(judge => 
      sessions_spawn({
        task: judge.prompt,
        agentId: 'debate-judge',
        runTimeoutSeconds: 60
      })
    )
  );
  
  // Finalize debate with results
  const finalResult = arena.finalizeDebate(userId, judgeResponses);
  
  // Send results
  await sendMessage(userId, finalResult.message);
}
```

## Command Handlers

### /debate
Start new debate
```javascript
const result = arena.startDebate(userId);
await sendMessage(userId, result.message);
```

### /stats
Show user statistics
```javascript
const result = arena.getStats(userId);
await sendMessage(userId, result.message);
```

### /cancel
Cancel active debate
```javascript
const result = arena.cancelDebate(userId);
await sendMessage(userId, result.message);
```

### /help
Show help
```javascript
const result = arena.getHelp();
await sendMessage(userId, result.message);
```

## Full Flow Example

```
User: /debate
Bot: [Topic + Position message]

User: [Voice message - opening statement]
Bot: [Transcribing...]
Bot: [Opponent's opening statement]

User: [Voice message - rebuttal]
Bot: [Opponent's rebuttal]

User: [Voice message - closing]
Bot: [Opponent's closing]
Bot: [Judging in progress...]
Bot: [Full results with scores and feedback]
```

## File Structure

```
debate-arena/
├── README.md                    # Project overview
├── topics.json                  # Debate topics database
├── debate-engine.js            # Core debate logic
├── bot-handler.js              # Telegram interface helpers
├── debate.js                   # Main integration class
├── clawdbot-integration.md     # This file
├── debate-commands.js          # Command handlers (to be created)
└── data/
    ├── debate-history.json     # User debate history
    └── active-debates.json     # Currently active debates
```

## Next Steps

1. Create `debate-commands.js` - Command handler for Clawdbot
2. Integrate with openai-whisper skill for voice transcription
3. Set up agent spawning for opponent and judges
4. Test full flow end-to-end
5. Add error handling and edge cases
6. Polish UI/UX messages

## Testing

```bash
# Test debate start
node debate.js start

# Test stats
node debate.js stats

# Test help
node debate.js help
```

## Notes

- Voice messages are preferred but text input works too
- Judges spawn in parallel for speed (~30-60 seconds total)
- Opponent responses take ~10-20 seconds
- All data persists across sessions
- Elo rating system tracks long-term progress
