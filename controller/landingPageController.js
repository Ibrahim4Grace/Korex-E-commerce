'use strict';
const express = require(`express`)
const ejs = require(`ejs`);
const nodemailer = require(`nodemailer`);
const app = express();
// const ContactUs = require("../models/contactUs");
// const  shippingLabel  = require('../models/shippingLabel');

// Send email to the applicant
const transporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});


const spinner = (req, res) => {
    res.render('spinner');
};

const indexPage = (req, res) => {
    setTimeout(() => {
        res.render('index');
    }, 3000);
};

// const aboutPage = (req, res) => {
//     res.render('about');
// };
// const servicePage = (req, res) => {
//     res.render('service');
// };


// const contactPage = (req, res) => {
//     res.render('contact');
// };



module.exports = ({ spinner, indexPage});
