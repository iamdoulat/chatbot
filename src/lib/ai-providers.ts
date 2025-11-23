// We might need to install this or use REST
// For now, we will use a generic REST approach or mock to avoid too many dependencies without checking.
// Actually, let's define a clean interface.

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

        // Convert messages to Gemini format
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

        // Anthropic requires system messages to be separate
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

// Factory to get provider
export function getProvider(providerId: string): AIProvider {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    // Add others as needed

    switch (providerId) {
        case 'gemini':
            return geminiKey ? new GeminiProvider(geminiKey) : new MockProvider();
        case 'gpt-4':
            return openaiKey ? new OpenAIProvider(openaiKey, 'gpt-4') : new MockProvider();
        case 'claude-3':
            return anthropicKey ? new AnthropicProvider(anthropicKey) : new MockProvider();
        case 'grok':
        case 'deepseek':
        case 'mistral':
            // Placeholder for other providers, falling back to Mock for now
            // In a real app, we'd implement their specific API calls here
            return new MockProvider();
        default:
            return new MockProvider();
    }
}
