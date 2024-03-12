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


const welcomeMerchant = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/index', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
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

const uploadMerchantImage = async (req, res, next) => {
    try {
        // Handle the uploaded file
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Extract the user ID from the JWT token
        const userId = req.user.id;

        // Find the merchant by their user ID
        const merchant = await Merchant.findById(userId);

        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }

        // Save the uploaded image to the merchant's profile
        merchant.image = {
            data: fs.readFileSync(file.path), // Read file data
            contentType: file.mimetype, // Get file MIME type
        };
        // Save the updated merchant object
        await merchant.save();

        // Respond to the client with a success message
        return res.status(200).json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
        // Handle any errors that occur during the upload process
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
};



// const uploadMerchantImage = async (req, res, next) => {
//     try {
//         // Handle the uploaded file
//         const file = req.file;

//         if (!file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const newMerchant = new Merchant({
//             image: {
//                 data: fs.readFileSync(path.join(__dirname, '../public/merchantImage/' + file.filename)),
//                 contentType: 'image/png',
//             },
//         });
//         await newMerchant.save();

//         // Respond to the client with a success message
//         res.json({ message: 'File uploaded successfully' });
//     } catch (error) {
//         // Handle any errors that occur during the upload process
//         console.error('Error uploading file:', error);
//         res.status(500).json({ message: 'Error uploading file' });
//     }
// };


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
