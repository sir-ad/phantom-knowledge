// Knowledge Engine
// Main orchestrator for the knowledge layer
import { Embeddings } from './embeddings.js';
import { VectorStore } from './vector-store.js';
import { RAGQuery } from './rag-query.js';
import { CitationTracker } from './citations.js';
export class KnowledgeEngine {
    embeddings;
    vectorStore;
    ragQuery;
    citations;
    connectors = new Map();
    initialized = false;
    constructor(config) {
        this.embeddings = new Embeddings(config.embeddings);
        this.vectorStore = new VectorStore(this.embeddings, config.vectorStore);
        this.citations = new CitationTracker();
        this.ragQuery = new RAGQuery(this.vectorStore, this.citations, config.llm);
    }
    async initialize() {
        await this.vectorStore.initialize();
        this.initialized = true;
        console.log('✅ Knowledge Engine initialized');
    }
    // Add a document directly
    async addDocument(doc) {
        this.ensureInitialized();
        await this.vectorStore.addDocument(doc);
    }
    // Add multiple documents
    async addDocuments(docs) {
        this.ensureInitialized();
        await this.vectorStore.addDocuments(docs);
    }
    // Query the knowledge base
    async query(prompt, options) {
        this.ensureInitialized();
        return this.ragQuery.query(prompt, options);
    }
    // Chat with context
    async chat(message, history = []) {
        this.ensureInitialized();
        return this.ragQuery.chat(message, history);
    }
    // Register a connector
    registerConnector(name, connector) {
        this.connectors.set(name, connector);
    }
    // Sync from a connector
    async syncConnector(name) {
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
    async semanticSearch(query, limit = 5) {
        this.ensureInitialized();
        return this.vectorStore.search(query, limit);
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Knowledge Engine not initialized. Call initialize() first.');
        }
    }
}
// Factory function for easy creation
export async function createKnowledgeEngine(config) {
    const engine = new KnowledgeEngine(config);
    await engine.initialize();
    return engine;
}
//# sourceMappingURL=engine.js.map