'use strict';
const express = require('express');
const router = express.Router();
const  {verifyAccessToken,  verifyRefreshToken}  = require ('../middleware/authMiddleware');


const {registerUser,registerUserPost,verifyEmail,requestVerification,requestVerificationPost,verificationFailed,forgetPassword,forgetPasswordPost,resetPassword,resetPasswordPost,googleAuthController,googleAuthCallback,loginUser,loginUserPost, logoutUser } = require('../controller/authController');


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


// Login route with verifyAccessToken middleware
router.get('/login', loginUser);
router.post('/loginUserPost',  loginUserPost);

// //refresh route with verifyRefreshToken middleware
// router.post('/refresh-token', verifyRefreshToken, refreshToken);

// //logout route
// router.get("/logout", logoutUser);





module.exports = router;
