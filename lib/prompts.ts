const DURATION_WORDS: Record<string, { min: number; max: number }> = {
    short: { min: 200, max: 350 },
    medium: { min: 400, max: 600 },
    long: { min: 650, max: 900 },
};

const TONE_DESCRIPTIONS: Record<string, Record<string, string>> = {
    en: {
        heartfelt: 'deeply emotional, sincere, and moving — bring tears of joy',
        funny: 'witty, lighthearted, and entertaining — make people laugh and smile',
        formal: 'elegant, dignified, and polished — sophisticated and refined',
        mix: 'a perfect balance of heartfelt emotion with tasteful humor — both touching and entertaining',
    },
    es: {
        heartfelt: 'profundamente emotivo, sincero y conmovedor — que provoque lágrimas de alegría',
        funny: 'ingenioso, ligero y entretenido — que haga reír y sonreír',
        formal: 'elegante, digno y pulido — sofisticado y refinado',
        mix: 'un equilibrio perfecto de emoción sincera con humor de buen gusto — conmovedor y entretenido',
    },
};

const ROLE_LABELS: Record<string, Record<string, string>> = {
    en: {
        bestMan: 'best man',
        maidOfHonor: 'maid of honor',
        father: 'father of the bride/groom',
        mother: 'mother of the bride/groom',
        sibling: 'sibling',
        friend: 'close friend',
        other: 'guest',
    },
    es: {
        bestMan: 'padrino',
        maidOfHonor: 'dama de honor',
        father: 'padre de la novia/novio',
        mother: 'madre de la novia/novio',
        sibling: 'hermano/a',
        friend: 'amigo/a cercano/a',
        other: 'invitado/a',
    },
};

export interface SpeechInput {
    relationship: string;
    coupleNames: string;
    tone: string;
    anecdotes: string;
    duration: string;
    speechLang: string;
}

export function buildPrompt(input: SpeechInput): string {
    const lang = input.speechLang || 'en';
    const wordRange = DURATION_WORDS[input.duration] || DURATION_WORDS.medium;
    const toneDesc = TONE_DESCRIPTIONS[lang]?.[input.tone] || TONE_DESCRIPTIONS.en.mix;
    const roleLabel = ROLE_LABELS[lang]?.[input.relationship] || input.relationship;

    if (lang === 'es') {
        return `Eres un escritor de discursos experto especializado en bodas. Crea un discurso de boda hermoso y personalizado en ESPAÑOL.

DETALLES:
- Quien habla: ${roleLabel}
- Pareja: ${coupleNamesFormatted(input.coupleNames)}
- Tono deseado: ${toneDesc}
- Longitud: entre ${wordRange.min} y ${wordRange.max} palabras
- Memorias/detalles clave del orador: ${input.anecdotes || 'No se proporcionaron detalles específicos, crea algo universalmente conmovedor'}

INSTRUCCIONES:
1. Escribe SOLAMENTE el discurso, nada más. No incluyas instrucciones escénicas, notas ni explicaciones.
2. Comienza con una apertura atractiva que capte la atención.
3. Incorpora naturalmente las memorias y detalles proporcionados.
4. Incluye un brindis al final.
5. Hazlo sentir auténtico y personal — no como una plantilla.
6. Usa un español natural y fluido, no traducido.
7. Mantente estrictamente dentro del rango de palabras indicado.`;
    }

    return `You are an expert speech writer specializing in weddings. Create a beautiful, personalized wedding speech in ENGLISH.

DETAILS:
- Speaker's role: ${roleLabel}
- Couple: ${coupleNamesFormatted(input.coupleNames)}
- Desired tone: ${toneDesc}
- Length: between ${wordRange.min} and ${wordRange.max} words
- Speaker's key memories/details: ${input.anecdotes || 'No specific details provided, create something universally touching'}

INSTRUCTIONS:
1. Write ONLY the speech itself, nothing else. Do not include stage directions, notes, or explanations.
2. Start with an engaging opening that grabs attention.
3. Naturally incorporate the provided memories and details.
4. Include a toast at the end.
5. Make it feel authentic and personal — not template-like.
6. Use natural, elegant English.
7. Stay strictly within the specified word range.`;
}

function coupleNamesFormatted(names: string): string {
    return names.trim() || 'the happy couple';
}
