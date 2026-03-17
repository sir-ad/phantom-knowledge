// GitHub Connector
// Fetches issues, PRs, discussions from GitHub repositories
export class GitHubConnector {
    name = 'github';
    config;
    baseUrl = 'https://api.github.com';
    constructor(config) {
        this.config = config;
    }
    async connect() {
        // Test connection
        const response = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}`, {
            headers: {
                'Authorization': `token ${this.config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!response.ok) {
            throw new Error(`GitHub connection failed: ${response.statusText}`);
        }
    }
    async fetch() {
        const [issues, prs, discussions] = await Promise.all([
            this.fetchIssues(),
            this.fetchPRs(),
            this.fetchDiscussions()
        ]);
        return [...issues, ...prs, ...discussions];
    }
    async sync() {
        // For now, sync just fetches all
        // Later, can implement incremental sync with last sync timestamp
        await this.fetch();
    }
    async fetchIssues() {
        const documents = [];
        let page = 1;
        let hasMore = true;
        while (hasMore && page <= 10) {
            const response = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/issues?state=all&page=${page}&per_page=100`, {
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok)
                break;
            const issues = await response.json();
            if (issues.length === 0) {
                hasMore = false;
            }
            else {
                for (const issue of issues) {
                    // Skip PRs (they appear in issues API)
                    if ('pull_request' in issue)
                        continue;
                    const labels = issue.labels.map(l => l.name).join(', ');
                    documents.push({
                        id: `issue-${issue.number}`,
                        content: `Issue #${issue.number}: ${issue.title}\n\n${issue.body || 'No description'}\n\nLabels: ${labels || 'None'}`,
                        source: `GitHub Issue #${issue.number}`,
                        sourceUrl: issue.html_url,
                        metadata: {
                            state: issue.state,
                            author: issue.user.login,
                            createdAt: issue.created_at,
                            updatedAt: issue.updated_at,
                            labels
                        },
                        embeddedAt: 0
                    });
                }
                page++;
            }
        }
        return documents;
    }
    async fetchPRs() {
        const documents = [];
        let page = 1;
        let hasMore = true;
        while (hasMore && page <= 10) {
            const response = await fetch(`${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/pulls?state=all&page=${page}&per_page=100`, {
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok)
                break;
            const prs = await response.json();
            if (prs.length === 0) {
                hasMore = false;
            }
            else {
                for (const pr of prs) {
                    const labels = pr.labels.map(l => l.name).join(', ');
                    documents.push({
                        id: `pr-${pr.number}`,
                        content: `PR #${pr.number}: ${pr.title}\n\n${pr.body || 'No description'}\n\n+${pr.additions} -${pr.deletions} lines`,
                        source: `GitHub PR #${pr.number}`,
                        sourceUrl: pr.html_url,
                        metadata: {
                            state: pr.state,
                            author: pr.user.login,
                            createdAt: pr.created_at,
                            updatedAt: pr.updated_at,
                            labels,
                            additions: pr.additions,
                            deletions: pr.deletions
                        },
                        embeddedAt: 0
                    });
                }
                page++;
            }
        }
        return documents;
    }
    async fetchDiscussions() {
        const documents = [];
        // GraphQL is needed for discussions
        const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          discussions(first: 100) {
            nodes {
              id
              title
              body
              createdAt
              updatedAt
              url
              category {
                name
              }
              author {
                login
              }
            }
          }
        }
      }
    `;
        const response = await fetch(`${this.baseUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${this.config.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                variables: {
                    owner: this.config.owner,
                    repo: this.config.repo
                }
            })
        });
        if (!response.ok) {
            // Discussions might not be enabled
            return documents;
        }
        const data = await response.json();
        const discussions = data.data?.repository?.discussions?.nodes || [];
        for (const discussion of discussions) {
            documents.push({
                id: `discussion-${discussion.id}`,
                content: `Discussion: ${discussion.title}\n\n${discussion.body || 'No content'}\n\nCategory: ${discussion.category.name}`,
                source: `GitHub Discussion`,
                sourceUrl: discussion.url,
                metadata: {
                    category: discussion.category.name,
                    author: discussion.author.login,
                    createdAt: discussion.created_at,
                    updatedAt: discussion.updated_at
                },
                embeddedAt: 0
            });
        }
        return documents;
    }
}
//# sourceMappingURL=github.js.map