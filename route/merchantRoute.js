'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');

const { welcomeMerchant} = require('../controller/merchantController');

router.get('/index', welcomeMerchant);
// router.get('/index', checkNotAuthenticated, indexPage);
// router.get('/detail', checkNotAuthenticated, detailsPage);
// router.get('/shop', checkNotAuthenticated, shopPage)
// router.get('/contact', checkNotAuthenticated, contactPage)
// router.post('/contact', checkNotAuthenticated, contactPagePost)
// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)



module.exports = router;
