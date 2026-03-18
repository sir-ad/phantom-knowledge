// Main exports

export { KnowledgeEngine, createKnowledgeEngine, KnowledgeError, KnowledgeErrorCode } from './engine.js';
export { Embeddings } from './embeddings.js';
export { VectorStore } from './vector-store.js';
export { RAGQuery } from './rag-query.js';
export { CitationTracker } from './citations.js';

// Connectors
export { GitHubConnector } from './connectors/github.js';
export { NotionConnector } from './connectors/notion.js';
export { DriveConnector } from './connectors/drive.js';
export { SlackConnector } from './connectors/slack.js';

// Future features
export { PodcastGenerator } from './podcast.js';
export { ReportExporter, ExportFormat } from './report.js';

// Types
export type { 
  Document, 
  Citation, 
  QueryResult, 
  EmbeddingOptions, 
  VectorStoreOptions, 
  Connector,
  ConnectorInfo,
  Stats,
  SyncResult,
  KnowledgeConfig
} from './types.js';
