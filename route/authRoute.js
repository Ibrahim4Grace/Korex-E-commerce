'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');

const {registerUser,registerUserPost,loginUser } = require('../controller/authController');


// Registration route
router.get('/register', registerUser);
router.post('/registerUserPost', registerUserPost)
// Login route
router.post('/login', loginUser);

// router.get('/', checkNotAuthenticated, spinner, indexPage);
// router.get('/index', checkNotAuthenticated, indexPage);
// router.get('/detail', checkNotAuthenticated, detailsPage);
// router.get('/shop', checkNotAuthenticated, shopPage)
// router.get('/contact', checkNotAuthenticated, contactPage)
// router.post('/contact', checkNotAuthenticated, contactPagePost)
// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)



module.exports = router;
