const db = require('../config/db');

module.exports = (app, passport) => {

    // **************** Login ****************
    app.get('/login', (req, res) => {
        res.render('login');
    });
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    }));

    // **************** Dashboard ****************
    app.get('/dashboard', isLoggedIn, (req, res) => {
        res.send('dashboard');
    })
}

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    } else {
        req.flash('error_msg', 'لطفا ابتدا وارد پنل کاربری خود شوید!');
        res.redirect('/login');
    }
}