// Ollama Provider - Local, Open-Source LLM Provider
// No API key needed, runs models locally

export interface OllamaConfig {
  baseUrl?: string; // Default: http://localhost:11434
  model: string;    // e.g., "llama3.1:8b"
  temperature?: number;
  maxTokens?: number;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaProvider {
  private baseUrl: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: OllamaConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model;
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 2000;
  }

  async chat(messages: OllamaMessage[]): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        options: {
          temperature: this.temperature,
          num_predict: this.maxTokens
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${error}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message.content;
  }

  async *chatStream(messages: OllamaMessage[]): AsyncGenerator<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        options: {
          temperature: this.temperature,
          num_predict: this.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data: OllamaResponse = JSON.parse(line);
          if (data.message?.content) {
            yield data.message.content;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  static async checkInstallation(): Promise<{ installed: boolean; version?: string }> {
    try {
      const response = await fetch('http://localhost:11434/api/version', {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        return { installed: true, version: data.version };
      }
    } catch {
      // Ollama not running
    }

    return { installed: false };
  }

  static async listModels(): Promise<string[]> {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        return data.models?.map((m: any) => m.name) || [];
      }
    } catch {
      // Ollama not running
    }

    return [];
  }

  static async pullModel(model: string, onProgress?: (progress: number) => void): Promise<void> {
    const response = await fetch('http://localhost:11434/api/pull', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: model, stream: true })
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.total && data.completed && onProgress) {
            const progress = (data.completed / data.total) * 100;
            onProgress(progress);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  static getRecommendedModels(): Array<{ name: string; size: string; description: string }> {
    return [
      {
        name: 'llama3.1:8b',
        size: '4.7GB',
        description: 'Recommended. Fast, capable, runs on most computers.'
      },
      {
        name: 'llama3.2:3b',
        size: '2GB',
        description: 'Lighter weight, faster, good for quick tasks.'
      },
      {
        name: 'qwen2.5:7b',
        size: '4.7GB',
        description: 'Excellent for coding tasks.'
      },
      {
        name: 'mistral:7b',
        size: '4.1GB',
        description: 'Good all-around performance.'
      }
    ];
  }
}
