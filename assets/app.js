const ROOM = 'public-hour-chat';
const TTL_MS = 60 * 60 * 1000; // 1 hora
const peers = ['https://gun-manhattan.herokuapp.com/gun'];

const gun = Gun({ peers });
const messages = new Map();

const authorInput = document.getElementById('author');
const messageInput = document.getElementById('message');
const rememberCheckbox = document.getElementById('remember');
const feedContainer = document.getElementById('messages');
const counter = document.getElementById('message-count');
const statusEl = document.getElementById('status');

function sanitize(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function isExpired(isoString) {
  return Date.now() - new Date(isoString).getTime() > TTL_MS;
}

function purgeExpired() {
  messages.forEach((value, id) => {
    if (isExpired(value.createdAt)) {
      gun.get(ROOM).get(id).put(null);
      messages.delete(id);
    }
  });
}

function renderMessages() {
  if (!messages.size) {
    feedContainer.innerHTML = '<p class="muted">Nenhuma mensagem no último período. Seja o primeiro!</p>';
    counter.textContent = '0 mensagens';
    return;
  }

  const sorted = Array.from(messages.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  feedContainer.innerHTML = sorted
    .map(
      (msg) => `
        <article class="message">
          <div class="message__meta">
            <div>
              <strong>${sanitize(msg.author)}</strong>
              <span class="muted">· ${formatDate(msg.createdAt)}</span>
            </div>
            <span class="message__badge">Expira em 1h</span>
          </div>
          <p class="message__body">${sanitize(msg.text)}</p>
        </article>
      `
    )
    .join('');

  counter.textContent = `${messages.size} ${messages.size === 1 ? 'mensagem' : 'mensagens'}`;
}

function persistAuthorPreference() {
  if (rememberCheckbox.checked) {
    localStorage.setItem('chat-author', authorInput.value.trim());
  } else {
    localStorage.removeItem('chat-author');
  }
}

function loadSavedAuthor() {
  const saved = localStorage.getItem('chat-author');
  if (saved) {
    authorInput.value = saved;
    rememberCheckbox.checked = true;
  }
}

function handleIncoming(data, id) {
  if (!data || !data.author || !data.text || !data.createdAt) {
    messages.delete(id);
    renderMessages();
    return;
  }

  if (isExpired(data.createdAt)) {
    gun.get(ROOM).get(id).put(null);
    messages.delete(id);
    renderMessages();
    return;
  }

  messages.set(id, { ...data, id });
  renderMessages();
}

function subscribe() {
  gun.get(ROOM).map().on(handleIncoming);
  statusEl.textContent = 'Conectado. Envie sua mensagem!';
}

function generateId() {
  return `${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
}

function handleSubmit(event) {
  event.preventDefault();
  const author = authorInput.value.trim();
  const text = messageInput.value.trim();

  if (!author || !text) return;

  const id = generateId();
  const payload = {
    author,
    text,
    createdAt: new Date().toISOString(),
  };

  gun.get(ROOM).get(id).put(payload, (ack) => {
    if (ack.err) {
      statusEl.textContent = 'Erro ao enviar. Tente novamente.';
    } else {
      statusEl.textContent = 'Mensagem publicada para todos.';
    }
  });

  persistAuthorPreference();
  messageInput.value = '';
}

function bootstrap() {
  loadSavedAuthor();
  document.getElementById('message-form').addEventListener('submit', handleSubmit);
  subscribe();
  renderMessages();
  setInterval(purgeExpired, 30 * 1000);
}

bootstrap();
