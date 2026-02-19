import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `You help people put into words what they already feel but struggle to express. You write wedding speeches that sound like a real person talking to people they love — not like a poet performing on stage. Your job is to take someone's messy memories and genuine feelings and shape them into something they can stand up and say out loud without feeling like they're reading someone else's words. You favor short sentences, plain language, and real emotion over literary flourish. The best speech is one where the audience thinks "that's so them," not "wow, what a writer."`;

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
            temperature: 0.75,
            topP: 0.92,
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
