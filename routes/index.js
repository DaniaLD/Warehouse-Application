module.exports = (app, passport) => {
    app.get('/login', (req, res) => {
        res.render('login');
    })
}