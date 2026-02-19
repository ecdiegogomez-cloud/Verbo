import { getExampleForTone } from './examples';

const DURATION_WORDS: Record<string, { min: number; max: number }> = {
    short: { min: 200, max: 350 },
    medium: { min: 400, max: 600 },
    long: { min: 650, max: 900 },
};

const TONE_DESCRIPTIONS: Record<string, Record<string, string>> = {
    en: {
        heartfelt: 'warm and sincere — honest emotion that makes people nod and get a little teary',
        funny: 'lighthearted and genuinely funny — real laughs from real stories, not rehearsed punchlines',
        formal: 'respectful and composed — warm but with a sense of occasion',
        mix: 'mostly warm and genuine, with natural humor that comes from the stories themselves',
        witty: 'clever and sharp — intelligent humor that makes people think while they laugh',
        straightforward: 'direct and honest — says what needs to be said without embellishment or fluff',
        celebratory: 'upbeat and joyful — focuses on celebrating the couple and the happiness of the occasion',
    },
    es: {
        heartfelt: 'cálido y sincero — emoción honesta que hace que la gente asienta y se le escape alguna lágrima',
        funny: 'ligero y genuinamente gracioso — risas reales de historias reales, no chistes ensayados',
        formal: 'respetuoso y sereno — cálido pero con sentido de la ocasión',
        mix: 'principalmente cálido y genuino, con humor natural que sale de las propias historias',
        witty: 'ingenioso y agudo — humor inteligente que hace pensar mientras ríen',
        straightforward: 'directo y honesto — dice lo que hay que decir sin adornos ni relleno',
        celebratory: 'alegre y entusiasta — se centra en celebrar a la pareja y la felicidad del momento',
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

const ROLE_APPROACH: Record<string, Record<string, string>> = {
    en: {
        bestMan: 'You\'re the groom\'s closest friend. Talk about what your friendship is actually like — the dumb stuff you\'ve done together, what he\'s like when no one\'s watching. Then talk about how you\'ve seen him change since meeting his partner.',
        maidOfHonor: 'You\'re the bride\'s closest friend. Talk about your real friendship — not the highlight reel, the actual day-to-day of it. Then talk about what you\'ve noticed since her partner came into the picture.',
        father: 'You\'re the parent watching your kid get married. Talk about who they were growing up and who they\'ve become. Be honest about what it feels like to see them start their own family.',
        mother: 'You\'re the parent who knows them in ways nobody else does. Share the small, everyday things — not the big milestones, the quiet stuff that only a parent would remember or notice.',
        sibling: 'You grew up with them. Talk about what that was actually like — the fights, the inside jokes, looking out for each other. Then talk about what their partner brings out in them.',
        friend: 'You\'re a close friend. Talk about who they really are through stories you\'ve shared. Say what you\'ve seen in them since they found their partner.',
        other: 'You know this couple from your own unique angle. Share what you\'ve seen in them and why you\'re happy to be here.',
    },
    es: {
        bestMan: 'Eres el amigo más cercano del novio. Habla de cómo es su amistad en realidad — las tonterías que han hecho juntos, cómo es él cuando nadie lo ve. Después habla de cómo lo has visto cambiar desde que conoció a su pareja.',
        maidOfHonor: 'Eres la amiga más cercana de la novia. Habla de su amistad real — no la versión bonita, la del día a día. Después habla de lo que has notado desde que su pareja llegó a su vida.',
        father: 'Eres el padre viendo a tu hijo/a casarse. Habla de quién era de chico/a y en quién se ha convertido. Sé honesto sobre lo que se siente verlo/a empezar su propia familia.',
        mother: 'Eres la madre que lo/la conoce como nadie. Comparte las cosas pequeñas del día a día — no los grandes momentos, las cosas calladas que solo una madre recuerda o nota.',
        sibling: 'Creciste con él/ella. Habla de cómo fue eso realmente — las peleas, los chistes internos, cuidarse el uno al otro. Después habla de lo que su pareja saca de él/ella.',
        friend: 'Eres un/a amigo/a cercano/a. Habla de quién es realmente a través de historias que han vivido. Di lo que has visto en él/ella desde que encontró a su pareja.',
        other: 'Conoces a esta pareja desde tu propio ángulo. Comparte lo que has visto en ellos y por qué te alegra estar aquí.',
    },
};

export interface SpeechInput {
    relationship: string;
    coupleNames: string;
    speakerName?: string;
    tone: string;
    anecdotes: string;
    duration: string;
    speechLang: string;
}

interface PromptParams {
    roleLabel: string;
    roleApproach: string;
    coupleNames: string;
    speakerName: string;
    toneDesc: string;
    wordRange: { min: number; max: number };
    anecdotes: string;
    exampleSpeech: string | null;
}

export function buildPrompt(input: SpeechInput): string {
    const lang = input.speechLang || 'en';
    const wordRange = DURATION_WORDS[input.duration] || DURATION_WORDS.medium;
    const toneDesc = TONE_DESCRIPTIONS[lang]?.[input.tone] || TONE_DESCRIPTIONS.en.mix;
    const roleLabel = ROLE_LABELS[lang]?.[input.relationship] || input.relationship;
    const roleApproach = ROLE_APPROACH[lang]?.[input.relationship] || ROLE_APPROACH[lang]?.other || '';
    const speakerName = input.speakerName?.trim() || '';
    const exampleSpeech = getExampleForTone(input.tone, lang);

    const params: PromptParams = {
        roleLabel,
        roleApproach,
        coupleNames: coupleNamesFormatted(input.coupleNames),
        speakerName,
        toneDesc,
        wordRange,
        anecdotes: input.anecdotes,
        exampleSpeech,
    };

    if (lang === 'es') {
        return buildSpanishPrompt(params);
    }

    return buildEnglishPrompt(params);
}

function buildEnglishPrompt(p: PromptParams): string {
    const speakerLine = p.speakerName ? `\n- Speaker's name: ${p.speakerName}` : '';
    const exampleBlock = p.exampleSpeech
        ? `\n\nREFERENCE — study the tone and rhythm, then write something completely original:\n\n"""\n${p.exampleSpeech}\n"""`
        : '';

    return `Write a wedding speech for ${p.speakerName || 'the speaker'} about ${p.coupleNames}.

CRITICAL RULE: You MUST only use facts, details, and personality traits that appear in the "STORIES AND MEMORIES" section below. Do NOT invent, assume, or imply personality traits for anyone (e.g., don't describe someone as quiet, thoughtful, analytical, shy, loud, or energetic unless the speaker explicitly said so). Do NOT fill gaps with generic characterizations. If the speaker only gave one story, build the speech around that one story. Less material = shorter speech, not more invention.

CONTEXT:
- Speaker's role: ${p.roleLabel}${speakerLine}
- Couple: ${p.coupleNames}
- Tone: ${p.toneDesc}
- Length: ${p.wordRange.min}-${p.wordRange.max} words

YOUR PERSPECTIVE:
${p.roleApproach}

THEIR STORIES AND MEMORIES:
${p.anecdotes || 'No specific details provided. Write a speech that feels personal by being specific and honest about the relationship. Avoid filler platitudes.'}

STYLE GUIDE:
- Sound like a real person at a dinner table, not a writer at a desk.
- Let stories carry the emotion. After telling one, stop. Don't explain what it means.
- Mix short sentences with longer ones. Vary rhythm like conversation.
- Specific details beat general statements. Not "she's always been there" but the actual moment.
- End with a toast: one sentence, warm, done.

DO NOT:
- Use metaphors (music, light, navigation, nature, books, puzzles, art)
- Write "in that moment I knew/realized" or "something changed/shifted"
- Use "[Person] is not just X; they are Y" constructions
- Write that someone "brought out" or "revealed" a side of someone, or "made them more [adjective]"
- Build toward a dramatic revelation or escalate emotion at the end
- Address each person separately with mini-tributes
- Use three-part lists for emotional effect ("the laughter, the tears, the love")
- End paragraphs with emotional summary sentences
- Explain what stories mean after telling them
- Use: journey, soulmate, chapter, compass, anchor, beacon, canvas, tapestry, radiate, illuminate, spark, flame, symphony, melody, blessing, gift (for a person), complete (as in "you complete them")${exampleBlock}

Write ONLY the speech text. No titles, notes, or brackets. Stay within ${p.wordRange.min}-${p.wordRange.max} words.`;
}

function buildSpanishPrompt(p: PromptParams): string {
    const speakerLine = p.speakerName ? `\n- Nombre del orador: ${p.speakerName}` : '';
    const exampleBlock = p.exampleSpeech
        ? `\n\nREFERENCIA — estudia el tono y el ritmo, después escribe algo completamente original:\n\n"""\n${p.exampleSpeech}\n"""`
        : '';

    return `Escribe un discurso de boda para ${p.speakerName || 'el orador'} sobre ${p.coupleNames}.

REGLA CRÍTICA: SOLO puedes usar hechos, detalles y rasgos de personalidad que aparezcan en la sección "HISTORIAS Y RECUERDOS" de abajo. NO inventes, asumas ni insinúes rasgos de personalidad de nadie (ej: no describas a alguien como callado, reflexivo, analítico, tímido, ruidoso o energético a menos que el orador lo haya dicho explícitamente). NO llenes vacíos con caracterizaciones genéricas. Si el orador solo dio una historia, construye el discurso alrededor de esa única historia. Menos material = discurso más corto, no más invención.

CONTEXTO:
- Rol del orador: ${p.roleLabel}${speakerLine}
- Pareja: ${p.coupleNames}
- Tono: ${p.toneDesc}
- Longitud: ${p.wordRange.min}-${p.wordRange.max} palabras

TU PERSPECTIVA:
${p.roleApproach}

SUS HISTORIAS Y RECUERDOS:
${p.anecdotes || 'No se proporcionaron detalles específicos. Escribe un discurso que se sienta personal siendo específico y honesto sobre la relación. Evita relleno genérico.'}

GUÍA DE ESTILO:
- Suena como una persona real en una cena, no como un escritor en un escritorio.
- Deja que las historias carguen la emoción. Después de contar una, para. No expliques qué significa.
- Mezcla frases cortas con más largas. Varía el ritmo como en una conversación.
- Los detalles específicos ganan a las frases generales. No "siempre ha estado ahí" sino el momento concreto.
- Cierra con un brindis: una frase, cálida, punto.

NO HAGAS:
- Usar metáforas (música, luz, navegación, naturaleza, libros, rompecabezas, arte)
- Escribir "en ese momento supe/comprendí" o "algo cambió/se transformó"
- Usar "[Persona] no es solo X; es Y"
- Escribir que alguien "sacó" o "reveló" un lado de alguien, o "lo hizo más [adjetivo]"
- Construir hacia una revelación dramática o escalar la emoción al final
- Hablarle a cada persona de la pareja por separado con mini-tributos
- Usar listas de tres para efecto emocional ("las risas, las lágrimas, el amor")
- Terminar párrafos con frases resumen emocionales
- Explicar qué significan las historias después de contarlas
- Usar: camino juntos, alma gemela, capítulo, brújula, ancla, faro, lienzo, tapiz, irradiar, iluminar, chispa, llama, sinfonía, melodía, bendición, regalo (para una persona), completar (como en "tú lo completas")${exampleBlock}

Escribe SOLO el texto del discurso. Sin títulos, notas ni corchetes. Mantente entre ${p.wordRange.min}-${p.wordRange.max} palabras. Usa español latino natural, NO traducido del inglés.`;
}

function coupleNamesFormatted(names: string): string {
    return names.trim() || 'the happy couple';
}