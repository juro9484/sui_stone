import axios from 'axios';

const API_KEY = 'xai-iUDjZvWPcmpl8qHQXsszrLioCTUp0IAV4Xr5N6RkQG0SVwtcQh4968TlCJVzK5odPPNtva6IKfIigorU';
const API_URL = 'https://api.x.ai/v1/chat/completions';

export const fetchGrokResponse = async (prompt: string) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        messages: [{ role: 'user', content: prompt }],
        model: 'grok-2', // Confirmed working
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Grok API error:', error);
    throw error;
  }
};