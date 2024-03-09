'use strict';
const express = require('express');
const router = express.Router();
const  {verifyAccessToken,  verifyRefreshToken}  = require ('../middleware/authMiddleware');


const {registerUser,registerUserPost,checkExistingUser,verifyEmail,requestVerification,requestVerificationPost,verificationFailed,forgetPassword,forgetPasswordPost,resetPassword,resetPasswordPost,googleAuthController,googleAuthCallback,loginUser,userLoginPost,merchantRegisteration,merchantRegisterationPost,checkExistingMerchant,merchantVerifyEmail,merchantRequestVerification,merchantRequestVerificationPost,merchantVerificationFailed,merchantForgetPassword,merchantForgetPasswordPost,merchantResetPassword,merchantResetPasswordPost,merchantLogin,merchantLoginPost} = require('../controller/authController');

                                         // USER ROUTES
// Registration route
router.get('/register', registerUser);
router.post('/registerUserPost', registerUserPost)

// checkExistingUser route
router.get('/checkExistingUser', checkExistingUser);

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
router.post('/userLoginPost',  userLoginPost);

                                    // MERCHANT ROUTES

// Merchant Registeration route 
router.get('/merchantRegistration', merchantRegisteration);
router.post('/merchantRegistrationPost',  merchantRegisterationPost);

// checkExistingMerchant route
router.get('/checkExistingMerchant', checkExistingMerchant);

// Merchant Email verification routes
router.get('/verifyEmail/:id/:token',  merchantVerifyEmail);

// Merchant Request New  verification link
router.get('/merchantrequestVerifyLink', merchantRequestVerification);
router.post('/merchantRequestVerificationPost', merchantRequestVerificationPost);
router.get('/merchantVerificationFailed',  merchantVerificationFailed);

//Merchant forgetPassword Routes
router.get('/merchantForgetPassword', merchantForgetPassword);
router.post('/merchantForgetPasswordPost', merchantForgetPasswordPost);

//Merchant ResettingPassword Routes
router.get('/merchantResetPassword/:resetToken', merchantResetPassword);
router.post('/merchantResetPasswordPost/:resetToken', merchantResetPasswordPost);


// Merchant Login route 
router.get('/merchantLogin', merchantLogin);
router.post('/merchantLoginPost',  merchantLoginPost);

// router.get("/logout", logoutUser);





module.exports = router;
