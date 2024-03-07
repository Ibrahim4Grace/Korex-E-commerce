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

const detailsPage = (req, res) => {
    res.render('user/detail');
};

const shopPage = (req, res) => {
    res.render('user/shop');
};

const cartPage = (req, res) => {
    res.render('user/cart');
};

const checkouttPage = (req, res) => {
    res.render('user/checkout');
};


// const logoutUser = async (req, res) => {
//     try {
//       if (!req.user) {
//         console.log("Logout failed. User not authenticated.");
//         return res.redirect("/login");
//       }
  
//       if (req.user.tokens) {
//         req.user.tokens = req.user.tokens.filter(
//           (token) => token !== req.cookies.jwt
//         );
  
//         await req.user.save();
//       }
  
//       res.clearCookie("jwt");
  
//       console.log("Logout successful!");
//       res.redirect("/login");
//     } catch (error) {
//       console.error("Logout failed:", error);
//       res.redirect("/home");
//     }
//   };


//   const logoutUser = async (req, res) => {
//     try {
//         if (!req.user) {
//             console.log("Logout failed. User not authenticated.");
//             return res.redirect("/login");
//         }

//         // Clear all cookies related to authentication
//         res.clearCookie("accessToken");
//         res.clearCookie("refreshToken");

//         // Optionally, you may add token revocation logic here

//         console.log("Logout successful!");
//         res.redirect("/login");
//     } catch (error) {
//         console.error("Logout failed:", error);
//         res.redirect("/home");
//     }
// };



module.exports = ({ userLandingPage,detailsPage,shopPage,cartPage,checkouttPage});



