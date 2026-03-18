// Vector store - document storage and search

import { Embeddings } from './embeddings.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Document, EmbeddedDocument, VectorStoreOptions } from './types.js';

interface VectorStoreData {
  version: number;
  documents: EmbeddedDocument[];
}

export class VectorStore {
  private documents = new Map<string, EmbeddedDocument>();
  private embeddings: Embeddings;
  private storagePath?: string;
  private storeType: 'memory' | 'file';

  constructor(emb: Embeddings, options: VectorStoreOptions) {
    this.embeddings = emb;
    this.storeType = options.type || 'memory';
    this.storagePath = options.path || path.join(os.homedir(), '.phantom', 'knowledge.json');
  }

  async initialize(): Promise<void> {
    if (this.storeType === 'file' && this.storagePath) {
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.storagePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf-8')) as VectorStoreData;
          if (data.documents) {
            data.documents.forEach((doc: EmbeddedDocument) => {
              this.documents.set(doc.id, doc);
            });
          }
        } catch (e) {
          console.warn('Failed to load vector store:', e);
        }
      }
    }
  }

  private async save(): Promise<void> {
    if (this.storeType === 'file' && this.storagePath) {
      const data: VectorStoreData = {
        version: 1,
        documents: Array.from(this.documents.values())
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    }
  }

  async addDocument(doc: Omit<Document, 'embeddedAt'>): Promise<void> {
    const embedding = await this.embeddings.embed(doc.content);
    const embedded = { ...doc, embedding, embeddedAt: Date.now() };
    this.documents.set(doc.id, embedded);
    await this.save();
  }

  async addDocuments(docs: Omit<Document, 'embeddedAt'>[]): Promise<void> {
    const embeddings = await this.embeddings.embedBatch(docs.map(d => d.content));
    docs.forEach((doc, i) => {
      this.documents.set(doc.id, { ...doc, embedding: embeddings[i], embeddedAt: Date.now() });
    });
    await this.save();
  }

  async search(query: string, limit = 5): Promise<EmbeddedDocument[]> {
    const queryEmbedding = await this.embeddings.embed(query);
    const results = Array.from(this.documents.values())
      .map(doc => ({ doc, score: this.embeddings.cosineSimilarity(queryEmbedding, doc.embedding) }))
      .sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map(r => r.doc);
  }

  getDocument(id: string): EmbeddedDocument | undefined {
    return this.documents.get(id);
  }

  count(): number {
    return this.documents.size;
  }

  getAllDocuments(): EmbeddedDocument[] {
    return Array.from(this.documents.values());
  }

  async clear(): Promise<void> {
    this.documents.clear();
    await this.save();
  }
}
