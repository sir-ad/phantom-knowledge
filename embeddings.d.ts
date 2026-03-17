import { EmbeddingOptions } from './types.js';
export declare class Embeddings {
    private provider;
    private model;
    private apiKey?;
    private baseUrl?;
    constructor(options: EmbeddingOptions);
    embed(text: string): Promise<number[]>;
    embedBatch(texts: string[]): Promise<number[][]>;
    private openAIEmbed;
    private openAIEmbedBatch;
    private ollamaEmbed;
    cosineSimilarity(a: number[], b: number[]): number;
}
//# sourceMappingURL=embeddings.d.ts.map