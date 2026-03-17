// Citation Tracker
// Tracks sources and citations for RAG responses
export class CitationTracker {
    citations = [];
    citationHistory = new Map();
    addCitations(citations) {
        this.citations = citations;
        // Also store by query for history
        const queryKey = Date.now().toString();
        this.citationHistory.set(queryKey, [...citations]);
    }
    getCitations() {
        return this.citations;
    }
    getCitationsByQuery(queryHash) {
        return this.citationHistory.get(queryHash) || [];
    }
    formatCitations() {
        if (this.citations.length === 0) {
            return '';
        }
        const lines = ['\n\n**Sources:**'];
        this.citations.forEach((cite, i) => {
            lines.push(`[${i + 1}] ${cite.source}${cite.sourceUrl ? ` - ${cite.sourceUrl}` : ''}`);
        });
        return lines.join('\n');
    }
    formatCitationsInline() {
        if (this.citations.length === 0) {
            return '';
        }
        return this.citations.map(c => `[${c.source}]`).join(', ');
    }
    clear() {
        this.citations = [];
    }
    // Export all citation history
    exportHistory() {
        return Array.from(this.citationHistory.entries()).map(([timestamp, citations]) => ({
            timestamp,
            citations
        }));
    }
    // Get most cited sources
    getTopSources(limit = 5) {
        const counts = new Map();
        this.citations.forEach(cite => {
            counts.set(cite.source, (counts.get(cite.source) || 0) + 1);
        });
        return Array.from(counts.entries())
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}
//# sourceMappingURL=citations.js.map