'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');
const ensureUserAuthenticated = require ('../middleware/passportMiddleware');

const { spinner,indexPage,shopPage,shirtPage,womenDressesPage,jeansPage,blazersPage,jacketsPage,bagsPage,swimwearPage,sleepwearPage,sportswearPage,jumpsuitsPage,loafersPage,sneakersPage,babyDressesPage,contactPage,contactPagePost} = require('../controller/landingPageController');

router.get('/', spinner,checkNotAuthenticated, indexPage);
router.get('/index',checkNotAuthenticated, indexPage);
router.get('/shop',checkNotAuthenticated, shopPage);
router.get('/shirt',checkNotAuthenticated, shirtPage);
router.get('/womenDresses',checkNotAuthenticated, womenDressesPage);
router.get('/jeans', jeansPage);
router.get('/blazers', blazersPage);
router.get('/jackets', jacketsPage);
router.get('/bags', bagsPage);
router.get('/swimwear', swimwearPage);
router.get('/sleepwear', sleepwearPage);
router.get('/sportswear', sportswearPage);
router.get('/jumpsuits', jumpsuitsPage);
router.get('/loafers', loafersPage);
router.get('/sneakers', sneakersPage);
router.get('/babyDresses', babyDressesPage);
router.get('/contact', contactPage);
router.post('/contactPagePost', contactPagePost);




module.exports = router;

// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)