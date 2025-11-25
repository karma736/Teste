const DB_NAME = 'diario-publico';
const DB_VERSION = 1;
const STORE = 'entries';

async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('pinned', 'pinned', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    const result = callback(store);

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
  });
}

async function addEntry(entry) {
  const payload = {
    ...entry,
    createdAt: new Date().toISOString(),
  };
  return withStore('readwrite', (store) => store.add(payload));
}

async function listEntries() {
  return withStore('readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const sorted = request.result.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  });
}

async function deleteEntry(id) {
  return withStore('readwrite', (store) => store.delete(id));
}

async function clearDatabase() {
  return withStore('readwrite', (store) => store.clear());
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function renderEntries(entries) {
  const container = document.getElementById('entries');
  const counter = document.getElementById('entry-count');

  if (!entries.length) {
    container.innerHTML = '<p class="muted">Nenhum registro salvo ainda. Adicione um acima.</p>';
    counter.textContent = '0 registros';
    return;
  }

  const markup = entries
    .map(
      (entry) => `
        <article class="entry">
          <div class="meta">
            <strong>${entry.author}</strong>
            <span>•</span>
            <span>${formatDate(entry.createdAt)}</span>
            ${entry.pinned ? '<span class="pinned">Fixado</span>' : ''}
          </div>
          <div class="message">${entry.message.replace(/</g, '&lt;')}</div>
          <div class="actions">
            <button class="button ghost" data-id="${entry.id}" data-action="delete">Remover</button>
          </div>
        </article>
      `
    )
    .join('');

  container.innerHTML = markup;
  counter.textContent = `${entries.length} ${entries.length === 1 ? 'registro' : 'registros'}`;
}

async function refreshEntries() {
  const entries = await listEntries();
  renderEntries(entries);
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const author = form.author.value.trim();
  const message = form.message.value.trim();
  const pinned = form.pinned.checked;

  if (!author || !message) return;

  await addEntry({ author, message, pinned });
  form.reset();
  refreshEntries();
}

function handleEntryActions(event) {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  if (target.dataset.action === 'delete') {
    const id = Number(target.dataset.id);
    deleteEntry(id).then(refreshEntries);
  }
}

function downloadJSON(entries) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'diario-publico.json';
  link.click();
  URL.revokeObjectURL(url);
}

function setupUI() {
  const form = document.getElementById('entry-form');
  const entriesContainer = document.getElementById('entries');
  const exportButton = document.getElementById('export-json');
  const clearButton = document.getElementById('clear-db');

  form.addEventListener('submit', handleSubmit);
  entriesContainer.addEventListener('click', handleEntryActions);
  exportButton.addEventListener('click', async () => downloadJSON(await listEntries()));
  clearButton.addEventListener('click', async () => {
    await clearDatabase();
    refreshEntries();
  });
}

async function bootstrap() {
  await openDatabase();
  setupUI();
  refreshEntries();
}

bootstrap();
