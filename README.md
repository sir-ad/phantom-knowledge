# Phantom Knowledge Layer

Vector embeddings, RAG, and connectors for AI applications.

## Quick Start

```bash
npm install @phantom-pm/knowledge
```

```javascript
import { createKnowledgeEngine, GitHubConnector } from '@phantom-pm/knowledge';

const engine = await createKnowledgeEngine({
  embeddings: { provider: 'ollama' },
  vectorStore: { type: 'memory' }
});

// Add documents
await engine.addDocuments([
  { id: '1', content: 'My content', source: 'test' }
]);

// Query
const result = await engine.query('What is this about?');
console.log(result.answer);
console.log(result.citations);
```

## Features

- Vector embeddings (OpenAI, Ollama)
- RAG with citations
- Connectors (GitHub, more coming)
- In-memory & file storage

## CLI

```bash
phantom-knowledge init
phantom-knowledge search "query"
phantom-knowledge sync github
```

## Docs

See README.md for full documentation.
