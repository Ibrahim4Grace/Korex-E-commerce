'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');

const {registerUser,upload,registerUserPost,verifyEmail,verificationFailed,resendVerificationEmail,forgetPassword,forgetPasswordPost,resettingPassword,resettingPasswordPost,loginUser,loginUserPost } = require('../controller/authController');


// Registration route
router.get('/register', registerUser);
router.post('/registerUserPost', upload.single('image'), registerUserPost)

// Email verification routes
router.get('/verify-email/:id/:token',  verifyEmail);
router.get('/verification-failed',  verificationFailed);
router.post('/resendVerificationEmail', resendVerificationEmail);


//forgetPassword Routes
router.get('/forgetPassword', forgetPassword);
router.post('/forgetPasswordPost', forgetPasswordPost);
router.get('/resettingPassword/:id/:token', resettingPassword);
router.post('/resettingPasswordPost', resettingPasswordPost);

// Login route
router.get('/login', loginUser);
router.post('/loginUserPost', loginUserPost);



// router.get('/', checkNotAuthenticated, spinner, indexPage);
// router.get('/index', checkNotAuthenticated, indexPage);
// router.get('/detail', checkNotAuthenticated, detailsPage);
// router.get('/shop', checkNotAuthenticated, shopPage)
// router.get('/contact', checkNotAuthenticated, contactPage)
// router.post('/contact', checkNotAuthenticated, contactPagePost)
// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)



module.exports = router;
