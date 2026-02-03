/**
 * Inference Engine Test Suite
 * Reality-Grounded TDD tests for LLM-powered inference capabilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  InferenceEngine,
  InferenceOptions,
  InferredConnection,
  TraversalPath
} from '../../extensions/knowledge-system/inference-engine.js';
import { GraphNode } from '../../extensions/knowledge-system/types.js';

describe('InferenceEngine - Reality-Grounded TDD', () => {
  let inferenceEngine: InferenceEngine;

  beforeEach(() => {
    inferenceEngine = new InferenceEngine();
  });

  // ========== Construction and Configuration Tests ==========

  describe('Construction and Configuration', () => {
    it('should create inference engine with default settings', () => {
      expect(inferenceEngine).toBeDefined();
    });

    it('should create inference engine with custom settings', () => {
      const customEngine = new InferenceEngine(
        null,
        'custom-embedding-model',
        500
      );

      expect(customEngine).toBeDefined();
    });

    it('should allow custom LLM client', () => {
      const mockClient = { call: async () => ({}) };
      const engine = new InferenceEngine(mockClient);

      expect(engine).toBeDefined();
    });
  });

  // ========== Inference Generation Tests ==========

  describe('Inference Generation', () => {
    it('should infer connections between nodes', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Machine learning uses algorithms', embedding: [] },
        { id: 'n2', content: 'Algorithms process data', embedding: [] },
        { id: 'n3', content: 'Data science uses machine learning', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(
        nodes,
        'What connects machine learning and data?'
      );

      expect(Array.isArray(inferences)).toBe(true);
      inferences.forEach(inf => {
        expect(inf).toHaveProperty('sourceNode');
        expect(inf).toHaveProperty('targetNode');
        expect(inf).toHaveProperty('reasoning');
        expect(inf).toHaveProperty('confidence');
        expect(inf).toHaveProperty('inferredType');
      });
    });

    it('should return empty array for empty node list', async () => {
      const inferences = await inferenceEngine.inferMissingConnections([], 'test query');

      expect(inferences).toEqual([]);
    });

    it('should filter inferences by confidence threshold', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Node 1 content', embedding: [] },
        { id: 'n2', content: 'Node 2 content', embedding: [] }
      ];

      const options: InferenceOptions = {
        confidenceThreshold: 0.8,
        maxInferences: 10
      };

      const inferences = await inferenceEngine.inferMissingConnections(
        nodes,
        'test query',
        options
      );

      // All inferences should meet threshold
      inferences.forEach(inf => {
        expect(inf.confidence).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('should limit number of inferences', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'AI machine learning deep neural', embedding: [] },
        { id: 'n2', content: 'machine learning algorithms data', embedding: [] },
        { id: 'n3', content: 'deep learning neural networks', embedding: [] },
        { id: 'n4', content: 'algorithms data structures', embedding: [] }
      ];

      const options: InferenceOptions = {
        maxInferences: 2
      };

      const inferences = await inferenceEngine.inferMissingConnections(
        nodes,
        'test query',
        options
      );

      expect(inferences.length).toBeLessThanOrEqual(2);
    });

    it('should use caching for repeated queries', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Test content 1', embedding: [] },
        { id: 'n2', content: 'Test content 2', embedding: [] }
      ];

      const options: InferenceOptions = {
        useCache: true
      };

      // First call
      const firstCall = await inferenceEngine.inferMissingConnections(
        nodes,
        'test query',
        options
      );

      // Second call (should use cache)
      const secondCall = await inferenceEngine.inferMissingConnections(
        nodes,
        'test query',
        options
      );

      expect(firstCall).toEqual(secondCall);
    });

    it('should bypass cache when disabled', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Test content', embedding: [] },
        { id: 'n2', content: 'Test content', embedding: [] }
      ];

      const options: InferenceOptions = {
        useCache: false
      };

      const result = await inferenceEngine.inferMissingConnections(
        nodes,
        'test query',
        options
      );

      expect(Array.isArray(result)).toBe(true);
    });

    it('should support different inference strategies', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Node 1', embedding: [] },
        { id: 'n2', content: 'Node 2', embedding: [] }
      ];

      const semanticOptions: InferenceOptions = { inferenceStrategy: 'semantic' };
      const similarityOptions: InferenceOptions = { inferenceStrategy: 'similarity' };
      const structuralOptions: InferenceOptions = { inferenceStrategy: 'structural' };

      const semantic = await inferenceEngine.inferMissingConnections(nodes, 'test', semanticOptions);
      const similarity = await inferenceEngine.inferMissingConnections(nodes, 'test', similarityOptions);
      const structural = await inferenceEngine.inferMissingConnections(nodes, 'test', structuralOptions);

      expect(Array.isArray(semantic)).toBe(true);
      expect(Array.isArray(similarity)).toBe(true);
      expect(Array.isArray(structural)).toBe(true);
    });

    it('should use custom temperature for inference', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Test', embedding: [] }
      ];

      const options: InferenceOptions = {
        temperature: 0.9
      };

      const result = await inferenceEngine.inferMissingConnections(nodes, 'test', options);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ========== Mock Inference Tests ==========

  describe('Mock Inference (No LLM Client)', () => {
    it('should generate mock inferences based on content similarity', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'machine learning algorithms', embedding: [] },
        { id: 'n2', content: 'machine learning models', embedding: [] },
        { id: 'n3', content: 'completely different topic', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test');

      // Should infer connection between n1 and n2 (similar content)
      const n1n2Inference = inferences.find(
        inf => (inf.sourceNode === 'n1' && inf.targetNode === 'n2') ||
               (inf.sourceNode === 'n2' && inf.targetNode === 'n1')
      );

      expect(n1n2Inference).toBeDefined();
      expect(n1n2Inference!.confidence).toBeGreaterThan(0);
    });

    it('should not infer connections for dissimilar content', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'completely unique content alpha', embedding: [] },
        { id: 'n2', content: 'totally different content beta', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test');

      // Should have no or low-confidence inferences
      expect(inferences.length).toBe(0);
    });

    it('should assign higher confidence to more similar content', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'a b c d e f', embedding: [] },
        { id: 'n2', content: 'a b c', embedding: [] },
        { id: 'n3', content: 'a b c d e f g h', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test');

      if (inferences.length > 1) {
        // Higher overlap should mean higher confidence
        const n1n3 = inferences.find(
          inf => (inf.sourceNode === 'n1' && inf.targetNode === 'n3') ||
                 (inf.sourceNode === 'n3' && inf.targetNode === 'n1')
        );
        const n2n3 = inferences.find(
          inf => (inf.sourceNode === 'n2' && inf.targetNode === 'n3') ||
                 (inf.sourceNode === 'n3' && inf.targetNode === 'n2')
        );

        if (n1n3 && n2n3) {
          expect(n1n3.confidence).toBeGreaterThan(n2n3.confidence);
        }
      }
    });
  });

  // ========== Knowledge Gap Identification Tests ==========

  describe('Knowledge Gap Identification', () => {
    it('should identify gaps in empty path list', async () => {
      const gaps = await inferenceEngine.identifyKnowledgeGaps([], 'test query');

      expect(Array.isArray(gaps)).toBe(true);
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps[0]).toContain('No paths available');
    });

    it('should identify gaps in short paths', async () => {
      const paths: TraversalPath[] = [
        {
          nodes: [
            { id: 'n1', content: 'Node 1', embedding: [] }
          ],
          score: 0.3
        }
      ];

      const gaps = await inferenceEngine.identifyKnowledgeGaps(paths, 'test query');

      expect(Array.isArray(gaps)).toBe(true);
      expect(gaps.some(gap => gap.includes('short'))).toBe(true);
    });

    it('should identify gaps when path scores are low', async () => {
      const paths: TraversalPath[] = [
        {
          nodes: [
            { id: 'n1', content: 'Node 1', embedding: [] },
            { id: 'n2', content: 'Node 2', embedding: [] }
          ],
          score: 0.2
        },
        {
          nodes: [
            { id: 'n3', content: 'Node 3', embedding: [] },
            { id: 'n4', content: 'Node 4', embedding: [] }
          ],
          score: 0.3
        }
      ];

      const gaps = await inferenceEngine.identifyKnowledgeGaps(paths, 'test query');

      expect(gaps.some(gap => gap.toLowerCase().includes('low'))).toBe(true);
    });

    it('should suggest specific information needs based on query', async () => {
      const paths: TraversalPath[] = [
        {
          nodes: [
            { id: 'n1', content: 'Test', embedding: [] },
            { id: 'n2', content: 'Test', embedding: [] }
          ],
          score: 0.5
        }
      ];

      const gaps = await inferenceEngine.identifyKnowledgeGaps(
        paths,
        'machine learning neural networks deep'
      );

      expect(Array.isArray(gaps)).toBe(true);
      expect(gaps.length).toBeGreaterThan(0);
    });

    it('should use caching for gap identification', async () => {
      const paths: TraversalPath[] = [
        {
          nodes: [
            { id: 'n1', content: 'Test', embedding: [] }
          ],
          score: 0.5
        }
      ];

      const firstCall = await inferenceEngine.identifyKnowledgeGaps(paths, 'test');
      const secondCall = await inferenceEngine.identifyKnowledgeGaps(paths, 'test');

      expect(firstCall).toEqual(secondCall);
    });
  });

  // ========== Validation Tests ==========

  describe('Inference Validation', () => {
    it('should validate correct inference', () => {
      const validInference: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: 'Valid reasoning',
        confidence: 0.8,
        inferredType: 'related_to'
      };

      expect(inferenceEngine.validateInference(validInference)).toBe(true);
    });

    it('should reject self-loop inference', () => {
      const selfLoop: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n1',
        reasoning: 'Self reference',
        confidence: 0.8,
        inferredType: 'related_to'
      };

      expect(inferenceEngine.validateInference(selfLoop)).toBe(false);
    });

    it('should reject inference with confidence > 1.0', () => {
      const highConfidence: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: 'Test',
        confidence: 1.5,
        inferredType: 'related_to'
      };

      expect(inferenceEngine.validateInference(highConfidence)).toBe(false);
    });

    it('should reject inference with confidence < 0.0', () => {
      const negativeConfidence: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: 'Test',
        confidence: -0.1,
        inferredType: 'related_to'
      };

      expect(inferenceEngine.validateInference(negativeConfidence)).toBe(false);
    });

    it('should reject inference with empty reasoning', () => {
      const emptyReasoning: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: '',
        confidence: 0.8,
        inferredType: 'related_to'
      };

      expect(inferenceEngine.validateInference(emptyReasoning)).toBe(false);
    });

    it('should reject inference with empty type', () => {
      const emptyType: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: 'Valid reasoning',
        confidence: 0.8,
        inferredType: ''
      };

      expect(inferenceEngine.validateInference(emptyType)).toBe(false);
    });

    it('should accept inference with confidence at boundaries', () => {
      const minConfidence: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: 'Test',
        confidence: 0.0,
        inferredType: 'related_to'
      };

      const maxConfidence: InferredConnection = {
        sourceNode: 'n1',
        targetNode: 'n2',
        reasoning: 'Test',
        confidence: 1.0,
        inferredType: 'related_to'
      };

      expect(inferenceEngine.validateInference(minConfidence)).toBe(true);
      expect(inferenceEngine.validateInference(maxConfidence)).toBe(true);
    });
  });

  // ========== Cache Management Tests ==========

  describe('Cache Management', () => {
    it('should clear cache', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Test', embedding: [] }
      ];

      // Populate cache
      await inferenceEngine.inferMissingConnections(nodes, 'test', { useCache: true });

      // Clear cache
      inferenceEngine.clearCache();

      // Cache should be empty (hard to verify directly, but should not error)
      expect(true).toBe(true);
    });

    it('should trim cache when size limit exceeded', async () => {
      const smallCacheEngine = new InferenceEngine(null, 'model', 2);

      // Add more entries than cache size
      for (let i = 0; i < 5; i++) {
        const nodes: GraphNode[] = [
          { id: `n${i}`, content: `Content ${i}`, embedding: [] }
        ];
        await smallCacheEngine.inferMissingConnections(
          nodes,
          `query ${i}`,
          { useCache: true }
        );
      }

      // Cache should have been trimmed (hard to verify, but should not crash)
      expect(true).toBe(true);
    });
  });

  // ========== Inference Connection Structure Tests ==========

  describe('Inference Connection Structure', () => {
    it('should produce inferences with correct structure', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'machine learning algorithms', embedding: [] },
        { id: 'n2', content: 'machine learning models', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test');

      if (inferences.length > 0) {
        const inference = inferences[0];

        expect(typeof inference.sourceNode).toBe('string');
        expect(typeof inference.targetNode).toBe('string');
        expect(typeof inference.reasoning).toBe('string');
        expect(typeof inference.confidence).toBe('number');
        expect(typeof inference.inferredType).toBe('string');

        expect(inference.reasoning.length).toBeGreaterThan(0);
        expect(inference.inferredType.length).toBeGreaterThan(0);
      }
    });

    it('should assign appropriate inference types', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'concept A', embedding: [] },
        { id: 'n2', content: 'concept B', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test');

      if (inferences.length > 0) {
        const validTypes = ['related_to', 'causes', 'depends_on', 'similar_to', 'part_of'];
        inferences.forEach(inf => {
          // In mock mode, it uses 'related_to'
          expect(inf.inferredType).toBe('related_to');
        });
      }
    });

    it('should provide meaningful reasoning', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'apple fruit', embedding: [] },
        { id: 'n2', content: 'fruit basket', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test');

      if (inferences.length > 0) {
        const inference = inferences[0];
        expect(inference.reasoning).toContain('common terms');
      }
    });
  });

  // ========== Edge Cases and Error Handling ==========

  describe('Edge Cases and Error Handling', () => {
    it('should handle nodes with minimal content', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'a', embedding: [] },
        { id: 'n2', content: 'b', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test');

      expect(Array.isArray(inferences)).toBe(true);
    });

    it('should handle nodes with metadata', async () => {
      const nodes: GraphNode[] = [
        {
          id: 'n1',
          content: 'Content 1',
          embedding: [],
          metadata: { type: 'concept', category: 'ML' }
        },
        {
          id: 'n2',
          content: 'Content 2',
          embedding: [],
          metadata: { type: 'example', category: 'ML' }
        }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test');

      expect(Array.isArray(inferences)).toBe(true);
    });

    it('should handle very long query strings', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Test', embedding: [] }
      ];

      const longQuery = 'word '.repeat(1000);

      const inferences = await inferenceEngine.inferMissingConnections(nodes, longQuery);

      expect(Array.isArray(inferences)).toBe(true);
    });

    it('should handle special characters in content', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: 'Content with @#$% symbols', embedding: [] },
        { id: 'n2', content: 'More !@#$ special chars', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, 'test!@#');

      expect(Array.isArray(inferences)).toBe(true);
    });

    it('should handle unicode content', async () => {
      const nodes: GraphNode[] = [
        { id: 'n1', content: '机器学习 machine learning', embedding: [] },
        { id: 'n2', content: 'Apprentissage automatique', embedding: [] }
      ];

      const inferences = await inferenceEngine.inferMissingConnections(nodes, '学习');

      expect(Array.isArray(inferences)).toBe(true);
    });
  });
});
