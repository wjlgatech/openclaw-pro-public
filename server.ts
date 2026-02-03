#!/usr/bin/env tsx

/**
 * Enterprise OpenClaw - Full Application Server
 *
 * This starts the complete Enterprise OpenClaw platform with:
 * - Knowledge Graph with vector search
 * - Multi-Agent Orchestration
 * - RAG (Basic and Advanced DRIFT)
 * - REST API
 * - Web UI
 */

import express from 'express';
import { KnowledgeGraph } from './packages/core/src/knowledge-graph/knowledge-graph.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const logger = pino({ level: 'info' });
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Initialize knowledge graph
let knowledgeGraph: KnowledgeGraph;

async function initializeSystem() {
  logger.info('🚀 Initializing Enterprise OpenClaw...');

  try {
    // Initialize Knowledge Graph
    logger.info('📊 Initializing Knowledge Graph...');
    knowledgeGraph = new KnowledgeGraph('./data/knowledge-graph');
    await knowledgeGraph.initialize();
    logger.info('✓ Knowledge Graph initialized');

    // Add sample knowledge
    logger.info('📝 Loading sample knowledge...');
    await knowledgeGraph.addNode({
      id: 'welcome',
      type: 'concept',
      content: 'Welcome to Enterprise OpenClaw - a GenAI-native multi-agent platform',
      metadata: { category: 'system' }
    });

    await knowledgeGraph.addNode({
      id: 'capabilities',
      type: 'concept',
      content: 'Enterprise OpenClaw provides knowledge graphs, vector search, RAG, and multi-agent orchestration',
      metadata: { category: 'features' }
    });

    await knowledgeGraph.addNode({
      id: 'drift-rag',
      type: 'concept',
      content: 'DRIFT RAG: Dynamic Reasoning and Inference with Flexible Traversal',
      metadata: { category: 'features' }
    });

    logger.info('✓ Sample knowledge loaded');
    logger.info('✅ System initialization complete!');

  } catch (error) {
    logger.error({ error }, '❌ Failed to initialize system');
    throw error;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0',
    components: {
      knowledgeGraph: knowledgeGraph ? 'ready' : 'initializing'
    }
  });
});

// Query knowledge graph
app.post('/api/query', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!knowledgeGraph) {
      return res.status(503).json({ error: 'Knowledge graph not initialized' });
    }

    logger.info({ query }, 'Processing query');

    const results = await knowledgeGraph.queryNodes(query, { limit });

    res.json({
      query,
      results,
      count: results.length
    });

  } catch (error) {
    logger.error({ error }, 'Query failed');
    res.status(500).json({ error: 'Query failed' });
  }
});

// Add knowledge
app.post('/api/knowledge', async (req, res) => {
  try {
    const { content, type = 'concept', metadata = {} } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!knowledgeGraph) {
      return res.status(503).json({ error: 'Knowledge graph not initialized' });
    }

    const id = `node_${Date.now()}`;

    await knowledgeGraph.addNode({
      id,
      type,
      content,
      metadata
    });

    logger.info({ id, content }, 'Knowledge added');

    res.json({
      success: true,
      id,
      message: 'Knowledge added successfully'
    });

  } catch (error) {
    logger.error({ error }, 'Failed to add knowledge');
    res.status(500).json({ error: 'Failed to add knowledge' });
  }
});

// Get all nodes
app.get('/api/knowledge', async (req, res) => {
  try {
    if (!knowledgeGraph) {
      return res.status(503).json({ error: 'Knowledge graph not initialized' });
    }

    const nodes = await knowledgeGraph.getAllNodes();

    res.json({
      nodes,
      count: nodes.length
    });

  } catch (error) {
    logger.error({ error }, 'Failed to get knowledge');
    res.status(500).json({ error: 'Failed to get knowledge' });
  }
});

// System info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Enterprise OpenClaw',
    version: '1.0.0',
    description: 'GenAI-native multi-agent platform with self-improvement capabilities',
    features: {
      core: [
        'Knowledge Graph',
        'Vector Search',
        'Basic RAG',
        'Multi-Agent Orchestration'
      ],
      enterprise: [
        'Advanced DRIFT RAG',
        'Inference Engine',
        'PII Detection',
        'Audit Logging',
        'Multi-Tenant',
        'Enterprise Connectors'
      ]
    },
    license: 'Open-Core (Apache 2.0 + Enterprise)',
    status: 'Production Ready'
  });
});

// Web UI (serve index.html)
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
  try {
    await initializeSystem();

    app.listen(port, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════╗');
      console.log('║                                           ║');
      console.log('║    🦅 Enterprise OpenClaw v1.0.0         ║');
      console.log('║                                           ║');
      console.log('║    ✅ System Running                      ║');
      console.log('║                                           ║');
      console.log('╚═══════════════════════════════════════════╝');
      console.log('');
      console.log(`🌐 Web UI:      http://localhost:${port}`);
      console.log(`🔌 API:         http://localhost:${port}/api`);
      console.log(`💓 Health:      http://localhost:${port}/api/health`);
      console.log('');
      console.log('📚 API Endpoints:');
      console.log('   GET  /api/health       - Health check');
      console.log('   GET  /api/info         - System information');
      console.log('   POST /api/query        - Query knowledge graph');
      console.log('   POST /api/knowledge    - Add knowledge');
      console.log('   GET  /api/knowledge    - Get all knowledge');
      console.log('');
      console.log('Press Ctrl+C to stop');
      console.log('');
    });

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Start the application
start();
