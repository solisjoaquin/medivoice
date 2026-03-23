import { GoogleGenAI } from '@google/genai';

function getAi() {
    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });
}

function buildSystemPrompt(profile) {
    const meds = profile.medications?.join(', ') || 'ninguno'
    const conditions = profile.conditions?.join(', ') || 'ninguna'
    const allergies = profile.allergies?.join(', ') || 'ninguna'

    return `Sos MediVoz, un asistente médico de voz diseñado para explicar información médica de forma clara, simple y personalizada.

PERFIL DEL USUARIO:
- Medicamentos actuales: ${meds}
- Condiciones / diagnósticos: ${conditions}
- Alergias conocidas: ${allergies}

INSTRUCCIONES:
- Explicá siempre en español, con lenguaje simple y accesible.
- Considerá el perfil del usuario para personalizar la respuesta (contraindicaciones, interacciones, etc.).
- Si hay una posible interacción con sus medicamentos actuales o una alergia relevante, mencionalo claramente al inicio.
- Estructura la respuesta para ser narrada en voz alta: sin listas con bullets, sin markdown, solo párrafos fluidos.
- Máximo 150 palabras. Conciso pero completo.
- Siempre cerrá con: "Si tenés dudas, podés consultar con tu médico desde esta misma app."
- No diagnosticás ni recetás. Solo informás.`
}

export async function generateMedicalResponse(query, profile, scrapedContent = '') {
    const userContent = scrapedContent
        ? `El usuario pregunta: "${query}"\n\nContenido del prospecto o página médica:\n${scrapedContent.slice(0, 4000)}`
        : `El usuario pregunta: "${query}"`

    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userContent,
        config: {
            systemInstruction: buildSystemPrompt(profile)
        }
    });

    return response.text;
}

export async function generateChatResponse(userMessage, profile, history) {
    const systemPrompt = `${buildSystemPrompt(profile)}

Estás en modo chat directo con el médico del usuario. El usuario no resolvió su duda con la consulta automática y quiere hablar con un profesional.
Actuá como intermediario: resumí el contexto, facilitá la comunicación y ayudá al médico a entender el historial del paciente.`

    const formattedHistory = history.slice(-10).map(m => ({
        role: m.role === 'assistant' || m.role === 'doctor' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.content) }]
    }));

    formattedHistory.push({
        role: 'user',
        parts: [{ text: String(userMessage) }]
    });

    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedHistory,
        config: {
            systemInstruction: systemPrompt
        }
    });

    return response.text;
}

export async function generateChatStream(userMessage, profile, history) {
    const systemPrompt = `${buildSystemPrompt(profile)}

Estás en modo chat directo con el médico del usuario. El usuario no resolvió su duda con la consulta automática y quiere hablar con un profesional.
Actuá como intermediario: resumí el contexto, facilitá la comunicación y ayudá al médico a entender el historial del paciente.`

    const formattedHistory = history.slice(-10).map(m => ({
        role: m.role === 'assistant' || m.role === 'doctor' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.content) }]
    }));

    formattedHistory.push({
        role: 'user',
        parts: [{ text: String(userMessage) }]
    });

    const ai = getAi();
    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: formattedHistory,
        config: {
            systemInstruction: systemPrompt
        }
    });
}

