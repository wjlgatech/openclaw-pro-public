# 🚀 Enterprise OpenClaw - Quick Start Guide

Get up and running with DRIFT RAG in 5 minutes!

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** ([Download](https://nodejs.org/))
- ✅ **npm 9+** (comes with Node.js)
- ✅ **Git** ([Download](https://git-scm.com/))
- ✅ **10 GB free disk space** (for dependencies and databases)

### Verify Prerequisites

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show 2.x.x or higher
```

---

## 📥 Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/wjlgatech/enterprise-openclaw.git

# Navigate to project directory
cd enterprise-openclaw

# Verify you're in the right place
ls -la  # Should see package.json, README.md, etc.
```

---

## 📦 Step 2: Install Dependencies

```bash
# Install all Node.js dependencies
npm install

# This will take 2-5 minutes depending on your internet speed
# You should see a progress bar installing ~500+ packages
```

**Expected Output:**
```
added 523 packages, and audited 524 packages in 2m
```

---

## 🔧 Step 3: Build the Project

```bash
# Compile TypeScript to JavaScript
npm run build

# This takes ~30 seconds
```

**Expected Output:**
```
> enterprise-openclaw@1.0.0 build
> tsc

✓ Build completed successfully
```

---

## ✅ Step 4: Run Tests (Optional but Recommended)

Verify everything works by running the test suite:

```bash
# Run all tests
npm test

# Or run specific DRIFT RAG tests only
npm test tests/knowledge-system/rag-modes/drift-rag.test.ts
npm test tests/knowledge-system/inference-engine.test.ts
```

**Expected Output:**
```
✓ Test Files  2 passed (2)
✓ Tests  91 passed (91)
Duration: ~20s
```

---

## 🎯 Step 5: Try Your First DRIFT RAG Query!

### Option A: Interactive Node.js REPL

```bash
# Start Node.js with TypeScript support
npx tsx

# Now paste this code:
```

```typescript
import { DRIFTRAG } from './extensions/knowledge-system/rag-modes/drift-rag.js';
import { KnowledgeGraph } from './extensions/knowledge-system/knowledge-graph.js';

// Create a knowledge graph
const graph = new KnowledgeGraph('./my-first-kb.db');
await graph.initialize();

// Add some knowledge
await graph.addNode({
  id: 'node1',
  content: 'Machine learning is a subset of artificial intelligence',
  embedding: Array(384).fill(0).map(() => Math.random() - 0.5),
  metadata: { type: 'definition' }
});

await graph.addNode({
  id: 'node2',
  content: 'Deep learning uses neural networks with multiple layers',
  embedding: Array(384).fill(0).map(() => Math.random() - 0.5),
  metadata: { type: 'definition' }
});

await graph.addEdge({
  id: 'edge1',
  source: 'node1',
  target: 'node2',
  type: 'includes',
  weight: 0.9
});

// Create DRIFT RAG instance
const driftRAG = new DRIFTRAG({ knowledgeGraph: graph });

// Ask a question!
const answer = await driftRAG.query('What is deep learning?');
console.log(answer);

// Clean up
await graph.close();
```

### Option B: Run the Example Script

```bash
# Run the pre-built example
npx tsx examples/drift-rag-example.ts
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════╗
║          DRIFT RAG Examples                               ║
║  Dynamic Reasoning and Inference with Flexible Traversal  ║
╚═══════════════════════════════════════════════════════════╝

=== Example 1: Basic DRIFT RAG Usage ===

Query: What is deep learning?

Response:
Based on the knowledge graph exploration...

✅ All examples completed successfully!
```

---

## 📚 Next Steps

1. **Read the docs**: [DRIFT_RAG_README.md](extensions/knowledge-system/rag-modes/DRIFT_RAG_README.md)
2. **Try examples**: [drift-rag-example.ts](examples/drift-rag-example.ts)
3. **Build something**: Start with your own knowledge base!

---

**Happy Building! 🚀**
