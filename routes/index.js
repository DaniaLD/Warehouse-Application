const db = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = (app, passport) => {
    // /\/\/\/\/\/\/\/\/\/\/\/\/\ ADMIN SECTION /\/\/\/\/\/\/\/\/\/\/\/\/\

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
        if(req.user.post_no === 1) {
            res.render('admin');
        }
    });

    // **************** Staff Management ****************
    app.get('/staff-management', isLoggedIn, (req, res) => {
        if(req.user.post_no === 1) {
            let staffsArr = [];
            db.query('select * from staff join poststaff on staff.post_no = poststaff.post_no', (err, staffs) => {
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
        if(req.user.post_no === 1) {
            res.render('add-staff', { errors: null });
        }
    });
    app.post('/add-staff', isLoggedIn,(req, res) => {
        req.checkBody('first_name', 'نام الزامی است!').notEmpty();
        req.checkBody('last_name', 'نام خانوادگی الزامی است!').notEmpty();
        req.checkBody('post_no', 'سمت کارمند انتخاب نشده است!').notEmpty();
        req.checkBody('password', 'گذرواژه الزامی است!').notEmpty();

        let errors = req.validationErrors();

        if(errors) {
            res.render('add-staff', { errors: errors });
        } else {
            let staff = {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                post_no: req.body.post_no,
                password: bcrypt.hashSync(req.body.password, 10)
            }
            let query = 'insert into staff ( first_name, last_name, post_no, password ) values ( ?, ?, ?, ?)';
            db.query(query, [ staff.first_name, staff.last_name, staff.post_no, staff.password ], (err, staff) => {
                if(err) {
                    console.log('Could not add new staff!!! => ' + err);
                } else {
                    console.log('New staff added successfully ...');
                    req.flash('success_msg', 'کارمند جدید اضافه شد.');
                    res.redirect('/staff-management');
                }
            });
        }
    });

    // **************** Edit staff ****************
    app.get('/edit-staff/:id', isLoggedIn, (req, res) => {
        if(req.user.post_no === 1) {
            let id = req.params.id;
            id = id.slice(1);

            let query = 'select * from staff where id = ?';
            db.query(query, [id], (err, staff) => {
                if(err) throw err;

                res.render('edit-staff', { staff: staff[0], errors: null });
            })
        }
    });
    app.post('/edit-staff/:id', isLoggedIn, (req, res) => {
        let id = req.params.id;
        id = id.slice(1);
        let query = 'select * from staff where id = ?';

        req.checkBody('first_name', 'نام الزامی است!').notEmpty();
        req.checkBody('last_name', 'نام خانوادگی الزامی است!').notEmpty();
        req.checkBody('post_no', 'سمت کارمند انتخاب نشده است!').notEmpty();

        let errors = req.validationErrors();
        if(errors) {
            db.query(query, [id], (err, staff) => {
                if(err) throw err;

                res.render('edit-staff', { staff: staff[0], errors: errors });
            })
        } else {
            let query = 'update staff set first_name = ?, last_name = ?, post_no = ?, activate = ? where id = ?';
            let updatedStaff = {
                id: id,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                post_no: req.body.post_no,
                activate: req.body.activate
            }

            db.query(query, [
                updatedStaff.first_name,
                updatedStaff.last_name,
                updatedStaff.post_no,
                updatedStaff.activate,
                updatedStaff.id], (err, updated) => {
                if(err) {
                    console.log('Could not update staff !!! => ' + err);
                } else {
                    console.log('Updated staff successfully ...');
                    req.flash('success_msg', 'کارمند با موفقیت اصلاح شد.');
                    res.redirect('/staff-management');
                }
            })
        }
    });
    // Add staff-interactions later

    // /\/\/\/\/\/\/\/\/\/\/\/\/\ END OF ADMIN SECTION /\/\/\/\/\/\/\/\/\/\/\/\/\
}

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    } else {
        req.flash('error_msg', 'لطفا ابتدا وارد پنل کاربری خود شوید!');
        res.redirect('/login');
    }
}