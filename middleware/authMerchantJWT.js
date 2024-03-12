// Protect Routes:Implement middleware to protect routes that require authentication.
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

const authenticateToken = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    console.log("My accessToken", accessToken)
    console.log("My refreshToken",  refreshToken)
    
    if (!accessToken || !refreshToken) {

        return res.redirect('/auth/merchantLogin?authErrorMessage=Please sign in to access this page');
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decodedAccessToken) => {
        if (err) {
            // If access token verification fails, check refresh token
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decodedRefreshToken) => {
                if (err) {
                    // If both tokens are invalid, return unauthorized
                    // return res.status(401).json({ success: false, message: 'Invalid tokens' });
                    return res.redirect('/auth/merchantLogin?authErrorMessage=Please sign in to access this page');
                } else {
                    // If refresh token is valid, issue new access token
                    const newAccessToken = jwt.sign(
                        { id: decodedRefreshToken.id, role: 'Merchant' },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME }
                    );
                    // Attach the new access token to the response headers
                    res.cookie('accessToken', newAccessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        maxAge: 30 * 60 * 1000
                    });
                    req.user = decodedRefreshToken;
                    next();
                }
            });
        } else {
            // If access token is valid, attach decoded payload to request object
            req.user = decodedAccessToken;
            next();
        }
    });
};

module.exports = { authenticateToken };
