// Embeddings module - vector conversion

export class Embeddings {
  private provider: 'openai' | 'ollama';
  private model: string;
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: { 
    provider: 'openai' | 'ollama'; 
    model?: string;
    apiKey?: string;
    baseUrl?: string;
  }) {
    this.provider = options.provider;
    this.model = options.model || (options.provider === 'openai' ? 'text-embedding-3-small' : 'nomic-embed-text');
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = options.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  async embed(text: string): Promise<number[]> {
    if (this.provider === 'openai') {
      return this.openAIEmbed(text);
    }
    return this.ollamaEmbed(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (this.provider === 'openai') {
      return this.openAIEmbedBatch(texts);
    }
    return Promise.all(texts.map(t => this.ollamaEmbed(t)));
  }

  private async openAIEmbed(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY env variable.');
    }
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ model: this.model, input: text })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    const data = await response.json() as { data: { embedding: number[] }[] };
    return data.data[0].embedding;
  }

  private async openAIEmbedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY env variable.');
    }
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ model: this.model, input: texts })
    });
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    const data = await response.json() as { data: { embedding: number[] }[] };
    return data.data.map((item: { embedding: number[] }) => item.embedding);
  }

  private async ollamaEmbed(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, prompt: text })
      });
      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}. Is Ollama running?`);
      }
      const data = await response.json() as { embedding: number[] };
      return data.embedding;
    } catch (e) {
      throw new Error(`Failed to connect to Ollama at ${this.baseUrl}. Make sure Ollama is running.`);
    }
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
