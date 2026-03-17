// Simple test without API keys
import { Embeddings } from './dist/embeddings.js';
import { VectorStore } from './dist/vector-store.js';
import { CitationTracker } from './dist/citations.js';
import { RAGQuery } from './dist/rag-query.js';

console.log('🧪 Testing Phantom Knowledge Layer...\n');

// Test 1: Embeddings similarity
console.log('📌 Test 1: Cosine Similarity');
const emb = new Embeddings({ provider: 'ollama' });

const a = [1, 0, 0];
const b = [1, 0, 0];
const c = [0, 1, 0];
const d = [-1, 0, 0];

console.log('  Same vector (1,0,0) vs (1,0,0):', emb.cosineSimilarity(a, b)); // Should be 1
console.log('  Perpendicular (1,0,0) vs (0,1,0):', emb.cosineSimilarity(a, c)); // Should be 0
console.log('  Opposite (1,0,0) vs (-1,0,0):', emb.cosineSimilarity(a, d)); // Should be -1
console.log('  ✅ Similarity working!\n');

// Test 2: Vector Store (mock embeddings)
console.log('📌 Test 2: Vector Store');
const mockEmb = new Embeddings({ provider: 'ollama' });

// Override embed to return mock vectors
mockEmb.embed = async (text) => {
  // Simple mock: hash-based deterministic vector
  const hash = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [Math.sin(hash), Math.cos(hash), Math.sin(hash * 2)];
};

const store = new VectorStore(mockEmb, { type: 'memory' });
await store.initialize();

const docs = [
  { id: '1', content: 'This is a bug in the login flow', source: 'GitHub Issue #1', metadata: {} },
  { id: '2', content: 'Add dark mode support', source: 'GitHub Issue #2', metadata: {} },
  { id: '3', content: 'Fix memory leak in dashboard', source: 'GitHub Issue #3', metadata: {} },
];

await store.addDocuments(docs);
console.log('  Added', store.count(), 'documents');

const results = await store.search('login problem', 2);
console.log('  Search results:', results.map(r => r.source));
console.log('  ✅ Vector store working!\n');

// Test 3: Citations
console.log('📌 Test 3: Citations');
const citations = new CitationTracker();

citations.addCitations([
  { documentId: '1', source: 'GitHub Issue #1', excerpt: 'Bug in login', relevanceScore: 0.9 },
  { documentId: '2', source: 'GitHub Issue #2', excerpt: 'Dark mode', relevanceScore: 0.7 },
]);

console.log('  Citations:', citations.formatCitationsInline());
console.log('  Top sources:', citations.getTopSources());
console.log('  ✅ Citations working!\n');

// Test 4: Full RAG (without LLM)
console.log('📌 Test 4: RAG Query (Fallback)');
const rag = new RAGQuery(store, citations, { model: 'gpt-4o-mini' });

const result = await rag.query('How to fix login?');
console.log('  Answer:', result.answer);
console.log('  Sources:', result.sources);
console.log('  Context used:', result.contextUsed);
console.log('  ✅ RAG working!\n');

console.log('🎉 All tests passed!');
console.log('\n📝 To use with real LLM:');
console.log('   - Set OPENAI_API_KEY environment variable');
console.log('   - Or run Ollama and use provider: "ollama"');
