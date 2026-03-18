// RAG Query Engine with fallback strategies

import { VectorStore } from './vector-store.js';
import { CitationTracker } from './citations.js';
import type { QueryResult, RAGOptions } from './types.js';

export class RAGQuery {
  private vectorStore: VectorStore;
  private citations: CitationTracker;
  private model: string;
  private apiKey?: string;

  constructor(vs: VectorStore, cit: CitationTracker, options: { model?: string } = {}) {
    this.vectorStore = vs;
    this.citations = cit;
    this.model = options.model || 'gpt-4o-mini';
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async query(prompt: string, options: RAGOptions = {}): Promise<QueryResult> {
    const { maxTokens = 4000, temperature = 0.7 } = options;
    const docs = await this.vectorStore.search(prompt, 10);

    if (docs.length === 0) {
      return { answer: "No relevant information found.", citations: [], sources: [], contextUsed: 0 };
    }

    const context = docs.map((d, i) => `[${i + 1}] ${d.source}: ${d.content}`).join('\n\n');
    const sources = [...new Set(docs.map(d => d.source))];
    
    const citationList = docs.map((d, i) => ({
      documentId: d.id,
      source: d.source,
      sourceUrl: d.sourceUrl,
      excerpt: d.content.slice(0, 200),
      relevanceScore: 1 - i * 0.1
    }));
    this.citations.addCitations(citationList);

    // Try LLM, fallback to raw context
    let answer: string;
    try {
      answer = await this.generateAnswer(context, prompt, { maxTokens, temperature });
    } catch (e) {
      // Fallback: return raw context summary
      console.warn('LLM query failed, using fallback:', e);
      answer = this.fallbackAnswer(context, prompt, docs);
    }

    return { answer, citations: citationList, sources, contextUsed: docs.length };
  }

  private fallbackAnswer(context: string, prompt: string, docs: any[]): string {
    // Return raw context summary when LLM fails
    const topDoc = docs[0];
    return `Based on ${docs.length} relevant document(s):\n\n${topDoc.content.slice(0, 800)}\n\n[Sources: ${docs.map(d => d.source).join(', ')}]`;
  }

  private async generateAnswer(context: string, prompt: string, options: { maxTokens: number; temperature: number }): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Use context to answer. Cite sources.' },
          { role: 'user', content: `Context:\n${context}\n\nQuestion: ${prompt}\n\nAnswer:` }
        ],
        max_tokens: options.maxTokens,
        temperature: options.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
  }
}
