'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');
const ensureUserAuthenticated = require ('../middleware/passportMiddleware');

const { spinner, indexPage,detailsPage,shopPage,contactPage,contactPagePost,checkouttPage,cartPage} = require('../controller/landingPageController');

router.get('/', spinner,checkNotAuthenticated, indexPage);
router.get('/index',checkNotAuthenticated, indexPage);
router.get('/detail',checkNotAuthenticated, detailsPage);
router.get('/shop',checkNotAuthenticated, shopPage)
router.get('/contact',checkNotAuthenticated, contactPage)
router.post('/contact',checkNotAuthenticated, contactPagePost)
router.get('/cart',ensureUserAuthenticated, cartPage)
router.get('/checkout',ensureUserAuthenticated, checkouttPage)



module.exports = router;

// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)