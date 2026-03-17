import { EmbeddedDocument, VectorStoreOptions, KnowledgeIndex } from './types.js';
import { Embeddings } from './embeddings.js';
export declare class VectorStore implements KnowledgeIndex {
    private documents;
    private embeddings;
    private storagePath?;
    private storageType;
    constructor(embeddings: Embeddings, options: VectorStoreOptions);
    initialize(): Promise<void>;
    addDocument(doc: {
        id: string;
        content: string;
        source: string;
        sourceUrl?: string;
        metadata: Record<string, unknown>;
    }): Promise<void>;
    addDocuments(docs: {
        id: string;
        content: string;
        source: string;
        sourceUrl?: string;
        metadata: Record<string, unknown>;
    }[]): Promise<void>;
    search(query: string, limit?: number): Promise<EmbeddedDocument[]>;
    delete(id: string): Promise<void>;
    clear(): Promise<void>;
    getDocument(id: string): EmbeddedDocument | undefined;
    getAllDocuments(): EmbeddedDocument[];
    count(): number;
    private saveToFile;
    private loadFromFile;
}
//# sourceMappingURL=vector-store.d.ts.map