import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; 


dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/api/chat', async (req, res) => {
  const messages = req.body.messages;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required in the request body.' });
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
      const err = await response.text();
      console.error('OpenRouter API error:', err);
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`AI backend proxy server running on port ${PORT}`);
});
