// Citation Tracker
// Tracks sources and citations for RAG responses

import { Citation } from './types.js';

export class CitationTracker {
  private citations: Citation[] = [];
  private citationHistory: Map<string, Citation[]> = new Map();

  addCitations(citations: Citation[]): void {
    this.citations = citations;
    
    // Also store by query for history
    const queryKey = Date.now().toString();
    this.citationHistory.set(queryKey, [...citations]);
  }

  getCitations(): Citation[] {
    return this.citations;
  }

  getCitationsByQuery(queryHash: string): Citation[] {
    return this.citationHistory.get(queryHash) || [];
  }

  formatCitations(): string {
    if (this.citations.length === 0) {
      return '';
    }

    const lines = ['\n\n**Sources:**'];
    
    this.citations.forEach((cite, i) => {
      lines.push(`[${i + 1}] ${cite.source}${cite.sourceUrl ? ` - ${cite.sourceUrl}` : ''}`);
    });

    return lines.join('\n');
  }

  formatCitationsInline(): string {
    if (this.citations.length === 0) {
      return '';
    }

    return this.citations.map(c => `[${c.source}]`).join(', ');
  }

  clear(): void {
    this.citations = [];
  }

  // Export all citation history
  exportHistory(): { timestamp: string; citations: Citation[] }[] {
    return Array.from(this.citationHistory.entries()).map(([timestamp, citations]) => ({
      timestamp,
      citations
    }));
  }

  // Get most cited sources
  getTopSources(limit: number = 5): { source: string; count: number }[] {
    const counts = new Map<string, number>();

    this.citations.forEach(cite => {
      counts.set(cite.source, (counts.get(cite.source) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
