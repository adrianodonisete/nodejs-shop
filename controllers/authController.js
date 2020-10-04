const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const helpMessage = req => {
    const message = req.flash('error');
    if (message.length > 0) {
        return message[0];
    } else {
        return null;
    }
};

exports.getLogin = (req, res, next) => {
    const message = helpMessage(req);
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
    });
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: helpMessage(req),
    });
};

exports.postLogin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
        });
    }

    req.session.isLoggedIn = true;
    req.session.user = req.user;
    return req.session.save(err => {
        res.redirect('/');
    });
};

exports.postSignup = (req, res, next) => {
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
        });
    }
    bcrypt
        .hash(password, 12)
        .then(haschedPassword => {
            const user = new User({
                email: email,
                password: haschedPassword,
                cart: { items: [] },
            });
            return user.save();
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};

exports.getReset = (req, res, next) => {
    const message = helpMessage(req);
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message,
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');

        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save().then(rs => {
                    const url = `http://localhost:3000/reset/${token}`;
                    req.flash('error', `Link: ${url}`);
                    return res.redirect('/reset');
                });
            })
            .catch(err => console.log(err));
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;

    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    })
        .then(user => {
            if (user) {
                const message = helpMessage(req);
                res.render('auth/new-password', {
                    path: '/new-password',
                    pageTitle: 'New Password',
                    errorMessage: message,
                    userId: user._id.toString(),
                    passwordToken: token,
                });
            } else {
                return res.redirect('/login');
            }
        })
        .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then(user => {
            if (user) {
                resetUser = user;
                return bcrypt
                    .hash(newPassword, 12)
                    .then(haschedPassword => {
                        resetUser.password = haschedPassword;
                        resetUser.resetToken = undefined;
                        resetUser.resetTokenExpiration = undefined;
                        return resetUser.save();
                    })
                    .then(() => {
                        res.redirect('/login');
                    });
            } else {
                return res.redirect('/login');
            }
        })
        .catch(err => console.log(err));
};
