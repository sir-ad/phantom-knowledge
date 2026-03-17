// Embeddings Module
// Handles text-to-vector conversion using OpenAI or Ollama

import { EmbeddingOptions, EmbeddedDocument } from './types.js';

export class Embeddings {
  private provider: 'openai' | 'ollama';
  private model: string;
  private apiKey?: string;
  private baseUrl?: string;

  constructor(options: EmbeddingOptions) {
    this.provider = options.provider;
    this.model = options.model || (options.provider === 'openai' ? 'text-embedding-3-small' : 'nomic-embed-text');
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  async embed(text: string): Promise<number[]> {
    if (this.provider === 'openai') {
      return this.openAIEmbed(text);
    } else {
      return this.ollamaEmbed(text);
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (this.provider === 'openai') {
      return this.openAIEmbedBatch(texts);
    } else {
      return Promise.all(texts.map(t => this.ollamaEmbed(t)));
    }
  }

  private async openAIEmbed(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI embedding failed: ${response.statusText}`);
    }

    const data = await response.json() as { data: { embedding: number[] }[] };
    return data.data[0].embedding;
  }

  private async openAIEmbedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: texts
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI embedding failed: ${response.statusText}`);
    }

    const data = await response.json() as { data: { embedding: number[] }[] };
    return data.data.map((item: { embedding: number[] }) => item.embedding);
  }

  private async ollamaEmbed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.statusText}`);
    }

    const data = await response.json() as { embedding: number[] };
    return data.embedding;
  }

  // Cosine similarity between two vectors
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
