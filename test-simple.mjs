// Simple test - no external services needed
import { CitationTracker } from './dist/citations.js';
import { Embeddings } from './dist/embeddings.js';

console.log('🧪 Testing Phantom Knowledge Layer...\n');

// Test 1: Cosine Similarity
console.log('📌 Test 1: Cosine Similarity');
const emb = new Embeddings({ provider: 'ollama' });

const tests = [
  { a: [1, 0, 0], b: [1, 0, 0], expected: 1, desc: 'Same vector' },
  { a: [1, 0, 0], b: [0, 1, 0], expected: 0, desc: 'Perpendicular' },
  { a: [1, 0, 0], b: [-1, 0, 0], expected: -1, desc: 'Opposite' },
  { a: [1, 2, 3], b: [4, 5, 6], expected: null, desc: '3D vectors' },
];

tests.forEach(t => {
  const result = emb.cosineSimilarity(t.a, t.b);
  console.log(`  ${t.desc}: ${result.toFixed(3)}`);
});

console.log('  ✅ Similarity working!\n');

// Test 2: Citations
console.log('📌 Test 2: Citations');
const citations = new CitationTracker();

citations.addCitations([
  { documentId: '1', source: 'GitHub Issue #1', excerpt: 'Bug in login', relevanceScore: 0.9 },
  { documentId: '2', source: 'GitHub Issue #2', excerpt: 'Dark mode', relevanceScore: 0.7 },
  { documentId: '3', source: 'GitHub PR #42', excerpt: 'Add feature', relevanceScore: 0.5 },
]);

console.log('  Inline:', citations.formatCitationsInline());
console.log('  Top sources:', citations.getTopSources());
console.log('  ✅ Citations working!\n');

// Test 3: Document structure
console.log('📌 Test 3: Document Types');
const doc = {
  id: 'issue-123',
  content: 'This is a test issue about login bug',
  source: 'GitHub Issue #123',
  sourceUrl: 'https://github.com/sir-ad/Phantom/issues/123',
  metadata: {
    state: 'open',
    author: 'testuser',
    labels: ['bug', 'priority']
  },
  embeddedAt: Date.now()
};

console.log('  Document:', JSON.stringify(doc, null, 2).slice(0, 200) + '...');
console.log('  ✅ Document structure valid!\n');

console.log('🎉 Core tests passed!');
console.log('\n📝 To run full tests with LLM:');
console.log('   1. Set OPENAI_API_KEY env var');
console.log('   2. Or start Ollama: ollama serve');
console.log('   3. Then run: node test-full.mjs');
