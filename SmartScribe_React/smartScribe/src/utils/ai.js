/**
 * AI utility functions that communicate with the backend
 */

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://smartscribe-yjsf.onrender.com' // deployed backend base URL
  : 'http://localhost:3001'; // local backend base URL (change as needed)

/**
 * Calls the AI backend with given messages.
 * @param {Array} messages - Array of message objects: [{ role: 'user'|'assistant'|'system', content: string }]
 * @returns {Promise<string>} AI response text
 */
export async function askOpenAI(messages, task="general" ) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages,
        task : task
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Backend API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "AI did not reply.";
  } catch (err) {
    console.error('Error calling AI backend:', err);
    throw new Error("⚠️ Failed to reach the AI service. Please check your internet connection or you may have run out of tokens.");
  }
}

/**
 * Stream chat responses from AI backend
 */
export async function streamChatResponse(messages, onChunk) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      let message = 'AI service is temporarily unavailable.';
      try {
        const error = await response.json();
        if (typeof error?.error === 'string') message = error.error;
      } catch {
        // Keep the response generic if the backend did not return JSON.
      }
      throw new Error(message);
    }

    if (!response.body) throw new Error('AI service returned an empty response.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let pending = '';

    const readEvent = (line) => {
      if (!line.startsWith('data: ')) return false;
      const data = line.slice(6);
      if (data === '[DONE]') return true;

      const parsed = JSON.parse(data);
      if (parsed?.error) {
        throw new Error(parsed.error.message || 'AI service is temporarily unavailable.');
      }

      const content = parsed.choices?.[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onChunk(content);
      }
      return false;
    };

    while (true) {
      const { done, value } = await reader.read();
      pending += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = pending.split('\n');
      pending = done ? '' : lines.pop();

      for (const line of lines) {
        if (readEvent(line.trimEnd())) {
          await reader.cancel();
          return fullResponse;
        }
      }
      if (done) break;
    }

    if (!fullResponse) throw new Error('AI service returned an empty response.');
    return fullResponse;
  } catch (err) {
    console.error('Error streaming from AI:', err);
    try {
      const fallbackResponse = await askOpenAI(messages, 'chat');
      if (fallbackResponse && fallbackResponse !== 'AI did not reply.') {
        onChunk(fallbackResponse);
        return fallbackResponse;
      }
    } catch {
      // Keep the UI error generic if both streaming and the standard chat request fail.
    }
    throw new Error('SmartScribe AI is unavailable right now. Please try again later.');
  }
}

/**
 * Generate a summary
 */
export async function generateSummary(content, wordCount = 150) {
  const messages = [
    { role: 'system', content: `You are SmartScribe AI. Summarize in ~${wordCount} words.` },
    { role: 'user', content: `Summarize:\n\n${content}` }
  ];
  return await askOpenAI(messages,"summarize");
}

/**
 * Generate structured notes
 */
export async function generateNotes(content) {
  const messages = [
    { role: 'system', content: 'You are SmartScribe AI creating structured notes in markdown.' },
    { role: 'user', content: `Create detailed notes:\n\n${content}` }
  ];
  return await askOpenAI(messages, "notes");
}

/**
 * Safe JSON parse utility with fixes for common AI formatting issues
 */
function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    console.warn('AI returned invalid JSON, attempting fix...', str);

    // Attempt quick repairs
    let fixed = str
      .replace(/```json/g, '')   // remove markdown fences
      .replace(/```/g, '')
      .replace(/,\s*]/g, ']')    // remove trailing commas
      .replace(/,\s*}/g, '}')    // remove trailing commas in objects
      .replace(/\s+/g, ' ')      // normalize whitespace
      .trim();

    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("❌ Could not repair JSON:", e2.message);
      return [];
    }
  }
}

/**
 * Generate quiz questions safely
 */
export async function generateQuiz(content, numberOfQuestions = 5, difficulty = 'intermediate', topic = '') {
  const batchSize = 10; // max questions per AI request
  const difficultyPrompt = {
    beginner: 'basic concepts and fundamental understanding',
    intermediate: 'moderate complexity requiring some analysis',
    advanced: 'complex analysis and deep understanding'
  };

  let allQuestions = [];
  const batches = Math.ceil(numberOfQuestions / batchSize);

  for (let i = 0; i < batches; i++) {
    const questionsInBatch = Math.min(batchSize, numberOfQuestions - allQuestions.length);
    const messages = [
      { 
        role: 'system', 
        content: `You are SmartScribe AI creating ${questionsInBatch} quiz questions at ${difficulty} level on ${difficultyPrompt[difficulty]}. ${topic ? `Focus on topic: ${topic}.` : ''} Return as valid JSON array [{"question":"...","options":["a","b","c","d"],"correct":0,"explanation":"..."}].` 
      },
      { 
        role: 'user', 
        content: `Create ${questionsInBatch} ${difficulty} level multiple choice questions ${topic ? `about ${topic}` : ''} based on:\n\n${content}` 
      }
    ];

    const response = await askOpenAI(messages, "quiz");
    const parsed = safeJSONParse(response);

    if (Array.isArray(parsed)) {
      allQuestions = allQuestions.concat(parsed);
    }
  }

  return allQuestions;
}

/**
 * Generate topic quiz safely
 */
export async function generateTopicQuiz(topic, numberOfQuestions = 5, difficulty = 'intermediate') {
  return await generateQuiz("", numberOfQuestions, difficulty, topic);
}

/**
 * Process URL content
 */
export async function processURL(url) {
  const messages = [
    { role: 'system', content: 'You are SmartScribe AI analyzing web content.' },
    { role: 'user', content: `Analyze URL: ${url.trim()}` }
  ];
  return await askOpenAI(messages, "notes");
}

/**
 * Process video content
 */
export async function processVideo(videoUrl, contentType = 'notes') {
  const messages = [
    { role: 'system', content: `You are SmartScribe AI processing video content. Provide ${contentType}.` },
    { role: 'user', content: `Process video URL ${videoUrl.trim()} and create ${contentType}.` }
  ];
  return await askOpenAI(messages, "video");
}

/**
 * Extract key topics
 */
export async function extractTopics(content) {
  const messages = [
    { role: 'system', content: 'You are SmartScribe AI creating structured learning paths.' },
    { role: 'user', content: `Analyze content and create topic breakdown:\n\n${content}` }
  ];
  return await askOpenAI(messages, "notes");
}

/**
 * Chat with AI
 */
export async function chatWithAI(userMessage, context = '') {
  const messages = [
    { role: 'system', content: `You are SmartScribe AI, friendly assistant.` }
  ];

  if (context) messages.push({ role: 'system', content: `Context: ${context}` });
  messages.push({ role: 'user', content: userMessage });

  return await askOpenAI(messages, "chat");
}

/**
 * Convert audio to notes
 */
export async function convertAudioToNotes(audioBlob, recordingName) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, recordingName + '.webm');

    const transcriptionResponse = await fetch(`${API_BASE_URL}/api/transcribe`, { method: 'POST', body: formData });
    if (!transcriptionResponse.ok) throw new Error(await transcriptionResponse.text());

    const { transcription } = await transcriptionResponse.json();
    if (!transcription || typeof transcription !== "string") throw new Error("No transcription received");

    const messages = [
      { role: 'system', content: 'Convert voice to structured notes with markdown.' },
      { role: 'user', content: `Transcription:\n\n${transcription}` }
    ];

    return await askOpenAI(messages);

  } catch (error) {
    console.error('Error converting audio:', error);
    throw new Error(error.message || 'Failed to convert recording to notes.');
  }
}
