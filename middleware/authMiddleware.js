const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Protect Routes:
// Implement middleware to protect routes that require authentication. For example, you can use a middleware function to verify JWT tokens:

// const verifyAccessToken = async (req, res, next) => {
//     try {
//         // Get the authorization header from the request
//         const authHeader = req.headers['authorization'];
//         const token = authHeader && authHeader.split(' ')[1];

//         if (!token) {
//             req.flash('error_msg', 'Authorization token is missing');
//             return res.redirect('/user/login');
//         }

//         // Verify the token
//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//         // Check if user exists
//         const user = await User.findById(decoded._id);
//         if (!user) {
//             req.flash('error_msg', 'User not found');
//             return res.redirect('/user/login');
//         }

//         // Attach the user object to the request for later use
//         req.user = user;
//         next();
//     } catch (error) {
//         req.flash('error_msg', 'Invalid token or authentication failed');
//         return res.redirect('/user/login');
//     }
// };


const verifyAccessToken = async (req, res, next) => {
    try {
        // Get the authorization header from the request
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            // Json API
            // return res.status(401).json({ error: 'Authorization token is missing' });
            // web applications to display messages to users
            req.flash('error_msg', 'Authorization token is missing');
                     return res.redirect('/user/login');
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check if user exists
        const user = await User.findById(decoded._id);
        if (!user) {
            // return res.status(404).json({ error: 'User not found' });
            req.flash('error_msg', 'User not found');
                return res.redirect('/user/login');
        }

        // Attach the user object to the request for later use
        req.user = user;
        next();
    } catch (error) {
      //  return res.status(403).json({ error: 'Invalid token or authentication failed' });
        req.flash('error_msg', 'Invalid token or authentication failed');
            return res.redirect('/user/login');
    }
};

const verifyRefreshToken = (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token not provided' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }
        req.userId = decoded.userId; // Save the decoded user ID for subsequent use
        next();
    });
};

module.exports = { verifyAccessToken,  verifyRefreshToken };
