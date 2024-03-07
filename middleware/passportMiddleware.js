'use strict';


// Middleware to check if user is authenticated
function ensureUserAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware/route handler
    }
    res.redirect('/auth/login'); // Redirect to the login page if user is not authenticated
};



module.exports = ensureUserAuthenticated;


