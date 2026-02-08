# 🥊 Debate Arena Web App

Beautiful web interface for the Debate Arena debate training system.

## Features

- 🎨 **Modern UI** - Chat-style interface with speech bubbles
- 📚 **Topic Browser** - Filter by category and difficulty
- 📊 **Live Stats** - Elo rating, win rate, streaks
- 🎤 **Voice Input** - Speak your arguments (coming soon)
- 🏆 **Judge Feedback** - Detailed scoring after each debate
- 📈 **Progress Tracking** - Track your improvement over time

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- Responsive design

**Backend:**
- Express + TypeScript
- Integrates with existing debate-engine.js
- RESTful API

## Setup

### Prerequisites
- Node.js 18+
- npm or pnpm

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`

## API Endpoints

### Topics
- `GET /api/topics` - Get all topics (filter with ?category=X&difficulty=Y)

### Debate
- `POST /api/debate/start` - Start new debate
  ```json
  { "topicId": 1, "position": "FOR" }
  ```

- `POST /api/debate/message` - Send message and get opponent response
  ```json
  { "debateId": "debate_123", "content": "Your argument..." }
  ```

- `POST /api/debate/end` - End debate and get judge scores
  ```json
  { "debateId": "debate_123", "messages": [...] }
  ```

### Stats
- `GET /api/stats/:userId` - Get user stats

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Deploy (auto-detects Vite)

### Backend (Railway)
1. Push to GitHub
2. Create new Railway project
3. Connect repo
4. Set environment variables if needed
5. Deploy

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app
```

## TODO

- [ ] Integrate real debate-engine.js logic
- [ ] Implement voice recording/transcription
- [ ] Add persistent user sessions
- [ ] Implement topic browser page
- [ ] Add detailed stats page with charts
- [ ] Add achievements/badges
- [ ] Implement real-time opponent responses (streaming)
- [ ] Add debate history/replay

## Current Status

✅ UI Design complete  
✅ Frontend components built  
✅ Backend API scaffolded  
⏳ Integration with debate-engine.js pending  
⏳ Voice input pending  

## Screenshots

![Preview](../../preview.html) - See preview.html for visual mockup

---

Built with ❤️ by Nox & niQlas
