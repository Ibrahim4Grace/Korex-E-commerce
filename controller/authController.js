'use strict';
const express = require(`express`)
const nodemailer = require(`nodemailer`);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 



// Send email to the applicant
const transporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

const registerUser = async (req, res) => {
    res.render('user/register')
};

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
                data: fs.readFileSync(path.join(__dirname, '../public/userImage/' + req.file.filename)),
                contentType: 'image/png',
            },
        });

        await newUser.save();

        // Include the verification token in the email
        const hosting = process.env.BASE_URL || 'http://localhost:4040';
        const verificationLink = `${hosting}/verify-email/${encodeURIComponent(newUser.id)}/${encodeURIComponent(newUser.verificationToken)}`;

        // Email content for unverified user
        const unverifiedMsg = `
        <p><img src="cid:shipping" alt="shipping" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
        <p>Dear ${senderName}, welcome to Korex Logistic Service.</p>
        <p>Please click <a href="${verificationLink}">here</a> to verify your email address.</p>
        <p>If you didn't register, please ignore this email.</p>
        <p>Best regards, <br> The Korex Logistic Team</p>`;


        const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: senderEmail,
        subject: 'Welcome to Korex Logistic Company!',
        html: unverifiedMsg,
        attachments: [
            {
                filename: 'shipping.jpg',
                path: './public/img/shipping.jpg',
                cid: 'shipping'
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
        res.redirect('/registration/login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while processing your request.');
        res.redirect('/registration/register');
    } 

    res.render('user/register')
};

const loginUser = async (req, res) => {
    
}




module.exports = ({registerUser,registerUserPost,loginUser  });
