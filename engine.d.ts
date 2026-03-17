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
export declare class KnowledgeEngine {
    private embeddings;
    private vectorStore;
    private ragQuery;
    private citations;
    private connectors;
    private initialized;
    constructor(config: KnowledgeEngineConfig);
    initialize(): Promise<void>;
    addDocument(doc: Document): Promise<void>;
    addDocuments(docs: Document[]): Promise<void>;
    query(prompt: string, options?: {
        maxTokens?: number;
        temperature?: number;
    }): Promise<QueryResult>;
    chat(message: string, history?: {
        role: string;
        content: string;
    }[]): Promise<QueryResult>;
    registerConnector(name: string, connector: any): void;
    syncConnector(name: string): Promise<void>;
    getStats(): {
        documentCount: number;
        sources: string[];
        topCitations: {
            source: string;
            count: number;
        }[];
    };
    semanticSearch(query: string, limit?: number): Promise<import("./types.js").EmbeddedDocument[]>;
    private ensureInitialized;
}
export declare function createKnowledgeEngine(config: KnowledgeEngineConfig): Promise<KnowledgeEngine>;
//# sourceMappingURL=engine.d.ts.map