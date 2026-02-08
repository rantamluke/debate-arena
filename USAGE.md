# Debate Arena - Usage Guide

## Quick Start (From Clawdbot)

The Debate Arena is ready to use! Here's how to integrate it:

### Method 1: Direct Import (Recommended)

From your Clawdbot session, I can handle debate commands directly:

```
You: /debate
Me: [Starts debate, shows topic and position]

You: [Send voice message with your argument]
Me: [Transcribes, spawns opponent agent, shows response]

You: [Continue debating...]
Me: [Manages flow, spawns judges when complete, shows results]
```

### Method 2: Manual Testing

Test the system locally:

```bash
cd debate-arena

# See help
node debate.js help

# Start a debate
node debate.js start

# Check stats
node debate.js stats

# Test full flow
node debate-handler.js test-flow
```

## How It Works

### 1. Start Debate
```
User sends: /debate
→ System assigns random topic + position
→ User sees debate setup
```

### 2. User Arguments (Voice Preferred)
```
User sends: 🎤 Voice message
→ I transcribe using Whisper
→ Add to debate transcript
→ Spawn opponent agent if needed
```

### 3. Opponent Response
```
System spawns agent with debate context
→ Agent generates counter-argument
→ User sees opponent's response
→ User's turn to rebut
```

### 4. Judging Phase (After 4 rounds each)
```
System spawns 4 judge agents in parallel:
├─ Judge 1: Logic specialist
├─ Judge 2: Evidence specialist
├─ Judge 3: Rhetoric specialist
└─ Judge 4: Overall persuasion

Each judge scores independently:
- Logic: 0-10
- Evidence: 0-10
- Rhetoric: 0-10
- Winner: HUMAN/AI/TIE

→ Majority vote determines outcome
→ Detailed feedback provided
→ Elo rating updated
```

### 5. Results
```
User sees:
- Win/Loss/Tie verdict
- Vote breakdown (e.g., 3-1)
- Average scores across all dimensions
- Detailed feedback from each judge
- Updated Elo rating
- Updated stats
```

## Debate Structure

### Full Flow
1. **Opening Statement** (Human)
2. **Opponent Opening** (AI)
3. **Rebuttal 1** (Human responds to opponent)
4. **Opponent Rebuttal 1** (AI responds to human)
5. **Rebuttal 2** (Human)
6. **Opponent Rebuttal 2** (AI)
7. **Closing Statement** (Human)
8. **Opponent Closing** (AI)
9. **Judging** (4 AI judges)
10. **Results** (Scores, feedback, rating update)

**Total time:** ~10-15 minutes per debate

## Commands

| Command | Description |
|---------|-------------|
| `/debate` | Start a new debate with random topic |
| `/stats` | View your debate statistics |
| `/cancel` | Cancel current debate |
| `/help` | Show help message |

## Voice vs Text

### Voice (Recommended) 🎤
- **Faster** - Speak naturally
- **More engaging** - Feels like real debate
- **Builds actual skill** - Practice verbal argumentation
- **Auto-transcribed** - Converted to text automatically

### Text ⌨️
- **Also supported** - If you prefer typing
- **Takes longer** - But gives you time to edit
- **Same evaluation** - Judges treat both equally

## Progression System

### Elo Rating
- **Start:** 1000
- **Win:** +15 to +40 (based on opponent difficulty)
- **Loss:** -15 to -40
- **Tie:** Small adjustment

### Topic Mastery
Track performance by category:
- Politics
- Technology  
- Economics
- Ethics
- Philosophy
- Society
- Science
- Education
- Work

### Stats Tracked
- Total debates
- Win/Loss/Tie record
- Win rate percentage
- Average scores (Logic, Evidence, Rhetoric)
- Topic mastery breakdown
- Recent debate history

## Tips for Winning

### 🧠 Logic
- Structure your argument clearly
- Address opponent's points directly
- Avoid logical fallacies
- Build reasoning step-by-step

### 📊 Evidence
- Use specific examples
- Reference data/studies when possible
- Draw from real-world cases
- Anticipate counter-evidence

### 🗣️ Rhetoric
- Be persuasive, not just logical
- Use analogies and metaphors
- Appeal to values and principles
- Deliver with confidence (even in text!)

### 🎯 Strategy
- **Don't over-complicate** - Clear beats clever
- **Address weaknesses** - Don't ignore them
- **Build momentum** - Strong closing matters
- **Learn from judges** - Read feedback carefully

## Example Session

```
You: /debate

Me: 🎭 NEW DEBATE
Topic: Social media does more harm than good
Category: Society
Your Position: FOR

You: [🎤 2-min voice arguing FOR the position]

Me: ✅ Transcribed your opening
🤖 OPPONENT'S OPENING:
"While social media has notable downsides, the benefits..."
[Full response]

You: [🎤 1.5-min rebuttal]

Me: 🤖 OPPONENT'S REBUTTAL:
"The human makes valid points, however..."

[Continue for 4 rounds each]

Me: ⚖️ JUDGING IN PROGRESS...
[30-60 seconds]

Me: 🏆 YOU WIN!
Vote Breakdown: 3-1
Your Average Scores:
🧠 Logic: 8/10
📊 Evidence: 7/10
🗣️ Rhetoric: 9/10

[Detailed judge feedback]

Your Elo: 1000 → 1032
Record: 1W - 0L - 0T

Type /debate for another round!
```

## Files Created

```
debate-arena/
├── data/
│   ├── debate-history.json      # Your debate history
│   └── active-debates.json      # Current active debates
├── topics.json                  # 15 debate topics
├── debate-engine.js            # Core logic
├── bot-handler.js              # UI formatting
├── debate.js                   # Main integration
├── debate-handler.js           # Clawdbot integration
└── README.md                   # Overview
```

## Integration with Clawdbot

I can handle all debate commands automatically through the message handler.

**When you send:**
- `/debate` → I start a debate
- Voice message (during debate) → I transcribe + process
- Text message (during debate) → I process as argument
- `/stats` → I show your statistics

**Behind the scenes, I:**
1. Transcribe voice using Whisper skill
2. Spawn opponent agent with debate context
3. Spawn 4 judge agents in parallel
4. Compile results and update your stats
5. Format everything nicely for Telegram

**You just debate. I handle the rest.** 🥊

## Ready to Start?

Just say `/debate` and let's see what you've got! 🔥
