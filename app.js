const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/errorController');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("5f6a7c163a89fcd5408bbf0e")
        .then(user => {
            if (!user) {
                //req.user = new User('adriano', 'adriano@teste', {items: []}, "5baa2528563f16379fc8a610");
            } else {
                req.user = new User(user.name, user.email, user.cart, user._id);
            }
            next();
        })
        .catch(err => console.log(err)); 
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
    app.listen(3000, 
        () => console.log(`Listen at http://localhost:3000/`));
});


