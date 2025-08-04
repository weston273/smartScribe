/**
 * AI utility functions that communicate with the backend
 */

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://smartscribe-yjsf.onrender.com' // Your deployed backend base URL
  : 'http://localhost:3001'; // Your local backend base URL (change as needed)

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
    return "Sorry, I couldn't reach the AI service. Please try again later or contact support because you may have run out of tokens.";
  }
}

/**
 * Stream chat responses from AI backend
 * @param {Array} messages - Array of message objects
 * @param {Function} onChunk - Callback for each chunk of data
 * @returns {Promise<string>} Complete response
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
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors for individual chunks
          }
        }
      }
    }

    return fullResponse;
  } catch (err) {
    console.error('Error streaming from AI:', err);
    const fallbackResponse = await askOpenAI(messages);
    onChunk(fallbackResponse);
    return fallbackResponse;
  }
}

/**
 * Generate a summary from content with word count option
 */
export async function generateSummary(content, wordCount = 150) {
  const messages = [
    { 
      role: 'system', 
      content: `You are a helpful assistant called SmartScribe AI that creates concise, well-structured summaries. Create a summary in approximately ${wordCount} words. Focus on the main points and key information.` 
    },
    { 
      role: 'user', 
      content: `Please summarize the following content in about ${wordCount} words:\n\n${content}` 
    }
  ];
  return await askOpenAI(messages,"summarize");
}

/**
 * Generate structured notes from content
 */
export async function generateNotes(content) {
  const messages = [
    { 
      role: 'system', 
      content: 'You are a helpful assistant called SmartScribe AI that creates well-structured study notes with clear headings, bullet points, and organized information using markdown formatting.' 
    },
    { 
      role: 'user', 
      content: `Please create detailed study notes from the following content, using markdown formatting with headings, bullet points, and clear structure:\n\n${content}` 
    }
  ];
  return await askOpenAI(messages, "notes");
}

/**
 * Generate quiz questions from content
 */
export async function generateQuiz(content, numberOfQuestions = 5, difficulty = 'intermediate', topic = '') {
  const difficultyPrompt = {
    beginner: 'basic concepts and fundamental understanding',
    intermediate: 'moderate complexity requiring some analysis',
    advanced: 'complex analysis and deep understanding'
  };

  const messages = [
    { 
      role: 'system', 
      content: `You are a helpful assistant called SmartScribe AI that creates engaging quiz questions. Create ${numberOfQuestions} multiple choice questions at ${difficulty} level focusing on ${difficultyPrompt[difficulty]}. ${topic ? `Focus specifically on the topic: ${topic}.` : ''} Return the response as a valid JSON array of objects with the format: [{"question": "...", "options": ["a", "b", "c", "d"], "correct": 0, "explanation": "..."}] where correct is the index of the correct answer.` 
    },
    { 
      role: 'user', 
      content: `Create ${numberOfQuestions} ${difficulty} level multiple choice quiz questions ${topic ? `about ${topic}` : ''} based on the following content:\n\n${content}` 
    }
  ];
  
  try {
    const response = await askOpenAI(messages, "quiz");
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing quiz JSON:', error);
    return [];
  }
}

/**
 * Process and analyze URL content
 */
export async function processURL(url) {
  const messages = [
    { 
      role: 'system', 
      content: 'You are a helpful assistant called SmartScribe AI that can analyze and provide comprehensive information about web content. Provide a detailed analysis including main topics, key points, and actionable insights.' 
    },
    { 
      role: 'user', 
      content: `Please analyze and provide comprehensive information about this URL: ${url.trim()}. Include main topics, key concepts, and create structured notes that would be helpful for learning.` 
    }
  ];
  return await askOpenAI(messages, "notes");
}

/**
 * Process video content and extract information
 */
export async function processVideo(videoUrl, contentType = 'notes') {
  const messages = [
    { 
      role: 'system', 
      content: `You are a helpful assistant called SmartScribe AI that processes youtube video content. Based on the video URL and any available information, provide comprehensive ${contentType === 'notes' ? 'study notes' : contentType === 'summary' ? 'summary' : 'analysis'}. Focus more on Youtube videos and provide actual notes of ${contentType} in the response.` 
    },
    { 
      role: 'user', 
      content: `Please process this youtube video URL and create ${contentType}: ${videoUrl.trim()}. Provide structured, educational content that would be valuable for learning. Provide actaual notes of ${contentType} in the response.` 
    }
  ];
  return await askOpenAI(messages, "video");
}

/**
 * Extract key topics and create learning breakdown
 */
export async function extractTopics(content) {
  const messages = [
    { 
      role: 'system', 
      content: 'You are a helpful assistant called SmartScribe that identifies key topics and creates structured learning paths. Organize information into main topics, subtopics, learning objectives, study materials, and provide difficulty levels and time estimates.' 
    },
    { 
      role: 'user', 
      content: `Please analyze the following content and create a comprehensive topic breakdown with:
      1. Main topics and subtopics
      2. Difficulty levels (beginner/intermediate/advanced)
      3. Estimated study time for each topic
      4. Recommended study path/sequence
      5. Key learning objectives
      6. Suggested study materials and resources
      
      Content to analyze:\n\n${content}` 
    }
  ];
  return await askOpenAI(messages, "notes");
}

/**
 * Chat with AI assistant with context
 */
export async function chatWithAI(userMessage, context = '') {
  const messages = [
    { 
      role: 'system', 
      content: 'You are SmartScribe AI, a helpful assistant specialized in note-taking, studying, and educational content. You also are a great at conversations whereyou ae motivating and engaged in the conversation making the user feel heard. You help users organize information, create summaries, generate quizzes, and provide study assistance. Be conversational, helpful, motivational, educational and the one who created SmartScribe AI is Weston N Sululu.' 
    }
  ];
  
  if (context) {
    messages.push({ 
      role: 'system', 
      content: `Context: ${context}` 
    });
  }
  
  messages.push({ 
    role: 'user', 
    content: userMessage 
  });
  
  return await askOpenAI(messages, "chat");
}

/**
 * Generate quiz from specific topic
 */
export async function generateTopicQuiz(topic, numberOfQuestions = 5, difficulty = 'intermediate') {
  const messages = [
    { 
      role: 'system', 
      content: `You are a helpful assistant called SmartScribe AI that creates educational quiz questions. Create ${numberOfQuestions} multiple choice questions about ${topic} at ${difficulty} level. Return as valid JSON array: [{"question": "...", "options": ["a", "b", "c", "d"], "correct": 0, "explanation": "..."}]` 
    },
    { 
      role: 'user', 
      content: `Create ${numberOfQuestions} ${difficulty} level multiple choice questions about: ${topic}` 
    }
  ];
  
  try {
    const response = await askOpenAI(messages, "quiz");
    return JSON.parse(response);
  } catch (error) {
    console.error('Error parsing quiz JSON:', error);
    return [];
  }
}

/**
 * Convert audio recording to structured notes using AI.
 * Uploads audioBlob to backend for transcription,
 * then sends transcription to AI to generate structured notes.
 */
export async function convertAudioToNotes(audioBlob, recordingName) {
  try {
    // Upload the audio blob to backend transcription endpoint
    const formData = new FormData();
    formData.append('audio', audioBlob, recordingName + '.webm');

    const transcriptionResponse = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      body: formData
    });

    if (!transcriptionResponse.ok) {
      const errText = await transcriptionResponse.text();
      throw new Error('Failed to transcribe audio: ' + errText);
    }

    const { transcription } = await transcriptionResponse.json();

    if (!transcription || typeof transcription !== "string") {
      throw new Error("No transcription received from backend.");
    }

    // Send transcription to AI for structuring notes
    const messages = [
      {
        role: 'system',
        content: `You are a helpful assistant that converts voice recordings into well-structured study notes.
Create comprehensive notes with clear headings, bullet points, key concepts, and actionable insights.
Use markdown formatting for readability. Include a summary section and highlight important points.`
      },
      {
        role: 'user',
        content: `Please convert this voice recording transcription into structured study notes:

Recording: ${recordingName}
Transcription: ${transcription}

Create organized notes with:
1. Main topics and key points
2. Important concepts highlighted
3. Summary section
4. Action items (if any)
5. Use clear markdown formatting`
      }
    ];

    const structuredNotes = await askOpenAI(messages);

    return structuredNotes;

  } catch (error) {
    console.error('Error converting audio to notes:', error);
    throw new Error(error.message || 'Failed to convert recording to notes. Please try again.');
  }
}
