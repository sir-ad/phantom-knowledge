# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-03-18

### Added
- Complete rewrite in TypeScript
- CLI with commands: init, search, sync, stats
- GitHub connector with rate limiting and pagination
- OpenAI and Ollama embeddings support
- RAG query engine with citations
- In-memory and file vector storage
- Module exports for embedding into larger projects

### Changed
- Package renamed to @phantom-pm/knowledge
- ESM by default
- Simplified API

### Removed
- Legacy Python code
- Complex setup requirements

## [1.0.0] - 2026-03-17

### Added
- Initial release
- Basic vector embeddings
- GitHub connector (beta)

---

## Deployment Checklist

- [x] All tests passing
- [x] TypeScript compiles without errors
- [x] Documentation complete
- [x] Version bumped
- [x] Changelog updated
- [ ] npm publish successful
- [ ] GitHub release created

## Rollback Plan

If issues arise:
1. Revert to previous version
2. Disable knowledge feature in config
3. Roll back CLI changes
