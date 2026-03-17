// Knowledge Layer Index
// Main entry point for Phantom Knowledge System

export { KnowledgeEngine } from './engine.js';
export { Embeddings } from './embeddings.js';
export { VectorStore } from './vector-store.js';
export { RAGQuery } from './rag-query.js';
export { CitationTracker } from './citations.js';
export { GitHubConnector } from './connectors/github.js';
export type { Document, Citation, QueryResult, EmbeddingOptions } from './types.js';
