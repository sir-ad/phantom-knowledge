import { VectorStore } from './vector-store.js';
import { CitationTracker } from './citations.js';
import { QueryResult, RAGOptions } from './types.js';
export declare class RAGQuery {
    private vectorStore;
    private citations;
    private model;
    private apiKey?;
    private baseUrl?;
    constructor(vectorStore: VectorStore, citations: CitationTracker, options?: {
        model?: string;
        apiKey?: string;
        baseUrl?: string;
    });
    query(prompt: string, options?: RAGOptions): Promise<QueryResult>;
    private generateAnswer;
    private summarizeFromContext;
    chat(message: string, history?: {
        role: string;
        content: string;
    }[]): Promise<QueryResult>;
}
//# sourceMappingURL=rag-query.d.ts.map