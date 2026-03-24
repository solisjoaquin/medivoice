import { GoogleGenAI } from '@google/genai';

function getAi() {
    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });
}

function buildSystemPrompt(profile, doctorData = null) {
    const meds = profile.medications?.join(', ') || 'none'
    const conditions = profile.conditions?.join(', ') || 'none'
    const allergies = profile.allergies?.join(', ') || 'none'

    let doctorSection = ''
    if (doctorData && (doctorData.medications?.length > 0 || doctorData.studies?.length > 0)) {
        const medsList = (doctorData.medications || [])
            .filter(m => m.assigned)
            .map(m => `- ${m.name}: ${m.description || ''}`)
            .join('\n');

        const prospectsList = (doctorData.medications || [])
            .filter(m => m.assigned && m.scrapedContent)
            .map(m => `Package insert for ${m.name}:\n${m.scrapedContent.slice(0, 1500)}`)
            .join('\n\n');

        const studiesList = (doctorData.studies || [])
            .filter(s => s.assigned)
            .map(s => `- ${s.name} (${s.date}):\n  Result: ${s.result}\n  Notes: ${s.notes || ''}`)
            .join('\n');

        doctorSection = `
INFORMATION ADDED BY DOCTOR:
- Assigned medications:
${medsList || 'None'}

- Available package inserts:
${prospectsList || 'None'}

- Recent studies:
${studiesList || 'None'}
`;
    }

    return `You are MediVoice, a voice medical assistant designed to explain medical information clearly, simply, and personalized.
${doctorSection}

USER PROFILE:
- Current medications: ${meds}
- Conditions / diagnoses: ${conditions}
- Known allergies: ${allergies}

INSTRUCTIONS:
- Always explain in English, using simple and accessible language.
- Consider the user profile to personalize the response (contraindications, interactions, etc.).
- If there is a possible interaction with their current medications or a relevant allergy, mention it clearly at the beginning.
- Structure the response to be read aloud: no bulleted lists, no markdown, just fluent paragraphs.
- Maximum 150 words. Concise but complete.
- Always close with: "If you have questions, you can consult your doctor through this app."
- You do not diagnose or prescribe. You only inform.`
}

export async function generateMedicalResponse(query, profile, scrapedContent = '', doctorData = {}) {
    const userContent = scrapedContent
        ? `The user asks: "${query}"\n\nPackage insert or medical page content:\n${scrapedContent.slice(0, 4000)}`
        : `The user asks: "${query}"`

    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userContent,
        config: {
            systemInstruction: buildSystemPrompt(profile, doctorData)
        }
    });

    return response.text;
}

export async function generateChatResponse(userMessage, profile, history) {
    const systemPrompt = `${buildSystemPrompt(profile)}

You are in direct chat mode with the user's doctor. The user did not resolve their question with the automatic consultation and wants to speak with a professional.
Act as an intermediary: summarize the context, facilitate communication, and help the doctor understand the patient's medical history.`

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

You are in direct chat mode with the user's doctor. The user did not resolve their question with the automatic consultation and wants to speak with a professional.
Act as an intermediary: summarize the context, facilitate communication, and help the doctor understand the patient's medical history.`

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

