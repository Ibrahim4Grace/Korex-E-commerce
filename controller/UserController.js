const express = require(`express`)
const bcrypt = require('bcryptjs');
const nodemailer = require(`nodemailer`);
const path = require('path');
const multer = require('multer');
const fs = require('fs');
// const PDFDocument = require('pdfkit');
// const generateTrackingID = require('../utils/tracking');
// const  Payment   = require('../models/payment');
const  User  = require('../models/User');
// const Notification = require('../models/notification');
// const notificationIo = io.of('/notifications');
const https = require('https');


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

const userLandingPage = (req, res) => {
    res.render('user/index');
}


 module.exports = ({ userLandingPage });

