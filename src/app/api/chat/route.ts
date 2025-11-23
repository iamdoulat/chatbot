import { NextResponse } from 'next/server';
import { getProvider } from '@/lib/ai-providers';

export async function POST(req: Request) {
    try {
        const { messages, model } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
        }

        if (!model) {
            return NextResponse.json({ error: 'Model not specified' }, { status: 400 });
        }

        import { NextResponse } from 'next/server';
        import { getProvider } from '@/lib/ai-providers';

        export async function POST(req: Request) {
            try {
                const { messages, model } = await req.json();

                if (!messages || !Array.isArray(messages)) {
                    return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
                }

                if (!model) {
                    return NextResponse.json({ error: 'Model not specified' }, { status: 400 });
                }

                const provider = getProvider(model);
                const responseContent = await provider.generateResponse(messages);

                return NextResponse.json({ content: responseContent });

            } catch (error: unknown) {
                console.error('API Error Details:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                // Log the full error object for debugging
                if (error instanceof Error) {
                    console.error('Stack:', error.stack);
                }
                return NextResponse.json(
                    { error: errorMessage },
                    { status: 500 }
                );
            }
        }
