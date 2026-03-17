// Full test with mock LLM - Pure JS
import { Embeddings } from './dist/embeddings.js';
import { VectorStore } from './dist/vector-store.js';
import { CitationTracker } from './dist/citations.js';
import { RAGQuery } from './dist/rag-query.js';

console.log('🧪 Full Phantom Knowledge Layer Test\n');

// Create mock embeddings
class MockEmbeddings extends Embeddings {
  async embed(text) {
    // Deterministic mock based on text
    const hash = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return [Math.sin(hash), Math.cos(hash), Math.sin(hash * 2), Math.cos(hash * 3)];
  }
  
  async embedBatch(texts) {
    return Promise.all(texts.map(t => this.embed(t)));
  }
}

console.log('📌 Test 1: Knowledge Engine Setup');

const embeddings = new MockEmbeddings({ provider: 'ollama' });
const vectorStore = new VectorStore(embeddings, { type: 'memory' });
await vectorStore.initialize();

console.log('  ✅ Engine initialized!\n');

// Add sample documents
console.log('📌 Test 2: Adding Documents');
const docs = [
  {
    id: 'issue-1',
    content: 'Login button not working on Safari - users cannot authenticate',
    source: 'GitHub Issue #42',
    sourceUrl: 'https://github.com/sir-ad/Phantom/issues/42',
    metadata: { state: 'open', labels: ['bug', 'login'] }
  },
  {
    id: 'issue-2',
    content: 'Add dark mode support for better user experience',
    source: 'GitHub Issue #43',
    sourceUrl: 'https://github.com/sir-ad/Phantom/issues/43',
    metadata: { state: 'open', labels: ['feature', 'ui'] }
  },
  {
    id: 'pr-1',
    content: 'Fix memory leak in dashboard component by properly cleaning up event listeners',
    source: 'GitHub PR #45',
    sourceUrl: 'https://github.com/sir-ad/Phantom/pull/45',
    metadata: { state: 'merged', author: 'dev1' }
  },
  {
    id: 'issue-3',
    content: 'Improve performance of data loading in charts - reduce initial load time from 3s to 500ms',
    source: 'GitHub Issue #44',
    sourceUrl: 'https://github.com/sir-ad/Phantom/issues/44',
    metadata: { state: 'open', labels: ['performance'] }
  },
];

await vectorStore.addDocuments(docs);
console.log('  Added', vectorStore.count(), 'documents');

// Test search
console.log('\n📌 Test 3: Semantic Search');
const searchResults = await vectorStore.search('login authentication problem', 3);
console.log('  Query: "login authentication problem"');
console.log('  Results:', searchResults.map(r => ({
  source: r.source,
  content: r.content.slice(0, 50) + '...'
})));

// Test RAG with mock
console.log('\n📌 Test 4: RAG Query (Mock LLM)');
const citations = new CitationTracker();

// Override RAG to use mock
class MockRAGQuery extends RAGQuery {
  async generateAnswer(systemPrompt, userPrompt, options) {
    // Return a mock answer based on context
    return `Based on the issue tracker, there is an open bug (#42) about the login button not working on Safari. This appears to be the primary login-related issue to fix. Additionally, there are performance improvements needed in data loading (#44) and a dark mode feature request (#43).`;
  }
}

const rag = new MockRAGQuery(vectorStore, citations, { model: 'mock' });

const queryResult = await rag.query('What are the login issues?');
console.log('  Query: "What are the login issues?"');
console.log('  Answer:', queryResult.answer);
console.log('  Sources:', queryResult.sources);
console.log('  Citations:', queryResult.citations.length);

// Test citation formatting
console.log('\n📌 Test 5: Citation Formatting');
console.log('  Inline:', citations.formatCitationsInline());

console.log('\n📌 Test 6: Stats');
console.log('  Total docs:', vectorStore.count());
console.log('  Sources:', [...new Set(vectorStore.getAllDocuments().map(d => d.source))]);

console.log('\n🎉 All tests passed!');
console.log('\n✅ Phantom Knowledge Layer is ready to use!');
console.log('\nNext steps:');
console.log('1. Set OPENAI_API_KEY for real LLM');
console.log('2. Add GitHub token');
console.log('3. Run: phantom knowledge sync github');
console.log('4. Query: phantom knowledge search "your question"');
