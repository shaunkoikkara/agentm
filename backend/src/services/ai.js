require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const generateResponse = async (tenant, knowledgeItems, conversationHistory, customerMessage) => {
  try {
    // Build knowledge base text
    let knowledgeText = 'Knowledge Base:\n';
    knowledgeItems.forEach(item => {
      knowledgeText += `- ${item.title}: ${item.content}\n`;
    });

    // Build system prompt
    let systemPrompt = tenant.system_prompt || `You are ${tenant.receptionist_name}, a receptionist for ${tenant.business_name}. 
Your personality is: ${tenant.receptionist_personality}.
Business Description: ${tenant.business_description || 'N/A'}
Business Hours: ${JSON.stringify(tenant.business_hours) || 'N/A'}

Instructions:
- Be helpful, polite, and stay on topic.
- Use the knowledge base to answer questions.
- If you don't know the answer, politely state that you'll have a human team member follow up, or offer to book an appointment for them to discuss further.
- Do not make up information that is not in the knowledge base.
- Keep your responses concise and conversational, suitable for WhatsApp.`;

    systemPrompt += `\n\n${knowledgeText}`;

    // Build conversation contents for Gemini
    // Gemini uses a different format than OpenAI
    const contents = [];

    // Add conversation history
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.direction === 'inbound' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: customerMessage }]
    });

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', JSON.stringify(data));
      throw new Error(data.error?.message || 'Gemini API error');
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      console.error('No text in Gemini response:', JSON.stringify(data));
      throw new Error('Empty response from Gemini');
    }

    return replyText;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'I apologize, but I am having trouble connecting to my system right now. Please try again later or wait for a human representative to contact you.';
  }
};

const transcribeAudio = async (base64Audio, mimeType) => {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: "Listen to this WhatsApp audio voice note carefully and transcribe the exact words spoken into plain text. Only return the transcribed text, nothing else." },
            {
              inline_data: {
                mime_type: mimeType || 'audio/ogg',
                data: base64Audio
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini Transcription Error:', JSON.stringify(data));
      throw new Error(data.error?.message || 'Gemini Audio API error');
    }

    const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log(`🎙️ Gemini Transcribed Voice Note: "${transcript}"`);
    return transcript || "Audio message received";
  } catch (error) {
    console.error('Error transcribing audio with Gemini:', error);
    return "Voice note received (could not transcribe)";
  }
};

module.exports = {
  generateResponse,
  transcribeAudio
};