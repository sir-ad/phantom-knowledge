import { Document, Connector } from '../types.js';
interface GitHubConfig {
    token: string;
    owner: string;
    repo: string;
}
export declare class GitHubConnector implements Connector {
    name: string;
    private config;
    private baseUrl;
    constructor(config: GitHubConfig);
    connect(): Promise<void>;
    fetch(): Promise<Document[]>;
    sync(): Promise<void>;
    private fetchIssues;
    private fetchPRs;
    private fetchDiscussions;
}
export {};
//# sourceMappingURL=github.d.ts.map