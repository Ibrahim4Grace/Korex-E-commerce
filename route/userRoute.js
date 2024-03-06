'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/passportMiddleware');
const ensureUserAuthenticated = require ('../middleware/passportMiddleware');
const  {verifyAccessToken,  verifyRefreshToken}  = require ('../middleware/authMiddleware');

const {userLandingPage,detailsPage,shopPage,contactPage,contactPagePost,checkouttPage,cartPage } = require('../controller/UserController');



// Registration route
router.get('/index',ensureUserAuthenticated, userLandingPage);
router.get('/detail',ensureUserAuthenticated, detailsPage);
router.get('/shop',ensureUserAuthenticated, shopPage)
router.get('/contact',ensureUserAuthenticated, contactPage)
router.post('/contact',ensureUserAuthenticated, contactPagePost)
router.get('/cart',ensureUserAuthenticated, cartPage)
router.get('/checkout',ensureUserAuthenticated, checkouttPage)





module.exports = router;
