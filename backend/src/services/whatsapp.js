require('dotenv').config();

const sendTextMessage = async (phoneNumberId, to, text) => {
  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const accessToken = process.env.META_PERMANENT_SYSTEM_TOKEN;
    
    if (!accessToken) {
      throw new Error("META_PERMANENT_SYSTEM_TOKEN is not configured in environment.");
    }

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
    
    console.log('✅ Meta API Accepted Message:', JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
};

const downloadMedia = async (mediaId) => {
  try {
    const accessToken = process.env.META_PERMANENT_SYSTEM_TOKEN;
    if (!accessToken) throw new Error("META_PERMANENT_SYSTEM_TOKEN is not configured.");

    // Step 1: Retrieve Media URL
    const metaUrl = `https://graph.facebook.com/v21.0/${mediaId}`;
    const metaRes = await fetch(metaUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const metaData = await metaRes.json();
    if (!metaRes.ok || !metaData.url) {
      throw new Error(metaData.error?.message || 'Failed to fetch media metadata from Meta');
    }

    // Step 2: Download Media Binary
    const mediaRes = await fetch(metaData.url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!mediaRes.ok) throw new Error('Failed to download media binary from Meta CDN');

    const arrayBuffer = await mediaRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return {
      base64,
      mimeType: metaData.mime_type || 'audio/ogg'
    };
  } catch (error) {
    console.error('Error downloading Meta media:', error);
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
  downloadMedia,
  verifyWebhook
};
