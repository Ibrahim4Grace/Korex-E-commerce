'use strict';
const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');
const  {verifyAccessToken,  verifyRefreshToken}  = require ('../middleware/authMiddleware');

const {userLandingPage } = require('../controller/UserController');


// Registration route
router.get('/index', userLandingPage);





module.exports = router;
