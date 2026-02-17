import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt, SpeechInput } from '@/lib/prompts';
import { generateSpeech } from '@/lib/ai';

export async function POST(request: NextRequest) {
    try {
        const body: SpeechInput = await request.json();

        if (!body.relationship || !body.coupleNames || !body.tone || !body.duration || !body.speechLang) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const prompt = buildPrompt(body);
        const stream = await generateSpeech(prompt);

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Speech generation error:', error);
        const message = error instanceof Error ? error.message : 'Failed to generate speech';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
