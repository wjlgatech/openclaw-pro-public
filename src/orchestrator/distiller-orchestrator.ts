/**
 * Distiller Orchestrator
 * AI Refinery compatible orchestration engine
 *
 * Features:
 * - YAML configuration loading
 * - Executor dictionary pattern
 * - Intelligent routing
 * - Task decomposition
 * - Memory context management
 */

import * as fs from 'fs/promises';
import * as yaml from 'yaml';
import {
  DistillerConfig,
  AgentExecutor,
  TaskNode,
  QueryOptions,
  ChatMessage,
} from './types';
import { DistillerConfigSchema } from './config-schema';

export class DistillerOrchestrator {
  private config: DistillerConfig | null = null;
  private executors: Map<string, AgentExecutor> = new Map();
  private chatHistory: ChatMessage[] = [];

  /**
   * Load configuration from YAML file
   */
  async loadConfig(filePath: string): Promise<void> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsed = yaml.parse(fileContent);
      await this.loadConfigFromObject(parsed);
    } catch (error: any) {
      throw new Error(`Failed to load config from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Load configuration from JavaScript object
   */
  async loadConfigFromObject(configObject: any): Promise<void> {
    // Validate configuration
    const validationResult = DistillerConfigSchema.safeParse(configObject);

    if (!validationResult.success) {
      throw new Error(`Invalid configuration: ${validationResult.error.message}`);
    }

    this.config = validationResult.data;
  }

  /**
   * Get current configuration
   */
  getConfig(): DistillerConfig | null {
    return this.config;
  }

  /**
   * Validate configuration
   */
  async validateConfig(): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    const validationResult = DistillerConfigSchema.safeParse(this.config);
    return validationResult.success;
  }

  /**
   * Register an agent executor function
   */
  registerAgent(name: string, executor: AgentExecutor): void {
    this.executors.set(name, executor);
  }

  /**
   * Check if agent is registered
   */
  hasAgent(name: string): boolean {
    return this.executors.has(name);
  }

  /**
   * List all registered agents
   */
  listAgents(): string[] {
    return Array.from(this.executors.keys());
  }

  /**
   * Execute a specific agent
   */
  async executeAgent(agentName: string, query: string, context?: any): Promise<string> {
    const executor = this.executors.get(agentName);

    if (!executor) {
      throw new Error(`Agent not found: ${agentName}. Available agents: ${this.listAgents().join(', ')}`);
    }

    try {
      return await executor(query, context);
    } catch (error: any) {
      throw new Error(`Agent ${agentName} execution failed: ${error.message}`);
    }
  }

  /**
   * Main query entry point with intelligent routing
   */
  async query(queryText: string, options: QueryOptions = {}): Promise<string> {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }

    // Add to chat history
    this.chatHistory.push({
      role: 'user',
      content: queryText,
      timestamp: new Date(),
    });

    // Task decomposition if enabled and requested
    if (this.config.orchestrator.task_decomposition && options.decompose) {
      return await this.executeWithDecomposition(queryText, options);
    }

    // Intelligent routing if enabled
    if (this.config.orchestrator.intelligent_routing) {
      const selectedAgent = await this.routeQuery(queryText, options);
      const result = await this.executeAgent(selectedAgent, queryText, options.context);

      // Add to chat history
      this.chatHistory.push({
        role: 'assistant',
        content: result,
        timestamp: new Date(),
      });

      return result;
    }

    // Fallback to default agent
    if (options.defaultAgent) {
      return await this.executeAgent(options.defaultAgent, queryText, options.context);
    }

    throw new Error('No routing method available. Enable intelligent_routing or provide defaultAgent.');
  }

  /**
   * Intelligent routing - select best agent for query
   */
  private async routeQuery(queryText: string, options: QueryOptions): Promise<string> {
    // Simple keyword-based routing for now
    // In production, this would use LLM to determine best agent
    const queryLower = queryText.toLowerCase();

    // Check registered agents
    const availableAgents = this.listAgents();

    // Simple keyword matching
    if ((queryLower.includes('search') || queryLower.includes('find')) && availableAgents.includes('search')) {
      return 'search';
    }

    if ((queryLower.includes('research') || queryLower.includes('analyze')) && availableAgents.includes('research')) {
      return 'research';
    }

    // Default to first available agent or fallback
    if (options.defaultAgent && availableAgents.includes(options.defaultAgent)) {
      return options.defaultAgent;
    }

    if (availableAgents.length > 0) {
      return availableAgents[0];
    }

    throw new Error('No agents available for routing');
  }

  /**
   * Execute query with task decomposition
   */
  private async executeWithDecomposition(queryText: string, options: QueryOptions): Promise<string> {
    const subtasks = await this.decomposeTask(queryText);

    // Convert to task DAG
    const taskDAG: TaskNode[] = subtasks.map((task, index) => ({
      agent: task.agent || this.listAgents()[0] || 'default',
      query: task.query,
      depends_on: task.depends_on || [],
    }));

    const results = await this.executeTaskDAG(taskDAG);

    // Combine results
    return results.join('\n\n');
  }

  /**
   * Decompose complex task into subtasks
   */
  async decomposeTask(queryText: string): Promise<Array<{ agent?: string; query: string; depends_on?: number[] }>> {
    // Simple decomposition for now
    // In production, this would use LLM for sophisticated decomposition

    const subtasks: Array<{ agent?: string; query: string; depends_on?: number[] }> = [];

    // Check for compound queries
    if (queryText.includes(' and ') || queryText.includes(' then ')) {
      const parts = queryText.split(/ and | then /i);
      parts.forEach((part, index) => {
        const agent = this.inferAgentFromQuery(part.trim());
        subtasks.push({
          agent,
          query: part.trim(),
          depends_on: index > 0 ? [index - 1] : [],
        });
      });
    } else {
      // Single task
      subtasks.push({
        agent: this.inferAgentFromQuery(queryText),
        query: queryText,
        depends_on: [],
      });
    }

    return subtasks;
  }

  /**
   * Infer best agent from query text
   */
  private inferAgentFromQuery(queryText: string): string {
    const lower = queryText.toLowerCase();

    if (lower.includes('search')) return 'search';
    if (lower.includes('research')) return 'research';
    if (lower.includes('analyze')) return 'analytics';
    if (lower.includes('plan')) return 'planning';

    return this.listAgents()[0] || 'default';
  }

  /**
   * Execute task DAG with dependencies
   */
  async executeTaskDAG(tasks: TaskNode[]): Promise<string[]> {
    const results: string[] = new Array(tasks.length);
    const completed: boolean[] = new Array(tasks.length).fill(false);

    // Execute tasks respecting dependencies
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      // Wait for dependencies
      for (const depIndex of task.depends_on) {
        if (!completed[depIndex]) {
          throw new Error(`Task ${i} depends on incomplete task ${depIndex}`);
        }
      }

      // Execute task
      try {
        results[i] = await this.executeAgent(task.agent, task.query);
        completed[i] = true;
      } catch (error: any) {
        results[i] = `Error executing task ${i}: ${error.message}`;
        completed[i] = false;
      }
    }

    return results;
  }

  /**
   * Get memory context
   */
  async getMemoryContext(contextType: string): Promise<string> {
    switch (contextType) {
      case 'date':
        return new Date().toISOString();

      case 'env_variable':
        return JSON.stringify(process.env, null, 2);

      case 'chat_history':
        return this.chatHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');

      default:
        return '';
    }
  }

  /**
   * Get chat history
   */
  async getChatHistory(): Promise<ChatMessage[]> {
    return this.chatHistory;
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    this.chatHistory = [];
  }
}
