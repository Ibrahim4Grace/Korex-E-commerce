'use strict';
const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');
const {authenticateToken} = require ('../middleware/authMerchantJWT');
const paginatedResults = require('../utils/pagination');

const { welcomeMerchant,upload,uploadMerchantImage,merchantProducts,upl,merchantProductsPost,viewProduct,editProduct,editProductPost,deleteProduct,merchantOrders,merchantReviews,merchantCustomerMsg,merchantSettings,merchantLogout} = require('../controller/merchantController');

            //Merchant landing page route 
router.get('/index',authenticateToken,welcomeMerchant);

            //uploading merchant profile image
router.post('/uploadMerchantImage',authenticateToken, upload.single('image'),uploadMerchantImage);

            //product and add product routes
router.get('/products', authenticateToken, paginatedResults(Product), merchantProducts);
router.post('/merchantProductsPost', authenticateToken,upl.array('images[]'),merchantProductsPost);

            //view product routes          
router.get('/viewProduct/:productId', authenticateToken,viewProduct)

            //Edit product routes
router.get('/editProduct/:productId',authenticateToken,editProduct);
router.post('/editProductPost/:productId',authenticateToken,editProductPost);
router.get('/deleteProduct/:productId',authenticateToken,deleteProduct);

router.get('/orders',authenticateToken,merchantOrders);
router.get('/reviews',authenticateToken,merchantReviews);
router.get('/customerMsg',authenticateToken,merchantCustomerMsg)
router.get('/settings',authenticateToken,merchantSettings)
router.get('/logout',authenticateToken,merchantLogout)

// router.get('/checkout', checkNotAuthenticated, checkouttPage)
// router.get('/cart', checkNotAuthenticated, cartPage)



module.exports = router;
