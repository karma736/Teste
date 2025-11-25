// FILE: server.js
const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/messages', async (req, res) => {
  try {
    await db.deleteOldMessages();
    const messages = await db.getMessages();
    res.json(messages);
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { username, content } = req.body || {};

  if (!username || !content || !String(username).trim() || !String(content).trim()) {
    return res.status(400).json({ error: 'Nome e mensagem são obrigatórios.' });
  }

  try {
    await db.deleteOldMessages();
    const message = await db.addMessage(String(username).trim(), String(content).trim());
    res.status(201).json(message);
  } catch (err) {
    console.error('Erro ao salvar mensagem:', err);
    res.status(500).json({ error: 'Erro ao salvar mensagem' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
