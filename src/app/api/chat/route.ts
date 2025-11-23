import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/ai-providers';

export async function POST(req: Request) {
    try {
        const { messages, model } = await req.json();

        // Extract keys from headers
        const geminiKey = req.headers.get('x-gemini-key') || undefined;
        const openaiKey = req.headers.get('x-openai-key') || undefined;
        const anthropicKey = req.headers.get('x-anthropic-key') || undefined;
        const openrouterKey = req.headers.get('x-openrouter-key') || undefined;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        if (!model) {
            return NextResponse.json({ error: 'Model not specified' }, { status: 400 });
        }

        const provider = getProvider(model, {
            gemini: geminiKey,
            openai: openaiKey,
            anthropic: anthropicKey,
            openrouter: openrouterKey
        });

        const responseContent = await provider.generateResponse(messages);

        return NextResponse.json({ content: responseContent });

    } catch (error: unknown) {
        console.error('API Error Details:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
        }
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
