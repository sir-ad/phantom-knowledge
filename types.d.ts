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
    dimensions?: number;
}
export interface VectorStoreOptions {
    type: 'memory' | 'file' | 'pinecone';
    path?: string;
    apiKey?: string;
}
export interface KnowledgeIndex {
    addDocument(doc: Document): Promise<void>;
    addDocuments(docs: Document[]): Promise<void>;
    search(query: string, limit?: number): Promise<EmbeddedDocument[]>;
    delete(id: string): Promise<void>;
    clear(): Promise<void>;
}
export interface RAGOptions {
    maxTokens?: number;
    temperature?: number;
    includeCitations?: boolean;
}
export interface Connector {
    name: string;
    connect(): Promise<void>;
    fetch(): Promise<Document[]>;
    sync(): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map