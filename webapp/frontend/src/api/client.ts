/**
 * API Client for Debate Arena Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Topic {
  id: number
  topic: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface DebateSession {
  id: string
  topic: Topic
  position: 'FOR' | 'AGAINST'
  round: number
  totalRounds: number
  startTime: number
  messages: Message[]
}

export interface Message {
  id: string
  type: 'user' | 'opponent' | 'system'
  content: string
  timestamp: number
}

export interface JudgeScore {
  name: string
  scores: {
    logic: number
    evidence: number
    rhetoric: number
  }
  feedback: string
}

export interface DebateResult {
  judges: JudgeScore[]
  averageScores: {
    logic: number
    evidence: number
    rhetoric: number
  }
  winner: 'user' | 'opponent' | 'tie'
  eloChange: number
}

export interface UserStats {
  elo: number
  totalDebates: number
  wins: number
  losses: number
  winRate: number
  currentStreak: number
  topicMastery: Record<string, {
    debates: number
    winRate: number
  }>
}

class APIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_URL
  }

  async getTopics(category?: string, difficulty?: string): Promise<Topic[]> {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (difficulty) params.append('difficulty', difficulty)
    
    const url = `${this.baseUrl}/api/topics${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)
    return response.json()
  }

  async startDebate(topicId: number, position?: 'FOR' | 'AGAINST'): Promise<DebateSession> {
    const response = await fetch(`${this.baseUrl}/api/debate/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, position })
    })
    return response.json()
  }

  async sendMessage(debateId: string, content: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/api/debate/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ debateId, content })
    })
    return response.json()
  }

  async endDebate(debateId: string, messages: Message[]): Promise<DebateResult> {
    const response = await fetch(`${this.baseUrl}/api/debate/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ debateId, messages })
    })
    return response.json()
  }

  async getStats(userId: string = 'default'): Promise<UserStats> {
    const response = await fetch(`${this.baseUrl}/api/stats/${userId}`)
    return response.json()
  }
}

export const api = new APIClient()
