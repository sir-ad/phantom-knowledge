// RAG Query Engine
// Retrieves relevant context and generates answers with citations

import { VectorStore } from './vector-store.js';
import { CitationTracker } from './citations.js';
import { QueryResult, Citation, RAGOptions } from './types.js';

export class RAGQuery {
  private vectorStore: VectorStore;
  private citations: CitationTracker;
  private model: string;
  private apiKey?: string;
  private baseUrl?: string;

  constructor(
    vectorStore: VectorStore,
    citations: CitationTracker,
    options: { model?: string; apiKey?: string; baseUrl?: string } = {}
  ) {
    this.vectorStore = vectorStore;
    this.citations = citations;
    this.model = options.model || 'gpt-4o-mini';
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    this.baseUrl = options.baseUrl;
  }

  async query(prompt: string, options: RAGOptions = {}): Promise<QueryResult> {
    const {
      maxTokens = 4000,
      temperature = 0.7,
      includeCitations = true
    } = options;

    // Step 1: Retrieve relevant documents
    const relevantDocs = await this.vectorStore.search(prompt, 10);

    if (relevantDocs.length === 0) {
      return {
        answer: "I don't have any relevant information to answer that question.",
        citations: [],
        sources: [],
        contextUsed: 0
      };
    }

    // Step 2: Build context from retrieved documents
    const context = relevantDocs
      .map((doc, i) => `[${i + 1}] ${doc.source}: ${doc.content}`)
      .join('\n\n');

    // Step 3: Track citations
    const citationList: Citation[] = [];
    const sources: string[] = [];

    if (includeCitations) {
      relevantDocs.forEach((doc, i) => {
        citationList.push({
          documentId: doc.id,
          source: doc.source,
          sourceUrl: doc.sourceUrl,
          excerpt: doc.content.slice(0, 200) + '...',
          relevanceScore: 1 - (i * 0.1) // Decreasing relevance score
        });
        
        if (!sources.includes(doc.source)) {
          sources.push(doc.source);
        }
      });

      this.citations.addCitations(citationList);
    }

    // Step 4: Generate answer using LLM
    const systemPrompt = `You are a helpful assistant. Use the provided context to answer the user's question.
If you use information from the context, cite it using the source name in brackets.
If the context doesn't contain enough information to answer the question, say so.`;

    const userPrompt = `Context:
${context}

Question: ${prompt}

Answer:`;

    let answer: string;

    try {
      answer = await this.generateAnswer(systemPrompt, userPrompt, {
        maxTokens,
        temperature
      });
    } catch (error) {
      // Fallback: summarize from context
      answer = this.summarizeFromContext(relevantDocs, prompt);
    }

    return {
      answer,
      citations: citationList,
      sources,
      contextUsed: relevantDocs.length
    };
  }

  private async generateAnswer(
    systemPrompt: string,
    userPrompt: string,
    options: { maxTokens: number; temperature: number }
  ): Promise<string> {
    const response = await fetch((this.baseUrl || 'https://api.openai.com/v1') + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: options.maxTokens,
        temperature: options.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`LLM query failed: ${response.statusText}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
  }

  private summarizeFromContext(docs: { source: string; content: string }[], query: string): string {
    const sources = [...new Set(docs.map(d => d.source))].join(', ');
    
    return `Based on the available information from ${sources}:\n\n${
      docs.slice(0, 3).map(d => d.content).join('\n\n')
    }\n\nNote: This is a simplified answer. For more accurate results, please configure an LLM API key.`;
  }

  // Get conversation context
  async chat(message: string, history: { role: string; content: string }[] = []): Promise<QueryResult> {
    const result = await this.query(message);
    
    // Add to history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: result.answer });

    return result;
  }
}
