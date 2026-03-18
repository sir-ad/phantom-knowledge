// GitHub Connector

import type { Document, Connector } from '../types.js';

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  labels: { name: string }[];
  user: { login: string };
}

export class GitHubConnector implements Connector {
  name = 'github';
  private token: string;
  private owner: string;
  private repo: string;
  private baseUrl = 'https://api.github.com';

  constructor(config: { token: string; owner: string; repo: string }) {
    this.token = config.token;
    this.owner = config.owner;
    this.repo = config.repo;
  }

  async connect(): Promise<void> {
    const res = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}`, {
      headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error(`GitHub connection failed: ${res.statusText}`);
  }

  async fetch(): Promise<Document[]> {
    const [issues, prs] = await Promise.all([
      this.fetchIssues(),
      this.fetchPRs()
    ]);
    return [...issues, ...prs];
  }

  private async fetchIssues(): Promise<Document[]> {
    const docs: Document[] = [];
    let page = 1;
    while (page <= 3) {
      const res = await fetch(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/issues?state=all&page=${page}&per_page=100`,
        { headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' } }
      );
      const issues: GitHubIssue[] = await res.json();
      if (!issues.length) break;
      for (const issue of issues) {
        if ('pull_request' in issue) continue;
        docs.push({
          id: `issue-${issue.number}`,
          content: `Issue #${issue.number}: ${issue.title}\n\n${issue.body || ''}`,
          source: `GitHub Issue #${issue.number}`,
          sourceUrl: issue.html_url,
          metadata: { state: issue.state, labels: issue.labels.map(l => l.name).join(', ') },
          embeddedAt: 0
        });
      }
      page++;
    }
    return docs;
  }

  private async fetchPRs(): Promise<Document[]> {
    const docs: Document[] = [];
    let page = 1;
    while (page <= 3) {
      const res = await fetch(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/pulls?state=all&page=${page}&per_page=100`,
        { headers: { Authorization: `token ${this.token}`, Accept: 'application/vnd.github.v3+json' } }
      );
      const prs: GitHubIssue[] = await res.json();
      if (!prs.length) break;
      for (const pr of prs) {
        docs.push({
          id: `pr-${pr.number}`,
          content: `PR #${pr.number}: ${pr.title}\n\n${pr.body || ''}`,
          source: `GitHub PR #${pr.number}`,
          sourceUrl: pr.html_url,
          metadata: { state: pr.state },
          embeddedAt: 0
        });
      }
      page++;
    }
    return docs;
  }
}
