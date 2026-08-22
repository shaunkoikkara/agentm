const sendInstagramMessage = async (recipientId, text, accessToken) => {
  try {
    const token = accessToken || process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/v18.0/me/messages`;

    console.log(`Sending Instagram DM to ${recipientId}: "${text.slice(0, 40)}..."`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: text }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Instagram API Send Error:', JSON.stringify(data));
      throw new Error(data.error?.message || 'Failed to send Instagram DM');
    }

    console.log(`✅ Instagram DM sent successfully! Message ID: ${data.message_id}`);
    return data;
  } catch (error) {
    console.error('Error in sendInstagramMessage service:', error.message);
    return null;
  }
};

module.exports = {
  sendInstagramMessage
};
