# Phantom Knowledge Layer

> Vector embeddings, RAG with citations, and connectors for Phantom PM OS

## Status: 🚧 Phase 1 In Progress

This is the knowledge layer for Phantom PM OS. It adds:
- Vector embeddings (OpenAI / Ollama)
- Semantic search
- RAG with citations
- Connectors (GitHub, and more to come)

## Installation

```bash
cd packages/knowledge
npm install
npm run build
```

## Quick Start

```typescript
import { createKnowledgeEngine, GitHubConnector } from '@phantom-pm/knowledge';

const engine = await createKnowledgeEngine({
  embeddings: {
    provider: 'openai',
    model: 'text-embedding-3-small'
  },
  vectorStore: {
    type: 'file',
    path: './knowledge.json'
  },
  llm: {
    model: 'gpt-4o-mini'
  }
});

// Register GitHub connector
const github = new GitHubConnector({
  token: process.env.GITHUB_TOKEN,
  owner: 'sir-ad',
  repo: 'Phantom'
});
engine.registerConnector('github', github);

// Sync and query
await engine.syncConnector('github');
const result = await engine.query('What are the open issues?');

console.log(result.answer);
console.log(result.citations);
```

## Architecture

```
packages/knowledge/
├── src/
│   ├── index.ts          # Exports
│   ├── types.ts          # Type definitions
│   ├── engine.ts         # Main knowledge engine
│   ├── embeddings.ts      # Vector embeddings (OpenAI/Ollama)
│   ├── vector-store.ts   # Vector storage
│   ├── rag-query.ts     # RAG query engine
│   ├── citations.ts      # Citation tracking
│   └── connectors/
│       └── github.ts    # GitHub connector
├── example.ts            # Usage example
└── package.json
```

## Features

### Embeddings
- OpenAI text-embedding-3-small
- Ollama nomic-embed-text
- Cosine similarity

### Vector Store
- In-memory (fast, no persistence)
- File-based (local JSON)
- Pinecone (cloud, scalable)

### RAG
- Semantic search
- Context-aware answers
- Source citations

### Connectors
- GitHub (issues, PRs, discussions)
- More coming soon...

## Roadmap

- [x] Core engine
- [x] Embeddings
- [x] Vector store
- [x] RAG query
- [x] Citations
- [x] GitHub connector
- [ ] Notion connector
- [ ] Drive connector
- [ ] Slack connector
- [ ] Podcast generation
- [ ] Report export

## Environment Variables

```bash
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
OLLAMA_BASE_URL=http://localhost:11434
```

## License

MIT
