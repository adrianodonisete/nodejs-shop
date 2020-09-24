const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const db = require('./util/dbConfig');

const errorController = require('./controllers/errorController');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("5f6d0e94976c332f7c519ffa")
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err)); 
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
    .connect(db.config, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(rs => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: "adriano",
                    email: "adriano@teste",
                    cart: { items: [] },
                });
                user.save();
            }
        });
        app.listen(3000, console.log(`Listen at http://localhost:3000/`));
    })
    .catch(err => console.log(err));
