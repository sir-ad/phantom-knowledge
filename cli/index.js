#!/usr/bin/env node

/**
 * Phantom Knowledge CLI
 * Commands: init, search, sync, stats
 */

import { createKnowledgeEngine, GitHubConnector } from '../dist/index.js';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'init':
      await cmdInit();
      break;
    case 'search':
      await cmdSearch(args[1]);
      break;
    case 'sync':
      await cmdSync(args[1]);
      break;
    case 'stats':
      await cmdStats();
      break;
    default:
      console.log(`
Phantom Knowledge Layer CLI

Usage: phantom knowledge <command>

Commands:
  init              Initialize knowledge layer
  search <query>   Search knowledge base
  sync <source>    Sync from connector (github)
  stats             Show knowledge stats

Examples:
  phantom knowledge init
  phantom knowledge search "what is VAJRA?"
  phantom knowledge sync github
  phantom knowledge stats
`);
  }
}

async function cmdInit() {
  console.log('📚 Initializing Phantom Knowledge Layer...');
  
  const engine = await createKnowledgeEngine({
    embeddings: {
      provider: process.env.EMBEDDING_PROVIDER || 'ollama',
      model: process.env.EMBEDDING_MODEL || 'nomic-embed-text'
    },
    vectorStore: {
      type: process.env.VECTOR_STORE_TYPE || 'file',
      path: process.env.VECTOR_STORE_PATH || './knowledge.json'
    },
    llm: {
      model: process.env.LLM_MODEL || 'gpt-4o-mini'
    }
  });
  
  console.log('✅ Knowledge engine initialized!');
  console.log('\nNext steps:');
  console.log('  1. Set GITHUB_TOKEN for GitHub connector');
  console.log('  2. Run: phantom knowledge sync github');
  console.log('  3. Query: phantom knowledge search "your question"');
}

async function cmdSearch(query) {
  if (!query) {
    console.log('Error: Please provide a search query');
    console.log('Usage: phantom knowledge search "<query>"');
    process.exit(1);
  }
  
  console.log(`🔍 Searching for: "${query}"`);
  
  const engine = await createKnowledgeEngine({
    embeddings: { provider: 'ollama' },
    vectorStore: { type: 'memory' }
  });
  
  const result = await engine.query(query);
  
  console.log('\n📝 Answer:');
  console.log(result.answer);
  
  if (result.citations.length > 0) {
    console.log('\n📚 Sources:');
    result.citations.forEach((cite, i) => {
      console.log(`  [${i + 1}] ${cite.source}${cite.sourceUrl ? ` (${cite.sourceUrl})` : ''}`);
    });
  }
}

async function cmdSync(source) {
  if (!source) {
    console.log('Error: Please specify a source to sync');
    console.log('Usage: phantom knowledge sync <source>');
    console.log('Available: github');
    process.exit(1);
  }
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('Error: GITHUB_TOKEN not set');
    console.log('Set it with: export GITHUB_TOKEN=your_token');
    process.exit(1);
  }
  
  console.log(`📥 Syncing from ${source}...`);
  
  const engine = await createKnowledgeEngine({
    embeddings: { provider: 'ollama' },
    vectorStore: { type: 'file', path: './knowledge.json' }
  });
  
  if (source === 'github') {
    const [owner, repo] = (process.env.GITHUB_REPO || 'sir-ad/phantom-knowledge').split('/');
    const github = new GitHubConnector({ token, owner, repo });
    engine.registerConnector('github', github);
    await engine.syncConnector('github');
  }
  
  const stats = engine.getStats();
  console.log(`\n✅ Synced! Total documents: ${stats.documentCount}`);
}

async function cmdStats() {
  const engine = await createKnowledgeEngine({
    embeddings: { provider: 'ollama' },
    vectorStore: { type: 'file', path: './knowledge.json' }
  });
  
  const stats = engine.getStats();
  
  console.log('📊 Knowledge Stats');
  console.log('─'.repeat(20));
  console.log(`Total Documents: ${stats.documentCount}`);
  console.log(`Sources: ${stats.sources.join(', ')}`);
}

main().catch(console.error);
