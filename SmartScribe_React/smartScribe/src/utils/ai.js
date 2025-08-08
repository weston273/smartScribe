/**
 * AI utility functions that communicate with the backend
 */

const API_BASE_URL = import.meta.env.PROD
  ? 'https://smartscribe-yjsf.onrender.com' // Your deployed backend base URL
  : 'http://localhost:3001'; // Your local backend base URL

/**
 * Calls the AI backend with given messages (non-streaming).
 * @param {Array} messages - Array of message objects: [{ role: 'user' | 'assistant', content: '...' }]
 * @returns {Promise<string>} - The assistant's reply.
 */
export async function askOpenAI(messages) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error asking OpenAI:', error.message);
    return 'Something went wrong. Please try again.';
  }
}

/**
 * Streams a chat response from the AI backend.
 * @param {Array} messages - Chat history
 * @param {Function} onChunk - Callback function for each streamed text chunk
 * @returns {Promise<string>} - The full AI response
 */
export async function streamChatResponse(messages, onChunk) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages,
        stream: true
      })
    });

    if (!response.ok || !response.body) {
      throw new Error(`Streaming failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop(); // Save incomplete line for next round

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              onChunk(content);
            }
          } catch (err) {
            console.warn('JSON parse error (streaming chunk):', err, data);
            continue; // skip malformed chunk
          }
        }
      }
    }

    return fullResponse;
  } catch (err) {
    console.error('Error during streaming:', err.message);
    const fallbackResponse = await askOpenAI(messages);
    onChunk(fallbackResponse);
    return fallbackResponse;
  }
}
