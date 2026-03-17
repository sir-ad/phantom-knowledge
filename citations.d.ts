import { Citation } from './types.js';
export declare class CitationTracker {
    private citations;
    private citationHistory;
    addCitations(citations: Citation[]): void;
    getCitations(): Citation[];
    getCitationsByQuery(queryHash: string): Citation[];
    formatCitations(): string;
    formatCitationsInline(): string;
    clear(): void;
    exportHistory(): {
        timestamp: string;
        citations: Citation[];
    }[];
    getTopSources(limit?: number): {
        source: string;
        count: number;
    }[];
}
//# sourceMappingURL=citations.d.ts.map