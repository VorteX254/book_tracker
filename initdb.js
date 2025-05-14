const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./db/booktracker.db');

const schema = fs.readFileSync('./db/schema.sql', 'utf-8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error creating tables:', err.message);
  } else {
    console.log('Tables created successfully.');
  }
});