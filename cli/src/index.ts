// CLI main entry
import { Command } from 'commander';
import { createKnowledgeEngine } from '../src/index.js';
import * as fs from 'fs';
import * as path from 'path';

interface Config {
  embeddings: { provider: string; model?: string };
  vectorStore: { type: string; path?: string };
  llm?: { model?: string };
  github?: { token: string; owner: string; repo: string };
}

function loadConfig(): Config {
  const configPath = process.cwd() + '/phantom-knowledge.json';
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  return {
    embeddings: { provider: 'ollama' },
    vectorStore: { type: 'memory' }
  };
}

const program = new Command();

program
  .name('phantom-knowledge')
  .description('Phantom Knowledge Layer CLI')
  .version('2.0.0');

// Init command
program
  .command('init')
  .description('Initialize knowledge config')
  .action(() => {
    const config: Config = {
      embeddings: { provider: 'ollama', model: 'nomic-embed-text' },
      vectorStore: { type: 'memory' },
      llm: { model: 'gpt-4o-mini' }
    };
    fs.writeFileSync('phantom-knowledge.json', JSON.stringify(config, null, 2));
    console.log('Created phantom-knowledge.json');
  });

// Search command
program
  .command('search <query>')
  .description('Search knowledge base')
  .action(async (query: string) => {
    const config = loadConfig();
    const engine = await createKnowledgeEngine(config as any);
    const result = await engine.query(query);
    console.log(result.answer);
    console.log('\nCitations:');
    result.citations.forEach((c, i) => {
      console.log(`[${i + 1}] ${c.source}${c.sourceUrl ? ` - ${c.sourceUrl}` : ''}`);
    });
  });

// Sync command
program
  .command('sync')
  .description('Sync from connectors')
  .action(async () => {
    const config = loadConfig();
    const engine = await createKnowledgeEngine(config as any);
    if (config.github) {
      const { GitHubConnector } = await import('../src/connectors/github.js');
      const github = new GitHubConnector(config.github);
      engine.registerConnector('github', github);
      await engine.syncConnector('github');
      console.log('GitHub sync complete');
    }
  });

// Stats command
program
  .command('stats')
  .description('Show knowledge stats')
  .action(async () => {
    const config = loadConfig();
    const engine = await createKnowledgeEngine(config as any);
    const stats = engine.getStats();
    console.log(`Documents: ${stats.documentCount}`);
    console.log('Sources:', stats.sources.join(', '));
  });

program.parse();
