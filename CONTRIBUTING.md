# Contributing to Phantom Knowledge Layer

Thank you for your interest in contributing!

## Development Setup

```bash
# Clone the repo
git clone https://github.com/sir-ad/phantom-knowledge.git
cd phantom-knowledge

# Install dependencies
npm install

# Build
npm run build

# Test
npm test
```

## Project Structure

```
phantom-knowledge/
├── src/
│   ├── index.ts          # Main exports
│   ├── types.ts         # Type definitions
│   ├── engine.ts        # Knowledge engine
│   ├── embeddings.ts    # Vector embeddings
│   ├── vector-store.ts  # Vector storage
│   ├── rag-query.ts    # RAG query
│   ├── citations.ts    # Citation tracking
│   └── connectors/    # Data connectors
│       └── github.ts
├── dist/               # Compiled output
├── package.json
└── tsconfig.json
```

## Adding a New Connector

1. Create a new file in `src/connectors/`
2. Implement the `Connector` interface
3. Export from `src/connectors/index.ts`
4. Add tests

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag: `git tag v1.0.0`
4. Push: `git push origin main --tags`

## Code Style

- Use TypeScript
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Test new features

## Questions?

Open an issue at: https://github.com/sir-ad/phantom-knowledge/issues
