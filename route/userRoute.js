'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/passportMiddleware');
const ensureUserAuthenticated = require ('../middleware/passportMiddleware');
const  {verifyAccessToken,  verifyRefreshToken}  = require ('../middleware/authMiddleware');

const {userLandingPage,detailsPage,shopPage,cartPage,checkouttPage,dressesPage,babyDressesPage,loafersPage,sneakersPage,shirtPage,jeansPage,swimwearPage,sleepwearPage,jumpsuitsPage,blazersPage,jacketsPage } = require('../controller/UserController');

// Registration route
router.get('/index',ensureUserAuthenticated, userLandingPage);
router.get('/detail',ensureUserAuthenticated, detailsPage);
router.get('/shop',ensureUserAuthenticated, shopPage)
// // router.get('/contact',checkNotAuthenticated, contactPage)
// router.post('/contact',checkNotAuthenticated, contactPagePost)
router.get('/cart',ensureUserAuthenticated, cartPage)
router.get('/checkout',ensureUserAuthenticated, checkouttPage)
router.get('/dresses',ensureUserAuthenticated, dressesPage)
router.get('/babyDresses',ensureUserAuthenticated, babyDressesPage)
router.get('/loafers',ensureUserAuthenticated, loafersPage)
router.get('/sneakers',ensureUserAuthenticated, sneakersPage)
router.get('/shirt',ensureUserAuthenticated, shirtPage)
router.get('/jeans',ensureUserAuthenticated, jeansPage)
router.get('/swimwear',ensureUserAuthenticated, swimwearPage)
router.get('/sleepwear',ensureUserAuthenticated, sleepwearPage)
router.get('/jumpsuits',ensureUserAuthenticated, jumpsuitsPage)
router.get('/blazers',ensureUserAuthenticated, blazersPage)
router.get('/jackets',ensureUserAuthenticated, jacketsPage)



module.exports = router;
