const {sign, verify} = require("jsonwebtoken");

const  createToken = (user) => {
    const accessToken = sign (
        { username: user.username, id: user.id},
        `${process.env.JWT_SECRET}`
        );
        return accessToken
}


function verifyToken(req, res, next) {

    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { checkAuthenticated,  checkNotAuthenticated, verifyToken};
