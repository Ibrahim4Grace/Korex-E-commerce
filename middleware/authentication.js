'use strict';
const jwt = require('jsonwebtoken');

// function verifyToken(req, res, next) {

//     const token = req.header('Authorization');
//     if (!token) return res.status(401).json({ error: 'Access denied' });

//     try {
//         const decoded = jwt.verify(token, 'your-secret-key');
//         req.userId = decoded.userId;
//         next();
//     } catch (error) {
//         res.status(401).json({ error: 'Invalid token' });
//     }
// };

// module.exports = verifyToken;



// Protect Routes:
// Implement middleware to protect routes that require authentication. For example, you can use a middleware function to verify JWT tokens:

//CHECKING IF ADMIN IS NOT AUTHENTICATED WONT ALLOW YOU TO VISIT DASHBOARD IF YOU'RE NOT LOGIN
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/admin/welcomeAdmin');
}

//if admin is authenticated you cant go out till you sign out
function checkNotAuthenticated(req, res,next){
    if(req.isAuthenticated()){
       return res.redirect('/admin/dashboard')
    }
    //keeps inside dashboard
   next()
}

module.exports = { checkAuthenticated,  checkNotAuthenticated};

