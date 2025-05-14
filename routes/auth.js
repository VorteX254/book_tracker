const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./db/booktracker.db');

// Render registration page
router.get('/register', (req, res) => {
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

  res.render('register', {
    layout: isAjax ? false : 'main',
    user: req.session.user,
  });
});

// Handle registration
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, hashedPassword, 'guest'],
    function (err) {
      if (err) {
        return res.render('register', { error: 'Username already taken' });
      }
      req.session.user = { id: this.lastID, username, role: 'guest' };
      res.redirect('/');
    }
  );
});

// Render login page
router.get('/login', (req, res) => {
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

  res.render('login', {
    layout: isAjax ? false : 'main',
    user: req.session.user,
  });
  //res.render('login');
});

// Handle login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.redirect('/');
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;