const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Format conversation history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current user message
    messages.push({ role: 'user', content: customerMessage });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'I apologize, but I am having trouble connecting to my system right now. Please try again later or wait for a human representative to contact you.';
  }
};

module.exports = {
  generateResponse
};
