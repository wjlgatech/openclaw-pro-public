/**
 * Tests for Distiller Orchestrator
 * Following Reality-Grounded TDD - tests written FIRST
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DistillerOrchestrator } from '../../src/orchestrator/distiller-orchestrator';
import * as path from 'path';

describe('DistillerOrchestrator', () => {
  let orchestrator: DistillerOrchestrator;

  beforeEach(() => {
    orchestrator = new DistillerOrchestrator();
  });

  describe('Configuration Loading', () => {
    it('should load valid YAML configuration file', async () => {
      const configPath = path.join(__dirname, '../../config/examples/test-distiller-config.yaml');

      await orchestrator.loadConfig(configPath);

      expect(orchestrator.getConfig()).toBeDefined();
      expect(orchestrator.getConfig()?.base_config.llm).toBe('ollama:phi4');
    });

    it('should validate configuration schema', async () => {
      const configPath = path.join(__dirname, '../../config/examples/test-distiller-config.yaml');

      await orchestrator.loadConfig(configPath);

      const config = orchestrator.getConfig();
      expect(config?.base_config).toBeDefined();
      expect(config?.utility_agents).toBeDefined();
      expect(config?.orchestrator).toBeDefined();
    });

    it('should throw error for invalid configuration', async () => {
      // Create orchestrator with invalid config
      const invalidConfig = { invalid: 'config' };

      await expect(
        orchestrator.loadConfigFromObject(invalidConfig)
      ).rejects.toThrow();
    });

    it('should throw error for non-existent file', async () => {
      await expect(
        orchestrator.loadConfig('/non/existent/file.yaml')
      ).rejects.toThrow();
    });
  });

  describe('Executor Dictionary', () => {
    it('should register agent executor functions', async () => {
      const mockExecutor = vi.fn(async (query: string) => 'result');

      orchestrator.registerAgent('test_agent', mockExecutor);

      expect(orchestrator.hasAgent('test_agent')).toBe(true);
    });

    it('should execute registered agent', async () => {
      const mockExecutor = vi.fn(async (query: string) => `Result for: ${query}`);
      orchestrator.registerAgent('test_agent', mockExecutor);

      const result = await orchestrator.executeAgent('test_agent', 'test query');

      expect(mockExecutor).toHaveBeenCalledWith('test query', undefined);
      expect(result).toBe('Result for: test query');
    });

    it('should throw error for unregistered agent', async () => {
      await expect(
        orchestrator.executeAgent('unknown_agent', 'query')
      ).rejects.toThrow('Agent not found');
    });

    it('should list all registered agents', () => {
      orchestrator.registerAgent('agent1', async () => 'result1');
      orchestrator.registerAgent('agent2', async () => 'result2');

      const agents = orchestrator.listAgents();

      expect(agents).toContain('agent1');
      expect(agents).toContain('agent2');
      expect(agents).toHaveLength(2);
    });
  });

  describe('Intelligent Routing', () => {
    beforeEach(async () => {
      const configPath = path.join(__dirname, '../../config/examples/test-distiller-config.yaml');
      await orchestrator.loadConfig(configPath);

      // Register test agents
      orchestrator.registerAgent('search', async (q: string) => `Search result for: ${q}`);
      orchestrator.registerAgent('research', async (q: string) => `Research result for: ${q}`);
    });

    it('should route query to appropriate agent', async () => {
      // Mock the routing decision
      const routeSpy = vi.spyOn(orchestrator as any, 'routeQuery');
      routeSpy.mockResolvedValue('search');

      const result = await orchestrator.query('What is the weather today?');

      expect(routeSpy).toHaveBeenCalled();
      expect(result).toContain('Search result');
    });

    it('should use intelligent routing when enabled', async () => {
      const config = orchestrator.getConfig();
      expect(config?.orchestrator.intelligent_routing).toBe(true);

      // Should use LLM to determine best agent
      const result = await orchestrator.query('Research climate change');

      expect(result).toBeDefined();
    });

    it('should fall back to default agent when routing fails', async () => {
      orchestrator.registerAgent('default', async (q: string) => `Default: ${q}`);

      const result = await orchestrator.query('Unknown query type', { defaultAgent: 'default' });

      expect(result).toContain('Default:');
    });
  });

  describe('Task Decomposition', () => {
    beforeEach(async () => {
      const configPath = path.join(__dirname, '../../config/examples/test-distiller-config.yaml');
      await orchestrator.loadConfig(configPath);

      orchestrator.registerAgent('search', async (q: string) => `Search: ${q}`);
      orchestrator.registerAgent('research', async (q: string) => `Research: ${q}`);
    });

    it('should decompose complex queries into subtasks', async () => {
      const complexQuery = 'Research AI trends and search for recent papers';

      const decomposed = await orchestrator.decomposeTask(complexQuery);

      expect(decomposed).toBeDefined();
      expect(decomposed.length).toBeGreaterThan(1);
    });

    it('should execute decomposed tasks in order', async () => {
      const complexQuery = 'Research and then search';

      const result = await orchestrator.query(complexQuery, { decompose: true });

      expect(result).toBeDefined();
      // Result should contain outputs from multiple agents
    });

    it('should handle task dependencies', async () => {
      const tasks = [
        { agent: 'research', query: 'Find information', depends_on: [] },
        { agent: 'search', query: 'Search for more', depends_on: [0] },
      ];

      const results = await orchestrator.executeTaskDAG(tasks);

      expect(results).toHaveLength(2);
      expect(results[0]).toContain('Research:');
      expect(results[1]).toContain('Search:');
    });
  });

  describe('Memory Context Management', () => {
    beforeEach(async () => {
      const configPath = path.join(__dirname, '../../config/examples/test-distiller-config.yaml');
      await orchestrator.loadConfig(configPath);
    });

    it('should initialize memory contexts', () => {
      const config = orchestrator.getConfig();

      expect(config?.orchestrator.memory_contexts).toContain('date');
      expect(config?.orchestrator.memory_contexts).toContain('env_variable');
      expect(config?.orchestrator.memory_contexts).toContain('chat_history');
    });

    it('should provide date context', async () => {
      const context = await orchestrator.getMemoryContext('date');

      expect(context).toBeDefined();
      expect(context).toContain(new Date().getFullYear().toString());
    });

    it('should provide environment variable context', async () => {
      process.env.TEST_VAR = 'test_value';

      const context = await orchestrator.getMemoryContext('env_variable');

      expect(context).toBeDefined();
    });

    it('should manage chat history', async () => {
      orchestrator.registerAgent('test', async (q: string) => 'response');

      await orchestrator.query('First message');
      await orchestrator.query('Second message');

      const history = await orchestrator.getChatHistory();

      expect(history.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Validation', () => {
    it('should validate configuration before execution', async () => {
      const configPath = path.join(__dirname, '../../config/examples/test-distiller-config.yaml');
      await orchestrator.loadConfig(configPath);

      const isValid = await orchestrator.validateConfig();

      expect(isValid).toBe(true);
    });

    it('should detect missing required fields', async () => {
      const invalidConfig = {
        base_config: {},
        // Missing utility_agents and orchestrator
      };

      await expect(
        orchestrator.loadConfigFromObject(invalidConfig)
      ).rejects.toThrow();
    });

    it('should validate agent descriptions exist', async () => {
      const configPath = path.join(__dirname, '../../config/examples/test-distiller-config.yaml');
      await orchestrator.loadConfig(configPath);

      const config = orchestrator.getConfig();

      config?.utility_agents.forEach(agent => {
        expect(agent.agent_description).toBeDefined();
        expect(agent.agent_description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle agent execution errors gracefully', async () => {
      orchestrator.registerAgent('failing_agent', async () => {
        throw new Error('Agent failed');
      });

      await expect(
        orchestrator.executeAgent('failing_agent', 'query')
      ).rejects.toThrow('Agent failed');
    });

    it('should provide helpful error messages', async () => {
      try {
        await orchestrator.executeAgent('nonexistent', 'query');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Agent not found');
        expect(error.message).toContain('nonexistent');
      }
    });

    it('should handle YAML parsing errors', async () => {
      const invalidYamlPath = path.join(__dirname, 'invalid.yaml');

      await expect(
        orchestrator.loadConfig(invalidYamlPath)
      ).rejects.toThrow();
    });
  });
});
