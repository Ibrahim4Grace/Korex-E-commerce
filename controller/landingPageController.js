'use strict';
const express = require(`express`)
const ejs = require(`ejs`);
const nodemailer = require(`nodemailer`);
const app = express();
// const ContactUs = require("../models/contactUs");


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


const shopPage = (req, res) => {
    res.render('shop');
};

const shirtPage = (req, res) => {
    res.render('shirt');
};

const womenDressesPage = (req, res) => {
    res.render('womenDresses');
};

const jeansPage = (req, res) => {
    res.render('jeans');
};

const blazersPage = (req, res) => {
    res.render('blazers');
};

const jacketsPage = (req, res) => {
    res.render('jackets');
};

const bagsPage = (req, res) => {
    res.render('bags');
};

const swimwearPage = (req, res) => {
    res.render('swimwear');
};

const sleepwearPage = (req, res) => {
    res.render('sleepwear');
};

const sportswearPage = (req, res) => {
    res.render('sportswear');
};

const jumpsuitsPage = (req, res) => {
    res.render('jumpsuits');
};

const loafersPage = (req, res) => {
    res.render('loafers');
};

const sneakersPage = (req, res) => {
    res.render('sneakers');
};

const babyDressesPage = (req, res) => {
    res.render('babyDresses');
};


const contactPage = (req, res) => {
    res.render('contact');
};

const contactPagePost = (req, res) => {

};
module.exports = ({ spinner,indexPage,shopPage,shirtPage,womenDressesPage,jeansPage,blazersPage,jacketsPage,bagsPage,swimwearPage,sleepwearPage,sportswearPage,jumpsuitsPage,loafersPage,sneakersPage,babyDressesPage,contactPage,contactPagePost});
