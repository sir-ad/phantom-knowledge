// MCP Server for Phantom Knowledge
import { createKnowledgeEngine } from '../src/index.js';
const tools = [
    {
        name: 'knowledge_search',
        description: 'Search the knowledge base',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query' },
                limit: { type: 'number', description: 'Max results', default: 5 }
            },
            required: ['query']
        }
    },
    {
        name: 'knowledge_sync',
        description: 'Sync data from connectors',
        inputSchema: {
            type: 'object',
            properties: {
                connector: { type: 'string', description: 'Connector name (github)' }
            },
            required: ['connector']
        }
    },
    {
        name: 'knowledge_stats',
        description: 'Get knowledge base statistics',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'knowledge_query',
        description: 'Query with RAG and get answer with citations',
        inputSchema: {
            type: 'object',
            properties: {
                question: { type: 'string', description: 'Question to ask' }
            },
            required: ['question']
        }
    }
];
export class MCPKnowledgeServer {
    engine;
    config;
    constructor(config) {
        this.config = config;
    }
    async initialize() {
        this.engine = await createKnowledgeEngine(this.config);
    }
    getTools() {
        return tools;
    }
    async handleTool(name, args) {
        if (!this.engine)
            await this.initialize();
        switch (name) {
            case 'knowledge_search': {
                const results = await this.engine.semanticSearch(args.query, args.limit || 5);
                return { results: results.map(d => ({ id: d.id, source: d.source, content: d.content.slice(0, 200) })) };
            }
            case 'knowledge_sync': {
                await this.engine.syncConnector(args.connector);
                return { success: true, connector: args.connector };
            }
            case 'knowledge_stats': {
                return this.engine.getStats();
            }
            case 'knowledge_query': {
                const result = await this.engine.query(args.question);
                return { answer: result.answer, citations: result.citations, sources: result.sources };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}
export { tools };
