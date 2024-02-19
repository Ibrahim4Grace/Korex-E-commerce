'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');

const { spinner, indexPage } = require('../controller/landingPageController');

router.get('/', checkNotAuthenticated, spinner, indexPage);
router.get('/index', checkNotAuthenticated, indexPage);
// router.get('/about', checkNotAuthenticated, aboutPage);
// router.get('/service', checkNotAuthenticated, servicePage)
// router.get('/contact', checkNotAuthenticated, contactPage);
// router.post('/contactPagePost', checkNotAuthenticated, contactPagePost);


module.exports = router;
