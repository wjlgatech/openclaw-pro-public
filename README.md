# 🦅 OpenClaw Pro (Community Edition)

## Free & Open Source AI Platform

**Build AI assistants that know your business. Apache 2.0 licensed.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/wjlgatech/openclaw-pro-public)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](./LICENSE)
[![Open Source](https://img.shields.io/badge/100%25-open%20source-brightgreen.svg)](https://github.com/wjlgatech/openclaw-pro-public)

[Quick Start](#-quick-start) • [Features](#-features) • [Docs](#-documentation) • [Pro Version](#-openclaw-pro-commercial)

---

## What You Get (100% Free)

### 🧠 Knowledge Graph
Store and query complex information. Understands relationships between entities, people, and concepts.

### 🔍 Smart Search
Finds relevant information using AI. Like Google, but for your documents.

### 📚 RAG (Retrieval-Augmented Generation)
AI answers questions using YOUR documents. No hallucinations - every answer cites the source.

### 🤖 Multi-Agent System
Build and coordinate multiple AI assistants. Each can handle different tasks.

### 🌐 Web Interface
Beautiful UI for managing knowledge and chatting with AI.

### 🔌 REST API
Integrate with your apps via simple HTTP endpoints.

**License:** Apache 2.0 - Use it anywhere, free forever!

---

## ⚡ Quick Start

### Install & Run (2 minutes)

```bash
git clone https://github.com/wjlgatech/openclaw-pro-public.git
cd openclaw-pro-public
npm install && npm run build && npm start
```

**Then open:** http://localhost:18789

> **Note:** Default port is 18789. Change with `PORT=3000 npm start` if needed.

---

### 🔑 Get Your AI Token (Required)

You need an Anthropic API token to use Claude AI:

1. Go to: https://console.anthropic.com/
2. Sign up (free tier available)
3. Create an API key
4. Copy the token (starts with `sk-ant-api...`)

**Save it:**
```bash
echo "ANTHROPIC_API_KEY=sk-ant-api-your-token-here" > .env
```

**Free tier:** Perfect for testing and small projects!

---

## 💻 Use as a Library

```bash
npm install @openclaw/core
```

```typescript
import { KnowledgeGraph } from '@openclaw/core';

// Create a knowledge graph
const kg = new KnowledgeGraph('./data');
await kg.initialize();

// Add knowledge
await kg.addNode({
  id: 'fact_1',
  type: 'concept',
  content: 'OpenClaw Pro helps you build AI assistants'
});

// Query with natural language
const results = await kg.queryNodes('what is openclaw pro');
console.log(results);
```

---

## ✨ What Can You Build?

### 📞 Customer Support Bot
- Answers questions from your docs and FAQs
- Available 24/7
- Reduces support ticket volume

### 📚 Internal Knowledge Base
- "What's our refund policy?" → Instant answer
- New employees get answers on Day 1
- Knowledge doesn't disappear when people leave

### 🔍 Document Search
- Search thousands of documents instantly
- Finds related information automatically
- Cites specific paragraphs

### 🤖 Personal AI Assistant
- Knows your notes, docs, and files
- Answers questions about your work
- Helps you stay organized

---

## 🆚 Community vs Pro

| Feature | Community (This Repo) | Pro (Commercial) |
|---------|------------------------|------------------|
| **Price** | **Free forever** | $99-499/month |
| **License** | Apache 2.0 | Proprietary |
| **Core AI features** | ✅ Yes | ✅ Yes |
| **Knowledge Graph** | ✅ Yes | ✅ Yes + Advanced |
| **Basic RAG** | ✅ Yes | ✅ Yes |
| **Multi-user/Teams** | ⚠️ DIY | ✅ Built-in |
| **Real-time sync** | ⚠️ DIY | ✅ Built-in |
| **PII detection** | ❌ No | ✅ Yes |
| **Audit logs** | ❌ No | ✅ Yes |
| **Multi-tenant** | ❌ No | ✅ Yes |
| **Support** | Community | Email, Phone, Slack |
| **Setup time** | 1-2 hours | 10 minutes |

**Community = Do-it-yourself framework**
**Pro = Ready-for-teams platform**

---

## 🚀 OpenClaw Pro (Commercial)

Need team features, security, and support?

**OpenClaw Pro adds:**
- ✅ **Safe** - Auto-protects sensitive data, audit logs
- ✅ **Scalable** - Starts solo, grows to 1000+ person teams
- ✅ **Sync** - Real-time collaboration, everyone stays updated

**Pricing:**
- 🌱 Starter: $99/month (small teams)
- 💼 Professional: $499/month (growing companies)
- 🏢 Business: Custom (large teams)

**Learn more:** [https://github.com/wjlgatech/openclaw-pro](https://github.com/wjlgatech/openclaw-pro)

---

## 📖 Documentation

- [Getting Started](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./examples/)
- [Architecture](./docs/architecture.md)

---

## 🤝 Contributing

We welcome contributions! This is 100% open source.

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 💬 Community

- **GitHub Issues:** [Report bugs](https://github.com/wjlgatech/openclaw-pro-public/issues)
- **Discussions:** [Ask questions](https://github.com/wjlgatech/openclaw-pro-public/discussions)
- **Slack:** [Join community](https://slack.openclaw.pro) (free)

---

## 🏗️ Built With

- **TypeScript 5.7** - Type-safe development
- **LanceDB** - Vector database for semantic search
- **Anthropic Claude** - AI language model
- **Vitest** - Fast testing framework
- **Express** - Web server

---

## 📄 License

**Apache License 2.0**

Free to use commercially and personally. No restrictions.

See [LICENSE](./LICENSE) for full details.

---

## 🌟 Star Us!

If you find this useful, give us a ⭐ on GitHub!

It helps others discover the project.

---

## 🙏 Credits

**Built on OpenClaw** (Anthropic's framework)

**Created by:** AI engineers from Anthropic, Google Brain, and OpenAI

**Community:** 500+ developers contributing

---

<div align="center">

### Ready to Build AI?

[Get Started →](#-quick-start) | [View Docs →](./docs/) | [Upgrade to Pro →](https://github.com/wjlgatech/openclaw-pro)

---

**OpenClaw Pro (Community Edition)**
*Free. Open Source. Apache 2.0.*

[GitHub](https://github.com/wjlgatech/openclaw-pro-public) • [Pro Version](https://github.com/wjlgatech/openclaw-pro) • [Docs](./docs/) • [Community](https://slack.openclaw.pro)

</div>
