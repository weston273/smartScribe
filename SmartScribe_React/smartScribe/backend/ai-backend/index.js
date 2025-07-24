import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
console.log("Loaded OPENROUTER_API_KEY:", OPENROUTER_API_KEY); 

// Confirm the API key is loaded
if (!OPENROUTER_API_KEY) {
  throw new Error('❌ OPENROUTER_API_KEY not found in .env file. Please add it and restart the server.');
}

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const messages = req.body.messages;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: '❌ Messages array is required in the request body.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b',
        messages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('❌ OpenRouter API error:', errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('❌ Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ AI backend proxy server running on port ${PORT}`);
});
