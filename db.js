const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'chat.db');
const db = new sqlite3.Database(dbPath);

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function runCallback(err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

async function initialize() {
  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function cleanupExpired() {
  await run("DELETE FROM messages WHERE created_at < datetime('now', '-2 hours')");
}

async function getMessages() {
  await cleanupExpired();
  const messages = await all(
    'SELECT id, username, content, created_at FROM messages ORDER BY datetime(created_at) ASC'
  );
  return messages;
}

async function addMessage(username, content) {
  await cleanupExpired();
  const { id } = await run(
    'INSERT INTO messages (username, content) VALUES (?, ?)',
    [username, content]
  );
  const row = await get(
    'SELECT id, username, content, created_at FROM messages WHERE id = ?',
    [id]
  );
  return row;
}

initialize().catch((err) => {
  console.error('Failed to initialize database', err);
  process.exit(1);
});

module.exports = {
  getMessages,
  addMessage,
  cleanupExpired,
  db,
};
