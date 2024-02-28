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
const userSchema = require('../middleware/userAuthValidation');
const resetPasswordSchema = require('../middleware/resetPwdAuthValidation');


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



const registerUser = async (req, res) => {
    res.render('user/register')
};

// Define multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Validate file type (e.g., allow only images)
        if (!file.mimetype.startsWith('image')) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, './public/customerImage/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now())
    }
});

// Initialize multer middleware
const upload = multer({ storage: storage });
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
        // console.log('userExists:', userExists);
        if (userExists) {
            if (userExists.customerEmail === userResult.customerEmail) {
                console.log('Email already registerede:', userExists.customerEmail);
                return res.status(409).json({ success: false, errors: [{ msg: 'Email already registered' }] });
            }
            if (userExists.customerUsername === userResult.customerUsername) {
                return res.status(409).json({ success: false, errors: [{ msg: 'Username already registered' }] });
            }
        }

        // If validation passes and user does not exist, proceed with registration
        const hashedPassword = await bcrypt.hash(userResult.customerPassword, 10);
        // Generate a unique verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

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
            role: 'User', // Assuming default role is 'User'
            verificationToken,
            date_added: Date.now(),
            // // Assuming req.file contains uploaded image information
            image: {
                data: fs.readFileSync(path.join(__dirname, '../public/customerImage/' + req.file.filename)),
                contentType: 'image/png',
            },
        });
        await newUser.save();
        

        // Include the verification token in the email
        const hosting = process.env.BASE_URL || 'http://localhost:8080';
        const verificationLink = `${hosting}/verify-email/${encodeURIComponent(newUser.id)}/${encodeURIComponent(newUser.verificationToken)}`;

        // Email content for unverified user
        const unverifiedMsg = `
            <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
            <p>Dear ${newUser.customerFirstName} ${newUser.customerLastName}, welcome to Korex StyleHub Service.</p>
            <p>Please click <a href="${verificationLink}">here</a> to verify your email address.</p>
            <p>If you didn't register, please ignore this email.</p>
            <p>Best regards, <br> The Korex StyleHub Team</p>`;

        // Configure email options
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: newUser.customerEmail,
            subject: 'Welcome to Korex StyleHub!',
            html: unverifiedMsg,
            attachments: [
                {
                    filename: 'companyLogo.jpg',
                    path: './public/img/companyLogo.jpg',
                    cid: 'companyLogo'
                }
            ]
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Email sending error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        console.log('User registered successfully:', newUser);
        // Send success response to the client
        res.status(201).json({ success: true ,  message: 'User registered successfully' });
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

// Verification endpoint
const verifyEmail = async (req, res) => {
    console.log('Verification Email Controller Method Called'); // Add this line
    const { id, token } = req.params;

    // Log the id parameter
    console.log('User ID:', id);
    console.log('Token:', token);

    try {
        // Find the user by ID and verification token
        console.log('User ID from URL:', id);
        const user = await User.findById(id);
        
        if (!user || user.verificationToken !== token) {
            // Invalid token or user not found
            return res.status(400).render('user/verification-failed', {
                errors: [{ msg: 'Invalid verification link. Please try again or contact support.' }],
            });
        }

         // Check if the token has already been used
        if (user.isVerified) {
            return res.status(400).render('user/verification-failed', {
                errors: [{ msg: 'Verification link has already been used. Please contact support if you have any issues.' }],
            });
        }

        // Check if the token has expired (1 hour expiration)
        const expirationTime = 60 * 60 * 1000; // 1 hour in milliseconds
        const currentTime = Date.now();
        const tokenCreationTime = user.date_added || 0; // Use 0 if date_added not available

        if (currentTime - tokenCreationTime > expirationTime) {
            // Token has expired
            return res.status(400).render('user/verification-failed', {
                errors: [{ msg: 'Verification link has expired. Please request a new one.' }],
            });
        }
     

        // Mark the user as verified
        user.isVerified = true;
        user.verificationToken = undefined; // Clear the verification token
        await user.save();

          // Email content for verified user
          const verifiedMsg = `
          <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
          <p>Dear  ${user.customerFirstName} ${user.customerLastName} ,  We are thrilled to welcome you to Korex StyleHub Service. </p>
  
          <p>Here are some important details to get you started:</p>
          <ul>
              <li>Full Name: ${user.customerFirstName} ${user.customerLastName}</li>
              <li>Email Address: ${user.customerEmail}</li>
              <li>Phone Number: ${user.customerNumber}</li>
              <li>Username: ${user.customerUsername}</li>
              <li>Home Address: ${user.customerAddress}</li>
              <li>City: ${user.customerCity}</li>
              <li>State: ${user.customerState}</li>
          </ul>
  
          <p>Thank you for registering with Korex StyleHub! We are delighted to welcome you to our platform</p>
  
          <p>Your account has been successfully created, you can now explore all the features we have to offer.</p>
  
          <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>
  
          <p>Best regards,<br>
          The Korex StyleHub Team</p>`;

          // Send the second email for verified users
          const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: user.customerEmail,
            subject: 'Welcome to Korex StyleHub!',
            html: verifiedMsg,
            attachments: [
                {
                    filename: 'companyLogo.jpg',
                    path: './public/img/companyLogo.jpg',
                    cid: 'companyLogo'
                }
            ]
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.log('Email sending error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        req.flash('success_msg', "Registration Completed. Please Login");
        res.redirect('/user/login');
    } catch (error) {
        // Handle database errors or other issues
        console.error('Error in verifyEmail:', error);
        res.status(500).render('user/verification-failed', {
            errors: [{ msg: 'An error occurred during email verification. Please try again or contact support.' }],
        });
    }
};

//verification link expired
const verificationFailed = (req, res) =>{
    res.render('user/verification-failed')
};

const resendVerificationEmail = async (req, res) => {
    const { customerEmail } = req.body;

    try {
        const user = await User.findOne({ customerEmail: customerEmail });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Check if the user is already verified
          if (user.isVerified) {
            return res.status(400).render('user/login', {
                errors: [{ msg: 'User is already verified' }],
            });
        }

    
        // Generate a new verification token
        const newVerificationToken = crypto.randomBytes(20).toString('hex');

        // Update the user's verification token and save to the database
        user.verificationToken = newVerificationToken;
        user.isVerified = false; // Reset verification status
        await user.save();

        // Send the new verification email
        const verificationLink = `${process.env.BASE_URL || 'http://localhost:8080'}/verify-email/${encodeURIComponent(user.id)}/${encodeURIComponent(newVerificationToken)}`;
        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: user.customerEmail,
            subject: 'Verify Your Email - Korex StyleHub',
            html: `<p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
            <p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>
            <p>Best regards,<br>
            The Korex StyleHub Team</p>`,
            attachments: [
                {
                    filename: 'companyLogo.jpg',
                    path: './public/img/companyLogo.jpg',
                    cid: 'companyLogo'
                }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Email sending error:', error);
                req.flash('error_msg', 'Failed to resend verification email');
                return res.redirect('/user/verification-failed');
            } else {
                console.log('Email sent:', info.response);
                req.flash('success_msg', "Verification email resent successfully");
                return res.redirect('/user/login');
            }
        });
    } catch (error) {
        console.error('Error in resendVerificationEmail:', error);
        return res.status(500).json({ error: 'An error occurred during email verification. Please try again or contact support.' });
    }
   
};

// Forget Password
const forgetPassword = (req, res) =>{
    res.render('user/forgetPassword')
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

        const msg = `
            <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
            <p>Dear ${user.customerFirstName} ${user.customerLastName},</p>

            <p>We are writing to confirm your password recovery with Korex StyleHub.</p>
            <p>Reset your password here: <a href="${resetLink}">Click here to reset your password</a></p>

            <p>If you didn't request this verification, please ignore this email.</p>

            <p>If you encounter any issues or need further assistance, feel free to contact our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>

            <p>Warm regards,<br>
            Korex StyleHub</p>
        `;

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: user.customerEmail,
            subject: 'Recover your password with Korex StyleHub!',
            html: msg,
            attachments: [
                {
                    filename: 'companyLogo.jpg',
                    path: './public/img/companyLogo.jpg',
                    cid: 'companyLogo'
                }
            ]
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Email sending error:', error);
                return res.status(500).json({ success: false, errors: [{ msg: 'Error sending email' }] });
            } else {
                console.log('Email sent:', info.response);
            }
        });

        // Once email is sent successfully, respond with a 200 status and success message
        return res.status(200).json({ success: true, message: 'Password reset link sent successfully' });
    } catch (error) {
        console.log('Error in forgetPasswordPost:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};




const resetPassword = (req, res) => {
    res.render('resetPassword')
};

//  RESET PASSWORD SECTION
const resetPasswordPost = async (req, res) => {
    const {  newPassword,confirmPassword } = req.body;
    const {resetToken} = req.params // Retrieve reset token from route parameters
console.log("my token", resetToken)
    // Hash the reset token for comparison
    const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    try {
        // Find the user with the provided reset token and check if it's still valid
        const user = await User.findOne({
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid reset token' });
        }

        // // Check if the provided current password matches the password stored in the database
        // const isPasswordMatch = await bcrypt.compare(customerPassword, user.customerPassword);
        // if (!isPasswordMatch) {
        //     return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        // }

        // If password matches, update the password to the new one
        user.customerPassword = bcrypt.hashSync(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};





// const resetPasswordPost = async (req, res) => {
//     const { id, token, customerPassword, customerPassword1 } = req.body;
//     let user;  // Declare user variable outside the try block
//     // Check if the passwords match
//     if (customerPassword !== customerPassword1) {
//         return res.status(400).json({ success: false, error: 'Passwords do not match' });
//     }

//     // Check if the password meets the minimum length requirement
//     if (customerPassword.length < 6) {
//         return res.status(400).json({ success: false, error: 'Password should be at least 6 characters' });
//     }

//     try {
//         // Find user by ID
//         const user = await User.findById(id);
//         if (!user) {
//             return res.status(404).json({ success: false, error: 'User not found' });
//         }

//         // Verify the token
//         const secret = process.env.JWT_SECRET_RESETPWD + user.customerPassword;
//         let payload;
//         try {
//             payload = jwt.verify(token, secret);
//         } catch (error) {
//             return res.status(400).json({ success: false, error: 'Invalid or expired token' });
//         }

//         // Update user's password
//         const hashedPassword = await bcrypt.hash(customerPassword, 10);
//         user.customerPassword = hashedPassword;
//         await user.save();

//         // Send password change notification (email, etc.)
//         // Code for sending email...

//         // Send password change notification (email, etc.)
//         let msg = `<p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
//                  <p>Dear ${user.customerFirstName} ${user.customerLastName},</p>
//                  <p>We hope this message finds you well. We wanted to inform you about a recent update regarding your password.</p>
//                  <p>If you didn't make this change, kindly contact our department at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>
//                  <p>We appreciate your continued dedication and patronization to our StyleHub team. Thank you for choosing to be a part of Korex StyleHub...</p>
//                  <p>Best regards,<br>The Korex StyleHub Team </p>`;
        
//                 const mailOptions = {
//                     from: process.env.NODEMAILER_EMAIL,
//                     to: user.customerEmail,
//                     subject: 'Password Changed Confirmation',
//                     html: msg,
//                     attachments: [
//                         {
//                                         filename: 'companyLogo.jpg',
//                              path: './public/img/companyLogo.jpg',
//                        cid: 'companyLogo'
//                         }
//                     ]
//                 };
        
//                 transporter.sendMail(mailOptions, (error, info) => {
//                     if (error) {
//                         console.log('Email sending error:', error);
//                     } else {
//                         console.log('Email sent:', info.response);
//                     }
//                 });

//         return res.json({ success: true, message: 'Password Successfully Updated. Please Login' });
//     } catch (error) {
//         console.error('Error:', error.message);
//         return res.status(500).json({ success: false, error: 'An error occurred while processing your request.' });
//     }
// };



const passwordResetExpired = (req, res) =>{
    res.render('user/forgetPassword')
};

// User login
const loginUser = (req, res) =>{
    res.render('user/login')
};

// const loginUserPost = async (req, res) => {
//     try {
//         const { customerUsername, customerPassword } = req.body;

//         // Find the user by their username
//         const user = await User.findOne({ customerUsername });

//         if (!user) {
//             // return res.status(401).json({ error: 'Authentication failed' });
//             req.flash('error_msg', 'Invalid username provided');
//             return res.redirect('/user/login');
//         }

//         // Compare the provided password with the hashed password stored in the database
//         const passwordMatch = await bcrypt.compare(customerPassword, user.customerPassword);
        
//         if (!passwordMatch) {
//             // return res.status(401).json({ error: 'Authentication failed' });
//             req.flash('error_msg', 'Invalid password provided');
//             return res.redirect('/user/login');
//         }

//         // Generate an access token
//         const accessToken = jwt.sign(
//             { id: user._id, role: 'User' },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: '30m' }
//         );

//         // Generate a refresh token
//         const refreshToken = jwt.sign(
//             { id: user._id, role: 'User' },
//             process.env.REFRESH_TOKEN_SECRET,
//             { expiresIn: '7d' }
//         );

//         // Output the generated tokens to the console
//         console.log('Generated access token:', accessToken);
//         console.log('Generated refresh token:', refreshToken);

//         // Store the tokens in cookies
//         res.cookie('accessToken', accessToken, {
//             httpOnly: true,
//             secure: true, // Ensures the cookie is sent only over HTTPS
//             sameSite: 'strict', // Prevents the cookie from being sent in cross-origin requests
//             maxAge: 30 * 60 * 1000 // 30 minutes expiration
//         });
    
//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             secure: true, // Ensures the cookie is sent only over HTTPS
//             sameSite: 'strict', // Prevents the cookie from being sent in cross-origin requests
//             maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days expiration
//         });

//         // Send the tokens in the response
//         // res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
//         res.redirect('/users/index');

//     } catch (error) {
//         // If an error occurs during the login process, return a 500 error response
//         console.error('Error during login:', error);
//         res.status(500).json({ error: 'Login failed' });
//     }
// };

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



// const refreshToken = (req, res) => {
//     const accessToken = generateAccessToken({ userId: req.userId });
//     res.status(200).json({ accessToken });
// };

// function generateAccessToken(user){
//     return jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30m'})
// }


// function generateRefreshToken(user){
//     return jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, process.env.REFRESH_TOKEN_SECRET,{expiresIn:'30m'})//aday
// }

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


module.exports = ({registerUser,upload,registerUserPost,verifyEmail,resendVerificationEmail,verificationFailed,forgetPassword,forgetPasswordPost,resetPassword,resetPasswordPost,passwordResetExpired,loginUser,loginUserPost,logoutUser  });


