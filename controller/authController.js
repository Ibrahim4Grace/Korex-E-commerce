'use strict';
const express = require(`express`)
const nodemailer = require(`nodemailer`);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');  
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const passport = require('../config/passportAuth')();
const User = require('../models/User');
const Merchant = require('../models/merchant');
const userSchema = require('../middleware/userValidation');
const merchantSchema = require('../middleware/merchantValidation');
const {userRegistrationMsg,verifyEmailMsg,requestVerificationMsg,forgetPasswordMsg,resetPasswordMsg} = require('../services/userAuthMsgMailer');
const {merchantRegistrationMsg,merchantVerifyEmailMsg,merchantRequestVerifyMsg,merchantForgetPswdMsg,merchantResetPswdMsg} = require('../services/merchantAuthMsgMailer');

 //Login attempts Limit 
const MAX_FAILED_ATTEMPTS = process.env.MAX_FAILED_ATTEMPTS;

// // Define multer storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Validate file type (e.g., allow only images)
//         if (!file.mimetype.startsWith('image')) {
//             return cb(new Error('Only images are allowed'));
//         }
//         cb(null, './public/customerImage/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now())
//     }
// });

// // Initialize multer middleware
// const upload = multer({ storage: storage });


// Registration attempt
const registerUser = (req, res) => {
    res.render('auth/register')
};

const registerUserPost = async (req, res) => {
    try {

        // Validate user input against Joi schema
        const userResult = await userSchema.validateAsync(req.body, {abortEarly: false});

        // Check if user with the same email or username already exists
        const userExists = await User.findOne({
            $or: [
                { customerEmail: userResult.customerEmail },
                { customerUsername: userResult.customerUsername }
            ]
        });
        console.log('user found in db:', userExists)
        if (userExists) {
            if (userExists.customerEmail === userResult.customerEmail) {
                return res.status(409).json({ success: false, errors: [{ msg: 'Email already registered' }] });
            }
            if (userExists.customerUsername === userResult.customerUsername) {
                return res.status(409).json({ success: false, errors: [{ msg: 'Username already registered' }] });
            }
        }

        // If validation passes and user does not exist, proceed with registration
        const hashedPassword = await bcrypt.hash(userResult.customerPassword, 10);
        // Generate a unique verification token
        const verificationToken = {
            token: crypto.randomBytes(20).toString('hex'),
            expires: new Date(Date.now() + (20 * 60 * 1000)) // 20 minutes expiration
        };
        
        // Save the user data to the database
        const newUser = new User({
            customerFirstName: userResult.customerFirstName,
            customerLastName: userResult.customerLastName,
            customerEmail: userResult.customerEmail,
            customerUsername: userResult.customerUsername,
            customerAddress: userResult.customerAddress,
            customerCity: userResult.customerCity,
            customerState: userResult.customerState,
            customerCountry: userResult.customerCountry,
            customerDob: userResult.customerDob,
            customerNumber: userResult.customerNumber,
            customerPassword: hashedPassword,
            role: 'User', verificationToken: verificationToken,
            date_added: Date.now(),
        });
   
        await newUser.save();

        // Include the verification token in the email
        const hosting = process.env.BASE_URL || 'http://localhost:8080';
        const verificationLink = `${hosting}/verify-email/${encodeURIComponent(newUser.id)}/${encodeURIComponent(newUser.verificationToken.token)}`;
        
        // After successfully registering the user, call the email sending function
        await userRegistrationMsg(newUser,verificationLink);

        console.log('User registered successfully:', newUser);
        // Send success response to the client
        res.status(201).json({ success: true ,  message: 'Registeration successful please verify your email' });
    }  catch (error) {
        let errors; // Declare errors variable
        if (error.isJoi) {
            // Joi validation error
            errors = error.details.map(err => ({
                key: err.path[0],
                msg: err.message
            }));
            console.error('Joi validation error:', errors);
            return res.status(400).json({ success: false, errors });

        } else {
            // Other error occurred
            console.error('An error occurred while processing the request:', error);
            return res.status(500).json({ success: false, errors: [{ msg: 'An error occurred while processing your request.' }] });
        }
    }
};

const checkExistingUser = async (req, res) => {
    try {
        const { field, value } = req.query;
        let user;

        // Check if the field is either 'customerEmail' or 'customerUsername'
        if (field === 'customerEmail' || field === 'customerUsername') {
            user = await User.findOne({ [field]: value });
        } else {
            return res.status(400).json({ error: 'Invalid field parameter' });
        }

        if (user) {
            res.status(200).json({ exists: true, message: `${field} has already been registered, please use it to log in.` });
        } else {
            // If user doesn't exist, send a JSON response with exists: false
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking existing user:', error);
        res.status(500).json({ error: 'An error occurred while checking existing user' });
    }
};

// Verifify  Email Address
const verifyEmail = async (req, res) => {
    console.log('Verification Email Controller Method Called');
    const { id, token } = req.params;
    try {
     
        // Find the user by ID
        const user = await User.findById(id);
        // Check if user exists and if the verification token exists and matches
        if (!user || user.verificationToken.token !== token) {
            return res.status(400).render('auth/verification-failed', { message: 'Invalid verification link.' });
        }

         // Check if the token has already been used
        if (user.isVerified) {
            return res.status(400).render('auth/verification-failed', { message: 'Verification link has already been used. Please contact support if you have any issues.' });
        }

        // Check if the token has expired
        const expirationTime = user.verificationToken.expires;
        const currentTime = new Date();
        if (currentTime >= expirationTime) {
            console.log('Verification link has expired.');
            return res.status(400).render('auth/verification-failed', { message: 'Verification link has expired. Please request a new one.' });
        } 

        // Mark the user as verified
        user.isVerified = true;
        user.verificationToken = null; // Clear the verification token
        await user.save();

        // Email content for verified user
        await verifyEmailMsg(user);

        const successMessage = 'Email verified successfully. You can now log in.';
        return res.redirect(`/auth/login?successMessage=${encodeURIComponent(successMessage)}`);

    } catch (error) {
        // Handle database errors or other issues
        console.error('Error in verifyEmail:', error);
        return res.status(500).render('auth/requestVerification', { message: 'An error occurred during email verification. Please try again or contact support.' });
    }
};

//Request new verification  link 
const requestVerification = (req, res) =>{
    res.render('auth/requestVerification')
};

const requestVerificationPost = async (req, res) => {
    const { customerEmail } = req.body;

    try {
        const user = await User.findOne({ customerEmail: customerEmail });

        if (!user) {
            return res.status(400).json({ success: false, message: 'No user found with this email' });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified.' });
        }

          // Generate a new verification token
        const verificationToken = {
            token: crypto.randomBytes(20).toString('hex'),
            expires: new Date(Date.now() + (30 * 60 * 1000)) // 1hr expiration
        };

            // Save the verification token and expiration time to the user's document
        user.verificationToken = {
            token: verificationToken.token,
            expires: verificationToken.expires 
        };
        await user.save();

        // Send the new verification email
        const verificationLink = `${process.env.BASE_URL || 'http://localhost:8080'}/verify-email/${encodeURIComponent(user.id)}/${encodeURIComponent(user.verificationToken.token)}`;

           // Resend Email content to user
        await requestVerificationMsg(user,verificationLink);
        
        return res.status(200).json({ success: true, message: 'Verification email resent successfully. Please check your inbox.' });
    } catch (error) {
        console.error('Error in requestVerificationPost:', error);
        return res.status(500).json({ error: 'An error occurred during email verification. Please try again or contact support.' });
    }
};

//verification link expired
const verificationFailed = (req, res) =>{
    res.render('auth/verification-failed')
};

// Forget Password
const forgetPassword = (req, res) =>{
    const errorMessage = req.query.errorMessage;
    res.render('auth/forgetPassword', { errorMessage });
};

const forgetPasswordPost = async (req, res) => {
    const { customerEmail } = req.body;

    try {
        const user = await User.findOne({ customerEmail });
        if (!user) {
            // If email is not found, respond with a 404 status and message
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save();

        // Send the email with the reset link
        const resetLink = `${process.env.BASE_URL || 'http://localhost:8080'}/auth/resetPassword/${resetToken}`;

         // Send forget Email content to user
         await forgetPasswordMsg(user,resetLink);
        
        // Once email is sent successfully, respond with a 200 status and success message
        return res.status(200).json({ success: true, message: 'Password reset link sent successfully' });
    } catch (error) {
        console.log('Error in forgetPasswordPost:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

//  RESET PASSWORD SECTION
const resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    try {
        // Hash the reset token for comparison
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Find the user with the provided reset token and check if it's still valid
        const user = await User.findOne({
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: { $gt: Date.now() }, // Token not expired
        });

        // Check if the user exists
        if (!user) {
            // If the token is not found or has expired, redirect to expired password page
             return res.redirect('/auth/forgetPassword?errorMessage=Invalid or expired reset token');
        }

        res.render('auth/resetPassword');

    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};

const resetPasswordPost = async (req, res) => {
    const { customerPassword, confirmPassword } = req.body;
    const { resetToken } = req.params;
    console.log("my token", resetToken)

      if (customerPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Minimum passwords must be 6 character' });
    }

      if (customerPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    try {

         // Hash the reset token for comparison
         const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Find the user with the provided reset token and check if it's still valid
        const user = await User.findOne({
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(customerPassword, 10);

        // If password matches, update the password to the new one
        user.customerPassword = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

           // ResetPassword Email content to user
        await resetPasswordMsg(user);

        return res.status(200).json({ success: true, message: 'Password reset successfully please login' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while resetting the password' });
    }
};

//Google Auth sign in
const googleAuthController = (req, res)=>{
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res)
};

const googleAuthCallback = (req, res, next)=>{
    passport.authenticate("google",{
        successRedirect: "http://localhost:8080/user/index",
        failureRedirect: "http://localhost:8080/auth/login",
    })(req, res, next);
};

// User login
const loginUser = (req, res) =>{
    res.render('auth/login')
};

const userLoginPost = async (req, res) => {
    try {
        const { customerUsername, customerPassword } = req.body;
        console.log(req.body);

        // Find the user by their username
        const user = await User.findOne({ customerUsername });
          // const user = await User.findOne({ customerUsername, role: 'User' });

        if (!user) {
            // If merchant does not exist
            return res.status(401).json({ success: false, message: 'Invalid username provided' });
        }

        if (user.role !== 'User') {
            // If user role isnt merchant
            return res.status(403).json({ success: false, message: 'Access forbidden. Only user are allowed.' });
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(customerPassword, user.customerPassword);
        
        if (!passwordMatch) {
            // If passwords do not match, increment failed login attempts
            await User.updateOne({ customerUsername }, { $inc: { failedLoginAttempts: 1 } });

            // Check if the account should be locked
            const updatedUser = await User.findOne({ customerUsername });
            if (updatedUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                // Lock the account
                await User.updateOne({ customerUsername }, { $set: { accountLocked: true } });
                return res.status(403).json({ success: false, message: 'Account locked. Contact Korex for assistance or reset Password.' });
           
            } else {
                  // Redirect with error message for invalid password
                  return res.status(409).json({ success: false, message: 'Invalid Password 2 attenmpts left before access disabled.' });
            }
        }

        // Check if user is verified and account is not locked
        if (!user.isVerified) {
            return res.status(412).json({ success: false, message: 'Please verify your email before logging in.' });
        }

        if (user.accountLocked) {
            return res.status(423).json({ success: false, message: 'Account locked. Contact Korex for assistance.' });
        }

        // Successful login - reset failed login attempts
        await User.updateOne({ customerUsername }, { $set: { failedLoginAttempts: 0 } });

        // Generate an access token
        const accessToken = jwt.sign(
            { id: user._id, role: 'User' },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        );

        // Generate a refresh token
        const refreshToken = jwt.sign(
            { id: user._id, role: 'User' },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Output the generated tokens to the console
        console.log('Generated access token:', accessToken);
        console.log('Generated refresh token:', refreshToken);

        // Store the tokens in cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true, // Ensures the cookie is sent only over HTTPS
            sameSite: 'strict', // Prevents the cookie from being sent in cross-origin requests
            maxAge: 30 * 60 * 1000 // 30 minutes expiration
        });
    
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // Ensures the cookie is sent only over HTTPS
            sameSite: 'strict', // Prevents the cookie from being sent in cross-origin requests
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days expiration
        });

         // Redirect to the index page after successful login
         console.log('Login successful');

    } catch (error) {
         // If an error occurs during the login process, return a 500 error response
         console.error('Error during login:', error);
         return res.status(500).json({ success: false, message: 'Login failed' });
    }
};

                                            // MERCHANT CONTROLLER

// Merchant Registration
const merchantRegisteration = (req, res) => {
    res.render('auth/merchantRegistration')
};

const merchantRegisterationPost = async(req, res) =>{
    try {

        // Validate user input against Joi schema
        const merchantResult = await merchantSchema.validateAsync(req.body, {abortEarly: false});

        // Check if user with the same email or username already exists
        const merchantExists = await Merchant.findOne({
            $or: [
                { merchantEmail: merchantResult.merchantEmail },
                { merchantUsername: merchantResult.merchantUsername }
            ]
        });

        if (merchantExists) {
            if (merchantExists.merchantEmail === merchantResult.merchantEmail) {
                return res.status(409).json({ success: false, errors: [{ msg: 'Email already registered' }] });
            }
            if (merchantExists.merchantUsername === merchantResult.merchantUsername) {
                return res.status(409).json({ success: false, errors: [{ msg: 'Username already registered' }] });
            }
        }

        // If validation passes and user does not exist, proceed with registration
        const hashedPassword = await bcrypt.hash(merchantResult.merchantPassword, 10);
        // Generate a unique verification token
        const verificationToken = {
            token: crypto.randomBytes(20).toString('hex'),
            expires: new Date(Date.now() + (20 * 60 * 1000)) // 20 minutes expiration
        };
   
        
        // Save the user data to the database
        const newMerchant = new Merchant({
            merchantFirstName: merchantResult.merchantFirstName,
            merchantLastName: merchantResult.merchantLastName,
            merchantEmail: merchantResult.merchantEmail,
            merchantPhone: merchantResult.merchantPhone,
            merchantUsername: merchantResult.merchantUsername,
            merchantAddress: merchantResult.merchantAddress,
            merchantCity: merchantResult.merchantCity,
            merchantState: merchantResult.merchantState,
            merchantCountry: merchantResult.merchantCountry,
            merchantPassword: hashedPassword,
            role: 'Merchant', verificationToken: verificationToken,
            date_added: Date.now(),
        });
   
        await newMerchant.save();

        // Include the verification token in the email
        const hosting = process.env.BASE_URL || 'http://localhost:8080';
        const verificationLink = `${hosting}/verifyEmail/${encodeURIComponent(newMerchant.id)}/${encodeURIComponent(newMerchant.verificationToken.token)}`;
        
        // After successfully registering the user, call the email sending function
        await merchantRegistrationMsg(newMerchant,verificationLink);

        console.log('Merchant registered successfully:', newMerchant);
        // Send success response to the client
        res.status(201).json({ success: true ,  message: 'Registeration successful please verify your email' });
    }  catch (error) {
        let errors; // Declare errors variable
        if (error.isJoi) {
            // Joi validation error
            errors = error.details.map(err => ({
                key: err.path[0],
                msg: err.message
            }));
            console.error('Joi validation error:', errors);
            return res.status(400).json({ success: false, errors });

        } else {
            // Other error occurred
            console.error('An error occurred while processing the request:', error);
            return res.status(500).json({ success: false, errors: [{ msg: 'An error occurred while processing your request.' }] });
        }
    } 
};

//Aysnronous request to check the email and username
const checkExistingMerchant = async (req, res) => {
    try {
        const { field, value } = req.query;
        let merchant;

        // Check if the field is either 'merchantEmail' or 'merchantUsername'
        if (field === 'merchantEmail' || field === 'merchantUsername') {
            merchant = await Merchant.findOne({ [field]: value });
        } else {
            return res.status(400).json({ error: 'Invalid field parameter' });
        }

        if (merchant) {
            res.status(200).json({ exists: true, message: `${field} has already been registered, please use it to log in.` });
        } else {
            // If merchant doesn't exist, send a JSON response with exists: false
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking existing merchant:', error);
        res.status(500).json({ error: 'An error occurred while checking existing merchant' });
    }
};

//Verify email address
const merchantVerifyEmail =async (req, res) => {
    console.log(' Merchant Verification Email Controller Method Called');
    const { id, token } = req.params;
    try {
     
        // Find the merchant by ID
        const merchant = await Merchant.findById(id);
        if (!merchant || merchant.verificationToken.token !== token) {
            return res.status(400).render('auth/merchantVerificationFailed', { message: 'Invalid verification link.' });
        }

         // Check if the token has already been used
        if (merchant.isVerified) {
            return res.status(400).render('auth/merchantVerificationFailed', { message: 'Verification link has already been used. Please contact support if you have any issues.' });
        }

        // Check if the token has expired
        const expirationTime = merchant.verificationToken.expires;
        const currentTime = new Date();
        if (currentTime >= expirationTime) {
            console.log('Verification link has expired.');
            return res.status(400).render('auth/merchantVerificationFailed', { message: 'Verification link has expired. Please request a new one.' });
        } 

        // Mark the user as verified
        merchant.isVerified = true;
        merchant.verificationToken = null; // Clear the verification token
        await merchant.save();

        // Email content for verified user
        await merchantVerifyEmailMsg(merchant);

        const successMessage = 'Email verified successfully. You can now log in.';
        return res.redirect(`/auth/merchantLogin?successMessage=${encodeURIComponent(successMessage)}`);

    } catch (error) {
        // Handle database errors or other issues
        console.error('Error in verifyEmail:', error);
        return res.status(500).render('auth/merchantrequestVerifyLink', { message: 'An error occurred during email verification. Please try again or contact support.' });
    }
};

//Request new verification  link 
const merchantRequestVerification = (req, res) =>{
    res.render('auth/merchantrequestVerifyLink')
};

const merchantRequestVerificationPost = async (req, res) => {
    const { merchantEmail } = req.body;

    try {
        const merchant = await Merchant.findOne({ merchantEmail: merchantEmail });

        if (!merchant) {
            return res.status(400).json({ success: false, message: 'No merchant found with this email' });
        }

        // Check if the user is already verified
        if (merchant.isVerified) {
            return res.status(400).json({ success: false, message: 'Merchant Email is already verified.' });
        }

          // Generate a new verification token
        const verificationToken = {
            token: crypto.randomBytes(20).toString('hex'),
            expires: new Date(Date.now() + (30 * 60 * 1000)) // 30 expiration
        };

            // Save the verification token and expiration time to the merchant's document
        merchant.verificationToken = {
            token: verificationToken.token,
            expires: verificationToken.expires 
        };
        await merchant.save();

        // Send the new verification email
        const verificationLink = `${process.env.BASE_URL || 'http://localhost:8080'}/verifyEmail/${encodeURIComponent(merchant.id)}/${encodeURIComponent(merchant.verificationToken.token)}`;

           // Resend Email content to user
        await merchantRequestVerifyMsg(merchant,verificationLink);
        
        return res.status(200).json({ success: true, message: 'Verification email resent successfully. Please check your inbox.' });
    } catch (error) {
        console.error('Error in requestVerificationPost:', error);
        return res.status(500).json({ error: 'An error occurred during email verification. Please try again or contact support.' });
    }
};

//verification link expired
const merchantVerificationFailed = (req, res) =>{
    res.render('auth/merchantVerificationFailed')
};

// Merchant Forget Password
const merchantForgetPassword = (req, res) =>{
    const errorMessage = req.query.errorMessage;
    res.render('auth/merchantForgetPassword', { errorMessage });
};

const merchantForgetPasswordPost = async (req, res) => {
    const { merchantEmail } = req.body;

    try {
        const merchant = await Merchant.findOne({ merchantEmail });
        if (!merchant) {
            return res.status(404).json({ success: false, message: 'Merchant Email not found' });
        }

        const resetToken = merchant.getResetPasswordTokens();
        await merchant.save();

        // Send the email with the reset link
        const resetLink = `${process.env.BASE_URL || 'http://localhost:8080'}/auth/merchantResetPassword/${resetToken}`;

         // Send forget Email content to merchant Email
         await merchantForgetPswdMsg(merchant,resetLink);
        
        // Once email is sent successfully, respond with a 200 status and success message
        return res.status(200).json({ success: true, message: 'Password reset link sent successfully' });
    } catch (error) {
        console.log('Error in forgetPasswordPost:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

//   MERCHANT RESET PASSWORD SECTION
const merchantResetPassword = async (req, res) => {
    const { resetToken } = req.params;
    try {
        // Hash the reset token for comparison
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Find the user with the provided reset token and check if it's still valid
        const merchant = await Merchant.findOne({
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: { $gt: Date.now() }, // Token not expired
        });

        // Check if the merchant exists
        if (!merchant) {
            // If the token is not found or has expired, redirect to expired password page
             return res.redirect('/auth/merchantForgetPassword?errorMessage=Invalid or expired reset token');
        }

        res.render('auth/merchantResetPassword');

    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
    }
};

const merchantResetPasswordPost = async (req, res) => {
    const { merchantPassword, confirmMerchantPassword } = req.body;
    const { resetToken } = req.params;
    console.log("my token", resetToken)

      if (merchantPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Minimum passwords must be 6 character' });
    }

      if (merchantPassword !== confirmMerchantPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    try {

         // Hash the reset token for comparison
         const hashedRresetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Find the user with the provided reset token and check if it's still valid
        const merchant = await Merchant.findOne({
            resetPasswordToken: hashedRresetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(merchantPassword, 10);

        // If password matches, update the password to the new one
        merchant.merchantPassword = hashedPassword;
        merchant.resetPasswordToken = null;
        merchant.resetPasswordExpires = null;
        await merchant.save();

           // ResetPassword Email content to user
        await merchantResetPswdMsg(merchant);

        return res.status(200).json({ success: true, message: 'Password reset successfully please login' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while resetting the password' });
    }
};

// Merchant login Page
const merchantLogin = (req, res) =>{
    res.render('auth/merchantLogin')
};

const merchantLoginPost = async (req, res) => {
    try {
        const { merchantUsername, merchantPassword } = req.body;
        console.log(req.body);

        // Find the user by their username
        const merchant = await Merchant.findOne({ merchantUsername });
        // const merchant = await Merchant.findOne({ merchantUsername, role: 'Merchant' });

        if (!merchant) {
            // If merchant does not exist
            return res.status(401).json({ success: false, message: 'Invalid merchant username provided' });
        }

        if (merchant.role !== 'Merchant') {
           // If merchant role isnt merchant
           return res.status(403).json({ success: false, message: 'Access forbidden. Only merchants are allowed.' });
       }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(merchantPassword, merchant.merchantPassword);
        
        if (!passwordMatch) {
            // If passwords do not match, increment failed login attempts
            await Merchant.updateOne({ merchantUsername }, { $inc: { failedLoginAttempts: 1 } });

            // Check if the account should be locked
            const updatedMerchant = await Merchant.findOne({ merchantUsername });
            if (updatedMerchant.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
                // Lock the account
                await Merchant.updateOne({ merchantUsername }, { $set: { accountLocked: true } });
                return res.status(403).json({ success: false, message: 'Account locked. Contact Korex for assistance or reset Password.' });
            } else {
                // Redirect with error message for invalid password
                return res.status(409).json({ success: false, message: 'Invalid Password 2 attenmpts left before access disabled.' });
            }
        }

        // Check if merchant is verified and account is not locked
        if (!merchant.isVerified) {
            return res.status(412).json({ success: false, message: 'Please verify your email before logging in.' });
        }

        if (merchant.accountLocked) {
            return res.status(423).json({ success: false, message: 'Account locked. Contact Korex for assistance.' });
        }

        // Successful login - reset failed login attempts
        await Merchant.updateOne({ merchantUsername }, { $set: { failedLoginAttempts: 0 } });

        // Generate an access token
        const accessToken = jwt.sign(
            { id: merchant._id, role: 'Merchant' },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRATION_TIME }
        );

        // Generate a refresh token
        const refreshToken = jwt.sign(
            { id: merchant._id, role: 'Merchant' },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME }
        );

        // Output the generated tokens to the console
        console.log('Generated access token:', accessToken);
        console.log('Generated refresh token:', refreshToken);

        // Store the tokens in cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true, // Ensures the cookie is sent only over HTTPS
            sameSite: 'strict', // Prevents the cookie from being sent in cross-origin requests
            maxAge: 30 * 60 * 1000 // 30 minutes expiration
        });
    
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // Ensures the cookie is sent only over HTTPS
            sameSite: 'strict', // Prevents the cookie from being sent in cross-origin requests
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days expiration
        });

        // Redirect to the index page after successful login
        console.log('Login successful');

    } catch (error) {
        // If an error occurs during the login process, return a 500 error response
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
};



module.exports = ({registerUser,registerUserPost,checkExistingUser,verifyEmail,requestVerification,requestVerificationPost,verificationFailed,forgetPassword,forgetPasswordPost,resetPassword,resetPasswordPost,googleAuthController,googleAuthCallback,loginUser,userLoginPost,merchantRegisteration,merchantRegisterationPost,checkExistingMerchant,merchantVerifyEmail,merchantRequestVerification,merchantRequestVerificationPost,merchantVerificationFailed,merchantForgetPassword,merchantForgetPasswordPost,merchantResetPassword,merchantResetPasswordPost,merchantLogin,merchantLoginPost});


