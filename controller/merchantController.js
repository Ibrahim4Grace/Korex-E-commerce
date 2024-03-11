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


// // Define multer storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Validate file type (e.g., allow only images)
//         if (!file.mimetype.startsWith('image')) {
//             return cb(new Error('Only images are allowed'));
//         }
//         cb(null, './public/merchantImage/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now())
//     }
// });

// // Initialize multer middleware
// const upload = multer({ storage: storage });

const welcomeMerchant = (req, res) => {
    res.render('merchant/index');
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



module.exports = ({ welcomeMerchant,merchantProducts,merchantOrders,merchantReviews,merchantCustomerMsg,merchantSettings});
