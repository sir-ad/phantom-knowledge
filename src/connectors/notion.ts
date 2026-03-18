// Notion Connector - FUTURE
// Roadmap: Notion connector

import type { Document, Connector } from '../types.js';

export class NotionConnector implements Connector {
  name = 'notion';
  private token: string;
  private databaseId?: string;
  private baseUrl = 'https://api.notion.com/v1';

  constructor(config: { token: string; databaseId?: string }) {
    this.token = config.token;
    this.databaseId = config.databaseId;
  }

  async connect(): Promise<void> {
    // Validate token
    const res = await fetch(`${this.baseUrl}/users/me`, {
      headers: { 
        'Authorization': `Bearer ${this.token}`,
        'Notion-Version': '2022-06-28'
      }
    });
    if (!res.ok) throw new Error(`Notion connection failed: ${res.statusText}`);
  }

  async fetch(): Promise<Document[]> {
    const docs: Document[] = [];
    
    if (this.databaseId) {
      // Fetch from database
      const res = await fetch(`${this.baseUrl}/databases/${this.databaseId}/query`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const data = await res.json() as { results: any[] };
      
      for (const page of data.results || []) {
        docs.push({
          id: `notion-${page.id}`,
          content: page.properties?.Name?.title?.[0]?.plain_text || 'Untitled',
          source: 'Notion',
          sourceUrl: page.url,
          metadata: { created: page.created_time, lastEdited: page.last_edited_time },
          embeddedAt: 0
        });
      }
    }
    
    return docs;
  }
}
