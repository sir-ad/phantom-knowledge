# IMPLEMENTATION PLAN
## Phantom Knowledge Layer — Step by Step

---

## PHASE 1: SETUP & CORE (Day 1)

### Task 1.1: Initialize Project
- [x] Create package structure ✅ DONE
- [ ] Write package.json with dependencies
- [ ] Add TypeScript config
- [ ] Add ESLint/Prettier config

### Task 1.2: Build Core Modules
- [x] types.ts ✅ DONE
- [x] embeddings.ts ✅ DONE
- [x] vector-store.ts ✅ DONE
- [x] citations.ts ✅ DONE
- [x] engine.ts ✅ DONE

### Task 1.3: Test Core Modules
- [ ] Test embeddings (with mock)
- [ ] Test vector store CRUD
- [ ] Test similarity search

---

## PHASE 2: CONNECTORS (Day 2)

### Task 2.1: GitHub Connector
- [x] Basic implementation ✅ DONE
- [ ] Add rate limiting
- [ ] Add pagination
- [ ] Add incremental sync

### Task 2.2: Test GitHub Connector
- [ ] Test with real GitHub token
- [ ] Test issue fetching
- [ ] Test PR fetching

### Task 2.3: Future Connectors (Not in v1)
- [ ] Notion connector (v2)
- [ ] Drive connector (v2)
- [ ] Slack connector (v2)

---

## PHASE 3: RAG & LLM (Day 3)

### Task 3.1: RAG Query Engine
- [x] Basic RAG ✅ DONE
- [ ] Add prompt templates
- [ ] Add context window management
- [ ] Add streaming (future)

### Task 3.2: LLM Integration
- [ ] OpenAI integration ✅ DONE (in code)
- [ ] Add fallback for failures
- [ ] Add token counting

### Task 3.3: Citation Formatting
- [ ] Markdown format
- [ ] HTML format
- [ ] API format

---

## PHASE 4: CLI INTEGRATION (Day 4)

### Task 4.1: Phantom CLI Commands
- [ ] `phantom knowledge init`
- [ ] `phantom knowledge search <query>`
- [ ] `phantom knowledge sync`
- [ ] `phantom knowledge stats`

### Task 4.2: Configuration
- [ ] Load from config file
- [ ] Environment variable support
- [ ] Validate config

---

## PHASE 5: MCP INTEGRATION (Day 5)

### Task 5.1: MCP Tools
- [ ] knowledge_search tool
- [ ] knowledge_sync tool
- [ ] knowledge_stats tool

### Task 5.2: MCP Server
- [ ] Register tools
- [ ] Handle requests
- [ ] Return formatted responses

---

## PHASE 6: TESTING & POLISH (Day 6-7)

### Task 6.1: Integration Tests
- [ ] Full flow: sync → query → cite
- [ ] Error handling
- [ ] Edge cases

### Task 6.2: Documentation
- [x] README ✅ DONE
- [x] PRD ✅ DONE
- [x] Tech Architecture ✅ DONE
- [ ] API Reference
- [ ] Examples

### Task 6.3: Release
- [ ] Version bump
- [ ] npm publish
- [ ] GitHub release

---

## DETAILED TASK BREAKDOWN

### Task 1.1.1: Package.json Dependencies

```json
{
  "name": "@phantom-pm/knowledge",
  "version": "1.0.0",
  "dependencies": {
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "tsx": "^4.0.0"
  }
}
```

### Task 1.3.1: Test Embeddings (Mock)

```typescript
// test/embeddings.test.ts
import { describe, it, expect } from 'vitest';
import { Embeddings } from '../src/embeddings.js';

describe('Embeddings', () => {
  it('should calculate cosine similarity', () => {
    const emb = new Embeddings({ provider: 'ollama' });
    const a = [1, 0, 0];
    const b = [1, 0, 0];
    expect(emb.cosineSimilarity(a, b)).toBe(1);
  });
});
```

### Task 2.1.1: GitHub Rate Limiting

```typescript
// Add to github.ts
private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, this.headers);
    
    if (response.status === 429) {
      const wait = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    
    return response;
  }
  throw new Error('Rate limited');
}
```

### Task 4.1.1: CLI Command Structure

```typescript
// packages/cli/src/commands/knowledge.ts
import { Command } from 'commander';
import { createKnowledgeEngine } from '@phantom-pm/knowledge';

export const knowledgeCommand = new Command('knowledge')
  .description('Knowledge layer commands');

knowledgeCommand
  .command('search <query>')
  .description('Search knowledge base')
  .action(async (query) => {
    const engine = await createKnowledgeEngine(config);
    const result = await engine.query(query);
    console.log(result.answer);
    console.log(result.citations);
  });

knowledgeCommand
  .command('sync')
  .description('Sync from connectors')
  .action(async () => {
    const engine = await createKnowledgeEngine(config);
    await engine.syncConnector('github');
  });
```

---

## CODEOWNERS

| Module | Owner |
|--------|-------|
| embeddings.ts | Auto-generated |
| vector-store.ts | Auto-generated |
| connectors/github.ts | Auto-generated |
| rag-query.ts | Auto-generated |
| CLI integration | Phantom team |

---

## DEPENDENCIES

### Production
- `dotenv` — Environment variables
- `openai` — LLM client (optional)

### Development
- `typescript` — Type checking
- `tsx` — TypeScript executor
- `vitest` — Testing
- `eslint` — Linting

---

## BUILD COMMANDS

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Dev (watch)
npm run dev

# Lint
npm run lint

# Format
npm run format
```

---

## DEPLOYMENT CHECKLIST

- [ ] All tests passing
- [ ] TypeScript compiles without errors
- [ ] Documentation complete
- [ ] Version bumped
- [ ] Changelog updated
- [ ] npm publish successful
- [ ] GitHub release created

---

## ROLLBACK PLAN

If issues arise:
1. Revert to previous version
2. Disable knowledge feature in config
3. Roll back CLI changes

---

*Implementation Plan Date: 2026-03-17*
