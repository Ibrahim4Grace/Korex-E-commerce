'use strict';
const express = require('express');
const router = express.Router();
const  {verifyAccessToken,  verifyRefreshToken}  = require ('../middleware/authMiddleware');


const {registerUser,registerUserPost,verifyEmail,requestVerification,requestVerificationPost,verificationFailed,forgetPassword,forgetPasswordPost,resetPassword,resetPasswordPost,googleAuthController,googleAuthCallback,loginUser,loginUserPost,merchantLogin,merchantRegisteration,merchantRegisterationPost,merchantVerifyEmail,merchantRequestVerification,merchantRequestVerificationPost,merchantVerificationFailed} = require('../controller/authController');


// Registration route
router.get('/register', registerUser);
router.post('/registerUserPost', registerUserPost)

// Email verification routes
router.get('/verify-email/:id/:token',  verifyEmail);

// Request New  verification link
router.get('/requestVerification', requestVerification);
router.post('/requestVerificationPost', requestVerificationPost);
router.get('/verification-failed',  verificationFailed);

//forgetPassword Routes
router.get('/forgetPassword', forgetPassword);
router.post('/forgetPasswordPost', forgetPasswordPost);

//ResettingPassword Routes
router.get('/resetPassword/:resetToken', resetPassword);
router.post('/resetPasswordPost/:resetToken', resetPasswordPost);

//Google oAuth callback route
router.get('/auth/google', googleAuthController);
router.get('/google/callback', googleAuthCallback);

// User Login route with verifyAccessToken middleware
router.get('/login', loginUser);
router.post('/loginUserPost',  loginUserPost);

// Merchant Login route 
router.get('/merchantLogin', merchantLogin);

// Merchant Registeration route 
router.get('/merchantRegistration', merchantRegisteration);
router.post('/merchantRegistrationPost',  merchantRegisterationPost);

// Merchant Email verification routes
router.get('/verifyEmail/:id/:token',  merchantVerifyEmail);

// Merchant Request New  verification link
router.get('/requestVerification', merchantRequestVerification);
router.post('/requestVerificationPost', merchantRequestVerificationPost);
router.get('/merchantVerificationFailed',  merchantVerificationFailed);

// //logout route
// router.get("/logout", logoutUser);





module.exports = router;
