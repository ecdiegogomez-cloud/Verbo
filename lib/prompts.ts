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

const PERSONALITY_DESCRIPTIONS: Record<string, Record<string, string>> = {
    en: {
        extroverted: 'outgoing, energetic, loves being the center of attention, expressive and enthusiastic',
        reflective: 'calm, thoughtful, introspective, chooses words carefully, prefers depth over breadth',
        funny: 'witty, sarcastic, always has a joke ready, uses humor to express affection',
        romantic: 'sensitive, emotional, wears their heart on their sleeve, deeply sentimental',
        direct: 'straightforward, practical, no-nonsense, says what they mean without embellishment',
    },
    es: {
        extroverted: 'extrovertido, energético, le encanta ser el centro de atención, expresivo y entusiasta',
        reflective: 'tranquilo, reflexivo, introspectivo, elige las palabras con cuidado, prefiere la profundidad',
        funny: 'ingenioso, sarcástico, siempre tiene un chiste listo, usa el humor para expresar cariño',
        romantic: 'sensible, emotivo, lleva el corazón en la mano, profundamente sentimental',
        direct: 'directo, práctico, sin rodeos, dice lo que piensa sin adornos',
    },
};

const ROLE_APPROACH: Record<string, Record<string, string>> = {
    en: {
        bestMan: 'You are the groom\'s closest confidant. Share the unique bond between you — the inside jokes, the late-night conversations, the moment you knew their partner was "the one." Balance brotherhood with genuine emotion.',
        maidOfHonor: 'You are the bride\'s most trusted person. Celebrate your deep friendship — the tears you\'ve shared, the laughter, how you\'ve watched her grow. Show why this love story is everything she deserves.',
        father: 'You are giving away your child. Channel the bittersweet beauty of watching them grow from the small person who held your hand to the adult standing before their partner. This is your legacy of love.',
        mother: 'You are the person who knows them most intimately. Share the quiet moments — the bedtime stories, the kitchen conversations, the pride that fills your heart. Let maternal/paternal love shine through every word.',
        sibling: 'You\'ve shared a lifetime with them. Use the sibling dynamic — the rivalry, the protection, the unspoken understanding. Show how their partner completes the family picture.',
        friend: 'You chose each other as family. Celebrate the friendship that has weathered time and distance. Show the room who they really are through stories only a true friend would know.',
        other: 'You bring a unique perspective to this celebration. Share what makes this couple special from your vantage point, and why their love story resonates with you.',
    },
    es: {
        bestMan: 'Eres el confidente más cercano del novio. Comparte el vínculo único entre ustedes — los chistes internos, las conversaciones nocturnas, el momento en que supiste que su pareja era "la indicada." Equilibra hermandad con emoción genuina.',
        maidOfHonor: 'Eres la persona de mayor confianza de la novia. Celebra su profunda amistad — las lágrimas compartidas, las risas, cómo la has visto crecer. Muestra por qué esta historia de amor es todo lo que ella merece.',
        father: 'Estás entregando a tu hijo/a. Canaliza la belleza agridulce de verlo/a crecer, de la pequeña persona que tomaba tu mano al adulto frente a su pareja. Este es tu legado de amor.',
        mother: 'Eres quien lo/la conoce más íntimamente. Comparte los momentos silenciosos — los cuentos antes de dormir, las conversaciones en la cocina, el orgullo que llena tu corazón. Deja que el amor maternal/paternal brille en cada palabra.',
        sibling: 'Han compartido toda una vida. Usa la dinámica de hermanos — la rivalidad, la protección, el entendimiento sin palabras. Muestra cómo su pareja completa el cuadro familiar.',
        friend: 'Se eligieron como familia. Celebra la amistad que ha resistido el tiempo y la distancia. Muestra a todos quién es realmente a través de historias que solo un verdadero amigo conocería.',
        other: 'Traes una perspectiva única a esta celebración. Comparte qué hace especial a esta pareja desde tu punto de vista, y por qué su historia de amor resuena contigo.',
    },
};

export interface SpeechInput {
    relationship: string;
    coupleNames: string;
    speakerName?: string;
    personality?: string;
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
    const roleApproach = ROLE_APPROACH[lang]?.[input.relationship] || ROLE_APPROACH[lang]?.other || '';
    const personalityDesc = input.personality
        ? PERSONALITY_DESCRIPTIONS[lang]?.[input.personality] || ''
        : '';
    const speakerName = input.speakerName?.trim() || '';

    if (lang === 'es') {
        return buildSpanishPrompt({
            roleLabel,
            roleApproach,
            coupleNames: coupleNamesFormatted(input.coupleNames),
            speakerName,
            personalityDesc,
            toneDesc,
            wordRange,
            anecdotes: input.anecdotes,
        });
    }

    return buildEnglishPrompt({
        roleLabel,
        roleApproach,
        coupleNames: coupleNamesFormatted(input.coupleNames),
        speakerName,
        personalityDesc,
        toneDesc,
        wordRange,
        anecdotes: input.anecdotes,
    });
}

interface PromptParams {
    roleLabel: string;
    roleApproach: string;
    coupleNames: string;
    speakerName: string;
    personalityDesc: string;
    toneDesc: string;
    wordRange: { min: number; max: number };
    anecdotes: string;
}

function buildEnglishPrompt(p: PromptParams): string {
    const speakerLine = p.speakerName ? `- Speaker's name: ${p.speakerName}` : '';
    const personalityBlock = p.personalityDesc
        ? `
SPEAKER'S CHARACTER PROFILE:
The speaker is ${p.personalityDesc}. Analyze their anecdotes below for additional clues about their voice — their word choices, sentence rhythm, and emotional register. The final speech MUST sound like something this specific person would naturally say. Match their vocabulary level, their sense of humor (or lack thereof), and their comfort with vulnerability. If they write casually, the speech should feel conversational. If they write formally, elevate the register. The speech should be an amplified, polished version of THEIR voice — never a generic speechwriter's voice.`
        : '';

    return `You are a world-class speechwriter who has written for TED speakers, heads of state, and bestselling authors. You specialize in wedding speeches that make rooms fall silent, then erupt in applause. Your speeches have been described as "the kind that people remember for decades."

CONTEXT:
- Speaker's role: ${p.roleLabel}
${speakerLine}
- Couple: ${p.coupleNames}
- Desired tone: ${p.toneDesc}
- Length: between ${p.wordRange.min} and ${p.wordRange.max} words

ROLE-SPECIFIC APPROACH:
${p.roleApproach}
${personalityBlock}

SPEAKER'S RAW MATERIAL (memories, anecdotes, details):
${p.anecdotes || 'No specific details provided. Create a universally resonant speech that feels personal through vivid, specific imagery and emotional truth rather than generic platitudes.'}

CRAFT REQUIREMENTS — follow these meticulously:

1. OPENING (first 2-3 sentences): Start with a hook that commands attention. Options: a provocative question, a vivid micro-story, a surprising confession, or a single powerful image. NEVER start with "Good evening everyone" or "For those who don't know me." Earn the room's attention.

2. NARRATIVE ARC: Structure the speech with rising emotional intensity:
   - Begin with warmth and connection (establish who you are to them)
   - Build through specific stories and observations (the body — this is where anecdotes live)
   - Reach an emotional peak (the moment that makes people reach for tissues)
   - Resolve with hope and celebration (the toast)

3. LITERARY TECHNIQUES — weave these in naturally, not forcefully:
   - Callbacks: Plant a detail early that returns with new meaning at the climax
   - Sensory language: Include at least one moment with sight, sound, or touch
   - The "rule of three" for rhythm in key moments
   - One perfectly placed pause moment (a short sentence after a longer passage)
   - Metaphor or analogy that crystallizes the couple's relationship

4. EMOTIONAL AUTHENTICITY:
   - Show, don't tell. Instead of "They love each other so much," describe the specific moment that PROVES it
   - Include at least one moment of vulnerability or honest reflection
   - The humor (if any) should come from truth and recognition, never from roasting or embarrassment
   - Build to a single sentence that captures the essence of why this couple belongs together

5. THE TOAST: End with a toast that feels like the natural culmination of everything before it — not a disconnected add-on. It should echo the speech's central theme.

ABSOLUTE RULES:
- Write ONLY the speech text. No titles, stage directions, notes, brackets, or parenthetical instructions.
- Never use clichés: "Webster's dictionary defines...", "I'm not crying, you're crying", "my better half", "soulmate", "journey"
- Never break the fourth wall or reference the act of speechwriting
- Stay strictly within ${p.wordRange.min}-${p.wordRange.max} words
- Write in natural, spoken English — this will be read aloud, so it must flow when spoken`;
}

function buildSpanishPrompt(p: PromptParams): string {
    const speakerLine = p.speakerName ? `- Nombre del orador: ${p.speakerName}` : '';
    const personalityBlock = p.personalityDesc
        ? `
PERFIL DEL CARÁCTER DEL ORADOR:
El orador es ${p.personalityDesc}. Analiza sus anécdotas para detectar pistas adicionales sobre su voz — sus elecciones de palabras, el ritmo de sus frases y su registro emocional. El discurso final DEBE sonar como algo que esta persona específica diría naturalmente. Iguala su nivel de vocabulario, su sentido del humor (o la falta de él), y su comodidad con la vulnerabilidad. Si escriben de manera casual, el discurso debe sentirse conversacional. Si escriben formalmente, eleva el registro. El discurso debe ser una versión amplificada y pulida de SU voz — nunca la voz genérica de un escritor de discursos.`
        : '';

    return `Eres un escritor de discursos de clase mundial que ha escrito para conferenciantes de TED, jefes de estado y autores bestseller. Te especializas en discursos de boda que hacen que las salas se queden en silencio y luego estallen en aplausos. Tus discursos han sido descritos como "de los que la gente recuerda por décadas."

CONTEXTO:
- Rol del orador: ${p.roleLabel}
${speakerLine}
- Pareja: ${p.coupleNames}
- Tono deseado: ${p.toneDesc}
- Longitud: entre ${p.wordRange.min} y ${p.wordRange.max} palabras

ENFOQUE SEGÚN EL ROL:
${p.roleApproach}
${personalityBlock}

MATERIAL DEL ORADOR (memorias, anécdotas, detalles):
${p.anecdotes || 'No se proporcionaron detalles específicos. Crea un discurso universalmente resonante que se sienta personal a través de imágenes vívidas y verdad emocional, no platitudes genéricas.'}

REQUISITOS DE ESCRITURA — sigue estos meticulosamente:

1. APERTURA (primeras 2-3 oraciones): Comienza con un gancho que capte la atención. Opciones: una pregunta provocadora, una micro-historia vívida, una confesión sorprendente, o una imagen poderosa. NUNCA empieces con "Buenas noches a todos" o "Para los que no me conocen." Gánate la atención de la sala.

2. ARCO NARRATIVO: Estructura el discurso con intensidad emocional creciente:
   - Comienza con calidez y conexión (establece quién eres para ellos)
   - Construye a través de historias específicas y observaciones (el cuerpo — aquí viven las anécdotas)
   - Alcanza un pico emocional (el momento que hace que la gente busque pañuelos)
   - Resuelve con esperanza y celebración (el brindis)

3. TÉCNICAS LITERARIAS — intégralas naturalmente, no forzadamente:
   - Callbacks: Planta un detalle al principio que regrese con nuevo significado en el clímax
   - Lenguaje sensorial: Incluye al menos un momento con vista, sonido o tacto
   - La "regla de tres" para el ritmo en momentos clave
   - Un momento de pausa perfectamente colocado (una oración corta después de un pasaje más largo)
   - Metáfora o analogía que cristalice la relación de la pareja

4. AUTENTICIDAD EMOCIONAL:
   - Muestra, no cuentes. En vez de "Se quieren muchísimo," describe el momento específico que lo DEMUESTRA
   - Incluye al menos un momento de vulnerabilidad o reflexión honesta
   - El humor (si lo hay) debe venir de la verdad y el reconocimiento, nunca de burlarse o avergonzar
   - Construye hacia una sola oración que capture la esencia de por qué esta pareja pertenece junta

5. EL BRINDIS: Termina con un brindis que se sienta como la culminación natural de todo lo anterior — no un añadido desconectado. Debe hacer eco del tema central del discurso.

REGLAS ABSOLUTAS:
- Escribe SOLO el texto del discurso. Sin títulos, direcciones escénicas, notas, corchetes ni instrucciones entre paréntesis.
- Nunca uses clichés: "el diccionario define...", "mi media naranja", "alma gemela", "camino juntos"
- Nunca rompas la cuarta pared ni hagas referencia al acto de escribir discursos
- Mantente estrictamente entre ${p.wordRange.min}-${p.wordRange.max} palabras
- Escribe en español natural y hablado — esto se leerá en voz alta, así que debe fluir al ser pronunciado
- Usa español latino/neutro natural, NO español traducido del inglés`;
}

function coupleNamesFormatted(names: string): string {
    return names.trim() || 'the happy couple';
}
