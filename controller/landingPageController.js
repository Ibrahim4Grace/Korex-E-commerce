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

const detailsPage = (req, res) => {
    res.render('detail');
};

const shopPage = (req, res) => {
    res.render('shop');
};

const contactPage = (req, res) => {
    res.render('contact');
};

const contactPagePost = (req, res) => {

};

const checkouttPage = (req, res) => {
    res.render('checkout');
};

const cartPage = (req, res) => {
    res.render('cart');
};



module.exports = ({ spinner, indexPage,detailsPage,shopPage,contactPage,contactPagePost,checkouttPage,cartPage});
