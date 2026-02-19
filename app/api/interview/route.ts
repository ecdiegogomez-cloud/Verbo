import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    buildInterviewSystemPrompt,
    ChatMessage,
    InterviewFormData,
    MAX_AI_TURNS,
} from '@/lib/interview-prompts';

const MODEL_NAME = 'gemini-2.5-flash';

export async function POST(request: NextRequest) {
    try {
        const body: {
            messages: ChatMessage[];
            formData: InterviewFormData;
        } = await request.json();

        const { messages, formData } = body;

        if (!formData?.relationship || !formData?.coupleNames || !formData?.tone) {
            return NextResponse.json({ error: 'Missing required formData fields' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Count how many AI turns have already happened
        const aiTurnCount = messages.filter((m) => m.role === 'model').length;
        if (aiTurnCount >= MAX_AI_TURNS) {
            return NextResponse.json({ error: 'Interview complete' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: buildInterviewSystemPrompt(formData),
            generationConfig: {
                temperature: 0.8,
                topP: 0.92,
            },
        });

        // Convert messages to Gemini chat history format.
        // The first message from the client is always 'model' (the AI's first question),
        // but Gemini requires history to start with 'user'. We prepend the synthetic
        // opener that was used to kick off the interview on the first call.
        const fullHistory = [
            { role: 'user' as const, content: 'Please start the interview with your first question.' },
            ...messages,
        ];

        // The last message must come from the user, so we pass history = all except last
        const history = fullHistory.slice(0, -1).map((m) => ({
            role: m.role,
            parts: [{ text: m.content }],
        }));

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
            // No user message yet — start the conversation with a gentle opener
            const chat = model.startChat({ history: [] });
            const result = await chat.sendMessageStream(
                'Please start the interview with your first question.'
            );

            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of result.stream) {
                            const text = chunk.text();
                            if (text) controller.enqueue(encoder.encode(text));
                        }
                        controller.close();
                    } catch (err) {
                        controller.error(err);
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Transfer-Encoding': 'chunked',
                },
            });
        }

        const chat = model.startChat({ history });
        const result = await chat.sendMessageStream(lastMessage.content);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) controller.enqueue(encoder.encode(text));
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Interview API error:', error);
        const message = error instanceof Error ? error.message : 'Interview failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
