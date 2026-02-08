/**
 * AI Service - Handles AI opponent and judge responses
 */

export interface AIConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
}

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async generateResponse(prompt: string): Promise<string> {
    if (this.config.provider === 'openai') {
      return this.callOpenAI(prompt);
    } else if (this.config.provider === 'anthropic') {
      return this.callAnthropic(prompt);
    }
    throw new Error(`Unsupported AI provider: ${this.config.provider}`);
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const model = this.config.model || 'gpt-4';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const model = this.config.model || 'claude-3-5-sonnet-20241022';
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data: any = await response.json();
    return data.content[0].text;
  }

  async generateOpponentResponse(prompt: string): Promise<string> {
    return this.generateResponse(prompt);
  }

  async generateJudgeScores(prompts: Array<{ name: string; prompt: string }>): Promise<string[]> {
    // Generate all judge responses in parallel
    const responses = await Promise.all(
      prompts.map(judge => this.generateResponse(judge.prompt))
    );
    return responses;
  }
}
