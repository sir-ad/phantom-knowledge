// Citation tracker

import type { Citation } from './types.js';

export class CitationTracker {
  private citations: Citation[] = [];

  addCitations(citations: Citation[]): void {
    this.citations = citations;
  }

  getCitations(): Citation[] {
    return this.citations;
  }

  formatCitations(): string {
    if (this.citations.length === 0) return '';
    const lines = ['**Sources:**'];
    this.citations.forEach((c, i) => {
      lines.push(`[${i + 1}] ${c.source}${c.sourceUrl ? ` - ${c.sourceUrl}` : ''}`);
    });
    return lines.join('\n');
  }

  formatCitationsInline(): string {
    if (this.citations.length === 0) return '';
    return this.citations.map(c => `[${c.source}]`).join(', ');
  }

  getTopSources(limit = 5): { source: string; count: number }[] {
    const counts = new Map<string, number>();
    this.citations.forEach(c => {
      counts.set(c.source, (counts.get(c.source) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  clear(): void {
    this.citations = [];
  }
}
