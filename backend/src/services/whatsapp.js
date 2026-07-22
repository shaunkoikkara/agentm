require('dotenv').config();

const sendTextMessage = async (phoneNumberId, to, text, accessToken) => {
  try {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: text
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API Error:', JSON.stringify(data));
      throw new Error(`WhatsApp API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
};

const verifyWebhook = (mode, token, challenge) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    return challenge;
  }
  
  return null;
};

module.exports = {
  sendTextMessage,
  verifyWebhook
};
