const mysql = require('mysql');
// const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync(10);

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'warehouse-application'
});

module.exports = db;

// const admin = {
//     first_name: 'راهبر',
//     last_name: 'راهبر',
//     post: 'راهبر',
//     password: bcrypt.hashSync('admin', salt),
//     sta_id: 1
// }
//
// let query = 'insert into staff ( first_name, last_name, post, password, sta_id ) values ( ?, ?, ?, ?, ?)';
// db.query(query, [ admin.first_name, admin.last_name, admin.post, admin.password, admin.sta_id ]);