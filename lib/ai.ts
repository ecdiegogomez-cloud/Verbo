import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `You are an elite speechwriter with decades of experience crafting speeches for weddings, galas, and milestone celebrations. Your writing has been praised for its emotional precision — you know exactly when to make an audience laugh, when to let silence speak, and when to deliver the line that brings tears. You write speeches that sound like they come from the heart of the person delivering them, never from a professional writer. Every word earns its place.`;

function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    return new GoogleGenerativeAI(apiKey);
}

export async function generateSpeech(prompt: string): Promise<ReadableStream> {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.85,
            topP: 0.95,
        },
    });

    const result = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });
}
