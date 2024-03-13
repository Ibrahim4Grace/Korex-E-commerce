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
        if (!file.mimetype.startsWith('image')) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, './public/merchantImage/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now())
    }
});
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
        const merchant = await Merchant.findById(userId);
        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }

        merchant.image = {
            data: fs.readFileSync(file.path), // Read file data
            contentType: file.mimetype, // Get file MIME type
        };
        await merchant.save();
        return res.status(200).json({ success: true, message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
};


const merchantProducts = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/products', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
};

const merchantOrders = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/orders', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
};

const merchantReviews = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/reviews', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
};

const merchantCustomerMsg = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/customerMsg', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
};

const merchantSettings = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.user.id);

        if (!merchant) {
            return res.status(404).send('Merchant not found');
        }

        res.render('merchant/settings', { merchant });
    } catch (error) {
        console.error('Error retrieving user information:', error);
        res.status(500).send('Error retrieving merchant information');
    }
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
