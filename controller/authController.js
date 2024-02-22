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

    //CUSTOMER IMAGE FOLDER
    let storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/customerImage/')
        },
        filename: (req, file, cb) => {
            cb(null, file.fieldname + '_' + Date.now())
        }
  });
    
const upload = multer({ storage: storage });

const registerUserPost = async (req, res) => {
    const { customerFirstName, customerLastName, customerEmail, customerUsername, customerAddress, customerCity,customerState, customerCountry, customerDob, customerNumber, customerPassword,customerPassword1, role } = req.body;

    let errors = [];

    if ( !customerFirstName || !customerLastName || !customerEmail || !customerUsername || !customerAddress || !customerCity || !customerState || !customerCountry || !customerDob || !customerNumber || !customerPassword || !customerPassword1 || !role ) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (customerPassword !== customerPassword1) {
        errors.push({ msg: 'Password does not match' });
    }

    if (!customerPassword || customerPassword.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    try {

        const registeredAdminExists = await Admin.findOne({ $or: [{ adminEmail: customerEmail }, { adminUsername: customerUsername }] });

        if (registeredAdminExists) {
            if (registeredAdminExists.adminEmail === customerEmail) {
                errors.push({ msg: 'Email already registered' });
            }

            if (registeredAdminExists.adminUsername === customerUsername) {
                errors.push({ msg: 'Username already registered' });
            }
        }

        const registeredUserExists = await User.findOne({ $or: [{ customerEmail }, { customerUsername }]  });

        if (registeredUserExists) {
            if (registeredUserExists.customerEmail === customerEmail) {
                errors.push({ msg: 'Email already registered' });
            }

            if (registeredUserExists.customerUsername === customerUsername) {
                errors.push({ msg: 'Username already registered' });
            }
        }

        if (errors.length > 0) {
            return res.render('user/register', {
                errors, customerFirstName, customerLastName, customerEmail, customerUsername, customerAddress, customerCity,customerState, customerCountry, customerDob, customerNumber, customerPassword,customerPassword1, role 
            });
        }
           //Hash password
        const hashedPassword = await bcrypt.hash(customerPassword, 10);
        // Generate a unique verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const newUser = new User({
            customerFirstName, customerLastName, customerEmail, customerUsername, 
            customerAddress, customerCity,customerState, customerCountry, customerDob, 
            customerNumber, customerPassword:hashedPassword,role,
            verificationToken, // Add verification token to user data
            date_added: Date.now(), // Update the date_added field
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
        <p>Dear ${customerFirstName} ${customerLastName}, welcome to Korex StyleHub Service.</p>
        <p>Please click <a href="${verificationLink}">here</a> to verify your email address.</p>
        <p>If you didn't register, please ignore this email.</p>
        <p>Best regards, <br> The Korex StyleHub Team</p>`;


        const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: customerEmail,
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

       transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
       });
        req.flash('success_msg', 'Registration Successful. Confirm your email.');
        res.redirect('/user/login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while processing your request.');
        res.redirect('/user/register');
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
                instructions: 'If you did not receive the verification email or if your verification link has expired, you can request a new one by clicking on the button below:'
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
            req.flash('error_msg', 'User not found');
            return res.redirect('/user/login');
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(400).render('user/verification-failed', {
                errors: [{ msg: 'User is already verified' }],
            });
        }

        // Check if the verification token has expired (1 hour expiration)
        const expirationTime = 60 * 60 * 1000; // 1 hour in milliseconds
        const currentTime = Date.now();
        const tokenCreationTime = user.date_added || 0; // Use 0 if date_added not available

        if (currentTime - tokenCreationTime > expirationTime) {
            // Token has expired
            return res.status(400).render('user/verification-failed', {
                errors: [{ msg: 'Verification link has expired. Please request a new one.' }],
                instructions: 'If you did not receive the verification email or if your verification link has expired, you can request a new one by clicking on the button below:'
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

            <p>Dear ${user.customerFirstName} ${user.customerLastName},</p>

            <p>Thank you for registering with Korex StyleHub! We're excited to have you on board.</p>
            <p>In order to complete your registration and access all the features of our platform, please verify your email address by clicking the link below:</p>

            <p><a href="${verificationLink}">Verify Email Address</a></p>
            <p>If you didn't request this verification, please ignore this email.</p>

            <p>If you encounter any issues or need further assistance, feel free to contact our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>
            <p>Best regards,<br>The Korex StyleHub Team</p>`,
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
                return res.redirect('/user/login');
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

const forgetPasswordPost = async (req, res) =>{
    const {  customerEmail} = req.body;
    let errors = [];

        // Check required fields
        if ( !customerEmail  ) {
            req.flash('error', 'Please fill all fields');
            return res.redirect('user/forgetPassword');
        }
        try {
           // Check if the email is already registered in the User table
           const user = await User.findOne({ customerEmail:customerEmail });
           if (!user) {
            errors.push({ msg: 'Email not found' });
            res.render('user/forgetPassword', {
                errors,
                customerEmail   
            });
        } else {
                // Fetch the user's name
                const { customerFirstName,customerLastName } = user;
                const secret = process.env.JWT_SECRET + user.customerPassword;
                const payload = {
                    customerEmail: user.customerEmail,
                    id: user.id
                };
                const token = jwt.sign(payload, secret, { expiresIn: process.env.TOKEN_EXPIRATION_TIME });
                const link = `${process.env.BASE_URL || 'http://localhost:8080'}/user/resetPassword/${user.id}/${token}`;

                const msg =`
                <p><img src="cid:companyLogo" alt="companyLogo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
                <p>Dear ${customerFirstName} ${customerLastName},</p>

                <p> We are writing to confirm your password recovery with Korex StyleHub.</p>
                <p>Reset your password here: <a href="${link}">Click here to reset your password</a></p>

                <p>If you didn't request this verification, please ignore this email.</p>

                <p>If you encounter any issues or need further assistance, feel free to contact our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>

                <p>Warm regards,<br>
                Korex StyleHub</p>`;
  
                const mailOptions = {
                    from: process.env.NODEMAILER_EMAIL,
                    to: customerEmail,
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
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });
                req.flash('success_msg', 'Kindly check your email to reset your password.');
                res.redirect('/user/login'); 

            }
        }catch(err) {
            console.error('Error:', err.message);
            res.redirect('/user/forgetPassword'); 
        }
};


// User login
const loginUser = (req, res) =>{
    res.render('user/login')
};


const loginUserPost = async (req, res) => {
    try {
        const { customerUsername, customerPassword } = req.body;

        const user = await User.findOne({ customerUsername:customerUsername });
        if (!user) {
        return res.status(401).json({ error: 'Authentication faile' });
        }

        const passwordMatch = await bcrypt.compare(customerPassword, user.customerPassword);
        if (!passwordMatch) {
        return res.status(401).json({ error: 'Authentication failed' });
        }

        // const token = jwt.sign(userId: user._id ,  `${process.env.JWT_SECRET}`, {
        // expiresIn: '1h',
        // });

        // const token = jwt.sign( user, `${process.env.ACCESS_TOKEN_SECRET}`, {expiresIn: '1h', });

        //when user login, access token will have the user information storedin the session token
        const accessToken = jwt.sign( user, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).json({ accessToken:accessToken });

        } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    } 
}




module.exports = ({registerUser,upload,registerUserPost,verifyEmail,resendVerificationEmail,verificationFailed,forgetPassword,forgetPasswordPost,loginUser,loginUserPost  });
