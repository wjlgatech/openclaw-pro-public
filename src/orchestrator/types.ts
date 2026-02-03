/**
 * Type definitions for Distiller Orchestrator
 * AI Refinery compatible types
 */

export interface BaseConfig {
  llm: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
}

export interface SelfReflectionConfig {
  enabled: boolean;
  max_attempts: number;
}

export interface UtilityAgent {
  agent_name: string;
  agent_description: string;
  self_reflection?: SelfReflectionConfig;
  llm?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface OrchestratorConfig {
  intelligent_routing: boolean;
  task_decomposition: boolean;
  memory_contexts: string[];
  routing_llm?: string;
}

export interface MemoryConfig {
  chat_history?: {
    enabled: boolean;
    max_rounds: number;
  };
  variable_memory?: {
    enabled: boolean;
  };
}

export interface DistillerConfig {
  base_config: BaseConfig;
  utility_agents: UtilityAgent[];
  orchestrator: OrchestratorConfig;
  memory_config?: MemoryConfig;
}

export type AgentExecutor = (query: string, context?: any) => Promise<string>;

export interface TaskNode {
  agent: string;
  query: string;
  depends_on: number[];
}

export interface QueryOptions {
  defaultAgent?: string;
  decompose?: boolean;
  context?: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
