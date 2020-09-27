const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const db = require("./util/dbConfig");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require("./controllers/errorController");
const User = require("./models/user");

const app = express();
const store = new MongoDBStore({
    uri: db.config,
    collection: 'sessions'
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: '332f7c519ffa5f6d0e94976c',
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            req.isLoggedIn = req.session.isLoggedIn;
            next();
        })
        .catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

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
