/**
 * Zod schemas for configuration validation
 */

import { z } from 'zod';

export const SelfReflectionSchema = z.object({
  enabled: z.boolean(),
  max_attempts: z.number().min(1).max(10),
});

export const UtilityAgentSchema = z.object({
  agent_name: z.string().min(1),
  agent_description: z.string().min(1),
  self_reflection: SelfReflectionSchema.optional(),
  llm: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional(),
});

export const BaseConfigSchema = z.object({
  llm: z.string().min(1),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().positive(),
  top_p: z.number().min(0).max(1),
});

export const OrchestratorConfigSchema = z.object({
  intelligent_routing: z.boolean(),
  task_decomposition: z.boolean(),
  memory_contexts: z.array(z.string()),
  routing_llm: z.string().optional(),
});

export const MemoryConfigSchema = z.object({
  chat_history: z.object({
    enabled: z.boolean(),
    max_rounds: z.number().positive(),
  }).optional(),
  variable_memory: z.object({
    enabled: z.boolean(),
  }).optional(),
});

export const DistillerConfigSchema = z.object({
  base_config: BaseConfigSchema,
  utility_agents: z.array(UtilityAgentSchema).min(1),
  orchestrator: OrchestratorConfigSchema,
  memory_config: MemoryConfigSchema.optional(),
});
