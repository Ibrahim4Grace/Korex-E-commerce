'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');

const { welcomeMerchant,merchantProducts,merchantOrders,merchantReviews,merchantCustomerMsg,merchantSettings} = require('../controller/merchantController');

router.get('/index', welcomeMerchant);
router.get('/products', merchantProducts);
router.get('/orders', merchantOrders);
router.get('/reviews', merchantReviews);
router.get('/customerMsg', merchantCustomerMsg)
router.get('/settings', merchantSettings)

// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)



module.exports = router;
