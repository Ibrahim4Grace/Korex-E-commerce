'use strict';
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');
const {authenticateToken} = require ('../middleware/authMerchantJWT');
const paginatedResults = require('../utils/pagination');

const { welcomeMerchant,upload,uploadMerchantImage,merchantProducts,upl,merchantProductsPost,viewProduct,editProduct,editProductPost,deleteProduct,merchantOrders,merchantReviews,merchantCustomerMsg,merchantSettings,merchantLogout} = require('../controller/merchantController');

router.get('/index',authenticateToken,welcomeMerchant);
router.post('/uploadMerchantImage',upload.single('image'),authenticateToken,uploadMerchantImage);
// router.get('/products',authenticateToken,paginatedResults(Product),merchantProducts);
router.get('/products', authenticateToken, paginatedResults(Product), merchantProducts);
router.post('/merchantProductsPost',upl.array('images'),authenticateToken,merchantProductsPost);
router.get('/viewProduct/:productId',authenticateToken,viewProduct);
router.get('/editProduct',authenticateToken,editProduct);
router.post('/editProductPost',authenticateToken,editProductPost);
router.get('/deleteProduct',authenticateToken,deleteProduct);
router.get('/orders',authenticateToken,merchantOrders);
router.get('/reviews',authenticateToken,merchantReviews);
router.get('/customerMsg',authenticateToken,merchantCustomerMsg)
router.get('/settings',authenticateToken,merchantSettings)
router.get('/logout',authenticateToken,merchantLogout)

// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)



module.exports = router;
