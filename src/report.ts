// Report Exporter - FUTURE
// Roadmap: Export knowledge as reports

import { KnowledgeEngine } from './engine.js';
import * as fs from 'fs';

export type ExportFormat = 'markdown' | 'html' | 'json';

export class ReportExporter {
  private engine: KnowledgeEngine;

  constructor(engine: KnowledgeEngine) {
    this.engine = engine;
  }

  async exportKnowledge(query: string, format: ExportFormat = 'markdown'): Promise<string> {
    const result = await this.engine.query(query);
    
    switch (format) {
      case 'markdown':
        return this.toMarkdown(result.answer, result.citations, result.sources);
      case 'html':
        return this.toHTML(result.answer, result.citations, result.sources);
      case 'json':
        return JSON.stringify(result, null, 2);
      default:
        throw new Error(`Unknown format: ${format}`);
    }
  }

  private toMarkdown(answer: string, citations: any[], sources: string[]): string {
    let md = `# Knowledge Report\n\n`;
    md += `## Answer\n\n${answer}\n\n`;
    md += `## Sources\n\n${sources.map(s => `- ${s}`).join('\n')}\n\n`;
    md += `## Citations\n\n`;
    citations.forEach((c, i) => {
      md += `${i + 1}. ${c.source}${c.sourceUrl ? ` - ${c.sourceUrl}` : ''}\n`;
    });
    return md;
  }

  private toHTML(answer: string, citations: any[], sources: string[]): string {
    let html = `<!DOCTYPE html><html><head><title>Knowledge Report</title></head><body>`;
    html += `<h1>Knowledge Report</h1>`;
    html += `<h2>Answer</h2><p>${answer.replace(/\n/g, '<br>')}</p>`;
    html += `<h2>Sources</h2><ul>${sources.map(s => `<li>${s}</li>`).join('')}</ul>`;
    html += `<h2>Citations</h2><ol>`;
    citations.forEach((c, i) => {
      html += `<li>${c.source}${c.sourceUrl ? ` - <a href="${c.sourceUrl}">link</a>` : ''}</li>`;
    });
    html += `</ol></body></html>`;
    return html;
  }

  async saveToFile(path: string, query: string, format: ExportFormat = 'markdown'): Promise<void> {
    const content = await this.exportKnowledge(query, format);
    fs.writeFileSync(path, content);
  }
}
