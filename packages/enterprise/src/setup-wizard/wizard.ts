// Setup Wizard for First-Run Configuration
// Guides users through initial setup with multi-choice selections

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  options: SetupOption[];
  multiSelect?: boolean;
}

export interface SetupOption {
  id: string;
  label: string;
  description: string;
  recommended?: boolean;
  requires?: string[]; // Prerequisites
}

export interface SetupConfig {
  llmProvider: 'ollama' | 'anthropic' | 'openai';
  ollamaModel?: string;
  anthropicApiKey?: string;
  openaiApiKey?: string;
  features: {
    piiDetection: boolean;
    auditLogging: boolean;
    multiTenant: boolean;
  };
  dataDirectory: string;
  port: number;
}

export const SETUP_WIZARD_STEPS: SetupStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to OpenClaw Pro!',
    description: 'Let\'s get you set up in a few quick steps. This will only take a minute.',
    options: [
      {
        id: 'continue',
        label: 'Get Started',
        description: 'Begin setup process',
        recommended: true
      },
      {
        id: 'skip',
        label: 'Use Defaults',
        description: 'Skip setup and use recommended settings'
      }
    ]
  },
  {
    id: 'llm-provider',
    title: 'Choose Your AI Provider',
    description: 'Select which AI model provider you want to use. You can change this later in Settings.',
    options: [
      {
        id: 'ollama',
        label: 'Ollama (Local, Free)',
        description: 'Run AI models locally on your computer. No API key needed. Works offline.',
        recommended: true
      },
      {
        id: 'anthropic',
        label: 'Anthropic Claude',
        description: 'Cloud-based, requires API key. Best quality but costs per use.'
      },
      {
        id: 'openai',
        label: 'OpenAI ChatGPT',
        description: 'Cloud-based, requires API key. Popular and powerful.'
      }
    ]
  },
  {
    id: 'ollama-model',
    title: 'Choose Ollama Model',
    description: 'Select which local model to use. We\'ll download it for you if needed.',
    options: [
      {
        id: 'llama3.1:8b',
        label: 'Llama 3.1 (8B)',
        description: 'Recommended. Fast, capable, runs on most computers. ~4.7GB download.',
        recommended: true
      },
      {
        id: 'llama3.2:3b',
        label: 'Llama 3.2 (3B)',
        description: 'Lighter weight, faster, good for quick tasks. ~2GB download.'
      },
      {
        id: 'qwen2.5:7b',
        label: 'Qwen 2.5 (7B)',
        description: 'Excellent for coding tasks. ~4.7GB download.'
      },
      {
        id: 'mistral:7b',
        label: 'Mistral (7B)',
        description: 'Good all-around performance. ~4.1GB download.'
      }
    ]
  },
  {
    id: 'anthropic-key',
    title: 'Enter Anthropic API Key',
    description: 'Get your API key from https://console.anthropic.com/',
    options: [
      {
        id: 'enter-key',
        label: 'I have an API key',
        description: 'Enter your Anthropic API key'
      },
      {
        id: 'get-key',
        label: 'I need to get one',
        description: 'Open Anthropic Console to create an API key'
      },
      {
        id: 'skip',
        label: 'Skip for now',
        description: 'Continue without Anthropic (you can add it later)'
      }
    ]
  },
  {
    id: 'features',
    title: 'Enable Enterprise Features',
    description: 'Choose which security and compliance features to enable.',
    multiSelect: true,
    options: [
      {
        id: 'pii-detection',
        label: 'PII Detection',
        description: 'Automatically detect and mask sensitive personal information',
        recommended: true
      },
      {
        id: 'audit-logging',
        label: 'Audit Logging',
        description: 'Track all actions for compliance and security',
        recommended: true
      },
      {
        id: 'multi-tenant',
        label: 'Multi-Tenant Support',
        description: 'Enable isolated workspaces for teams'
      }
    ]
  },
  {
    id: 'complete',
    title: 'Setup Complete!',
    description: 'You\'re all set. OpenClaw Pro is ready to use.',
    options: [
      {
        id: 'finish',
        label: 'Start Using OpenClaw Pro',
        description: 'Go to the main dashboard',
        recommended: true
      },
      {
        id: 'settings',
        label: 'Review Settings',
        description: 'View and adjust your configuration'
      }
    ]
  }
];

export class SetupWizard {
  private currentStep = 0;
  private config: Partial<SetupConfig> = {
    llmProvider: 'ollama', // Default to Ollama (no API key needed)
    ollamaModel: 'llama3.1:8b',
    features: {
      piiDetection: true,
      auditLogging: true,
      multiTenant: false
    },
    dataDirectory: './data',
    port: 19000
  };

  getCurrentStep(): SetupStep {
    return SETUP_WIZARD_STEPS[this.currentStep];
  }

  getProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentStep + 1,
      total: SETUP_WIZARD_STEPS.length,
      percentage: Math.round(((this.currentStep + 1) / SETUP_WIZARD_STEPS.length) * 100)
    };
  }

  async handleSelection(stepId: string, selectedOptions: string[], inputValues?: Record<string, string>): Promise<void> {
    const step = this.getCurrentStep();

    if (step.id !== stepId) {
      throw new Error(`Invalid step: expected ${step.id}, got ${stepId}`);
    }

    // Process selections based on step
    switch (stepId) {
      case 'welcome':
        if (selectedOptions.includes('skip')) {
          // Use all defaults
          this.currentStep = SETUP_WIZARD_STEPS.length - 1;
        }
        break;

      case 'llm-provider':
        this.config.llmProvider = selectedOptions[0] as any;
        break;

      case 'ollama-model':
        this.config.ollamaModel = selectedOptions[0];
        await this.downloadOllamaModel(selectedOptions[0]);
        break;

      case 'anthropic-key':
        if (selectedOptions.includes('enter-key') && inputValues?.apiKey) {
          this.config.anthropicApiKey = inputValues.apiKey;
        } else if (selectedOptions.includes('get-key')) {
          // Open Anthropic Console
          // Will be handled by UI
        }
        break;

      case 'features':
        this.config.features = {
          piiDetection: selectedOptions.includes('pii-detection'),
          auditLogging: selectedOptions.includes('audit-logging'),
          multiTenant: selectedOptions.includes('multi-tenant')
        };
        break;

      case 'complete':
        await this.saveConfiguration();
        break;
    }
  }

  next(): boolean {
    if (this.currentStep < SETUP_WIZARD_STEPS.length - 1) {
      this.currentStep++;

      // Skip steps based on selections
      const currentStep = this.getCurrentStep();

      // Skip Ollama model selection if not using Ollama
      if (currentStep.id === 'ollama-model' && this.config.llmProvider !== 'ollama') {
        this.currentStep++;
      }

      // Skip Anthropic key if not using Anthropic
      if (currentStep.id === 'anthropic-key' && this.config.llmProvider !== 'anthropic') {
        this.currentStep++;
      }

      return true;
    }
    return false;
  }

  previous(): boolean {
    if (this.currentStep > 0) {
      this.currentStep--;

      // Skip steps when going backward too
      const currentStep = this.getCurrentStep();

      if (currentStep.id === 'ollama-model' && this.config.llmProvider !== 'ollama') {
        this.currentStep--;
      }

      if (currentStep.id === 'anthropic-key' && this.config.llmProvider !== 'anthropic') {
        this.currentStep--;
      }

      return true;
    }
    return false;
  }

  getConfiguration(): SetupConfig {
    return this.config as SetupConfig;
  }

  private async downloadOllamaModel(model: string): Promise<void> {
    // Check if Ollama is installed
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      // Check if model is already downloaded
      const { stdout } = await execAsync('ollama list');
      if (stdout.includes(model)) {
        return; // Already have it
      }

      // Pull the model
      await execAsync(`ollama pull ${model}`);
    } catch (error: any) {
      if (error.message.includes('command not found')) {
        throw new Error('Ollama is not installed. Please install it from https://ollama.ai/download');
      }
      throw error;
    }
  }

  private async saveConfiguration(): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');

    // Save to .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch {
      // .env doesn't exist, will create
    }

    // Update or add configuration
    const updates: Record<string, string> = {
      LLM_PROVIDER: this.config.llmProvider!,
      OLLAMA_MODEL: this.config.ollamaModel || 'llama3.1:8b',
      ENABLE_PII_DETECTION: String(this.config.features?.piiDetection),
      ENABLE_AUDIT_LOGGING: String(this.config.features?.auditLogging),
      ENABLE_MULTI_TENANT: String(this.config.features?.multiTenant),
      ENTERPRISE_PORT: String(this.config.port),
      DATA_DIR: this.config.dataDirectory!
    };

    if (this.config.anthropicApiKey) {
      updates.ANTHROPIC_API_KEY = this.config.anthropicApiKey;
    }

    // Update env content
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }

    await fs.writeFile(envPath, envContent.trim() + '\n');

    // Mark setup as complete
    const setupFlagPath = path.join(process.cwd(), '.setup-complete');
    await fs.writeFile(setupFlagPath, new Date().toISOString());
  }

  static async isSetupComplete(): Promise<boolean> {
    const fs = require('fs').promises;
    const path = require('path');
    const setupFlagPath = path.join(process.cwd(), '.setup-complete');

    try {
      await fs.access(setupFlagPath);
      return true;
    } catch {
      return false;
    }
  }

  static async resetSetup(): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    const setupFlagPath = path.join(process.cwd(), '.setup-complete');

    try {
      await fs.unlink(setupFlagPath);
    } catch {
      // Already deleted or doesn't exist
    }
  }
}
