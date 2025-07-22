// src/utils/ai.js
export async function askOpenAI(messages) {
  const apiKey = "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”
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
    body: JSON.stringify({
      model: "gpt-3.5-turbo",  // or "gpt-4" if you have access
      messages
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "AI did not reply.";
}
