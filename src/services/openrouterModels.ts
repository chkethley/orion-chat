interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  pricing?: string;
  featured?: boolean;
}

const FEATURED_MODEL_IDS = [
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4o',
  'google/gemini-2.0-flash-exp:free',
];

export async function fetchOpenRouterModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data: OpenRouterModelsResponse = await response.json();

    return data.data.map((model) => {
      const provider = model.id.split('/')[0] || 'Unknown';
      const contextWindow = formatContextWindow(model.context_length);
      const pricing = formatPricing(model.pricing);

      return {
        id: model.id,
        name: model.name || model.id.split('/')[1]?.replace(/-/g, ' ') || model.id,
        provider: capitalizeProvider(provider),
        contextWindow,
        pricing,
        featured: FEATURED_MODEL_IDS.includes(model.id),
      };
    });
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    // Return fallback models if fetch fails
    return getFallbackModels();
  }
}

function formatContextWindow(contextLength: number): string {
  if (contextLength >= 1_000_000) {
    return `${(contextLength / 1_000_000).toFixed(1)}M`.replace('.0', '');
  } else if (contextLength >= 1_000) {
    return `${(contextLength / 1_000).toFixed(0)}K`;
  }
  return `${contextLength}`;
}

function formatPricing(pricing: { prompt: string; completion: string }): string {
  const promptPrice = parseFloat(pricing.prompt);
  const completionPrice = parseFloat(pricing.completion);

  if (promptPrice === 0 && completionPrice === 0) {
    return 'Free';
  }

  // Convert to per 1M tokens
  const promptPer1M = (promptPrice * 1_000_000).toFixed(2);
  const completionPer1M = (completionPrice * 1_000_000).toFixed(2);

  return `$${promptPer1M}/$${completionPer1M} per 1M tokens`;
}

function capitalizeProvider(provider: string): string {
  const providerMap: Record<string, string> = {
    anthropic: 'Anthropic',
    openai: 'OpenAI',
    google: 'Google',
    meta: 'Meta',
    mistral: 'Mistral AI',
    cohere: 'Cohere',
    'meta-llama': 'Meta',
  };

  return providerMap[provider.toLowerCase()] || provider;
}

function getFallbackModels(): ModelInfo[] {
  return [
    {
      id: 'anthropic/claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      contextWindow: '200K',
      pricing: '$3.00/$15.00 per 1M tokens',
      featured: true,
    },
    {
      id: 'anthropic/claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      contextWindow: '200K',
      pricing: '$15.00/$75.00 per 1M tokens',
    },
    {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      contextWindow: '200K',
      pricing: '$0.25/$1.25 per 1M tokens',
    },
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      contextWindow: '128K',
      pricing: '$2.50/$10.00 per 1M tokens',
      featured: true,
    },
    {
      id: 'openai/gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      contextWindow: '128K',
      pricing: '$10.00/$30.00 per 1M tokens',
    },
    {
      id: 'openai/gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      contextWindow: '128K',
      pricing: '$0.15/$0.60 per 1M tokens',
    },
    {
      id: 'google/gemini-2.0-flash-exp:free',
      name: 'Gemini 2.0 Flash (Free)',
      provider: 'Google',
      contextWindow: '1M',
      pricing: 'Free',
      featured: true,
    },
    {
      id: 'google/gemini-pro-1.5',
      name: 'Gemini Pro 1.5',
      provider: 'Google',
      contextWindow: '2M',
      pricing: '$1.25/$5.00 per 1M tokens',
    },
  ];
}
