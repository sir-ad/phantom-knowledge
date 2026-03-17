// Vector Store Module
// Stores and retrieves embeddings with similarity search
import { readFile, writeFile, access } from 'fs/promises';
export class VectorStore {
    documents = new Map();
    embeddings;
    storagePath;
    storageType;
    constructor(embeddings, options) {
        this.embeddings = embeddings;
        this.storageType = options.type;
        this.storagePath = options.path;
    }
    async initialize() {
        if (this.storageType === 'file' && this.storagePath) {
            await this.loadFromFile();
        }
    }
    async addDocument(doc) {
        const embedding = await this.embeddings.embed(doc.content);
        const embeddedDoc = {
            ...doc,
            embedding,
            embeddedAt: Date.now()
        };
        this.documents.set(doc.id, embeddedDoc);
        if (this.storageType === 'file') {
            await this.saveToFile();
        }
    }
    async addDocuments(docs) {
        const contents = docs.map(d => d.content);
        const embeddings = await this.embeddings.embedBatch(contents);
        docs.forEach((doc, i) => {
            const embeddedDoc = {
                ...doc,
                embedding: embeddings[i],
                embeddedAt: Date.now()
            };
            this.documents.set(doc.id, embeddedDoc);
        });
        if (this.storageType === 'file') {
            await this.saveToFile();
        }
    }
    async search(query, limit = 5) {
        const queryEmbedding = await this.embeddings.embed(query);
        const results = [];
        for (const doc of this.documents.values()) {
            const score = this.embeddings.cosineSimilarity(queryEmbedding, doc.embedding);
            results.push({ doc, score });
        }
        // Sort by score descending
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit).map(r => r.doc);
    }
    async delete(id) {
        this.documents.delete(id);
        if (this.storageType === 'file') {
            await this.saveToFile();
        }
    }
    async clear() {
        this.documents.clear();
        if (this.storageType === 'file') {
            await this.saveToFile();
        }
    }
    getDocument(id) {
        return this.documents.get(id);
    }
    getAllDocuments() {
        return Array.from(this.documents.values());
    }
    count() {
        return this.documents.size;
    }
    async saveToFile() {
        if (!this.storagePath)
            return;
        const data = {
            documents: Array.from(this.documents.values()),
            version: 1
        };
        await writeFile(this.storagePath, JSON.stringify(data, null, 2), 'utf-8');
    }
    async loadFromFile() {
        if (!this.storagePath)
            return;
        try {
            await access(this.storagePath);
            const content = await readFile(this.storagePath, 'utf-8');
            const data = JSON.parse(content);
            this.documents = new Map(data.documents.map(d => [d.id, d]));
        }
        catch {
            // File doesn't exist yet, start fresh
            this.documents = new Map();
        }
    }
}
//# sourceMappingURL=vector-store.js.map