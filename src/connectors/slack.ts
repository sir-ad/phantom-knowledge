// Slack Connector - FUTURE
// Roadmap: Slack connector

import type { Document, Connector } from '../types.js';

export class SlackConnector implements Connector {
  name = 'slack';
  private token: string;
  private baseUrl = 'https://slack.com/api';

  constructor(config: { token: string }) {
    this.token = config.token;
  }

  async connect(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth.test`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    const data = await res.json() as { ok: boolean };
    if (!data.ok) throw new Error('Slack connection failed');
  }

  async fetch(): Promise<Document[]> {
    const docs: Document[] = [];
    
    // List channels
    const channelsRes = await fetch(`${this.baseUrl}/conversations.list?types=public_channel,private_channel`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    const channelsData = await channelsRes.json() as { channels: { id: string; name: string; topic?: { value: string } }[] };
    
    for (const channel of channelsData.channels || []) {
      // Get recent messages from each channel
      const messagesRes = await fetch(
        `${this.baseUrl}/conversations.history?channel=${channel.id}&limit=10`,
        { headers: { Authorization: `Bearer ${this.token}` } }
      );
      const messagesData = await messagesRes.json() as { messages: { ts: string; text: string; user?: string }[] };
      
      for (const msg of messagesData.messages || []) {
        docs.push({
          id: `slack-${channel.id}-${msg.ts}`,
          content: `[#${channel.name}] ${msg.text}`,
          source: `Slack #${channel.name}`,
          sourceUrl: '',
          metadata: { user: msg.user, timestamp: msg.ts },
          embeddedAt: 0
        });
      }
    }
    
    return docs;
  }
}
