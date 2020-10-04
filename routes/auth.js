const express = require('express');
const bcrypt = require('bcryptjs');
const { check, body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/authController');
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login',
    [
        body(
            'password',
            'Please enter a password with only numbers and text and min 5 an max 15 characters.'
        )
            .isLength({ min: 5, max: 15 })
            .isAlphanumeric(),
        check('email')
            .isEmail()
            .withMessage('Invalid email!')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(user => {
                    console.log(user);
                    if (!user) {
                        return Promise.reject('Invalid email or password1.');
                    } else {
                        return bcrypt
                            .compare(req.body.password, user.password)
                            .then(doMatch => {
                                if (!doMatch) {
                                    return Promise.reject(
                                        'Invalid email or password2.'
                                    );
                                }
                                req.user = user;
                                return true;
                            });
                    }
                });
            }),
    ],
    authController.postLogin
);

router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Invalid email!')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject(
                            'Email exists already, please pick a different one.'
                        );
                    }
                    return true;
                });
                // .catch(err => console.log(err));
            }),
        body(
            'password',
            'Please enter a password with only numbers and text and min 5 an max 15 characters.'
        )
            .isLength({ min: 5, max: 15 })
            .isAlphanumeric(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match!');
            }
            return true;
        }),
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
