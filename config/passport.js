const db = require('./db');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

module.exports = passport => {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        db.query('select * from staff where id = ?', [id], (err, rows) => {
            if(err) throw err;
            done(err, rows[0]);
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField: 'id',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, id, password, done) => {
            db.query('select * from staff where id = ?', [id], (err, rows) => {
                if(err) return done(err);
                if(!rows.length) {
                    return done(null, false, req.flash('error_msg', 'شماره پرسنلی اشتباه است!'));
                } else {
                    bcrypt.compare(password, rows[0].password, (err, isMatched) => {
                        if(err) throw err;
                        if(!isMatched) {
                            return done(null, false, req.flash('error_msg', 'گذرواژه اشتباه است!'));
                        } else {
                            return done(null, rows[0]);
                        }
                    })
                }
            })
        }
    ))
}