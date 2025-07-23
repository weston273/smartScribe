/**
 * Calls the DeepSeek model via OpenRouter Chat API with given messages.
 * @param {Array} messages - Array of message objects: [{ role: 'user'|'assistant'|'system', content: string }]
 * @returns {Promise<string>} AI response text
 */
export async function askOpenAI(messages) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file.');
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528-qwen3-8b",  // Or "deepseek/deepseek-chat:free" if you prefer
        messages: messages  // Pass messages array directly
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "AI did not reply.";
  } catch (err) {
    console.error('Error calling OpenRouter AI:', err);
    return "Sorry, I couldn't reach the AI service.";
  }
}
