// Types for Phantom Knowledge Layer

export interface Document {
  id: string;
  content: string;
  source: string;
  sourceUrl?: string;
  metadata: Record<string, unknown>;
  embeddedAt: number;
}

export interface EmbeddedDocument extends Document {
  embedding: number[];
}

export interface Citation {
  documentId: string;
  source: string;
  sourceUrl?: string;
  excerpt: string;
  relevanceScore: number;
}

export interface QueryResult {
  answer: string;
  citations: Citation[];
  sources: string[];
  contextUsed: number;
}

export interface EmbeddingOptions {
  provider: 'openai' | 'ollama';
  model?: string;
}

export interface VectorStoreOptions {
  type: 'memory' | 'file';
  path?: string;
}

export interface RAGOptions {
  maxTokens?: number;
  temperature?: number;
}

export interface Connector {
  name: string;
  connect(): Promise<void>;
  fetch(): Promise<Document[]>;
}

export interface ConnectorInfo {
  name: string;
  ready: boolean;
}

export interface Stats {
  documentCount: number;
  sources: string[];
}

export interface SyncResult {
  connector: string;
  documentsAdded: number;
  timestamp: number;
}

export interface KnowledgeConfig {
  embeddings: EmbeddingOptions;
  vectorStore: VectorStoreOptions;
  llm?: {
    model?: string;
  };
  github?: {
    token: string;
    owner: string;
    repo: string;
  };
}
