// Example: Using Phantom Knowledge Layer

import { createKnowledgeEngine, GitHubConnector } from './src/index.js';

async function main() {
  // 1. Create knowledge engine
  const engine = await createKnowledgeEngine({
    embeddings: {
      provider: 'openai', // or 'ollama'
      model: 'text-embedding-3-small'
    },
    vectorStore: {
      type: 'file',
      path: './knowledge-store.json'
    },
    llm: {
      model: 'gpt-4o-mini'
    }
  });

  // 2. Register GitHub connector
  const github = new GitHubConnector({
    token: process.env.GITHUB_TOKEN || 'your-token',
    owner: 'sir-ad',
    repo: 'Phantom'
  });
  engine.registerConnector('github', github);

  // 3. Sync from GitHub
  console.log('📥 Syncing from GitHub...');
  await engine.syncConnector('github');

  // 4. Query the knowledge base
  console.log('\n❓ Query: What issues are open?');
  const result = await engine.query('What are the open issues in this repository?');
  
  console.log('\n📝 Answer:', result.answer);
  console.log('\n📚 Citations:');
  result.citations.forEach((cite, i) => {
    console.log(`  [${i + 1}] ${cite.source}`);
  });

  // 5. Get stats
  console.log('\n📊 Stats:', engine.getStats());
}

main().catch(console.error);
