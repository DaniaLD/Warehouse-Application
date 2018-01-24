const db = require('../config/db');
const bcrypt = require('bcryptjs');

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
        if(req.user.post === 'راهبر') {
            res.render('admin');
        }
    });

    // **************** Staff Management ****************
    app.get('/staff-management', isLoggedIn, (req, res) => {
        if(req.user.post === 'راهبر') {
            let staffsArr = [];
            db.query('select * from staff', (err, staffs) => {
                if(err) throw err;
                staffs.forEach( staff => {
                    staffsArr.push(staff);
                });
                res.render('staff-management', { staffs: staffsArr });
            })
        }
    });

    // **************** Add staff ****************
    app.get('/add-staff', isLoggedIn,(req, res) => {
        if(req.user.post === 'راهبر') {
            res.render('add-staff', { errors: null });
        }
    });
    app.post('/add-staff', isLoggedIn,(req, res) => {
        req.checkBody('first_name', 'نام الزامی است!').notEmpty();
        req.checkBody('last_name', 'نام خانوادگی الزامی است!').notEmpty();
        req.checkBody('post', 'سمت کارمند انتخاب نشده است!').notEmpty();

        let errors = req.validationErrors();

        if(errors) {
            res.render('add-staff', { errors: errors });
        } else {
            let staff = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                post: req.body.post,
                password: bcrypt.hashSync(`${this.first_name} ${this.last_name}`, 10)
            }
            let query = 'insert into staff ( first_name, last_name, post, password ) values ( ?, ?, ?, ?)';
            db.query(query, [ staff.first_name, staff.last_name, staff.post, staff.password ], (err, staff) => {
                if(err) {
                    console.log('Could not add new staff!!! => ' + err);
                } else {
                    console.log('New staff added successfully ...');
                    req.flash('success_msg', 'کارمند جدید اضافه شد.');
                    res.redirect('/staff-management');

                }
            });
        }
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