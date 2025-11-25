const messagesContainer = document.getElementById('messages');
const usernameInput = document.getElementById('username');
const rememberCheckbox = document.getElementById('rememberName');
const contentInput = document.getElementById('content');
const sendBtn = document.getElementById('sendBtn');

function formatTimeAgo(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) {
    return `há ${diffSeconds} segundo${diffSeconds === 1 ? '' : 's'}`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `há ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  return `há ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
}

function renderMessages(messages) {
  messagesContainer.innerHTML = '';

  if (!messages.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Nenhuma mensagem por aqui. Seja o primeiro a enviar!';
    messagesContainer.appendChild(empty);
    return;
  }

  messages.forEach((msg) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'message';

    const header = document.createElement('div');
    header.className = 'message-header';

    const name = document.createElement('span');
    name.className = 'message-username';
    name.textContent = msg.username;

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTimeAgo(msg.created_at);

    header.appendChild(name);
    header.appendChild(time);

    const content = document.createElement('p');
    content.className = 'message-content';
    content.textContent = msg.content;

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
  const content = contentInput.value.trim();

  if (!username || !content) {
    alert('Por favor, preencha seu nome e a mensagem.');
    return;
  }

  if (rememberCheckbox.checked) {
    localStorage.setItem('chatUsername', username);
  } else {
    localStorage.removeItem('chatUsername');
  }

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, content }),
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar mensagem');
    }

    await loadMessages();
    contentInput.value = '';
    contentInput.focus();
  } catch (error) {
    console.error(error);
    alert('Não foi possível enviar a mensagem. Tente novamente.');
  }
}

function restoreName() {
  const saved = localStorage.getItem('chatUsername');
  if (saved) {
    usernameInput.value = saved;
    rememberCheckbox.checked = true;
  }
}

sendBtn.addEventListener('click', sendMessage);
contentInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

window.addEventListener('load', () => {
  restoreName();
  loadMessages();
  setInterval(loadMessages, 10000);
});
