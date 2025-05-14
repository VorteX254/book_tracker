const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/booktracker.db');

(async () => {
  const username = 'admin';
  const password = 'admin';
  const role = 'admin';

  const hashed = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashed, role],
    (err) => {
      if (err) {
        console.error('Error inserting admin user:', err.message);
      } else {
        console.log('Admin user added.');
      }
    }
  );
})();
