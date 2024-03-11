'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');
const {authenticateToken} = require ('../middleware/authMerchantJWT');

const { welcomeMerchant,upload,uploadMerchantImage,merchantProducts,merchantOrders,merchantReviews,merchantCustomerMsg,merchantSettings,merchantLogout} = require('../controller/merchantController');

router.get('/index',authenticateToken,welcomeMerchant);
router.post('/uploadMerchantImage',upload.single('image'),uploadMerchantImage);
router.get('/products',authenticateToken,merchantProducts);
router.get('/orders',authenticateToken,merchantOrders);
router.get('/reviews',authenticateToken,merchantReviews);
router.get('/customerMsg',authenticateToken,merchantCustomerMsg)
router.get('/settings',authenticateToken,merchantSettings)
router.get('/logout',authenticateToken,merchantLogout)

// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)



module.exports = router;
