// Google Drive Connector - FUTURE
// Roadmap: Drive connector

import type { Document, Connector } from '../types.js';

export class DriveConnector implements Connector {
  name = 'drive';
  private accessToken: string;
  private baseUrl = 'https://www.googleapis.com/drive/v3';

  constructor(config: { accessToken: string }) {
    this.accessToken = config.accessToken;
  }

  async connect(): Promise<void> {
    // Validate token
    const res = await fetch(`${this.baseUrl}/about?fields=user`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    if (!res.ok) throw new Error(`Drive connection failed: ${res.statusText}`);
  }

  async fetch(): Promise<Document[]> {
    const docs: Document[] = [];
    
    // List files
    const res = await fetch(
      `${this.baseUrl}/files?q=mimeType='application/vnd.google-apps.document'&fields=files(id,name,webViewLink,modifiedTime)`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    const data = await res.json() as { files: { id: string; name: string; webViewLink: string; modifiedTime: string }[] };
    
    for (const file of data.files || []) {
      docs.push({
        id: `drive-${file.id}`,
        content: `Google Doc: ${file.name}`,
        source: 'Google Drive',
        sourceUrl: file.webViewLink,
        metadata: { modifiedTime: file.modifiedTime },
        embeddedAt: 0
      });
    }
    
    return docs;
  }
}
