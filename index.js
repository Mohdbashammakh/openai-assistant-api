const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
  const { message } = req.body;
  
  try {
    const threadResponse = await axios.post(
      'https://api.openai.com/v1/threads',
      {},
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );

    const threadId = threadResponse.data.id;

    const runResponse = await axios.post(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        assistant_id: process.env.ASSISTANT_ID,
        additional_messages: [{ role: 'user', content: message }]
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );

    await new Promise(resolve => setTimeout(resolve, 3000));

    const messagesResponse = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );

    const reply = messagesResponse.data.data[0].content[0].text.value;
    res.json({ reply });
    
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
