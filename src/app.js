const express = require('express');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const methodOverride = require('method-override');
const flash = require('express-flash');
const pool = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Root redirect
app.get('/', (req, res) => res.redirect('/dashboard'));

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/tickets', ticketRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);
app.use('/reports', reportRoutes);

// /trash is an alias for /tickets/trash (for sidebar link)
app.get('/trash', (req, res) => res.redirect('/tickets/trash'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});