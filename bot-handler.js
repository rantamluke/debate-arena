#!/usr/bin/env node

/**
 * Debate Arena Bot Handler
 * Manages Telegram interface for debates
 */

import { DebateEngine } from './debate-engine.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ACTIVE_DEBATES_FILE = './data/active-debates.json';

export class DebateBot {
  constructor() {
    this.engine = new DebateEngine();
    this.activeDebates = this.loadActiveDebates();
  }

  loadActiveDebates() {
    if (existsSync(ACTIVE_DEBATES_FILE)) {
      return JSON.parse(readFileSync(ACTIVE_DEBATES_FILE, 'utf-8'));
    }
    return {};
  }

  saveActiveDebates() {
    writeFileSync(ACTIVE_DEBATES_FILE, JSON.stringify(this.activeDebates, null, 2));
  }

  hasActiveDebate(userId) {
    return this.activeDebates[userId] !== undefined;
  }

  getActiveDebate(userId) {
    return this.activeDebates[userId];
  }

  setActiveDebate(userId, debate) {
    this.activeDebates[userId] = debate;
    this.saveActiveDebates();
  }

  clearActiveDebate(userId) {
    delete this.activeDebates[userId];
    this.saveActiveDebates();
  }

  formatTopicMessage(topic, position) {
    return `🎭 **NEW DEBATE**

📌 **Topic:** ${topic.topic}
🏷️ **Category:** ${topic.category}
⚡ **Difficulty:** ${topic.difficulty}

🎯 **Your Position:** ${position}

**You will argue ${position} this topic.**

Ready to start? Send your opening statement!

🎤 **Use voice message** (recommended)
⌨️ **Or type** your argument

⏱️ You have up to 2 minutes for your opening.`;
  }

  formatOpponentResponse(content, round) {
    return `🤖 **OPPONENT'S ${round}**

${content}

---

🎤 **Your turn!** Record your response.`;
  }

  formatJudgingMessage() {
    return `⚖️ **JUDGING IN PROGRESS...**

Four independent judges are now evaluating the debate:
- 🧠 Judge 1: Logic specialist
- 📊 Judge 2: Evidence specialist
- 🗣️ Judge 3: Rhetoric specialist
- 🎯 Judge 4: Overall persuasion

This will take about 30-60 seconds...`;
  }

  formatResults(debate, results) {
    const { outcome, voteBreakdown, averageScores, judgeDetails } = results;
    
    let outcomeEmoji = '🤝';
    let outcomeText = 'TIE';
    if (outcome === 'WIN') {
      outcomeEmoji = '🏆';
      outcomeText = 'YOU WIN!';
    } else if (outcome === 'LOSS') {
      outcomeEmoji = '💪';
      outcomeText = 'OPPONENT WINS';
    }

    let message = `${outcomeEmoji} **${outcomeText}**

📊 **VOTE BREAKDOWN**
You: ${voteBreakdown.human} | Opponent: ${voteBreakdown.ai} | Tie: ${voteBreakdown.tie}

📈 **YOUR AVERAGE SCORES**
🧠 Logic: ${averageScores.logic}/10
📊 Evidence: ${averageScores.evidence}/10
🗣️ Rhetoric: ${averageScores.rhetoric}/10

---

**JUDGE FEEDBACK:**

`;

    judgeDetails.forEach((judge, i) => {
      message += `**Judge ${i + 1}:** ${judge.winner === 'HUMAN' ? '✅ YOU' : judge.winner === 'AI' ? '❌ OPPONENT' : '🤝 TIE'}
Logic: ${judge.logic}/10 | Evidence: ${judge.evidence}/10 | Rhetoric: ${judge.rhetoric}/10
💬 ${judge.feedback.substring(0, 200)}${judge.feedback.length > 200 ? '...' : ''}

`;
    });

    // Add stats
    const stats = this.engine.getStats();
    message += `---

📊 **YOUR STATS**
🎯 Elo Rating: ${stats.eloRating}
📈 Total Debates: ${stats.totalDebates}
🏆 Record: ${stats.wins}W - ${stats.losses}L - ${stats.ties}T

Type /debate to start a new debate!`;

    return message;
  }

  formatStatsMessage() {
    const stats = this.engine.getStats();
    
    let message = `📊 **YOUR DEBATE STATS**

🎯 **Elo Rating:** ${stats.eloRating}
📈 **Total Debates:** ${stats.totalDebates}
🏆 **Record:** ${stats.wins}W - ${stats.losses}L - ${stats.ties}T

**Win Rate:** ${stats.totalDebates > 0 ? Math.round((stats.wins / stats.totalDebates) * 100) : 0}%

`;

    if (Object.keys(stats.topicMastery).length > 0) {
      message += `\n**📚 TOPIC MASTERY**\n`;
      Object.entries(stats.topicMastery)
        .sort((a, b) => b[1].avgScore - a[1].avgScore)
        .forEach(([topic, data]) => {
          const winRate = Math.round((data.wins / data.debates) * 100);
          message += `${topic}: ${data.debates} debates, ${winRate}% win rate, avg score ${data.avgScore}/30\n`;
        });
    }

    const recent = this.engine.getRecentDebates(3);
    if (recent.length > 0) {
      message += `\n**🕐 RECENT DEBATES**\n`;
      recent.forEach(d => {
        const emoji = d.results.outcome === 'WIN' ? '🏆' : d.results.outcome === 'LOSS' ? '💪' : '🤝';
        message += `${emoji} ${d.topic} (${d.category})\n`;
      });
    }

    return message;
  }

  formatHelpMessage() {
    return `🥊 **DEBATE ARENA - HOW TO PLAY**

**Start a Debate:**
Type /debate to get a random topic

**During Debate:**
1. You'll get a topic and position (FOR or AGAINST)
2. Record your opening statement (🎤 voice recommended)
3. AI opponent responds
4. You rebut their argument
5. AI rebuts your argument
6. You give closing statement
7. AI gives closing statement
8. 4 judges evaluate and declare winner

**Rounds:**
- Opening Statement (2 min max)
- Rebuttal 1 (1.5 min max)
- Rebuttal 2 (1.5 min max)
- Closing Statement (2 min max)

**Tips:**
🎤 Use voice - it's faster and more natural
🧠 Address opponent's points directly
📊 Use examples and evidence
🗣️ Be persuasive, not just logical

**Commands:**
/debate - Start new debate
/stats - View your statistics
/help - Show this message

**Progression:**
- Start at 1000 Elo
- Win debates to increase rating
- Track mastery across topics
- Improve your argumentation skills

Ready to debate? Type /debate!`;
  }

  // Helper to determine debate stage
  getDebateStage(debate) {
    const rounds = debate.rounds.length;
    
    if (rounds === 0) return 'opening';
    if (rounds === 1) return 'opponent_opening';
    if (rounds === 2) return 'rebuttal1';
    if (rounds === 3) return 'opponent_rebuttal1';
    if (rounds === 4) return 'rebuttal2';
    if (rounds === 5) return 'opponent_rebuttal2';
    if (rounds === 6) return 'closing';
    if (rounds === 7) return 'opponent_closing';
    return 'judging';
  }

  getStageLabel(stage) {
    const labels = {
      'opening': 'OPENING STATEMENT',
      'opponent_opening': 'OPPONENT OPENING',
      'rebuttal1': 'REBUTTAL 1',
      'opponent_rebuttal1': 'OPPONENT REBUTTAL 1',
      'rebuttal2': 'REBUTTAL 2',
      'opponent_rebuttal2': 'OPPONENT REBUTTAL 2',
      'closing': 'CLOSING STATEMENT',
      'opponent_closing': 'OPPONENT CLOSING',
      'judging': 'JUDGING'
    };
    return labels[stage] || stage;
  }
}
