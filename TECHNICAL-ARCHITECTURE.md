# TECHNICAL ARCHITECTURE
## Phantom Knowledge Layer Integration

---

## 1. SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PHANTOM PM OS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    CLI / Dashboard                           │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                         │
│  ┌──────────────────────────▼───────────────────────────────────┐   │
│  │                   MISSION ENGINE                             │   │
│  │  (existing: missions, artifacts, discovery)                 │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                         │
│  ┌──────────────────────────▼───────────────────────────────────┐   │
│  │               KNOWLEDGE LAYER (NEW)                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │   │
│  │  │  Connectors │  │   Engine    │  │  MCP Server    │    │   │
│  │  │  ─────────  │  │   ──────    │  │  ──────────    │    │   │
│  │  │  • GitHub   │  │  • Embed    │  │  • search      │    │   │
│  │  │  • Notion   │  │  • Vector   │  │  • query       │    │   │
│  │  │  • Drive    │  │  • RAG      │  │  • sync        │    │   │
│  │  │  • Slack    │  │  • Cite     │  │                 │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                             │                                         │
│  ┌──────────────────────────▼───────────────────────────────────┐   │
│  │                   INTEGRATIONS                                │   │
│  │  (existing: GitHub, Notion, Linear, Figma)                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. PACKAGE STRUCTURE

```
packages/
├── knowledge/                    # NEW
│   ├── src/
│   │   ├── index.ts            # Main exports
│   │   ├── types.ts            # Type definitions
│   │   ├── engine.ts           # KnowledgeEngine class
│   │   ├── embeddings.ts       # OpenAI/Ollama
│   │   ├── vector-store.ts     # Vector storage
│   │   ├── rag-query.ts        # RAG with LLM
│   │   ├── citations.ts         # Citation tracking
│   │   └── connectors/
│   │       ├── index.ts
│   │       ├── github.ts
│   │       ├── notion.ts       # FUTURE
│   │       └── drive.ts        # FUTURE
│   ├── package.json
│   └── README.md
│
└── core/                        # EXISTING - MODIFY
    └── src/
        └── index.ts             # Import KnowledgeEngine
```

---

## 3. DATA FLOW ARCHITECTURE

### 3.1 Ingestion Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Connector  │────▶│   Parser    │────▶│ Embeddings  │────▶│   Vector   │
│  (GitHub)  │     │ (Normalize) │     │  (OpenAI)   │     │   Store    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │  Fetch docs       │  Clean + chunk    │  Vector array    │  Store
       ▼                   ▼                   ▼                   ▼
   Document            Document            Document           Document
   (raw JSON)         (cleaned text)      (with vector)     (indexed)
```

### 3.2 Query Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User     │────▶│   Query     │────▶│   Vector   │────▶│  Context   │
│   Query    │     │  (自然语言)   │     │   Search   │     │  Builder   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                         │
       ┌───────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    LLM     │────▶│  Response   │────▶│  Citations  │────▶│   Output    │
│  (GPT-4)   │     │  (Answer)   │     │  (Sources)  │     │  (UI/API)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## 4. CLASS DIAGRAMS

### 4.1 Core Classes

```
┌─────────────────────────────────────────────────────────────────┐
│                        KnowledgeEngine                           │
├─────────────────────────────────────────────────────────────────┤
│ - embeddings: Embeddings                                        │
│ - vectorStore: VectorStore                                      │
│ - ragQuery: RAGQuery                                           │
│ - citations: CitationTracker                                   │
│ - connectors: Map<string, Connector>                          │
├─────────────────────────────────────────────────────────────────┤
│ + initialize(): Promise<void>                                   │
│ + addDocument(doc: Document): Promise<void>                    │
│ + addDocuments(docs: Document[]): Promise<void>                │
│ + query(prompt: string): Promise<QueryResult>                  │
│ + chat(message: string): Promise<QueryResult>                   │
│ + registerConnector(name: string, connector: Connector): void   │
│ + syncConnector(name: string): Promise<void>                   │
│ + getStats(): Stats                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Embeddings Strategy

```
                    ┌─────────────────┐
                    │   Embeddings    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌───────────┐  ┌───────────┐  ┌───────────┐
      │  OpenAI   │  │  Ollama   │  │  Custom   │
      │ Provider  │  │  Provider  │  │  Provider │
      └───────────┘  └───────────┘  └───────────┘
```

### 4.3 Vector Store Strategy

```
                    ┌─────────────────┐
                    │  VectorStore    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    Memory     │    │     File      │    │   Pinecone   │
│   (in-memory)│    │   (JSON)      │    │   (cloud)    │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 5. INTEGRATION POINTS

### 5.1 With Phantom Core

```typescript
// packages/core/src/index.ts

import { KnowledgeEngine } from '@phantom-pm/knowledge';

// Add to PhantomContext
interface PhantomContext {
  // ... existing fields
  knowledge?: KnowledgeEngine;
}

// Initialize
const knowledge = await createKnowledgeEngine({
  embeddings: { provider: 'ollama' },
  vectorStore: { type: 'file', path: '~/.phantom/knowledge.json' }
});
```

### 5.2 With CLI

```bash
# New commands
phantom knowledge init           # Initialize knowledge layer
phantom knowledge search <query> # Search
phantom knowledge sync           # Sync all connectors
phantom knowledge stats          # Show stats
```

### 5.3 With MCP Server

```typescript
// packages/mcp-server/src/handlers/knowledge.ts

export const knowledgeTools = {
  async search({ query, limit = 5 }) {
    const results = await knowledge.query(query, { limit });
    return {
      answer: results.answer,
      citations: results.citations,
      sources: results.sources
    };
  },

  async sync({ connector }) {
    await knowledge.syncConnector(connector);
    return { success: true };
  }
};
```

---

## 6. DATABASE SCHEMA

### 6.1 Vector Store (JSON)

```json
{
  "version": 1,
  "documents": [
    {
      "id": "issue-123",
      "content": "Issue title and body...",
      "source": "GitHub Issue #123",
      "sourceUrl": "https://github.com/...",
      "metadata": {
        "state": "open",
        "author": "username",
        "labels": ["bug", "priority"]
      },
      "embedding": [0.1, 0.2, -0.3, ...],
      "embeddedAt": 1699999999999
    }
  ]
}
```

### 6.2 Metadata Store

```json
{
  "sources": {
    "github": {
      "owner": "sir-ad",
      "repo": "Phantom",
      "lastSync": 1699999999999,
      "documentCount": 150
    }
  },
  "stats": {
    "totalDocuments": 150,
    "lastQuery": 1699999999999,
    "topSources": ["GitHub Issues", "GitHub PRs"]
  }
}
```

---

## 7. API DESIGN

### 7.1 Internal API

```typescript
// Knowledge Engine API
interface KnowledgeAPI {
  // Initialize
  initialize(): Promise<void>;
  
  // Documents
  addDocument(doc: Document): Promise<void>;
  addDocuments(docs: Document[]): Promise<void>;
  getDocument(id: string): Promise<Document | null>;
  
  // Query
  query(prompt: string, options?: QueryOptions): Promise<QueryResult>;
  chat(message: string, history?: Message[]): Promise<QueryResult>;
  
  // Connectors
  registerConnector(name: string, connector: Connector): void;
  syncConnector(name: string): Promise<SyncResult>;
  listConnectors(): ConnectorInfo[];
  
  // Admin
  getStats(): Stats;
  clear(): Promise<void>;
}
```

### 7.2 CLI Commands

```bash
# Initialize
phantom knowledge init --provider ollama --vector file

# Search
phantom knowledge search "what are the open issues?"

# Sync
phantom knowledge sync github

# Stats
phantom knowledge stats
```

### 7.3 MCP Tools

```json
{
  "tools": {
    "phantom_knowledge_search": {
      "description": "Search the knowledge base",
      "parameters": {
        "type": "object",
        "properties": {
          "query": { "type": "string" },
          "limit": { "type": "number", "default": 5 }
        }
      }
    },
    "phantom_knowledge_sync": {
      "description": "Sync from a connector",
      "parameters": {
        "type": "object",
        "properties": {
          "connector": { "type": "string" }
        }
      }
    }
  }
}
```

---

## 8. CONFIGURATION

### 8.1 Environment Variables

```bash
# OpenAI (optional)
OPENAI_API_KEY=sk-...

# Ollama (optional)
OLLAMA_BASE_URL=http://localhost:11434

# GitHub (for connector)
GITHUB_TOKEN=ghp_...

# Vector Store
KNOWLEDGE_STORE_PATH=~/.phantom/knowledge.json
KNOWLEDGE_STORE_TYPE=file  # file | memory | pinecone
```

### 8.2 Phantom Config

```yaml
# ~/.phantom/config.yaml
knowledge:
  provider: ollama  # openai | ollama
  embeddingModel: nomic-embed-text
  vectorStore:
    type: file
    path: ~/.phantom/knowledge.json
  llm:
    model: gpt-4o-mini
  connectors:
    github:
      enabled: true
      token: ${GITHUB_TOKEN}
```

---

## 9. ERROR HANDLING

### 9.1 Error Types

```typescript
enum KnowledgeErrorCode {
  NOT_INITIALIZED = 'KNOWLEDGE_001',
  CONNECTOR_FAILED = 'KNOWLEDGE_002',
  EMBEDDING_FAILED = 'KNOWLEDGE_003',
  VECTOR_STORE_ERROR = 'KNOWLEDGE_004',
  LLM_QUERY_FAILED = 'KNOWLEDGE_005',
  RATE_LIMIT_EXCEEDED = 'KNOWLEDGE_006'
}
```

### 9.2 Fallback Strategies

| Error | Fallback |
|-------|----------|
| OpenAI API down | Use Ollama |
| Ollama not running | Return error, suggest install |
| Rate limit | Exponential backoff + queue |
| LLM fails | Return raw context summary |

---

## 10. SECURITY

### 10.1 API Keys

- Store in environment variables
- Never log or expose
- Rotate regularly

### 10.2 Rate Limiting

- GitHub: 5000 requests/hour (authenticated)
- OpenAI: Depends on tier

### 10.3 Data Privacy

- All data stays local (file-based store)
- No telemetry
- User controls their data

---

## 11. PERFORMANCE

### 11.1 Benchmarks

| Operation | Target |
|-----------|--------|
| Embed 1 document | < 500ms |
| Embed 100 documents | < 30s (batch) |
| Vector search | < 100ms |
| RAG query (no LLM) | < 200ms |
| RAG query (with LLM) | < 5s |

### 11.2 Optimization Strategies

- Batch embedding operations
- Cache recent queries
- Paginate large result sets
- Async background sync

---

## 12. DEPLOYMENT

### 12.1 Development

```bash
npm run dev  # Watch mode
```

### 12.2 Production

```bash
npm run build
npm publish
```

### 12.3 Docker (Future)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY packages/knowledge ./packages/knowledge
RUN cd packages/knowledge && npm install && npm run build
CMD ["node", "packages/knowledge/dist/index.js"]
```

---

*Architecture Date: 2026-03-17*
