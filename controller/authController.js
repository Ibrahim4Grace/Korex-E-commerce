'use strict';
const express = require(`express`)
const nodemailer = require(`nodemailer`);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');  
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const userSchema = require('../middleware/userValidation');
const {userRegistrationMsg,verifyEmailMsg,requestVerificationMsg,forgetPasswordMsg,resetPasswordMsg} = require('../services/authMessageMailer');

// Send email to the applicant
const transporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

const phoneNumber = process.env.COMPANY_NUMBER;
const emailAddress = process.env.COMPANY_EMAIL;

 //Login attempts Limit 
const MAX_FAILED_ATTEMPTS = process.env.MAX_FAILED_ATTEMPTS;


// Registration attempt
const registerUser = (req, res) => {
    res.render('user/register')
};

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

// Verifify  Email Address
const verifyEmail = async (req, res) => {
    console.log('Verification Email Controller Method Called');
    const { id, token } = req.params;
    try {
     
        // Find the user by ID
        const user = await User.findById(id);
        // Check if user exists and if the verification token exists and matches
        if (!user || user.verificationToken.token !== token) {
            return res.status(400).render('user/verification-failed', { message: 'Invalid verification link.' });
        }

         // Check if the token has already been used
        if (user.isVerified) {
            return res.status(400).render('user/verification-failed', { message: 'Verification link has already been used. Please contact support if you have any issues.' });
        }

        // Check if the token has expired
        const expirationTime = user.verificationToken.expires;
        const currentTime = new Date();
        if (currentTime >= expirationTime) {
            console.log('Verification link has expired.');
            return res.status(400).render('user/verification-failed', { message: 'Verification link has expired. Please request a new one.' });
        } 

        // Mark the user as verified
        user.isVerified = true;
        user.verificationToken = null; // Clear the verification token
        await user.save();

        // Email content for verified user
        await verifyEmailMsg(user);

        const successMessage = 'Email verified successfully. You can now log in.';
        return res.redirect(`/user/login?successMessage=${encodeURIComponent(successMessage)}`);

    } catch (error) {
        // Handle database errors or other issues
        console.error('Error in verifyEmail:', error);
        return res.status(500).render('user/requestVerification', { message: 'An error occurred during email verification. Please try again or contact support.' });
    }
};

//Request new verification  link 
const requestVerification = (req, res) =>{
    res.render('user/requestVerification')
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
    res.render('user/verification-failed')
};

// Forget Password
const forgetPassword = (req, res) =>{
    const errorMessage = req.query.errorMessage;
    res.render('user/forgetPassword', { errorMessage });
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
        const resetLink = `${process.env.BASE_URL || 'http://localhost:8080'}/user/resetPassword/${resetToken}`;

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
             return res.redirect('/user/forgetPassword?errorMessage=Invalid or expired reset token');
        }

        res.render('user/resetPassword');

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



// User login
const loginUser = (req, res) =>{
    res.render('user/login')
};


const loginUserPost = async (req, res) => {
    try {
        const { customerUsername, customerPassword } = req.body;

        // Find the user by their username
        const user = await User.findOne({ customerUsername });

        if (!user) {
             // return res.status(401).json({ error: 'Authentication failed' });
            // If user does not exist, redirect with error message
            req.flash('error_msg', 'Invalid username provided');
            return res.redirect('/user/login');
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
                req.flash('error_msg', 'Account locked. Contact Korex for assistance or reset Password.');
                return res.redirect('/user/login');
            } else {
                // Redirect with error message for invalid password
                req.flash('error_msg', 'Invalid Password 2 attenmpts left before access disabled.');
                return res.redirect('/user/login');
            }
        }

        // Check if user is verified and account is not locked
        if (!user.isVerified) {
            req.flash('error_msg', 'Please verify your email before logging in.');
            return res.redirect('/user/login');
        }

        if (user.accountLocked) {
            req.flash('error_msg', 'Account locked. Contact Korex for assistance.');
            return res.redirect('/user/login');
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
        res.redirect('/users/index');

    } catch (error) {
        // If an error occurs during the login process, return a 500 error response
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};


const logoutUser = async (req, res) => {
    try {
        if (!req.user) {
            console.log("Logout failed. User not authenticated.");
            return res.redirect("/login");
        }

        // Clear all cookies related to authentication
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        // Optionally, you may add token revocation logic here

        console.log("Logout successful!");
        res.redirect("/login");
    } catch (error) {
        console.error("Logout failed:", error);
        res.redirect("/home");
    }
};


module.exports = ({registerUser,registerUserPost,verifyEmail,requestVerification,requestVerificationPost,verificationFailed,forgetPassword,forgetPasswordPost,resetPassword,resetPasswordPost,loginUser,loginUserPost,logoutUser  });


