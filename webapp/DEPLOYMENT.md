# 🚀 Deployment Guide

## Was schon funktioniert ✅

- ✅ Frontend UI komplett (React + TailwindCSS)
- ✅ Backend API Struktur (Express + TypeScript)
- ✅ Mock-Daten für Tests
- ✅ Lokales Development Setup

## Was du noch machen musst 🔨

### 1. Frontend auf Vercel deployen

```bash
cd webapp/frontend

# .env erstellen (für Production)
echo "VITE_API_URL=https://dein-backend.railway.app" > .env

# Push zu GitHub
git add .
git commit -m "Add Debate Arena webapp"
git push

# Auf Vercel:
# 1. New Project → Import from GitHub
# 2. Select debate-arena repo
# 3. Root Directory: webapp/frontend
# 4. Framework Preset: Vite
# 5. Environment Variables:
#    VITE_API_URL = https://dein-backend.railway.app
# 6. Deploy!
```

### 2. Backend auf Railway deployen

```bash
cd webapp/backend

# .env erstellen
cp .env.example .env
# Fülle die Werte aus (siehe unten)

# Push zu GitHub (falls noch nicht)
git add .
git commit -m "Add backend"
git push

# Auf Railway:
# 1. New Project → Deploy from GitHub
# 2. Select debate-arena repo
# 3. Root Directory: webapp/backend
# 4. Add Service → Backend
# 5. Build Command: npm install && npm run build
# 6. Start Command: npm start
# 7. Environment Variables (siehe unten)
# 8. Deploy!
```

**Backend Environment Variables für Railway:**
```
PORT=3001
NODE_ENV=production
CLAWDBOT_GATEWAY_URL=http://localhost:18789  # (später anpassen)
CLAWDBOT_GATEWAY_TOKEN=dein-gateway-token
```

### 3. Domains verknüpfen

Nach dem Deployment:
1. Kopiere die Railway Backend-URL (z.B. `https://debate-arena-backend.railway.app`)
2. Gehe zu Vercel → Settings → Environment Variables
3. Update `VITE_API_URL` mit der Railway URL
4. Redeploy Frontend

### 4. Backend mit echter Debate Engine verbinden (später)

Aktuell läuft das Backend mit Mock-Daten. Um die echte AI-Integration zu aktivieren:

**Option A: Clawdbot Gateway lokal**
1. Clawdbot muss laufen auf Port 18789
2. Backend `.env` anpassen:
   ```
   CLAWDBOT_GATEWAY_URL=http://localhost:18789
   CLAWDBOT_GATEWAY_TOKEN=<dein-token>
   ```
3. Backend-Code erweitern um Clawdbot Sessions zu spawnen

**Option B: Clawdbot als Subagent**
1. Debate Engine direkt in Backend integrieren
2. Opponent + Judges als Clawdbot Subagents spawnen
3. Siehe `../../debate-engine.js` für Logik

## Testing Checklist

Vor dem Live-Gang teste:
- [ ] Frontend lädt auf Vercel
- [ ] Backend /health gibt 200 zurück
- [ ] GET /api/topics liefert Topics
- [ ] POST /api/debate/start funktioniert
- [ ] Frontend → Backend Communication klappt
- [ ] Keine CORS-Fehler
- [ ] Mobile-View sieht gut aus

## Known Issues

### CORS
Falls CORS-Fehler auftreten, im Backend `src/index.ts` prüfen:
```typescript
app.use(cors({
  origin: ['https://dein-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Environment Variables
- Frontend: Müssen mit `VITE_` prefixed sein
- Railway: Automatisch verfügbar via `process.env`
- Vercel: Unter Settings → Environment Variables setzen

## Nächste Features (TODO)

Nach Deployment können folgende Features gebaut werden:

### High Priority
- [ ] Echte AI-Integration (Opponent + Judges via Clawdbot)
- [ ] User Authentication (Simple Token-Based)
- [ ] Persistent Storage (PostgreSQL oder SQLite)
- [ ] Voice Recording (Browser MediaRecorder API)
- [ ] Transcription (Whisper API oder Browser Speech-to-Text)

### Medium Priority
- [ ] Topic Browser Page
- [ ] Detailed Stats Dashboard mit Charts
- [ ] Debate History & Replay
- [ ] Achievements/Badges System
- [ ] Leaderboard

### Nice to Have
- [ ] Real-time Streaming (Opponent antwortet live)
- [ ] Mobile App (React Native)
- [ ] Social Features (Share Debates)
- [ ] Custom Topics erstellen

## Support

Bei Problemen:
1. Check Browser Console (F12)
2. Check Railway Logs
3. Check Vercel Deployment Logs
4. Ping Nox im Chat 💪

---

**Status:** Ready for Deployment 🚀

Built by Nox & niQlas
