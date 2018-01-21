const mysql = require('mysql');
// const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'warehouse-application'
});

module.exports = db;

// const admin = {
//     first_name: 'راهبر',
//     last_name: 'راهبر',
//     national_code: '0123456789',
//     post: 'راهبر',
//     password: bcrypt.hashSync('admin', 10),
//     sta_id: 1
// }
//
// let query = 'insert into staff ( first_name, last_name, national_code, post, password, sta_id ) values ( ?, ?, ?, ?, ?, ?)';
// db.query(query, [ admin.first_name, admin.last_name, admin.national_code, admin.post, admin.password, admin.sta_id ]);