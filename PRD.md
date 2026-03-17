# PRD — Phantom Knowledge Layer

## Product Name
**Phantom Knowledge Layer** (v1.0)

---

## Problem

Phantom PM OS lacks:
1. **Knowledge ingestion** — Can't pull from external sources (GitHub, Drive, Notion)
2. **Semantic search** — No vector-based search across data
3. **Context retention** — No persistent memory between sessions
4. **Citation tracking** — AI responses have no source attribution

PMs can't leverage their existing data (issues, docs, notes) to get intelligent answers.

---

## User

- Product Managers using Phantom
- Teams wanting AI-powered search across their PM data
- Developers wanting code-aware search

---

## Context

Phantom already has:
- Mission engine
- Artifact generation
- Basic memory (local-first)
- Basic integrations (GitHub sync)

Missing:
- Vector embeddings
- Semantic search
- RAG with citations
- Multi-source connectors

---

## Goal

Add a knowledge layer to Phantom that enables:
1. Connect to multiple data sources
2. Semantic search across all connected data
3. AI-powered Q&A with source citations
4. Persistent memory

---

## Non-Goals

- Replace Phantom's mission engine
- Build a general-purpose RAG (keep PM-focused)
- Add real-time sync (batch sync only)
- Team/collaborative features (v2)

---

## Scope

### In Scope
- Vector embeddings (OpenAI + Ollama)
- File-based vector store
- RAG query engine with citations
- GitHub connector (issues, PRs, discussions)
- MCP server integration

### Out of Scope
- Real-time sync
- Team spaces
- Podcast generation
- Report export
- Notion/Drive/Slack connectors (v2)

---

## Key Flows

### Flow 1: Knowledge Ingestion
```
User → Configure connector → Auth → Sync → Index → Searchable
```

### Flow 2: Query with Citations
```
User query → RAG search → Context + Sources → LLM → Answer + Citations
```

### Flow 3: Chat with Memory
```
User message → History + Context → LLM → Response → Citations
```

---

## Requirements

### R1: Embeddings
- Support OpenAI text-embedding-3-small
- Support Ollama (local, free)
- Configurable dimensions

### R2: Vector Store
- In-memory option (fast, no persistence)
- File-based option (local JSON)
- Pinecone option (cloud, scalable)

### R3: RAG Query
- Semantic search across indexed documents
- Context-aware answers via LLM
- Source citation in every answer
- Configurable max tokens, temperature

### R4: GitHub Connector
- Fetch issues (open + closed)
- Fetch pull requests
- Fetch discussions (if available)
- Incremental sync support

### R5: MCP Server
- Expose knowledge search via MCP protocol
- Compatible with Claude Code, Cursor, etc.

---

## Acceptance Criteria

### AC1: Embeddings
- [ ] OpenAI embeddings work with valid API key
- [ ] Ollama embeddings work with local server
- [ ] Cosine similarity returns correct values

### AC2: Vector Store
- [ ] Documents can be added and retrieved
- [ ] Search returns relevant results
- [ ] File persistence works

### AC3: RAG Query
- [ ] Query returns answer + citations
- [ ] Citations include source name and URL
- [ ] Works without LLM (fallback to summary)

### AC4: GitHub Connector
- [ ] Can authenticate with GitHub token
- [ ] Fetches issues correctly
- [ ] Fetches PRs correctly

### AC5: Integration
- [ ] Works as standalone package
- [ ] Can be integrated into Phantom CLI

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API cost | Medium | Default to Ollama |
| Rate limits | Medium | Add batching |
| Large repos | High | Pagination + incremental sync |

---

## Metrics / Signals

| Metric | Target |
|--------|--------|
| Query relevance | 80%+ relevant |
| Index time | < 1 min per 100 docs |
| Search latency | < 500ms |
| Citation accuracy | 90%+ |

---

## Release Notes

### v1.0 (MVP)
- OpenAI + Ollama embeddings
- File-based vector store
- RAG with citations
- GitHub connector
- MCP server ready
