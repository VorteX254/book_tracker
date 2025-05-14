const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./db/booktracker.db');

router.get('/admin', requireAdmin, (req, res) => {
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }

    res.render('admin', {
      layout: isAjax ? false : 'main',
      user: req.session.user,
      users: rows
    });
  });
});

module.exports = router;
