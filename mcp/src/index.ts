// MCP Server for Phantom Knowledge
import { createKnowledgeEngine } from '../src/engine.js';
import type { KnowledgeEngine } from '../src/engine.js';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: object;
}

const tools: MCPTool[] = [
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
  private engine?: KnowledgeEngine;
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.engine = await createKnowledgeEngine(this.config);
  }

  getTools(): MCPTool[] {
    return tools;
  }

  async handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.engine) await this.initialize();

    switch (name) {
      case 'knowledge_search': {
        const results = await this.engine!.semanticSearch(args.query as string, args.limit as number || 5);
        return { results: results.map((d: any) => ({ id: d.id, source: d.source, content: d.content.slice(0, 200) })) };
      }
      case 'knowledge_sync': {
        await this.engine!.syncConnector(args.connector as string);
        return { success: true, connector: args.connector };
      }
      case 'knowledge_stats': {
        return this.engine!.getStats();
      }
      case 'knowledge_query': {
        const result = await this.engine!.query(args.question as string);
        return { answer: result.answer, citations: result.citations, sources: result.sources };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}

export { tools };
