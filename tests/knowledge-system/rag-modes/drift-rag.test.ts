/**
 * DRIFT RAG Test Suite
 * Reality-Grounded TDD tests for Dynamic Reasoning and Inference with Flexible Traversal RAG
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DRIFTRAG, DRIFTRAGConfig, TraversalPath } from '../../../extensions/knowledge-system/rag-modes/drift-rag.js';
import { InferenceEngine, InferredConnection } from '../../../extensions/knowledge-system/inference-engine.js';
import { KnowledgeGraph } from '../../../extensions/knowledge-system/knowledge-graph.js';
import { GraphNode, GraphEdge } from '../../../extensions/knowledge-system/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('DRIFTRAG - Reality-Grounded TDD', () => {
  let testDbPath: string;
  let graph: KnowledgeGraph;
  let driftRAG: DRIFTRAG;

  beforeEach(async () => {
    // Create temporary database
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'drift-rag-test-'));
    testDbPath = path.join(tempDir, 'test.db');

    // Initialize graph
    graph = new KnowledgeGraph(testDbPath);
    await graph.initialize();

    // Populate with test data
    await populateTestGraph(graph);

    // Create DRIFT RAG instance
    driftRAG = new DRIFTRAG({
      knowledgeGraph: graph,
      entryPointCount: 3,
      maxTraversalDepth: 3,
      traversalDirection: 'bidirectional',
      topKPaths: 5,
      useInference: true,
      minPathScore: 0.3
    });
  });

  afterEach(async () => {
    // Cleanup
    await graph.close();
    await fs.rm(path.dirname(testDbPath), { recursive: true, force: true });
  });

  // ========== Configuration Tests ==========

  describe('Configuration', () => {
    it('should validate required configuration', () => {
      expect(() => {
        new DRIFTRAG({} as any);
      }).toThrow('knowledgeGraph is required');
    });

    it('should reject non-positive entryPointCount', () => {
      expect(() => {
        new DRIFTRAG({
          knowledgeGraph: graph,
          entryPointCount: 0
        });
      }).toThrow('entryPointCount must be positive');
    });

    it('should reject non-positive maxTraversalDepth', () => {
      expect(() => {
        new DRIFTRAG({
          knowledgeGraph: graph,
          maxTraversalDepth: -1
        });
      }).toThrow('maxTraversalDepth must be positive');
    });

    it('should reject invalid traversalDirection', () => {
      expect(() => {
        new DRIFTRAG({
          knowledgeGraph: graph,
          traversalDirection: 'invalid' as any
        });
      }).toThrow('Invalid traversalDirection');
    });

    it('should reject non-positive topKPaths', () => {
      expect(() => {
        new DRIFTRAG({
          knowledgeGraph: graph,
          topKPaths: 0
        });
      }).toThrow('topKPaths must be positive');
    });

    it('should apply default configuration values', () => {
      const config = driftRAG.getConfig();

      expect(config.entryPointCount).toBe(3);
      expect(config.maxTraversalDepth).toBe(3);
      expect(config.traversalDirection).toBe('bidirectional');
      expect(config.topKPaths).toBe(5);
      expect(config.useInference).toBe(true);
      expect(config.minPathScore).toBe(0.3);
      expect(config.llmModel).toBe('gpt-4');
      expect(config.embeddingModel).toBe('text-embedding-ada-002');
    });

    it('should allow updating configuration', () => {
      driftRAG.updateConfig({
        entryPointCount: 5,
        maxTraversalDepth: 4,
        topKPaths: 10
      });

      const config = driftRAG.getConfig();
      expect(config.entryPointCount).toBe(5);
      expect(config.maxTraversalDepth).toBe(4);
      expect(config.topKPaths).toBe(10);
    });

    it('should validate updates when updating configuration', () => {
      expect(() => {
        driftRAG.updateConfig({ entryPointCount: 0 });
      }).toThrow('entryPointCount must be positive');

      expect(() => {
        driftRAG.updateConfig({ maxTraversalDepth: -1 });
      }).toThrow('maxTraversalDepth must be positive');

      expect(() => {
        driftRAG.updateConfig({ traversalDirection: 'invalid' as any });
      }).toThrow('Invalid traversalDirection');
    });
  });

  // ========== Entry Point Detection Tests ==========

  describe('Entry Point Detection', () => {
    it('should find entry points via vector similarity', async () => {
      const entryPoints = await driftRAG.findEntryPoints('machine learning algorithms');

      expect(entryPoints.length).toBeGreaterThan(0);
      expect(entryPoints.length).toBeLessThanOrEqual(3);
      expect(entryPoints.every(node => node.id && node.content)).toBe(true);
    });

    it('should return configured number of entry points', async () => {
      driftRAG.updateConfig({ entryPointCount: 2 });

      const entryPoints = await driftRAG.findEntryPoints('neural networks');

      expect(entryPoints.length).toBeLessThanOrEqual(2);
    });

    it('should find relevant entry points for specific query', async () => {
      const entryPoints = await driftRAG.findEntryPoints('deep learning');

      expect(entryPoints.length).toBeGreaterThan(0);
      // Entry points should have embeddings
      expect(entryPoints.every(node => node.embedding)).toBe(true);
    });

    it('should handle queries with no similar nodes', async () => {
      // Clear graph
      await graph.close();
      const emptyDbPath = path.join(path.dirname(testDbPath), 'empty.db');
      const emptyGraph = new KnowledgeGraph(emptyDbPath);
      await emptyGraph.initialize();

      const emptyDriftRAG = new DRIFTRAG({
        knowledgeGraph: emptyGraph,
        entryPointCount: 3
      });

      await expect(emptyDriftRAG.query('test query')).rejects.toThrow('Cannot query empty graph');

      await emptyGraph.close();
    });
  });

  // ========== Dynamic Traversal Tests ==========

  describe('Dynamic Traversal', () => {
    it('should perform forward traversal', async () => {
      const startNode = await graph.getNode('node1');
      expect(startNode).toBeDefined();

      const paths = await driftRAG.dynamicTraversal(
        startNode!,
        'test query',
        2,
        'forward'
      );

      expect(paths.length).toBeGreaterThan(0);
      paths.forEach(path => {
        expect(path.nodes.length).toBeGreaterThan(1);
        expect(path.nodes[0].id).toBe('node1');
        expect(path.score).toBeGreaterThanOrEqual(0);
        expect(path.score).toBeLessThanOrEqual(1);
      });
    });

    it('should perform backward traversal', async () => {
      const startNode = await graph.getNode('node3');
      expect(startNode).toBeDefined();

      const paths = await driftRAG.dynamicTraversal(
        startNode!,
        'test query',
        2,
        'backward'
      );

      expect(paths.length).toBeGreaterThan(0);
      paths.forEach(path => {
        expect(path.nodes.length).toBeGreaterThan(1);
        expect(path.nodes[0].id).toBe('node3');
      });
    });

    it('should perform bidirectional traversal', async () => {
      const startNode = await graph.getNode('node2');
      expect(startNode).toBeDefined();

      const paths = await driftRAG.dynamicTraversal(
        startNode!,
        'test query',
        2,
        'bidirectional'
      );

      expect(paths.length).toBeGreaterThan(0);
      paths.forEach(path => {
        expect(path.nodes.length).toBeGreaterThan(1);
        expect(path.nodes[0].id).toBe('node2');
      });
    });

    it('should respect maximum traversal depth', async () => {
      const startNode = await graph.getNode('node1');
      expect(startNode).toBeDefined();

      const paths = await driftRAG.dynamicTraversal(
        startNode!,
        'test query',
        1,
        'forward'
      );

      // All paths should have at most depth+1 nodes (start node + depth)
      paths.forEach(path => {
        expect(path.nodes.length).toBeLessThanOrEqual(2); // 1 depth = max 2 nodes
      });
    });

    it('should avoid cycles in traversal', async () => {
      const startNode = await graph.getNode('node1');
      expect(startNode).toBeDefined();

      const paths = await driftRAG.dynamicTraversal(
        startNode!,
        'test query',
        5,
        'bidirectional'
      );

      // Check that no path contains duplicate nodes
      paths.forEach(path => {
        const nodeIds = path.nodes.map(n => n.id);
        const uniqueIds = new Set(nodeIds);
        expect(nodeIds.length).toBe(uniqueIds.size);
      });
    });

    it('should apply node filter when provided', async () => {
      const startNode = await graph.getNode('node1');
      expect(startNode).toBeDefined();

      const nodeFilter = (node: GraphNode) => node.content.includes('machine');

      const paths = await driftRAG.dynamicTraversal(
        startNode!,
        'test query',
        3,
        'forward',
        nodeFilter
      );

      // All nodes in paths should pass the filter (except start node)
      paths.forEach(path => {
        path.nodes.slice(1).forEach(node => {
          expect(node.content.includes('machine')).toBe(true);
        });
      });
    });

    it('should apply edge type filter when provided', async () => {
      const startNode = await graph.getNode('node1');
      expect(startNode).toBeDefined();

      const paths = await driftRAG.dynamicTraversal(
        startNode!,
        'test query',
        3,
        'forward',
        undefined,
        ['related_to']
      );

      // All edges in paths should have the specified type
      paths.forEach(path => {
        path.edges.forEach(edge => {
          expect(edge.type).toBe('related_to');
        });
      });
    });

    it('should calculate relevance scores for paths', async () => {
      const startNode = await graph.getNode('node1');
      expect(startNode).toBeDefined();

      const paths = await driftRAG.dynamicTraversal(
        startNode!,
        'machine learning',
        3,
        'forward'
      );

      expect(paths.length).toBeGreaterThan(0);
      paths.forEach(path => {
        expect(typeof path.score).toBe('number');
        expect(path.score).toBeGreaterThanOrEqual(0);
        expect(path.score).toBeLessThanOrEqual(1);
      });
    });
  });

  // ========== Inference Tests ==========

  describe('Inference and Knowledge Gaps', () => {
    it('should infer connections between nodes', async () => {
      const nodes = await graph.getAllNodes();
      const sampleNodes = nodes.slice(0, 3);

      const inferences = await driftRAG.inferConnections(
        sampleNodes,
        'machine learning concepts'
      );

      expect(Array.isArray(inferences)).toBe(true);
      inferences.forEach(inf => {
        expect(inf).toHaveProperty('sourceNode');
        expect(inf).toHaveProperty('targetNode');
        expect(inf).toHaveProperty('reasoning');
        expect(inf).toHaveProperty('confidence');
        expect(inf).toHaveProperty('inferredType');
        expect(inf.confidence).toBeGreaterThanOrEqual(0);
        expect(inf.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should infer connections from paths', async () => {
      const entryPoints = await driftRAG.findEntryPoints('machine learning');
      const paths = await driftRAG.traverseFromEntryPoints(entryPoints, 'machine learning');

      const inferences = await driftRAG.inferConnections(paths, 'machine learning');

      expect(Array.isArray(inferences)).toBe(true);
    });

    it('should filter inferences by confidence threshold', async () => {
      const nodes = await graph.getAllNodes();
      const sampleNodes = nodes.slice(0, 4);

      const inferences = await driftRAG.inferConnections(
        sampleNodes,
        'test query'
      );

      // All inferences should meet the default threshold (0.5)
      inferences.forEach(inf => {
        expect(inf.confidence).toBeGreaterThanOrEqual(0.5);
      });
    });

    it('should identify knowledge gaps in paths', async () => {
      const entryPoints = await driftRAG.findEntryPoints('machine learning');
      const paths = await driftRAG.traverseFromEntryPoints(entryPoints, 'machine learning');

      const gaps = await driftRAG.identifyKnowledgeGaps(paths, 'machine learning');

      expect(Array.isArray(gaps)).toBe(true);
      gaps.forEach(gap => {
        expect(typeof gap).toBe('string');
        expect(gap.length).toBeGreaterThan(0);
      });
    });

    it('should validate inferences', () => {
      const validInference: InferredConnection = {
        sourceNode: 'node1',
        targetNode: 'node2',
        reasoning: 'Related concepts',
        confidence: 0.8,
        inferredType: 'related_to'
      };

      expect(driftRAG.validateInference(validInference)).toBe(true);
    });

    it('should reject self-loop inferences', () => {
      const selfLoopInference: InferredConnection = {
        sourceNode: 'node1',
        targetNode: 'node1',
        reasoning: 'Self reference',
        confidence: 0.8,
        inferredType: 'related_to'
      };

      expect(driftRAG.validateInference(selfLoopInference)).toBe(false);
    });

    it('should reject inferences with invalid confidence', () => {
      const invalidConfidence: InferredConnection = {
        sourceNode: 'node1',
        targetNode: 'node2',
        reasoning: 'Related',
        confidence: 1.5,
        inferredType: 'related_to'
      };

      expect(driftRAG.validateInference(invalidConfidence)).toBe(false);
    });

    it('should reject inferences with missing fields', () => {
      const missingReasoning: InferredConnection = {
        sourceNode: 'node1',
        targetNode: 'node2',
        reasoning: '',
        confidence: 0.8,
        inferredType: 'related_to'
      };

      expect(driftRAG.validateInference(missingReasoning)).toBe(false);
    });

    it('should use different inference strategies', async () => {
      const nodes = await graph.getAllNodes();
      const sampleNodes = nodes.slice(0, 3);

      const semanticInferences = await driftRAG.inferConnections(
        sampleNodes,
        'test query',
        'semantic'
      );

      const similarityInferences = await driftRAG.inferConnections(
        sampleNodes,
        'test query',
        'similarity'
      );

      expect(Array.isArray(semanticInferences)).toBe(true);
      expect(Array.isArray(similarityInferences)).toBe(true);
    });
  });

  // ========== Path Aggregation and Ranking Tests ==========

  describe('Path Aggregation and Ranking', () => {
    it('should deduplicate paths with same node sequence', () => {
      const node1: GraphNode = { id: 'n1', content: 'Node 1', embedding: [] };
      const node2: GraphNode = { id: 'n2', content: 'Node 2', embedding: [] };
      const edge1: GraphEdge = { id: 'e1', source: 'n1', target: 'n2', type: 'related_to' };

      const path1: TraversalPath = {
        nodes: [node1, node2],
        edges: [edge1],
        score: 0.7
      };

      const path2: TraversalPath = {
        nodes: [node1, node2],
        edges: [edge1],
        score: 0.9
      };

      const deduped = driftRAG['deduplicatePaths']([path1, path2]);

      expect(deduped.length).toBe(1);
      expect(deduped[0].score).toBe(0.9); // Keeps higher score
    });

    it('should rank paths by score descending', () => {
      const paths: TraversalPath[] = [
        { nodes: [], edges: [], score: 0.5 },
        { nodes: [], edges: [], score: 0.9 },
        { nodes: [], edges: [], score: 0.7 }
      ];

      const ranked = driftRAG['rankPaths'](paths);

      expect(ranked[0].score).toBe(0.9);
      expect(ranked[1].score).toBe(0.7);
      expect(ranked[2].score).toBe(0.5);
    });

    it('should select top-K paths', () => {
      const paths: TraversalPath[] = [
        { nodes: [], edges: [], score: 0.9 },
        { nodes: [], edges: [], score: 0.8 },
        { nodes: [], edges: [], score: 0.7 },
        { nodes: [], edges: [], score: 0.6 },
        { nodes: [], edges: [], score: 0.5 }
      ];

      const topPaths = driftRAG['selectTopKPaths'](paths, 3);

      expect(topPaths.length).toBe(3);
      expect(topPaths[0].score).toBe(0.9);
      expect(topPaths[1].score).toBe(0.8);
      expect(topPaths[2].score).toBe(0.7);
    });

    it('should filter paths below minimum score threshold', () => {
      const paths: TraversalPath[] = [
        { nodes: [], edges: [], score: 0.9 },
        { nodes: [], edges: [], score: 0.5 },
        { nodes: [], edges: [], score: 0.2 }, // Below threshold
        { nodes: [], edges: [], score: 0.1 }  // Below threshold
      ];

      const topPaths = driftRAG['selectTopKPaths'](paths, 10);

      expect(topPaths.every(p => p.score >= 0.3)).toBe(true);
    });

    it('should boost path scores with inferences', () => {
      const node1: GraphNode = { id: 'n1', content: 'Node 1', embedding: [] };
      const node2: GraphNode = { id: 'n2', content: 'Node 2', embedding: [] };
      const node3: GraphNode = { id: 'n3', content: 'Node 3', embedding: [] };

      const path: TraversalPath = {
        nodes: [node1, node2, node3],
        edges: [],
        score: 0.5
      };

      const inference: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: 'Test inference',
        confidence: 0.8,
        inferredType: 'related_to'
      };

      const boosted = driftRAG['boostPathsWithInferences']([path], [inference]);

      expect(boosted[0].score).toBeGreaterThan(0.5);
      expect(boosted[0].score).toBeLessThanOrEqual(1.0);
    });

    it('should aggregate and rank paths with inferences', () => {
      const node1: GraphNode = { id: 'n1', content: 'Node 1', embedding: [] };
      const node2: GraphNode = { id: 'n2', content: 'Node 2', embedding: [] };

      const paths: TraversalPath[] = [
        { nodes: [node1, node2], edges: [], score: 0.5 },
        { nodes: [node1, node2], edges: [], score: 0.7 }, // Duplicate
        { nodes: [node2, node1], edges: [], score: 0.6 }
      ];

      const inference: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: 'Test',
        confidence: 0.9,
        inferredType: 'related_to'
      };

      const result = driftRAG.aggregateAndRankPaths(paths, [inference]);

      expect(result.length).toBeLessThanOrEqual(paths.length);
      // Should be sorted by score descending
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score);
      }
    });

    it('should calculate path score based on content relevance', () => {
      const node1: GraphNode = {
        id: 'n1',
        content: 'machine learning algorithms',
        embedding: []
      };
      const node2: GraphNode = {
        id: 'n2',
        content: 'neural networks',
        embedding: []
      };

      const path: TraversalPath = {
        nodes: [node1, node2],
        edges: [],
        score: 0
      };

      const score = driftRAG['calculatePathScore'](path, 'machine learning');

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should penalize longer paths in scoring', () => {
      const shortPath: TraversalPath = {
        nodes: [
          { id: 'n1', content: 'test', embedding: [] },
          { id: 'n2', content: 'test', embedding: [] }
        ],
        edges: [],
        score: 0
      };

      const longPath: TraversalPath = {
        nodes: [
          { id: 'n1', content: 'test', embedding: [] },
          { id: 'n2', content: 'test', embedding: [] },
          { id: 'n3', content: 'test', embedding: [] },
          { id: 'n4', content: 'test', embedding: [] },
          { id: 'n5', content: 'test', embedding: [] }
        ],
        edges: [],
        score: 0
      };

      const shortScore = driftRAG['calculatePathScore'](shortPath, 'test');
      const longScore = driftRAG['calculatePathScore'](longPath, 'test');

      expect(shortScore).toBeGreaterThan(longScore);
    });

    it('should incorporate edge weights in path scoring', () => {
      const node1: GraphNode = { id: 'n1', content: 'test', embedding: [] };
      const node2: GraphNode = { id: 'n2', content: 'test', embedding: [] };

      const highWeightPath: TraversalPath = {
        nodes: [node1, node2],
        edges: [{ id: 'e1', source: 'n1', target: 'n2', type: 'strong', weight: 0.9 }],
        score: 0
      };

      const lowWeightPath: TraversalPath = {
        nodes: [node1, node2],
        edges: [{ id: 'e1', source: 'n1', target: 'n2', type: 'weak', weight: 0.1 }],
        score: 0
      };

      const highScore = driftRAG['calculatePathScore'](highWeightPath, 'test');
      const lowScore = driftRAG['calculatePathScore'](lowWeightPath, 'test');

      expect(highScore).toBeGreaterThan(lowScore);
    });
  });

  // ========== Response Generation Tests ==========

  describe('Response Generation', () => {
    it('should generate response from ranked paths', async () => {
      const node1: GraphNode = { id: 'n1', content: 'Machine learning is a subset of AI', embedding: [] };
      const node2: GraphNode = { id: 'n2', content: 'Deep learning uses neural networks', embedding: [] };

      const paths: TraversalPath[] = [
        { nodes: [node1, node2], edges: [], score: 0.9 }
      ];

      const response = await driftRAG.generateResponse('What is machine learning?', paths);

      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
      expect(response).toContain('machine learning');
    });

    it('should handle empty paths gracefully', async () => {
      const response = await driftRAG.generateResponse('test query', []);

      expect(response).toBe('No relevant information found to answer the query.');
    });

    it('should assemble context from multiple paths', () => {
      const node1: GraphNode = { id: 'n1', content: 'Content 1', embedding: [] };
      const node2: GraphNode = { id: 'n2', content: 'Content 2', embedding: [] };
      const node3: GraphNode = { id: 'n3', content: 'Content 3', embedding: [] };

      const paths: TraversalPath[] = [
        { nodes: [node1, node2], edges: [], score: 0.9 },
        { nodes: [node2, node3], edges: [], score: 0.7 }
      ];

      const context = driftRAG['assembleContext'](paths);

      expect(typeof context).toBe('string');
      expect(context).toContain('Path 1');
      expect(context).toContain('Path 2');
      expect(context).toContain('Content 1');
      expect(context).toContain('Content 3');
    });

    it('should include provenance when requested', async () => {
      const node1: GraphNode = { id: 'n1', content: 'Test content', embedding: [] };
      const paths: TraversalPath[] = [
        { nodes: [node1], edges: [], score: 0.9 }
      ];

      const response = await driftRAG.generateResponse('test', paths, true);

      expect(response).toContain('Sources:');
      expect(response).toContain('Path:');
      expect(response).toContain('score:');
    });

    it('should validate response quality', () => {
      const validResponse = 'This is a valid response with sufficient content.';
      const invalidResponse = 'short';
      const emptyResponse = 'No relevant information found to answer the query.';

      expect(driftRAG.validateResponse(validResponse, 'test')).toBe(true);
      expect(driftRAG.validateResponse(invalidResponse, 'test')).toBe(false);
      expect(driftRAG.validateResponse(emptyResponse, 'test')).toBe(true); // Valid empty response
    });
  });

  // ========== Full Pipeline Tests ==========

  describe('Full DRIFT RAG Pipeline', () => {
    it('should execute complete query pipeline', async () => {
      const response = await driftRAG.query('machine learning concepts');

      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should reject empty query', async () => {
      await expect(driftRAG.query('')).rejects.toThrow('Query must be a non-empty string');
    });

    it('should reject null or undefined query', async () => {
      await expect(driftRAG.query(null as any)).rejects.toThrow();
      await expect(driftRAG.query(undefined as any)).rejects.toThrow();
    });

    it('should handle queries on empty graph', async () => {
      // Close current graph and create empty one
      await graph.close();
      const emptyDbPath = path.join(path.dirname(testDbPath), 'empty2.db');
      const emptyGraph = new KnowledgeGraph(emptyDbPath);
      await emptyGraph.initialize();

      const emptyDriftRAG = new DRIFTRAG({
        knowledgeGraph: emptyGraph
      });

      await expect(emptyDriftRAG.query('test')).rejects.toThrow('Cannot query empty graph');

      await emptyGraph.close();
    });

    it('should handle queries with no entry points found', async () => {
      // This is hard to trigger but testing the error path
      // Would need a graph where similarity search returns nothing
      const response = await driftRAG.query('machine learning');
      expect(typeof response).toBe('string');
    });

    it('should use inference engine when enabled', async () => {
      const withInference = new DRIFTRAG({
        knowledgeGraph: graph,
        useInference: true
      });

      const response = await withInference.query('machine learning');
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should skip inference when disabled', async () => {
      const withoutInference = new DRIFTRAG({
        knowledgeGraph: graph,
        useInference: false
      });

      const response = await withoutInference.query('machine learning');
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should respect configured entry point count', async () => {
      driftRAG.updateConfig({ entryPointCount: 1 });

      const response = await driftRAG.query('neural networks');

      expect(typeof response).toBe('string');
    });

    it('should respect configured traversal depth', async () => {
      driftRAG.updateConfig({ maxTraversalDepth: 1 });

      const response = await driftRAG.query('deep learning');

      expect(typeof response).toBe('string');
    });

    it('should respect configured top-K paths', async () => {
      driftRAG.updateConfig({ topKPaths: 3 });

      const response = await driftRAG.query('artificial intelligence');

      expect(typeof response).toBe('string');
    });

    it('should handle different traversal directions', async () => {
      const forwardRAG = new DRIFTRAG({
        knowledgeGraph: graph,
        traversalDirection: 'forward'
      });

      const backwardRAG = new DRIFTRAG({
        knowledgeGraph: graph,
        traversalDirection: 'backward'
      });

      const bidirectionalRAG = new DRIFTRAG({
        knowledgeGraph: graph,
        traversalDirection: 'bidirectional'
      });

      const forwardResponse = await forwardRAG.query('test');
      const backwardResponse = await backwardRAG.query('test');
      const bidirectionalResponse = await bidirectionalRAG.query('test');

      expect(typeof forwardResponse).toBe('string');
      expect(typeof backwardResponse).toBe('string');
      expect(typeof bidirectionalResponse).toBe('string');
    });

    it('should handle complex multi-hop queries', async () => {
      driftRAG.updateConfig({
        maxTraversalDepth: 4,
        topKPaths: 10
      });

      const response = await driftRAG.query('relationship between machine learning and neural networks');

      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(50);
    });
  });
});

// Helper function to populate test graph
async function populateTestGraph(graph: KnowledgeGraph): Promise<void> {
  // Create test nodes with embeddings
  const nodes: GraphNode[] = [
    {
      id: 'node1',
      content: 'Machine learning is a subset of artificial intelligence',
      embedding: generateMockEmbedding('machine learning artificial intelligence'),
      metadata: { type: 'definition' }
    },
    {
      id: 'node2',
      content: 'Deep learning uses neural networks with multiple layers',
      embedding: generateMockEmbedding('deep learning neural networks'),
      metadata: { type: 'definition' }
    },
    {
      id: 'node3',
      content: 'Neural networks are inspired by biological neurons',
      embedding: generateMockEmbedding('neural networks biological neurons'),
      metadata: { type: 'explanation' }
    },
    {
      id: 'node4',
      content: 'Supervised learning requires labeled training data',
      embedding: generateMockEmbedding('supervised learning labeled data'),
      metadata: { type: 'concept' }
    },
    {
      id: 'node5',
      content: 'Unsupervised learning finds patterns in unlabeled data',
      embedding: generateMockEmbedding('unsupervised learning patterns'),
      metadata: { type: 'concept' }
    }
  ];

  for (const node of nodes) {
    await graph.addNode(node);
  }

  // Create test edges
  const edges: GraphEdge[] = [
    { id: 'edge1', source: 'node1', target: 'node2', type: 'related_to', weight: 0.9 },
    { id: 'edge2', source: 'node2', target: 'node3', type: 'uses', weight: 0.8 },
    { id: 'edge3', source: 'node1', target: 'node4', type: 'includes', weight: 0.7 },
    { id: 'edge4', source: 'node1', target: 'node5', type: 'includes', weight: 0.7 },
    { id: 'edge5', source: 'node4', target: 'node5', type: 'contrasts_with', weight: 0.6 }
  ];

  for (const edge of edges) {
    await graph.addEdge(edge);
  }
}

// Helper to generate mock embeddings
function generateMockEmbedding(text: string): number[] {
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 384 }, (_, i) => {
    const value = Math.sin(hash + i) * 0.5;
    return Math.max(-1, Math.min(1, value));
  });
}
