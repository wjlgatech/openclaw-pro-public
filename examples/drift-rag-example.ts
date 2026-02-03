/**
 * DRIFT RAG Example
 * Demonstrates usage of Dynamic Reasoning and Inference with Flexible Traversal RAG
 */

import { DRIFTRAG } from '../extensions/knowledge-system/rag-modes/drift-rag.js';
import { KnowledgeGraph } from '../extensions/knowledge-system/knowledge-graph.js';
import { InferenceEngine } from '../extensions/knowledge-system/inference-engine.js';
import { GraphNode, GraphEdge } from '../extensions/knowledge-system/types.js';
import * as path from 'path';
import * as os from 'os';

/**
 * Example 1: Basic DRIFT RAG Usage
 */
async function basicExample() {
  console.log('\n=== Example 1: Basic DRIFT RAG Usage ===\n');

  // Initialize knowledge graph
  const dbPath = path.join(os.tmpdir(), 'drift-rag-example-1.db');
  const graph = new KnowledgeGraph(dbPath);
  await graph.initialize();

  // Add sample nodes
  const nodes: GraphNode[] = [
    {
      id: 'ml-1',
      content: 'Machine learning is a subset of artificial intelligence',
      embedding: generateMockEmbedding('machine learning artificial intelligence'),
      metadata: { category: 'ML', type: 'definition' }
    },
    {
      id: 'dl-1',
      content: 'Deep learning uses neural networks with multiple layers',
      embedding: generateMockEmbedding('deep learning neural networks'),
      metadata: { category: 'ML', type: 'definition' }
    },
    {
      id: 'nn-1',
      content: 'Neural networks are inspired by biological neurons in the brain',
      embedding: generateMockEmbedding('neural networks biological neurons'),
      metadata: { category: 'ML', type: 'explanation' }
    }
  ];

  for (const node of nodes) {
    await graph.addNode(node);
  }

  // Add edges
  const edges: GraphEdge[] = [
    { id: 'edge-1', source: 'ml-1', target: 'dl-1', type: 'includes', weight: 0.9 },
    { id: 'edge-2', source: 'dl-1', target: 'nn-1', type: 'uses', weight: 0.8 }
  ];

  for (const edge of edges) {
    await graph.addEdge(edge);
  }

  // Create DRIFT RAG instance
  const driftRAG = new DRIFTRAG({
    knowledgeGraph: graph,
    entryPointCount: 2,
    maxTraversalDepth: 3,
    topKPaths: 3
  });

  // Query the knowledge graph
  const query = 'What is deep learning?';
  console.log(`Query: ${query}\n`);

  const response = await driftRAG.query(query);
  console.log(`Response:\n${response}\n`);

  // Cleanup
  await graph.close();
}

/**
 * Example 2: Advanced Configuration
 */
async function advancedConfigExample() {
  console.log('\n=== Example 2: Advanced Configuration ===\n');

  const dbPath = path.join(os.tmpdir(), 'drift-rag-example-2.db');
  const graph = new KnowledgeGraph(dbPath);
  await graph.initialize();

  // Populate with more complex graph
  await populateMLKnowledgeGraph(graph);

  // Create DRIFT RAG with custom configuration
  const driftRAG = new DRIFTRAG({
    knowledgeGraph: graph,
    entryPointCount: 3,
    maxTraversalDepth: 4,
    traversalDirection: 'bidirectional',
    topKPaths: 5,
    useInference: true,
    minPathScore: 0.3,
    inferenceStrategy: 'semantic'
  });

  // Query with complex question
  const query = 'How do neural networks relate to machine learning?';
  console.log(`Query: ${query}\n`);

  const response = await driftRAG.query(query);
  console.log(`Response:\n${response}\n`);

  // Update configuration at runtime
  console.log('Updating configuration for broader search...\n');
  driftRAG.updateConfig({
    maxTraversalDepth: 5,
    topKPaths: 10
  });

  const query2 = 'What are different types of machine learning?';
  console.log(`Query: ${query2}\n`);

  const response2 = await driftRAG.query(query2);
  console.log(`Response:\n${response2}\n`);

  await graph.close();
}

/**
 * Example 3: Dynamic Traversal Directions
 */
async function traversalDirectionsExample() {
  console.log('\n=== Example 3: Traversal Directions ===\n');

  const dbPath = path.join(os.tmpdir(), 'drift-rag-example-3.db');
  const graph = new KnowledgeGraph(dbPath);
  await graph.initialize();

  await populateMLKnowledgeGraph(graph);

  // Forward traversal (following dependencies)
  console.log('Forward Traversal (following dependencies):\n');
  const forwardRAG = new DRIFTRAG({
    knowledgeGraph: graph,
    traversalDirection: 'forward'
  });

  const forwardResponse = await forwardRAG.query('What depends on neural networks?');
  console.log(`${forwardResponse}\n`);

  // Backward traversal (finding prerequisites)
  console.log('Backward Traversal (finding prerequisites):\n');
  const backwardRAG = new DRIFTRAG({
    knowledgeGraph: graph,
    traversalDirection: 'backward'
  });

  const backwardResponse = await backwardRAG.query('What does deep learning require?');
  console.log(`${backwardResponse}\n`);

  // Bidirectional traversal (comprehensive exploration)
  console.log('Bidirectional Traversal (comprehensive):\n');
  const bidirectionalRAG = new DRIFTRAG({
    knowledgeGraph: graph,
    traversalDirection: 'bidirectional'
  });

  const bidirectionalResponse = await bidirectionalRAG.query('How does everything connect?');
  console.log(`${bidirectionalResponse}\n`);

  await graph.close();
}

/**
 * Example 4: Inference and Knowledge Gaps
 */
async function inferenceExample() {
  console.log('\n=== Example 4: Inference and Knowledge Gaps ===\n');

  const dbPath = path.join(os.tmpdir(), 'drift-rag-example-4.db');
  const graph = new KnowledgeGraph(dbPath);
  await graph.initialize();

  await populateMLKnowledgeGraph(graph);

  // Create DRIFT RAG with inference enabled
  const driftRAG = new DRIFTRAG({
    knowledgeGraph: graph,
    useInference: true
  });

  // Find entry points
  const query = 'supervised learning techniques';
  console.log(`Query: ${query}\n`);

  const entryPoints = await driftRAG.findEntryPoints(query);
  console.log(`Found ${entryPoints.length} entry points:\n`);
  entryPoints.forEach((node, i) => {
    console.log(`${i + 1}. ${node.id}: ${node.content.substring(0, 60)}...`);
  });

  // Traverse from entry points
  console.log('\nTraversing from entry points...\n');
  const paths = await driftRAG.traverseFromEntryPoints(entryPoints, query);
  console.log(`Generated ${paths.length} paths\n`);

  // Infer missing connections
  console.log('Inferring missing connections...\n');
  const inferences = await driftRAG.inferConnections(paths, query);
  console.log(`Generated ${inferences.length} inferred connections:\n`);
  inferences.slice(0, 3).forEach((inf, i) => {
    console.log(`${i + 1}. ${inf.sourceNode} → ${inf.targetNode}`);
    console.log(`   Type: ${inf.inferredType}`);
    console.log(`   Confidence: ${inf.confidence.toFixed(2)}`);
    console.log(`   Reasoning: ${inf.reasoning}\n`);
  });

  // Identify knowledge gaps
  console.log('Identifying knowledge gaps...\n');
  const gaps = await driftRAG.identifyKnowledgeGaps(paths, query);
  console.log(`Identified ${gaps.length} knowledge gaps:\n`);
  gaps.forEach((gap, i) => {
    console.log(`${i + 1}. ${gap}`);
  });

  await graph.close();
}

/**
 * Example 5: Custom Filters and Advanced Traversal
 */
async function customFiltersExample() {
  console.log('\n=== Example 5: Custom Filters ===\n');

  const dbPath = path.join(os.tmpdir(), 'drift-rag-example-5.db');
  const graph = new KnowledgeGraph(dbPath);
  await graph.initialize();

  await populateMLKnowledgeGraph(graph);

  const driftRAG = new DRIFTRAG({
    knowledgeGraph: graph
  });

  // Get a starting node
  const startNode = await graph.getNode('ml-1');
  if (!startNode) {
    console.log('Start node not found');
    return;
  }

  // Traversal with node filter
  console.log('Traversal with node filter (only ML category):\n');
  const filteredPaths = await driftRAG.dynamicTraversal(
    startNode,
    'machine learning',
    3,
    'forward',
    (node) => node.metadata?.category === 'ML'
  );

  console.log(`Found ${filteredPaths.length} paths with filter\n`);

  // Traversal with edge type filter
  console.log('Traversal with edge type filter (only "uses" edges):\n');
  const edgeFilteredPaths = await driftRAG.dynamicTraversal(
    startNode,
    'machine learning',
    3,
    'forward',
    undefined,
    ['uses']
  );

  console.log(`Found ${edgeFilteredPaths.length} paths with edge filter\n`);

  await graph.close();
}

/**
 * Example 6: Path Scoring and Ranking
 */
async function pathScoringExample() {
  console.log('\n=== Example 6: Path Scoring and Ranking ===\n');

  const dbPath = path.join(os.tmpdir(), 'drift-rag-example-6.db');
  const graph = new KnowledgeGraph(dbPath);
  await graph.initialize();

  await populateMLKnowledgeGraph(graph);

  const driftRAG = new DRIFTRAG({
    knowledgeGraph: graph,
    topKPaths: 10
  });

  // Get entry points and traverse
  const query = 'deep learning and neural networks';
  console.log(`Query: ${query}\n`);

  const entryPoints = await driftRAG.findEntryPoints(query);
  const paths = await driftRAG.traverseFromEntryPoints(entryPoints, query);

  console.log(`Generated ${paths.length} paths\n`);
  console.log('Top 5 paths by score:\n');

  const rankedPaths = driftRAG['rankPaths'](paths);
  rankedPaths.slice(0, 5).forEach((path, i) => {
    console.log(`${i + 1}. Score: ${path.score.toFixed(3)}`);
    console.log(`   Nodes: ${path.nodes.map(n => n.id).join(' → ')}`);
    console.log(`   Length: ${path.nodes.length} nodes, ${path.edges.length} edges\n`);
  });

  await graph.close();
}

/**
 * Helper function to populate knowledge graph with ML concepts
 */
async function populateMLKnowledgeGraph(graph: KnowledgeGraph): Promise<void> {
  const nodes: GraphNode[] = [
    {
      id: 'ml-1',
      content: 'Machine learning is a subset of artificial intelligence that enables systems to learn from data',
      embedding: generateMockEmbedding('machine learning artificial intelligence data'),
      metadata: { category: 'ML', type: 'definition' }
    },
    {
      id: 'dl-1',
      content: 'Deep learning uses neural networks with multiple hidden layers for complex pattern recognition',
      embedding: generateMockEmbedding('deep learning neural networks layers'),
      metadata: { category: 'ML', type: 'definition' }
    },
    {
      id: 'nn-1',
      content: 'Neural networks consist of interconnected nodes that process information similar to biological neurons',
      embedding: generateMockEmbedding('neural networks nodes neurons'),
      metadata: { category: 'ML', type: 'explanation' }
    },
    {
      id: 'supervised-1',
      content: 'Supervised learning trains models using labeled data with input-output pairs',
      embedding: generateMockEmbedding('supervised learning labeled data training'),
      metadata: { category: 'ML', type: 'concept' }
    },
    {
      id: 'unsupervised-1',
      content: 'Unsupervised learning discovers patterns in unlabeled data without predefined targets',
      embedding: generateMockEmbedding('unsupervised learning patterns clustering'),
      metadata: { category: 'ML', type: 'concept' }
    },
    {
      id: 'cnn-1',
      content: 'Convolutional Neural Networks excel at image recognition by learning spatial hierarchies',
      embedding: generateMockEmbedding('CNN convolutional neural networks image recognition'),
      metadata: { category: 'ML', type: 'technique' }
    },
    {
      id: 'rnn-1',
      content: 'Recurrent Neural Networks process sequential data using internal memory',
      embedding: generateMockEmbedding('RNN recurrent neural networks sequential'),
      metadata: { category: 'ML', type: 'technique' }
    }
  ];

  for (const node of nodes) {
    await graph.addNode(node);
  }

  const edges: GraphEdge[] = [
    { id: 'e1', source: 'ml-1', target: 'dl-1', type: 'includes', weight: 0.9 },
    { id: 'e2', source: 'ml-1', target: 'supervised-1', type: 'includes', weight: 0.8 },
    { id: 'e3', source: 'ml-1', target: 'unsupervised-1', type: 'includes', weight: 0.8 },
    { id: 'e4', source: 'dl-1', target: 'nn-1', type: 'uses', weight: 0.9 },
    { id: 'e5', source: 'dl-1', target: 'cnn-1', type: 'includes', weight: 0.85 },
    { id: 'e6', source: 'dl-1', target: 'rnn-1', type: 'includes', weight: 0.85 },
    { id: 'e7', source: 'cnn-1', target: 'nn-1', type: 'is_a', weight: 0.9 },
    { id: 'e8', source: 'rnn-1', target: 'nn-1', type: 'is_a', weight: 0.9 }
  ];

  for (const edge of edges) {
    await graph.addEdge(edge);
  }
}

/**
 * Helper function to generate mock embeddings
 */
function generateMockEmbedding(text: string): number[] {
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 384 }, (_, i) => {
    const value = Math.sin(hash + i) * 0.5;
    return Math.max(-1, Math.min(1, value));
  });
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║          DRIFT RAG Examples                               ║');
  console.log('║  Dynamic Reasoning and Inference with Flexible Traversal  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    await basicExample();
    await advancedConfigExample();
    await traversalDirectionsExample();
    await inferenceExample();
    await customFiltersExample();
    await pathScoringExample();

    console.log('\n✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
    process.exit(1);
  }
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  basicExample,
  advancedConfigExample,
  traversalDirectionsExample,
  inferenceExample,
  customFiltersExample,
  pathScoringExample
};
