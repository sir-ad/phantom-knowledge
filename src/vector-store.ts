// Vector Store Module
// Stores and retrieves embeddings with similarity search

import { EmbeddedDocument, VectorStoreOptions, KnowledgeIndex } from './types.js';
import { Embeddings } from './embeddings.js';
import { readFile, writeFile, mkdir, access, readdir } from 'fs/promises';
import { join } from 'path';

interface VectorStoreData {
  documents: EmbeddedDocument[];
  version: number;
}

export class VectorStore implements KnowledgeIndex {
  private documents: Map<string, EmbeddedDocument> = new Map();
  private embeddings: Embeddings;
  private storagePath?: string;
  private storageType: 'memory' | 'file' | 'pinecone';

  constructor(embeddings: Embeddings, options: VectorStoreOptions) {
    this.embeddings = embeddings;
    this.storageType = options.type;
    this.storagePath = options.path;
  }

  async initialize(): Promise<void> {
    if (this.storageType === 'file' && this.storagePath) {
      await this.loadFromFile();
    }
  }

  async addDocument(doc: { id: string; content: string; source: string; sourceUrl?: string; metadata: Record<string, unknown> }): Promise<void> {
    const embedding = await this.embeddings.embed(doc.content);
    
    const embeddedDoc: EmbeddedDocument = {
      ...doc,
      embedding,
      embeddedAt: Date.now()
    };

    this.documents.set(doc.id, embeddedDoc);

    if (this.storageType === 'file') {
      await this.saveToFile();
    }
  }

  async addDocuments(docs: { id: string; content: string; source: string; sourceUrl?: string; metadata: Record<string, unknown> }[]): Promise<void> {
    const contents = docs.map(d => d.content);
    const embeddings = await this.embeddings.embedBatch(contents);

    docs.forEach((doc, i) => {
      const embeddedDoc: EmbeddedDocument = {
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

  async search(query: string, limit: number = 5): Promise<EmbeddedDocument[]> {
    const queryEmbedding = await this.embeddings.embed(query);
    
    const results: { doc: EmbeddedDocument; score: number }[] = [];

    for (const doc of this.documents.values()) {
      const score = this.embeddings.cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({ doc, score });
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit).map(r => r.doc);
  }

  async delete(id: string): Promise<void> {
    this.documents.delete(id);
    if (this.storageType === 'file') {
      await this.saveToFile();
    }
  }

  async clear(): Promise<void> {
    this.documents.clear();
    if (this.storageType === 'file') {
      await this.saveToFile();
    }
  }

  getDocument(id: string): EmbeddedDocument | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): EmbeddedDocument[] {
    return Array.from(this.documents.values());
  }

  count(): number {
    return this.documents.size;
  }

  private async saveToFile(): Promise<void> {
    if (!this.storagePath) return;

    const data: VectorStoreData = {
      documents: Array.from(this.documents.values()),
      version: 1
    };

    await writeFile(this.storagePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  private async loadFromFile(): Promise<void> {
    if (!this.storagePath) return;

    try {
      await access(this.storagePath);
      const content = await readFile(this.storagePath, 'utf-8');
      const data: VectorStoreData = JSON.parse(content);
      
      this.documents = new Map(data.documents.map(d => [d.id, d]));
    } catch {
      // File doesn't exist yet, start fresh
      this.documents = new Map();
    }
  }
}
