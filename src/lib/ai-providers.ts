// Types defined locally for simplicity

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface AIProvider {
    id: string;
    name: string;
    generateResponse(messages: ChatMessage[]): Promise<string>;
}

class MockProvider implements AIProvider {
    id = 'mock';
    name = 'Mock Provider';

    async generateResponse(messages: ChatMessage[]): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `[MOCK] This is a simulated response for the last message: "${messages[messages.length - 1].content}". \n\n Configure API keys to get real responses.`;
    }
}

class GeminiProvider implements AIProvider {
    id = 'gemini';
    name = 'Google Gemini';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(messages: ChatMessage[]): Promise<string> {
        if (!this.apiKey) throw new Error("Gemini API Key missing");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

        const contents = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API Error: ${error}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
}

class OpenAIProvider implements AIProvider {
    id = 'gpt-4';
    name = 'OpenAI GPT-4';
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = 'gpt-4') {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generateResponse(messages: ChatMessage[]): Promise<string> {
        if (!this.apiKey) throw new Error("OpenAI API Key missing");

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages.map(m => ({ role: m.role, content: m.content }))
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("OpenAI Error Response:", error);
            throw new Error(`OpenAI API Error: ${error}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}

class AnthropicProvider implements AIProvider {
    id = 'claude-3';
    name = 'Anthropic Claude 3';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(messages: ChatMessage[]): Promise<string> {
        if (!this.apiKey) throw new Error("Anthropic API Key missing");

        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-opus-20240229',
                max_tokens: 1024,
                system: systemMessage?.content,
                messages: chatMessages.map(m => ({ role: m.role, content: m.content }))
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Anthropic API Error: ${error}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }
}

class OpenRouterProvider implements AIProvider {
    id = 'openrouter';
    name = 'OpenRouter';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(messages: ChatMessage[]): Promise<string> {
        if (!this.apiKey) throw new Error("OpenRouter API Key missing");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-3.5-turbo", // Default model, can be made configurable
                "messages": messages.map(m => ({ role: m.role, content: m.content })),
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API Error: ${error}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}

// Factory to get provider
// Now accepts optional keys override
export function getProvider(providerId: string, keys?: { gemini?: string; openai?: string; anthropic?: string; openrouter?: string }): AIProvider {
    const geminiKey = keys?.gemini || process.env.GEMINI_API_KEY;
    const openaiKey = keys?.openai || process.env.OPENAI_API_KEY;
    const anthropicKey = keys?.anthropic || process.env.ANTHROPIC_API_KEY;
    const openrouterKey = keys?.openrouter || process.env.OPENROUTER_API_KEY;

    switch (providerId) {
        case 'gemini':
            return geminiKey ? new GeminiProvider(geminiKey) : new MockProvider();
        case 'gpt-4':
            return openaiKey ? new OpenAIProvider(openaiKey, 'gpt-4') : new MockProvider();
        case 'claude-3':
            return anthropicKey ? new AnthropicProvider(anthropicKey) : new MockProvider();
        case 'openrouter':
            return openrouterKey ? new OpenRouterProvider(openrouterKey) : new MockProvider();
        case 'grok':
        case 'deepseek':
        case 'mistral':
            return new MockProvider();
        default:
            return new MockProvider();
    }
}
