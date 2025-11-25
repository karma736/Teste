// FILE: public/script.js
const messagesContainer = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const rememberCheckbox = document.getElementById('remember');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

function loadStoredName() {
  const storedName = localStorage.getItem('chat_username');
  if (storedName) {
    usernameInput.value = storedName;
    rememberCheckbox.checked = true;
  }
}

function storeNameIfNeeded() {
  if (rememberCheckbox.checked && usernameInput.value.trim()) {
    localStorage.setItem('chat_username', usernameInput.value.trim());
  } else {
    localStorage.removeItem('chat_username');
  }
}

function formatTimeAgo(timestamp) {
  const now = Date.now();
  const normalizedTimestamp = typeof timestamp === 'string' ? `${timestamp.replace(' ', 'T')}Z` : timestamp;
  const created = new Date(normalizedTimestamp).getTime();
  if (Number.isNaN(created)) {
    return 'agora mesmo';
  }
  const diffMs = now - created;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return `há ${diffSeconds} segundo${diffSeconds === 1 ? '' : 's'}`;
  }
  if (diffMinutes < 60) {
    return `há ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`;
  }
  return `há ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
}

function renderMessages(messages) {
  if (!messages.length) {
    messagesContainer.innerHTML = '<p class="empty">Nenhuma mensagem ainda. Envie a primeira!</p>';
    return;
  }

  messagesContainer.innerHTML = '';
  messages.forEach((message) => {
    const wrapper = document.createElement('article');
    wrapper.className = 'message';

    const header = document.createElement('div');
    header.className = 'message-header';

    const user = document.createElement('span');
    user.className = 'message-user';
    user.textContent = message.username;

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTimeAgo(message.created_at);

    header.appendChild(user);
    header.appendChild(time);

    const content = document.createElement('p');
    content.className = 'message-content';
    content.textContent = message.content;

    wrapper.appendChild(header);
    wrapper.appendChild(content);

    messagesContainer.appendChild(wrapper);
  });
}

async function loadMessages() {
  try {
    const response = await fetch('/api/messages');
    if (!response.ok) {
      throw new Error('Erro ao buscar mensagens');
    }
    const data = await response.json();
    renderMessages(data);
  } catch (error) {
    console.error(error);
  }
}

async function sendMessage() {
  const username = usernameInput.value.trim();
  const content = messageInput.value.trim();

  if (!username || !content) {
    alert('Informe seu nome e uma mensagem.');
    return;
  }

  storeNameIfNeeded();

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, content }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Falha ao enviar mensagem');
    }

    messageInput.value = '';
    await loadMessages();
  } catch (error) {
    alert(error.message);
  }
}

function handleEnterKey(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    sendMessage();
  }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', handleEnterKey);
rememberCheckbox.addEventListener('change', storeNameIfNeeded);
usernameInput.addEventListener('blur', storeNameIfNeeded);

loadStoredName();
loadMessages();
setInterval(loadMessages, 10000);
