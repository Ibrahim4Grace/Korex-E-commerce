'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');
const  {verifyAccessToken,  verifyRefreshToken}  = require ('../middleware/authMiddleware');

const {registerUser,upload,registerUserPost,verifyEmail,requestVerification,requestVerificationPost,verificationFailed,forgetPassword,forgetPasswordPost,resetPassword,resetPasswordPost,passwordResetExpired,loginUser,loginUserPost, logoutUser } = require('../controller/authController');


// Registration route
router.get('/register', registerUser);
router.post('/registerUserPost', upload.single('image'), registerUserPost)

// Email verification routes
router.get('/verify-email/:id/:token',  verifyEmail);
router.get('/requestVerification', requestVerification);
router.post('/requestVerificationPost', requestVerificationPost);

router.get('/verification-failed',  verificationFailed);

//forgetPassword Routes
router.get('/forgetPassword', forgetPassword);
router.post('/forgetPasswordPost', forgetPasswordPost);
router.get('/resetPassword/:resetToken', resetPassword);
router.post('/resetPasswordPost/:resetToken', resetPasswordPost);


router.get('/passwordResetExpired', passwordResetExpired);


// Login route with verifyAccessToken middleware
router.get('/login', loginUser);
router.post('/loginUserPost',  loginUserPost);

// //refresh route with verifyRefreshToken middleware
// router.post('/refresh-token', verifyRefreshToken, refreshToken);

//logout route
router.get("/logout", logoutUser);


// router.get('/', checkNotAuthenticated, spinner, indexPage);
// router.get('/index', checkNotAuthenticated, indexPage);
// router.get('/detail', checkNotAuthenticated, detailsPage);
// router.get('/shop', checkNotAuthenticated, shopPage)
// router.get('/contact', checkNotAuthenticated, contactPage)
// router.post('/contact', checkNotAuthenticated, contactPagePost)
// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)



module.exports = router;
