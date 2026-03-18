// Knowledge Engine - main orchestrator

import { Embeddings } from './embeddings.js';
import { VectorStore } from './vector-store.js';
import { RAGQuery } from './rag-query.js';
import { CitationTracker } from './citations.js';
import type { Document, QueryResult, EmbeddingOptions, VectorStoreOptions, Connector } from './types.js';

// Error codes
export enum KnowledgeErrorCode {
  NOT_INITIALIZED = 'KNOWLEDGE_001',
  CONNECTOR_FAILED = 'KNOWLEDGE_002',
  EMBEDDING_FAILED = 'KNOWLEDGE_003',
  VECTOR_STORE_ERROR = 'KNOWLEDGE_004',
  LLM_QUERY_FAILED = 'KNOWLEDGE_005',
  RATE_LIMIT_EXCEEDED = 'KNOWLEDGE_006'
}

export class KnowledgeError extends Error {
  constructor(
    public code: KnowledgeErrorCode,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'KnowledgeError';
  }
}

export class KnowledgeEngine {
  private embeddings: Embeddings;
  private vectorStore: VectorStore;
  private ragQuery: RAGQuery;
  private citations: CitationTracker;
  private connectors = new Map<string, Connector>();
  private initialized = false;

  constructor(
    embOptions: EmbeddingOptions,
    vsOptions: VectorStoreOptions,
    llmOptions: { model?: string } = {}
  ) {
    // Auto-detect from env if not provided
    const apiKey = process.env.OPENAI_API_KEY;
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    this.embeddings = new Embeddings({
      provider: embOptions.provider,
      model: embOptions.model,
      apiKey,
      baseUrl: ollamaUrl
    });
    this.vectorStore = new VectorStore(this.embeddings, vsOptions);
    this.citations = new CitationTracker();
    this.ragQuery = new RAGQuery(this.vectorStore, this.citations, llmOptions);
  }

  async initialize(): Promise<void> {
    await this.vectorStore.initialize();
    this.initialized = true;
  }

  async addDocument(doc: Omit<Document, 'embeddedAt'>): Promise<void> {
    await this.vectorStore.addDocument(doc);
  }

  async addDocuments(docs: Omit<Document, 'embeddedAt'>[]): Promise<void> {
    await this.vectorStore.addDocuments(docs);
  }

  async query(prompt: string): Promise<QueryResult> {
    return this.ragQuery.query(prompt);
  }

  registerConnector(name: string, connector: Connector): void {
    this.connectors.set(name, connector);
  }

  async syncConnector(name: string): Promise<void> {
    const connector = this.connectors.get(name);
    if (!connector) throw new KnowledgeError(
      KnowledgeErrorCode.CONNECTOR_FAILED,
      `Connector ${name} not found`
    );
    await connector.connect();
    const docs = await connector.fetch();
    await this.addDocuments(docs);
  }

  getStats() {
    return {
      documentCount: this.vectorStore.count(),
      sources: [...new Set(this.vectorStore.getAllDocuments().map(d => d.source))]
    };
  }

  async semanticSearch(query: string, limit = 5) {
    return this.vectorStore.search(query, limit);
  }

  async chat(message: string): Promise<QueryResult> {
    return this.query(message);
  }

  listConnectors() {
    return Array.from(this.connectors.keys()).map(name => ({
      name,
      ready: this.initialized
    }));
  }

  async clear(): Promise<void> {
    await this.vectorStore.clear();
  }
}

export async function createKnowledgeEngine(config: {
  embeddings: EmbeddingOptions;
  vectorStore: VectorStoreOptions;
  llm?: { model?: string };
}): Promise<KnowledgeEngine> {
  const engine = new KnowledgeEngine(config.embeddings, config.vectorStore, config.llm);
  await engine.initialize();
  return engine;
}
