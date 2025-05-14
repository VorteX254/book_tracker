const express = require('express');
const session = require('express-session');
const path = require('path');
const exphbs = require('express-handlebars');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const bookRoutes = require('./routes/books');


const app = express();
const PORT = 3000;

// Handlebars setup
app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts')
}));
const hbs = exphbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    helpers: {
      eq: (a, b) => a === b
    }
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', bookRoutes);

// Routes
app.get('/', (req, res) => {
    const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

    res.render('index', {
        layout: isAjax ? false : 'main',
        user: req.session.user,
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});