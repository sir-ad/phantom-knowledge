// Knowledge Engine
// Main orchestrator for the knowledge layer

import { Embeddings } from './embeddings.js';
import { VectorStore } from './vector-store.js';
import { RAGQuery } from './rag-query.js';
import { CitationTracker } from './citations.js';
import { GitHubConnector } from './connectors/github.js';
import { Document, QueryResult, EmbeddingOptions, VectorStoreOptions } from './types.js';

export interface KnowledgeEngineConfig {
  embeddings: EmbeddingOptions;
  vectorStore: VectorStoreOptions;
  llm?: {
    model?: string;
    apiKey?: string;
    baseUrl?: string;
  };
}

export class KnowledgeEngine {
  private embeddings: Embeddings;
  private vectorStore: VectorStore;
  private ragQuery: RAGQuery;
  private citations: CitationTracker;
  private connectors: Map<string, any> = new Map();
  private initialized = false;

  constructor(config: KnowledgeEngineConfig) {
    this.embeddings = new Embeddings(config.embeddings);
    this.vectorStore = new VectorStore(this.embeddings, config.vectorStore);
    this.citations = new CitationTracker();
    this.ragQuery = new RAGQuery(this.vectorStore, this.citations, config.llm);
  }

  async initialize(): Promise<void> {
    await this.vectorStore.initialize();
    this.initialized = true;
    console.log('✅ Knowledge Engine initialized');
  }

  // Add a document directly
  async addDocument(doc: Document): Promise<void> {
    this.ensureInitialized();
    await this.vectorStore.addDocument(doc);
  }

  // Add multiple documents
  async addDocuments(docs: Document[]): Promise<void> {
    this.ensureInitialized();
    await this.vectorStore.addDocuments(docs);
  }

  // Query the knowledge base
  async query(prompt: string, options?: { maxTokens?: number; temperature?: number }): Promise<QueryResult> {
    this.ensureInitialized();
    return this.ragQuery.query(prompt, options);
  }

  // Chat with context
  async chat(message: string, history: { role: string; content: string }[] = []): Promise<QueryResult> {
    this.ensureInitialized();
    return this.ragQuery.chat(message, history);
  }

  // Register a connector
  registerConnector(name: string, connector: any): void {
    this.connectors.set(name, connector);
  }

  // Sync from a connector
  async syncConnector(name: string): Promise<void> {
    const connector = this.connectors.get(name);
    if (!connector) {
      throw new Error(`Connector ${name} not found`);
    }

    await connector.connect();
    const docs = await connector.fetch();
    await this.addDocuments(docs);
    
    console.log(`📥 Synced ${docs.length} documents from ${name}`);
  }

  // Get stats
  getStats() {
    return {
      documentCount: this.vectorStore.count(),
      sources: [...new Set(this.vectorStore.getAllDocuments().map(d => d.source))],
      topCitations: this.citations.getTopSources()
    };
  }

  // Search without LLM (just vector similarity)
  async semanticSearch(query: string, limit: number = 5) {
    this.ensureInitialized();
    return this.vectorStore.search(query, limit);
  }

  private ensureInitialized() {
    if (!this.initialized) {
      throw new Error('Knowledge Engine not initialized. Call initialize() first.');
    }
  }
}

// Factory function for easy creation
export async function createKnowledgeEngine(config: KnowledgeEngineConfig): Promise<KnowledgeEngine> {
  const engine = new KnowledgeEngine(config);
  await engine.initialize();
  return engine;
}
