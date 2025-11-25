const express = require('express');
const path = require('path');
const { getMessages, addMessage } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await getMessages();
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

app.post('/api/messages', async (req, res) => {
  const username = (req.body.username || '').trim();
  const content = (req.body.content || '').trim();

  if (!username || !content) {
    return res.status(400).json({ error: 'Nome e mensagem são obrigatórios' });
  }

  try {
    const message = await addMessage(username, content);
    res.status(201).json(message);
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ error: 'Erro ao salvar mensagem' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
