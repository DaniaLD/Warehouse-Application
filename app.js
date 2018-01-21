const express = require('express');
const expressValidator = require('express-validator');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const flash = require('connect-flash');

const app = express();
const port = process.env.PORT || 3000;

// Database Connection
const db = require('./config/db');
db.connect( err => {
    if(err) {
        console.log('Could not connect to database !!! => ' + err);
    } else {
        console.log('Connected to database successfully ...');
    }
} );

// Middlewares
app.use(cookieParser());
app.use(session({
    secret: 'This is a warehouse application.This is a warehouse application.',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

// Global Variables
app.use( (req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
} );

// Routes
require('./routes/index.js')(app, passport);

app.listen(port, () => {
    console.log(`App is listening on port : ${port}`);
})