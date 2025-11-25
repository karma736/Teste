// FILE: db.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'chat.db');
const EXPIRATION_WINDOW_HOURS = 2;

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

function deleteOldMessages() {
  return new Promise((resolve, reject) => {
    const query =
      'DELETE FROM messages WHERE datetime(created_at) <= datetime("now", ?)';
    db.run(query, [`-${EXPIRATION_WINDOW_HOURS} hours`], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

function getMessages() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, username, content, created_at FROM messages ORDER BY datetime(created_at) ASC';
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function addMessage(username, content) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO messages (username, content) VALUES (?, ?)';
    db.run(query, [username, content], function (err) {
      if (err) {
        reject(err);
        return;
      }

      db.get('SELECT id, username, content, created_at FROM messages WHERE id = ?', [this.lastID], (getErr, row) => {
        if (getErr) {
          reject(getErr);
        } else {
          resolve(row);
        }
      });
    });
  });
}

module.exports = {
  getMessages,
  addMessage,
  deleteOldMessages,
  EXPIRATION_WINDOW_HOURS,
};
