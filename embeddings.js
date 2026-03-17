// Embeddings Module
// Handles text-to-vector conversion using OpenAI or Ollama
export class Embeddings {
    provider;
    model;
    apiKey;
    baseUrl;
    constructor(options) {
        this.provider = options.provider;
        this.model = options.model || (options.provider === 'openai' ? 'text-embedding-3-small' : 'nomic-embed-text');
        this.apiKey = process.env.OPENAI_API_KEY;
        this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    }
    async embed(text) {
        if (this.provider === 'openai') {
            return this.openAIEmbed(text);
        }
        else {
            return this.ollamaEmbed(text);
        }
    }
    async embedBatch(texts) {
        if (this.provider === 'openai') {
            return this.openAIEmbedBatch(texts);
        }
        else {
            return Promise.all(texts.map(t => this.ollamaEmbed(t)));
        }
    }
    async openAIEmbed(text) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                input: text
            })
        });
        if (!response.ok) {
            throw new Error(`OpenAI embedding failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data[0].embedding;
    }
    async openAIEmbedBatch(texts) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                input: texts
            })
        });
        if (!response.ok) {
            throw new Error(`OpenAI embedding failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data.map((item) => item.embedding);
    }
    async ollamaEmbed(text) {
        const response = await fetch(`${this.baseUrl}/api/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                prompt: text
            })
        });
        if (!response.ok) {
            throw new Error(`Ollama embedding failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.embedding;
    }
    // Cosine similarity between two vectors
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have same dimensions');
        }
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
//# sourceMappingURL=embeddings.js.map