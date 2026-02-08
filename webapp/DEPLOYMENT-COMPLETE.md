# Debate Arena - Complete Deployment Guide

## ✅ What's Built

### Backend (Railway)
- ✅ Full REST API with debate management
- ✅ Real AI opponent responses (OpenAI or Anthropic)
- ✅ 4 AI judges with scoring system
- ✅ Elo rating system with persistence
- ✅ Stats tracking (wins, losses, topic mastery)
- ✅ Graceful fallback to mock responses (works without AI API)

### Frontend (Vercel)
- ✅ React + TypeScript + Tailwind UI
- ✅ Real-time debate interface
- ✅ Topic selection and position choice
- ✅ Message exchange with AI opponent
- ✅ Judge scoring and feedback display
- ✅ Stats dashboard

## 🚀 Deployment Status

### Backend on Railway
**URL:** Get from Railway dashboard

#### Environment Variables (Optional):
```
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-xxxxx
AI_MODEL=claude-3-5-sonnet-20241022
```

**Note:** Backend works without AI config (uses mock responses for testing).

### Frontend on Vercel
**Environment Variables (Required):**
```
VITE_API_URL=https://your-railway-backend-url.railway.app
```

## 🔧 Enabling Real AI

The backend is already built to support real AI opponents and judges. To enable:

### Option 1: Anthropic (Recommended)
1. Get API key from https://console.anthropic.com
2. In Railway → Settings → Variables:
   ```
   AI_PROVIDER=anthropic
   AI_API_KEY=sk-ant-xxxxx
   AI_MODEL=claude-3-5-sonnet-20241022
   ```
3. Redeploy

### Option 2: OpenAI
1. Get API key from https://platform.openai.com
2. In Railway → Settings → Variables:
   ```
   AI_PROVIDER=openai
   AI_API_KEY=sk-xxxxx
   AI_MODEL=gpt-4
   ```
3. Redeploy

## 📊 Features

### Debate Flow
1. **Start Debate**
   - Choose topic (15 topics across 6 categories)
   - Choose position (FOR/AGAINST) or get random
   - System assigns you Round 1

2. **Exchange Arguments**
   - User presents argument
   - AI opponent responds
   - 4 rounds total (2 each)

3. **Judgment**
   - 4 AI judges evaluate the debate
   - Each scores Logic, Evidence, Rhetoric (0-10)
   - Judges vote for winner (HUMAN/AI/TIE)
   - Majority wins

4. **Results**
   - Average scores displayed
   - Individual judge feedback
   - Elo rating update (+/- based on outcome)
   - Stats tracked (wins, losses, topic mastery)

### Stats System
- **Elo Rating:** Starts at 1000, changes based on wins/losses
- **Topic Mastery:** Track performance by category
- **Win Rate:** Overall and per-topic
- **Persistence:** All stats saved to `data/debate-history.json` on backend

## 🧪 Testing Without AI

The backend works perfectly without AI configuration:
- Mock opponent responses (realistic debate arguments)
- Mock judge scores (varied, realistic feedback)
- Full Elo and stats tracking still works

This lets you:
- ✅ Test the full UX without API costs
- ✅ Demo the product
- ✅ Develop frontend features

## 🎯 Next Steps

### Production Ready:
- ✅ Add AI API key (optional, for real debates)
- ✅ Custom domain for frontend
- ✅ Custom domain for backend
- ⚠️ Consider persistence upgrade (Railway Volume or external DB for multi-instance)

### Future Enhancements:
- 🎤 Voice input integration (Web Speech API)
- 👥 User accounts and leaderboards
- 📱 Mobile app version
- 🔊 TTS for opponent responses
- 📈 Advanced analytics dashboard

## 💾 Data Persistence

**Current:** File-based storage (`data/debate-history.json`)
- ✅ Works great for single instance
- ✅ Survives deployments on Railway (ephemeral)
- ⚠️ Lost on Railway restart (unless using Volume)

**For Production:**
- Add Railway Volume for persistent `/app/data`
- Or migrate to PostgreSQL/MongoDB
- Or use Redis for session data

## 🐛 Troubleshooting

### Backend shows "AI Service: DISABLED"
- Expected if no AI_PROVIDER or AI_API_KEY set
- Backend will use mock responses
- Still fully functional for testing

### Frontend can't connect to backend
- Check VITE_API_URL is set correctly in Vercel
- Make sure Railway backend is deployed and public
- Check CORS (backend allows all origins currently)

### Stats not persisting between deployments
- Railway uses ephemeral filesystem
- Add a Volume in Railway Settings → Volumes
- Mount at `/app/data`

## 📞 Support

Issues? Check:
1. Railway logs for backend errors
2. Vercel logs for frontend errors
3. Browser console for API connection issues

---

**Built:** 2026-02-08
**Stack:** React + TypeScript + Express + AI (OpenAI/Anthropic)
