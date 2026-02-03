<div align="center">

# 🦅 Enterprise OpenClaw

### Open Source Multi-Agent Platform

**GenAI-native platform for building intelligent systems**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/wjlgatech/enterprise-openclaw-public)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](./LICENSE)
[![Open Source](https://img.shields.io/badge/open%20source-core-brightgreen.svg)](https://github.com/wjlgatech/enterprise-openclaw-public)

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Enterprise](#-enterprise-version)

</div>

---

## 🎯 What is Enterprise OpenClaw?

**Open source core** of a production-ready platform for building GenAI-powered multi-agent systems.

### What You Get (Free & Open Source)

- 🧠 **Knowledge Graph** - Store and traverse complex information
- 🔍 **Vector Search** - Semantic similarity with LanceDB
- 📚 **Basic RAG** - Retrieval-Augmented Generation for AI apps
- 🤖 **Multi-Agent Foundation** - Build and coordinate AI agents
- 🌐 **Web UI** - Interactive knowledge management interface
- 🔌 **REST API** - Ready-to-use HTTP endpoints

**License:** Apache 2.0 - Use it anywhere, commercially or personally!

---

## ⚡ Quick Start

### 🚀 One-Click: Install + Run

```bash
git clone https://github.com/wjlgatech/enterprise-openclaw-public.git && \
cd enterprise-openclaw-public && \
./install.sh
```

**The script will:**
1. ✓ Check prerequisites (Node.js >= 20)
2. ✓ Install all dependencies
3. ✓ Build the core package
4. ✓ Run tests
5. ✓ Ask if you want to start the app

**Then open:** http://localhost:3000 🎉

### Or Manual Installation

```bash
git clone https://github.com/wjlgatech/enterprise-openclaw-public.git
cd enterprise-openclaw-public
npm install && npm run build && npm start
```

### What You'll See

A beautiful web interface with:
- 🔍 **Query knowledge** - Natural language search
- ➕ **Add knowledge** - Build your knowledge base
- 📚 **Browse all** - View stored information
- 📊 **Live status** - Real-time monitoring

---

## 💻 Use as a Library

### Installation

```bash
npm install @enterprise-openclaw/core
```

### Basic Usage

```typescript
import { KnowledgeGraph } from '@enterprise-openclaw/core';

// Create a knowledge graph
const kg = new KnowledgeGraph('./data/knowledge');
await kg.initialize();

// Add knowledge
await kg.addNode({
  id: 'concept_1',
  type: 'concept',
  content: 'Enterprise OpenClaw is a GenAI platform'
});

// Query with natural language
const results = await kg.queryNodes('what is enterprise openclaw');
console.log(results);
```

That's it! 🚀

---

## ✨ Core Features (Open Source)

### Knowledge Graph
- Store nodes with relationships
- Graph traversal and queries
- Metadata support
- Type-safe operations

### Vector Search
- Semantic similarity search
- LanceDB integration
- Fast approximate nearest neighbor
- Customizable embeddings

### Basic RAG
- Retrieval-augmented generation
- Context injection for LLMs
- Simple and effective

### Multi-Agent Foundation
- Agent orchestration basics
- Task coordination
- Message passing

### Web Interface
- Modern React-style UI
- Real-time updates
- RESTful API
- Easy integration

---

## 📖 Documentation

**API Reference:**
- [Knowledge Graph API](./packages/core/README.md#knowledge-graph-api)
- [Vector Store API](./packages/core/README.md#vector-store-api)
- [RAG API](./packages/core/README.md#rag-api)

**Examples:**
- [Basic Knowledge Graph](./examples/basic-knowledge-graph.ts)
- [Vector Search](./examples/vector-search.ts)
- [Simple RAG](./examples/basic-rag.ts)

---

## 🏢 Enterprise Version

Want advanced features for production deployments?

**Enterprise OpenClaw** adds:
- 🚀 **Advanced DRIFT RAG** - Dynamic reasoning with inference
- 🛡️ **PII Detection** - Automatic privacy protection
- 📝 **Audit Logging** - Complete compliance trail
- 🏗️ **Multi-Tenant** - Secure data isolation
- 🔌 **Enterprise Connectors** - Integration with your stack
- 🧠 **Inference Engine** - Automatic knowledge gap detection
- 🆘 **Priority Support** - Email, phone, and Slack

### Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Starter** | $99/mo | Advanced RAG, 1 tenant, 100K tokens/mo |
| **Professional** | $499/mo | + Inference, PII detection, 5 tenants |
| **Enterprise** | Custom | + Multi-tenant, audit logs, unlimited |

**Learn more:** [Enterprise Features](https://github.com/wjlgatech/enterprise-openclaw#enterprise-features)

**Contact sales:** sales@enterprise-openclaw.com

---

## 🛠️ Development

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Build from Source

```bash
git clone https://github.com/wjlgatech/enterprise-openclaw-public.git
cd enterprise-openclaw-public

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Start server
npm start
```

### Scripts

```bash
npm run build      # Build the core package
npm test           # Run tests
npm start          # Start the web server
```

---

## 🤝 Contributing

We welcome contributions! This is the **open source core** - help us make it better.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## 🏗️ Architecture

Built with modern, production-ready technologies:

- **TypeScript 5.7** - Type-safe development
- **LanceDB** - High-performance vector store
- **Vitest** - Fast, modern testing
- **Express** - Web server
- **Zod** - Runtime validation

---

## 📊 Project Status

- ✅ **Production Ready** - v1.0.0 released
- ✅ **Battle Tested** - 134 tests passing
- ✅ **Well Documented** - Comprehensive guides
- ✅ **Active Development** - Regular updates

---

## 🌟 Why Choose Enterprise OpenClaw?

| Feature | Enterprise OpenClaw | LangChain | LlamaIndex |
|---------|---------------------|-----------|------------|
| **Knowledge Graph** | ✅ Native | ❌ | ✅ Basic |
| **Vector Search** | ✅ LanceDB | ✅ Various | ✅ Various |
| **Multi-Agent** | ✅ Built-in | ✅ | ⚠️ Limited |
| **Type Safety** | ✅ Full TypeScript | ⚠️ Partial | ⚠️ Partial |
| **Web UI** | ✅ Included | ❌ | ❌ |
| **Open Source** | ✅ Apache 2.0 | ✅ MIT | ✅ MIT |
| **Enterprise Option** | ✅ Available | ✅ | ❌ |

---

## 📄 License

**Apache License 2.0**

Free to use commercially and personally. See [LICENSE](./LICENSE) for details.

The enterprise features are available under a separate commercial license.

---

## 🙏 Acknowledgments

Built with ❤️ by the Enterprise OpenClaw Team

**Powered by Claude Sonnet 4.5**

---

## 🔗 Links

- **GitHub (Open Source):** https://github.com/wjlgatech/enterprise-openclaw-public
- **Enterprise Version:** https://github.com/wjlgatech/enterprise-openclaw
- **Documentation:** [Read the docs](./docs/)
- **Issues:** [Report bugs](https://github.com/wjlgatech/enterprise-openclaw-public/issues)
- **Discussions:** [Join the community](https://github.com/wjlgatech/enterprise-openclaw-public/discussions)

---

<div align="center">

### Ready to build intelligent systems?

[Get Started →](#-quick-start) | [View Enterprise →](https://github.com/wjlgatech/enterprise-openclaw) | [Contribute →](#-contributing)

---

*Enterprise OpenClaw - Open Source Multi-Agent Platform* 🦅

</div>
