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
// const {userRegistrationMsg,verifyEmailMsg,requestVerificationMsg,forgetPasswordMsg,resetPasswordMsg} = require('../services/userAuthMsgMailer');



const welcomeMerchant = (req, res) => {
    // Pass the entire user object to the rendering of the template
    res.render('merchant/index', { user: req.user });
};


// Merchant Uploading Image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Validate file type (e.g., allow only images)
        if (!file.mimetype.startsWith('image')) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, './public/merchantImage/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now())
    }
});

// Initialize multer middleware
const upload = multer({ storage: storage });

const uploadMerchantImage = (req, res, next) =>{
 // Handle the uploaded file
 const file = req.file;
 // Save the file to your desired location or cloud storage
 // Respond to the client with any necessary data
 res.json({ message: 'File uploaded successfully' });
};


const merchantProducts = (req, res) => {
    res.render('merchant/products');
};

const merchantOrders = (req, res) => {
    res.render('merchant/orders');
};
const merchantReviews = (req, res) => {
    res.render('merchant/reviews');
};
const merchantCustomerMsg = (req, res) => {
    res.render('merchant/customerMsg');
};
const merchantSettings = (req, res) => {
    res.render('merchant/settings');
};


// Define the logout route
const merchantLogout = (req, res) => {
  // Clear cookies containing access token and refresh token
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  // Optionally, clear any session data or perform other cleanup tasks

  // Respond with a success message
  res.status(200).json({ success: true, message: 'Logout successful' });
};




module.exports = ({ welcomeMerchant,upload,uploadMerchantImage,merchantProducts,merchantOrders,merchantReviews,merchantCustomerMsg,merchantSettings,merchantLogout});
