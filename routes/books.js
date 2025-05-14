const express = require('express');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./db/booktracker.db');


// Show search form
router.get('/search', requireLogin, (req, res) => {
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
  res.render('search', {
    layout: isAjax ? false : 'main',
    user: req.session.user,
  });
});

// Handle search + fetch results from Google Books
router.post('/search', requireLogin, (req, res) => {
  const query = encodeURIComponent(req.body.query);
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`;

  https.get(apiUrl, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        const books = (json.items || []).map(item => {
          const info = item.volumeInfo;
          return {
            title: info.title,
            author: (info.authors || []).join(', '),
            description: info.description || 'No description'
          };
        });

        const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
        res.render('search', {
          layout: isAjax ? false : 'main',
          user: req.session.user,
          books,
          query: req.body.query
        });
      } catch (err) {
        console.error('Failed to parse API response:', err);
        res.render('search', {
          layout: false,
          error: 'Failed to parse API response'
        });
      }
    });
  }).on('error', (err) => {
    console.error('Request error:', err);
    res.render('search', {
      layout: false,
      error: 'Failed to fetch from Google Books API'
    });
  });
});

router.post('/books/save', requireLogin, (req, res) => {
  const { title, author, description } = req.body;
  const userId = req.session.user.id;

  db.run(
    'INSERT INTO books (title, author, description, added_by) VALUES (?, ?, ?, ?)',
    [title, author, description, userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to save book.');
      }

      res.redirect('/mybooks');
    }
  );
});

router.get('/mybooks', requireLogin, (req, res) => {
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
  const userId = req.session.user.id;

  db.all(
    'SELECT id, title, author, description FROM books WHERE added_by = ?',
    [userId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching saved books.');
      }

      res.render('mybooks', {
        layout: isAjax ? false : 'main',
        user: req.session.user,
        books: rows
      });
    }
  );
});

router.post('/books/delete', requireLogin, (req, res) => {
  const bookId = req.body.id;
  const userId = req.session.user.id;

  db.run('DELETE FROM books WHERE id = ? AND added_by = ?', [bookId, userId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

module.exports = router;
