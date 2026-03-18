// Performance benchmarks
// Run: npx tsx bench.ts

import { createKnowledgeEngine } from './src/index.js';

async function benchmark() {
  const engine = await createKnowledgeEngine({
    embeddings: { provider: 'ollama' },
    vectorStore: { type: 'memory' }
  });

  // Add test documents
  const docs = Array.from({ length: 100 }, (_, i) => ({
    id: `doc-${i}`,
    content: `Document ${i} content about various topics.`,
    source: `test-${i}`,
    metadata: {},
    embeddedAt: 0
  }));

  console.time('Embed 100 docs');
  await engine.addDocuments(docs);
  console.timeEnd('Embed 100 docs');

  console.time('Vector search');
  await engine.semanticSearch('test query', 5);
  console.timeEnd('Vector search');

  console.time('RAG query (no LLM - fallback)');
  const result = await engine.query('What is this about?');
  console.timeEnd('RAG query (no LLM - fallback)');

  console.log('Results:', result.sources.length, 'sources');
}

benchmark().catch(console.error);
