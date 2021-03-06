const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jalaali = require('jalaali-js');

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
        } else if(req.user.post_no === 2) {
            res.render('warehousekeeper');
        } else if(req.user.post_no === 4) {
            res.render('planner');
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
        } else {
            res.render('denied-access');
        }
    });

    // **************** Add staff ****************
    app.get('/add-staff', isLoggedIn,(req, res) => {
        if(req.user.post_no === 1) {
            res.render('add-staff', { errors: null });
        } else {
            res.render('denied-access');
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
            });
        } else {
            res.render('denied-access');
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
                updatedStaff.id], err => {
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

    // /\/\/\/\/\/\/\/\/\/\/\/\/\ WAREHOUSE KEEPER SECTION /\/\/\/\/\/\/\/\/\/\/\/\/\

    // **************** Good Management ****************
    app.get('/good-management', isLoggedIn, (req, res) => {
       if(req.user.post_no === 2) {
           let goodArr = [];

           let query = 'select * from good';
           db.query(query, (err, goods) => {
               if(err) throw err;
               goods.forEach( good => {
                   goodArr.push(good);
               });
               res.render('good-management', { goods: goodArr });
           });
       } else {
           res.render('denied-access');
       }
    });
    app.post('/good-management', isLoggedIn, (req, res) => {
        let goodArr = [];
        let query = 'select * from good where id = ? or name = ? or technical_number = ? or number = ?';

        db.query(query, [
            req.body.id || null,
            req.body.name || null,
            req.body.technical_number || null,
            req.body.number || null
        ], (err, goods) => {
            if(err) throw err;

            if(goods) {
                goods.forEach(good => {
                    goodArr.push(good);
                });
                res.render('good-management', { goods: goodArr });
            } else {
                req.flash('error_msg', 'کالایی با این مشخصات وجود ندارد!');
                res.redirect('/good-management');
            }
        });
    });

    // **************** Add Good ****************
    app.get('/add-good', isLoggedIn,(req, res) => {
       if(req.user.post_no === 2) {
           res.render('add-good', { errors: null });
       } else {
           res.render('denied-access');
       }
    });
    app.post('/add-good', isLoggedIn, (req, res) => {
        req.checkBody('name', 'نام الزامی است!').notEmpty();
        req.checkBody('technical_number', 'شماره فنی الزامی است!').notEmpty();
        req.checkBody('technical_number', 'شماره فنی فقط باید عدد باشد!').isNumeric();
        req.checkBody('unit', 'واحد الزامی است!').notEmpty();
        req.checkBody('number', 'تعداد الزامی است!').notEmpty();
        req.checkBody('number', 'تعداد فقط باید عدد باشد!').isNumeric();

        let errors = req.validationErrors();

        if(errors) {
            res.render('add-good', { errors: errors });
        } else {
            let good = {
                name: req.body.name,
                technical_number: req.body.technical_number,
                unit: req.body.unit,
                number: req.body.number
            }

            let query = 'insert into good ( name, technical_number, unit, number) values (?,?,?,?)';
            db.query(query, [ good.name, good.technical_number, good.unit, good.number ], (err, good) => {
                if(err) {
                    console.log('Could not add new good!!! => ' + err);
                } else {
                    let query = 'insert into staff_good ( staff_id, good_id ) values (?,?)';
                    db.query(query, [req.user.id, good.insertId]);

                    console.log('New good added successfully ...');
                    req.flash('success_msg', 'کالای جدید اضافه شد.');
                    res.redirect('/good-management');
                }
            });
        }
    });

    // **************** Edit Good ****************
    app.get('/edit-good/:id', isLoggedIn, (req, res) => {
        if(req.user.post_no === 2) {
            let id = req.params.id;
            id = id.slice(1);

            let query = 'select * from good where id = ?';
            db.query(query, [id], (err, good) => {
                if(err) throw err;

                res.render('edit-good', { good: good[0], errors: null });
            });
        } else {
            res.render('denied-access');
        }
    });
    app.post('/edit-good/:id', isLoggedIn, (req, res) => {
       let id = req.params.id;
       id = id.slice(1);

        req.checkBody('name', 'نام الزامی است!').notEmpty();
        req.checkBody('technical_number', 'شماره فنی الزامی است!').notEmpty();
        req.checkBody('technical_number', 'شماره فنی فقط باید عدد باشد!').isNumeric();
        req.checkBody('unit', 'واحد الزامی است!').notEmpty();
        req.checkBody('number', 'تعداد الزامی است!').notEmpty();
        req.checkBody('number', 'تعداد فقط باید عدد باشد!').isNumeric();

        let errors = req.validationErrors();

        if(errors) {
            res.render('edit-good', { errors: errors });
        } else {
            let updatedGood = {
                id: id,
                name: req.body.name,
                technical_number: req.body.technical_number,
                unit: req.body.unit,
                number: req.body.number
            }

            let query = 'update good set name = ?, technical_number = ?, unit = ?, number = ? where id = ?';
            db.query(query, [
                updatedGood.name,
                updatedGood.technical_number,
                updatedGood.unit,
                updatedGood.number,
                updatedGood.id ], (err, good) => {
                if(err) {
                    console.log('Could not update good!!! => ' + err);
                } else {
                    let query = 'insert into staff_good ( staff_id, good_id ) values (?,?)';
                    db.query(query, [req.user.id, updatedGood.id], err => {
                        if(err) {
                            console.log('Updated good successfully ...');
                            req.flash('success_msg', 'کالا با موفقیت اصلاح شد.');
                            res.redirect('/good-management');
                        }
                    });
                }
            });
        }
    });

    // **************** Requirement Form Management ****************
    app.get('/requirement-form-management', isLoggedIn, (req, res) => {
        if(req.user.post_no === 2) {
            let rowsArr = [];

            let query = 'select * from row join good on row.good_id = good.id join form on row.form_id = form.id where form.finished_no = 2';
            db.query(query, (err, rows) => {
                if(err) throw err;
                rows.forEach( row => {
                    rowsArr.push(row);
                });
                res.render('requirement-form-management', { rows: rowsArr });
            });
        } else {
            res.render('denied-access');
        }
    });

    // **************** Register Requirement Form ****************
    app.get('/register-requirement-form', isLoggedIn,(req, res) => {
        if(req.user.post_no === 2) {
            let currentDate = {
                year: new Date().getFullYear(),
                month: new Date().getMonth()+1,
                day: new Date().getDate(),
            }

            let currentJalaaliDate = jalaali.toJalaali(currentDate.year, currentDate.month, currentDate.day);
            let decoratedDate = currentJalaaliDate.jy + '/' + currentJalaaliDate.jm + '/' + currentJalaaliDate.jd;

            res.render('register-requirement-form', { errors: null, currentDate: decoratedDate, userID: req.user.id });
        } else {
            res.render('denied-access');
        }
    });
    app.post('/register-requirement-form', (req, res) => {
        if(req.body.comment === "") {
            req.body.comment = null;
        }

       let form = {
           sta_id: req.user.id,
           type_no: 1,
           created: new Date(),
           comment: req.body.comment
       }
       let query = 'insert into form ( sta_id, type_no, created, comment ) values(?,?,?,?)';
        db.query(query, [ form.sta_id, form.type_no, form.created, form.comment ], (err, form) => {
           if(err) {
               console.log('Could not add new form !!! => ' + err);
           } else {
               req.flash('success_msg', 'فرم با موفقیت اضافه شد.');
               res.redirect('/add-requirement-form-row/:' + form.insertId);
           }
        });
    });

    // **************** Add Requirement Form Row ****************
    app.get('/add-requirement-form-row/:id', isLoggedIn,(req, res) => {
        let formId = req.params.id;
        formId = formId.slice(1);

        let query = 'select * from form where form.id = ?';
        db.query(query, [formId], (err, forms) => {
            if(err) throw err;
            if(req.user.post_no === 2 && forms[0].sta_id === req.user.id) {
                let rowArr = [];

                let query = 'select * from row join good on row.good_id = good.id where form_id = ?';
                db.query(query, [formId], (err, rows) => {
                    if(err) throw err;
                    rows.forEach(row => {
                        rowArr.push(row);
                    });
                    res.render('add-requirement-form-row', { errors:null, rows: rowArr, formID: formId });
                });
            } else {
                res.render('denied-access');
            }
        });
    });
    app.post('/add-requirement-form-row/:id', isLoggedIn,(req, res) => {
        let formId = req.params.id;
        formId = formId.slice(1);

        req.checkBody('id', 'کد جنس الزامی است!').notEmpty();
        req.checkBody('no', 'تعداد الزامی است!').notEmpty();

        if(req.body.explanation === "") {
            req.body.explanation = null;
        }

        let errors = req.validationErrors();

        if(errors) {
            res.render('add-requirement-form-row', { errors: errors });
        } else {
            let row = {
                form_id: formId,
                good_id: req.body.id,
                no: req.body.no,
                explanation: req.body.explanation
            }

            let query = 'insert into row ( form_id, good_id, no, explanation ) values(?,?,?,?)';
            db.query(query, [ row.form_id, row.good_id, row.no, row.explanation ], (err) => {
                if(err) {
                    console.log('Could not add new row !!! => ' + err);
                    req.flash('error_msg', 'خطا در افزودن اطلاعات! لطفا اطلاعات ورودی را بررسی کنید.');
                    res.redirect('/add-requirement-form-row/:' + formId);
                } else {
                    req.flash('success_msg', 'ردیف جدید با موفقیت اضافه شد.');
                    res.redirect('/add-requirement-form-row/:' + formId);
                }
            });
        }
    });


    // /\/\/\/\/\/\/\/\/\/\/\/\/\ END OF WAREHOUSE KEEPER SECTION /\/\/\/\/\/\/\/\/\/\/\/\/\

    // /\/\/\/\/\/\/\/\/\/\/\/\/\ Planning Unit SECTION /\/\/\/\/\/\/\/\/\/\/\/\/\

    // **************** Company Management ****************
    app.get('/company-management', isLoggedIn, (req, res) => {
        if(req.user.post_no === 4) {
            let companyArr = [];

            let query = 'select * from company';
            db.query(query, (err, companies) => {
                if(err) throw err;
                companies.forEach( company => {
                    companyArr.push(company);
                });
                res.render('company-management', { companies: companyArr });
            });
        } else {
            res.render('denied-access');
        }
    });

    // **************** Add Company ****************
    app.get('/add-company', isLoggedIn, (req, res) => {
        if(req.user.post_no === 4) {
            res.render('add-company', { errors: null });
        } else {
            res.render('denied-access');
        }
    });
    app.post('/add-company', isLoggedIn, (req, res) => {
        req.checkBody('name', 'نام الزامی است!').notEmpty();
        req.checkBody('phone', 'شماره تلفن الزامی است!').notEmpty();
        req.checkBody('phone', 'شماره تلفن ناصحیح است!').isNumeric();
        req.checkBody('phone', 'شماره تلفن باید فقط شامل اعداد صحیح باشد!').isInt();
        req.checkBody('email', 'ایمیل الزامی است!').notEmpty();
        req.checkBody('email', 'ایمیل ناصیحیح است!').isEmail();
        req.checkBody('address', 'آدرس الزامی است!').notEmpty();

        let errors = req.validationErrors();

        if(errors) {
            res.render('add-company', { errors: errors });
        } else {
            let company = {
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address
            }

            let query = 'insert into company ( name, phone, email, address) values (?,?,?,?)';
            db.query(query, [ company.name, company.phone, company.email, company.address ], (err, company) => {
                if(err) {
                    console.log('Could not add new company!!! => ' + err);
                } else {
                    let query = 'insert into staff_company ( staff_id, company_id ) values (?,?)';
                    db.query(query, [req.user.id, company.insertId]);

                    console.log('New company added successfully ...');
                    req.flash('success_msg', 'شرکت جدید اضافه شد.');
                    res.redirect('/company-management');
                }
            });
        }
    });

    // **************** Edit Company ****************
    app.get('/edit-company/:id', isLoggedIn, (req, res) => {
        if(req.user.post_no === 4) {
            let id = req.params.id;
            id = id.slice(1);

            let query = 'select * from company where id = ?';
            db.query(query, [id], (err, company) => {
                if(err) throw err;

                res.render('edit-company', { company: company[0], errors: null });
            });
        } else {
            res.render('denied-access');
        }
    });
    app.post('/edit-company/:id', isLoggedIn, (req, res) => {
        let id = req.params.id;
        id = id.slice(1);

        req.checkBody('name', 'نام الزامی است!').notEmpty();
        req.checkBody('phone', 'شماره تلفن الزامی است!').notEmpty();
        req.checkBody('phone', 'شماره تلفن ناصحیح است!').isNumeric();
        req.checkBody('phone', 'شماره تلفن باید فقط شامل اعداد صحیح باشد!').isInt();
        req.checkBody('email', 'ایمیل الزامی است!').notEmpty();
        req.checkBody('email', 'ایمیل ناصیحیح است!').isEmail();
        req.checkBody('address', 'آدرس الزامی است!').notEmpty();

        let errors = req.validationErrors();

        if(errors) {
            res.render('edit-company', { errors: errors });
        } else {
            let updatedCompany = {
                id: id,
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address
            }

            let query = 'update company set name = ?, phone = ?, email = ?, address = ? where id = ?';
            db.query(query, [
                updatedCompany.name,
                updatedCompany.phone,
                updatedCompany.email,
                updatedCompany.address,
                updatedCompany.id ], (err) => {
                if(err) {
                    console.log('Could not update company!!! => ' + err);
                } else {
                    let query = 'insert into staff_company ( staff_id, company_id ) values (?,?)';
                    db.query(query, [req.user.id, updatedCompany.id], err => {
                        if(err) {
                            console.log('Updated company successfully ...');
                            req.flash('success_msg', 'شرکت با موفقیت اصلاح شد.');
                            res.redirect('/company-management');
                        }
                    });
                }
            });
        }
    });

    // **************** Purchase Query Management ****************
    app.get('/purchase-query-management', isLoggedIn,(req, res) => {
        if(req.user.post_no === 4) {
            let formArr = [];
            let decoratedDate = [];
            // and form.id != purchase_query.id
            let query = 'select *, form.id as form_id, form.sta_id as form_sta_id from form join staff on form.sta_id = staff.id where finished_no = 2 and form.type_no = 1';
            db.query(query, (err, forms) => {
                if (err) throw err;
                forms.forEach(form => {
                    formArr.push(form);

                    let createdDate = {
                        year: form.created.getFullYear(),
                        month: form.created.getMonth() + 1,
                        day: form.created.getDate(),
                    }

                    let createdJalaaliDate = jalaali.toJalaali(createdDate.year, createdDate.month, createdDate.day);
                    let designedDate = createdJalaaliDate.jy + '/' + createdJalaaliDate.jm + '/' + createdJalaaliDate.jd;

                    decoratedDate.push(designedDate);
                });

                res.render('purchase-query-management', {errors: null, forms: formArr, createdJalaali: decoratedDate});
            });
        } else {
            res.render('denied-access');
        }
    });

    // **************** Purchase Query Form ****************
    app.get('/purchase-query-form/:id', isLoggedIn, (req, res) => {
        if(req.user.post_no === 4) {
            let formId = req.params.id.slice(1);
            let decoratedDate;
            let companyArr = [];

            let query = 'select * from form where id = ?';
            db.query(query, [formId], (err, form) => {
                if(err) throw err;

                let currentDate = {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth()+1,
                    day: new Date().getDate(),
                }

                let currentJalaaliDate = jalaali.toJalaali(currentDate.year, currentDate.month, currentDate.day);
                decoratedDate = currentJalaaliDate.jy + '/' + currentJalaaliDate.jm + '/' + currentJalaaliDate.jd;

                db.query('select * from company', ( err, companies ) => {
                    if(err) throw err;

                    let query = 'select * from row join good on row.good_id = good.id where row.form_id = ?';
                    db.query(query, [formId], (err, rows) => {
                        if(err) throw err;

                        res.render('purchase-query-form', {
                            errors: null,
                            form: form[0],
                            currentJalaaliDate: decoratedDate,
                            companies: companies,
                            rows: rows
                        });
                    });
                });
            });
        } else {
            res.render('denied-access');
        }
    });
    app.post('/purchase-query-form/:id', isLoggedIn, (req, res) => {
        req.checkBody('urgency', 'اولویت الزامی است!').notEmpty();
        req.checkBody('need_date', 'تاریخ نیاز الزامی است!').notEmpty();

        if(req.checkBody(req.body.com_id).isEmpty()) {
            req.body.com_id = null;
        } else {
            req.body.com_id = Number(req.body.com_id);
        }

        let errors = req.validationErrors();

        if(errors) {
            res.render('purchase-query-form', { errors: errors });
        } else {
            let form_id = req.params.id.slice(1);

            let needDate = req.body.need_date;
            let fetchingDate = {
                year: needDate.slice(0, 4),
                month: needDate.slice(5, 7),
                date: needDate.slice(8)
            }
            let needDateToGre = jalaali.toGregorian(
                fetchingDate.year,
                fetchingDate.month,
                fetchingDate.date
            )

            let purchase_query = {
                id: form_id,
                urgency: Number(req.body.urgency),
                need_date: Number(needDate.gy) + '-' + Number(needDate.gm) + '-' + Number(needDate.gd)
            }

            let query = 'insert into purchase_query ( id, urgency, need_date ) values (?,?,?)';
            db.query(query, [purchase_query.id, purchase_query.urgency, purchase_query.need_date], (err, result) => {
                if(err) {
                    req.flash('error_msg', 'درخواست خرید برای این کالا قبلا ثبت شده!');
                    res.redirect('/purchase-query-management');
                }

                let form = {
                    sta_id: req.user.id,
                    com_id: req.body.com_id,
                    type_no: 2,
                    created: new Date(),
                    comment: req.body.comment
                }

                let query = 'insert into form ( sta_id, com_id, type_no, created, comment ) values (?,?,?,?,?)';
                db.query(query, [ form.sta_id, form.com_id, form.type_no, form.created, form.comment ], (err) => {
                    if(err) throw err;

                    req.flash('success_msg', 'درخواست خرید با موفقیت ثبت شد.');
                    res.redirect('/purchase-query-management');
                });


            });
        }
    });

    // /\/\/\/\/\/\/\/\/\/\/\/\/\ END OF Planning Unit SECTION /\/\/\/\/\/\/\/\/\/\/\/\/\

    app.get('/logout', (req, res) => {
        req.logOut();
        res.redirect('/login');
    });
}

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    } else {
        req.flash('error_msg', 'لطفا ابتدا وارد پنل کاربری خود شوید!');
        res.redirect('/login');
    }
}